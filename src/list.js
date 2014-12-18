pie.list = pie.model.extend('list', {
  init: function(array, options) {
    array = array || [];
    this._super({items: array}, options);
  },


  _normalizedIndex: function(wanted) {
    wanted = parseInt(wanted, 10);
    if(!isNaN(wanted) && wanted < 0) wanted += this.data.items.length;
    return wanted;
  },


  _trackMutations: function(options, fn) {
    var oldLength = this.data.items.length,
    changes = [fn.call()],
    newLength = this.data.items.length;

    if(oldLength !== newLength) {
      changes.push({
        name: 'length',
        type: 'update',
        object: this.data.items,
        oldValue: oldLength,
        value: newLength
      });
    }

    this.changeRecords = this.changeRecords.concat(changes);

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },


  forEach: function(f) {
    return this.get('items').forEach(f);
  },


  get: function(key) {
    var idx = this._normalizedIndex(key), path;

    if(isNaN(idx)) path = key;
    else path = 'items.' + idx;

    return pie.model.prototype.get.call(this, path);
  },


  indexOf: function(value) {
    return this.get('items').indexOf(value);
  },


  insert: function(key, value, options) {
    var idx = this._normalizedIndex(key);

    return this._trackMutations(options, function(){
      var change = {
        name: String(idx),
        object: this.data.items,
        type: 'add',
        oldValue: this.data.items[idx],
        value: value
      };

      this.data.items.splice(idx, 0, value);

      return change;
    }.bind(this));
  },


  length: function() {
    return this.get('items.length');
  },


  push: function(value, options) {
    return this._trackMutations(options, function(){
      var change = {
        name: String(this.data.items.length),
        object: this.data.items,
        type: 'add',
        value: value,
        oldValue: undefined
      };

      this.data.items.push(value);

      return change;
    }.bind(this));
  },


  remove: function(key, options) {
    var idx = this._normalizedIndex(key);

    return this._trackMutations(options, function(){
      var change = {
        name: String(idx),
        object: this.data.items,
        type: 'delete',
        oldValue: this.data.items[idx],
        value: undefined
      };

      this.data.items.splice(idx, 1);

      return change;
    }.bind(this));
  },


  set: function(key, value, options) {
    var idx = this._normalizedIndex(key);

    if(isNaN(idx)) {
      return pie.model.prototype.set.call(this, key, value, options);
    }

    return this._trackMutations(options, function(){
      var change = {
        name: String(idx),
        object: this.data.items,
        type: 'update',
        oldValue: this.data.items[idx]
      };

      this.data.items[idx] = change.value = value;

      return change;
    }.bind(this));
  },


  shift: function(options) {
    return this._trackMutations(options, function(){
      var change = {
        name: '0',
        object: this.data.items,
        type: 'delete'
      };

      change.oldValue = this.data.items.shift();
      change.value = this.data.items[0];

      return change;
    }.bind(this));
  },


  unshift: function(value, options) {
    return this.insert(0, value, options);
  }
});
