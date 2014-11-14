pie.list = function(array, options) {
  array = array || [];
  pie.model.call(this, {items: array}, options);
};


pie.inherit(pie.list, pie.model);


pie.list.prototype._normalizedIndex = function(wanted) {
  wanted = parseInt(wanted, 10);
  if(!isNaN(wanted) && wanted < 0) wanted += this.data.items.length;
  return wanted;
};


pie.list.prototype._trackMutations = function(skipObservers, fn) {
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

  if(skipObservers) return this;
  return this.deliverChangeRecords();
};


pie.list.prototype.forEach = function(f) {
  return this.get('items').forEach(f);
};


pie.list.prototype.get = function(key) {
  var idx = this._normalizedIndex(key), path;

  if(isNaN(idx)) path = key;
  else path = 'items.' + idx;

  return this._super('get', path);
};


pie.list.prototype.indexOf = function(value) {
  return this.get('items').indexOf(value);
},


pie.list.prototype.insert = function(key, value, skipObservers) {
  var idx = this._normalizedIndex(key);

  return this._trackMutations(skipObservers, function(){
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
};


pie.list.prototype.length = function() {
  return this.get('items.length');
};


pie.list.prototype.push = function(value, skipObservers) {
  return this._trackMutations(skipObservers, function(){
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
};


pie.list.prototype.remove = function(key, skipObservers) {
  var idx = this._normalizedIndex(key);

  return this._trackMutations(skipObservers, function(){
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
};


pie.list.prototype.set = function(key, value, skipObservers) {
  var idx = this._normalizedIndex(key);

  if(isNaN(idx)) {
    return this._super('set', key, value, skipObservers);
  }

  return this._trackMutations(skipObservers, function(){
    var change = {
      name: String(idx),
      object: this.data.items,
      type: 'update',
      oldValue: this.data.items[idx]
    };

    this.data.items[idx] = change.value = value;

    return change;
  }.bind(this));
};


pie.list.prototype.shift = function(skipObservers) {
  return this._trackMutations(skipObservers, function(){
    var change = {
      name: '0',
      object: this.data.items,
      type: 'delete'
    };

    change.oldValue = this.data.items.shift();
    change.value = this.data.items[0];

    return change;
  }.bind(this));
};


pie.list.prototype.unshift = function(value, skipObservers) {
  return this.insert(0, value, skipObservers);
};
