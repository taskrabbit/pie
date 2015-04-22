pie.dataStore = pie.base.extend('dataStore', {

  init: function(app, options) {
    this.app = app;
    this.options = pie.object.merge({
      stores: ['sessionStorage', 'localStorage', 'cookie', 'backup']
    }, options);
    this._super();

    this.backup = new pie.model({});
  },

  stores: function(options) {
    var arr;

    if(options && options.store) arr = pie.array.from(options.store);
    if(options && options.stores) arr = pie.array.from(options.stores);

    var all = pie.array.from(this.options.store || this.options.stores);
    if(options && options.except) arr = pie.array.subtract(all, options.except);
    if(options && options.only) arr = pie.array.intersect(all, options.only);

    arr = arr || all;

    return arr.map(function(s){
      if(pie.object.isString(s)) return pie.dataStore.adapters[s];
      else return s;
    });
  },


  clear: function(key, options) {
    var stores = this.stores(options);
    for(var i = 0; i < stores.length; i++) {
      stores[i].clear(key, this);
    }
  },


  get: function(key, options) {
    var stores = this.stores(options), val;

    for(var i = 0; i < stores.length; i++) {
      val = stores[i].get(key, this);
      if(val !== pie.dataStore.ACCESS_ERROR) break;
      else val = undefined;
    }

    if(!options || (options.clear === undefined || options.clear)) {
      this.clear(key, options);
    }

    return val;
  },

  set: function(key, value, options) {
    var stores = this.stores(options), val;

    for(var i = 0; i < stores.length; i++) {
      val = stores[i].set(key, value, this);
      if(val !== pie.dataStore.ACCESS_ERROR) break;
      else val = undefined;
    }

    return val;
  }

});

pie.dataStore.ACCESS_ERROR = new Error("~~PIE_ACCESS_ERROR~~");
pie.dataStore.adapters = (function(){

  var storageGet = function(storeName, key) {

    try {
      if(!window[storeName]) return pie.dataStore.ACCESS_ERROR;

      var encoded = window[storeName].getItem(key);
      return encoded != null ? JSON.parse(encoded) : encoded;
    } catch(err) {
      this.app.errorHandler.reportError(err, {
        handledBy: "pie.dataStore." + storeName + "#get",
        key: key
      });

      return pie.dataStore.ACCESS_ERROR;
    }
  };

  var storageSet = function(storeName, key, value) {

    var str;

    try {
      if(!window[storeName]) return pie.dataStore.ACCESS_ERROR;

      str = JSON.stringify(value);
      window[storeName].setItem(key, str);

      return true;
    } catch(err) {
      this.app.errorHandler.reportError(err, {
        handledBy: "pie.dataStore." + storeName + "#get",
        key: key,
        data: str
      });

      return pie.dataStore.ACCESS_ERROR;
    }
  };

  var storageClear = function(storeName, key) {
    try {
      if(!window[storeName]) return pie.dataStore.ACCESS_ERROR;
      window[storeName].removeItem(key);
    } catch(err) {
      this.app.errorHandler.reportError(err, {
        handledBy: "pie.dataStore." + storeName + "#clear",
        key: key
      });
    }
  };

  return {

    sessionStorage: {

      clear: function(key, parentStore) {
        return storageClear.call(parentStore, 'sessionStorage', key);
      },

      get: function(key, parentStore) {
        return storageGet.call(parentStore, 'sessionStorage', key);
      },
      set: function(key, value, parentStore) {
        return storageSet.call(parentStore, 'sessionStorage', key, value);
      }
    },

    localStorage: {

      clear: function(key, parentStore) {
        return storageClear.call(parentStore, 'localStorage', key);
      },

      get: function(key, parentStore) {
        return storageGet.call(parentStore, 'localStorage', key);
      },
      set: function(key, value, parentStore) {
        return storageSet.call(parentStore, 'localStorage', key, value);
      }

    },

    cookie: {

      clear: function(key, parentStore) {
        return pie.browser.setCookie(key, null);
      },

      get: function(key, parentStore) {
        var encoded = pie.browser.getCookie(key);
        return encoded != null ? JSON.parse(encoded) : encoded;
      },

      set: function(key, value, parentStore) {
        var encoded = JSON.stringify(value);
        pie.browser.setCookie(key, value);
      }

    },

    backup: {

      clear: function(key, parentStore) {
        parentStore.backup.set(key, undefined);
      },

      get: function(key, parentStore) {
        parentStore.backup.get(key);
      },

      set: function(key, value, parentStore) {
        parentStore.backup.set(key, value);
      }

    }
  };
})();
