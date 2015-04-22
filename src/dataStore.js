pie.dataStore = pie.base.extend('dataStore', {

  init: function(app, options) {
    this.app = app;
    this.options = pie.object.merge({
      primary: 'sessionStorage',
      backup: 'backup'
    }, options);

    this._super();

    this.backupModel = new pie.model({});
  },

  primary: function() {
    return this._store(this.options.primary);
  },

  backup: function() {
    return this._store(this.options.backup);
  },

  _store: function(name) {
    if(pie.object.isString(name)) return pie.dataStore.adapters[name];
    else return name;
  },


  clear: function(key) {
    this.primary().clear(key, this);
    this.primary().clear(key, this);
  },

  get: function(key, options) {
    var result = this.primary().get(key, this);
    if(result === pie.dataStore.ACCESS_ERROR) result = this.backup().get(key, this);

    if(!options || (options.clear === undefined || options.clear)) {
      this.clear(key);
    }

    return result;
  },

  set: function(key, value, options) {
    // clear from all stores so we don't get out of sync.
    this.clear(key);

    var result = this.primary().set(key, value, this);
    if(result === pie.dataStore.ACCESS_ERROR) result = this.backup().set(key, this);

    return result;
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

      return pie.dataStore.ACCESS_ERROR;
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
        try {
          return pie.browser.setCookie(key, null);
        } catch(e) {
          return pie.dataStore.ACCESS_ERROR;
        }
      },

      get: function(key, parentStore) {
        try {
          var encoded = pie.browser.getCookie(key);
          return encoded != null ? JSON.parse(encoded) : encoded;
        } catch(e) {
          return pie.dataStore.ACCESS_ERROR;
        }
      },

      set: function(key, value, parentStore) {
        try{
          var encoded = JSON.stringify(value);
          pie.browser.setCookie(key, value);
        } catch(e) {
          return pie.dataStore.ACCESS_ERROR;
        }
      }

    },

    backup: {

      clear: function(key, parentStore) {
        parentStore.backupModel.set(key, undefined);
      },

      get: function(key, parentStore) {
        parentStore.backupModel.get(key);
      },

      set: function(key, value, parentStore) {
        parentStore.backupModel.set(key, value);
      }

    }
  };
})();
