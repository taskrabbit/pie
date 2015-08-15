// # Pie List
// A model representing a list. Essentially an array wrapper.
// List models provide observation for:
//   * The entire list
//   * Specific indexes
//   * Length of the list
//   * Any other key not related to the list.
// Optionally, a list can provide a `cast` option which it will use
// to cast plain object index values into. `castOptions` can also be supplied
// which will be provided as the second argument to the cast' constructor.
pie.list = pie.model.extend('list', {

  init: function(arrayOrData, options) {
    if(Array.isArray(arrayOrData)) arrayOrData = {items: arrayOrData};
    this._super(arrayOrData, options);
    this.data.items = pie.array.from(this.data.items).map(this._cast.bind(this));
    this.boundChangeObserver = this.onItemChange.bind(this);
  },

  // ** pie.list._cast **
  //
  // Casts a `value` to the option-provided `cast`.
  // The first argument provided to the cast is the object itself, the
  // second is the options-provided castOptions.
  _cast: function(value) {
    var klass = this.options.cast;
    if(klass === true) klass = pie.model;

    if(klass && pie.object.isPlainObject(value)) {
      value = klass.create(value, this.options.castOptions);
    }

    this._observeItem(value);

    return value;
  },

  _observeItem: function(child) {
    if(this.options.observeItems === false) return;
    if(!child.observe) return;

    child.observe(this.boundChangeObserver);
  },

  _unobserveItem: function(child) {
    if(this.options.observeItems === false) return;
    if(!child.unobserve) return;
    child.unobserve(this.boundChangeObserver);
  },

  // ** pie.list._normalizeIndex **
  //
  // Converts a potential index into the numeric form.
  // If the index is negative, it should represent the index from the end of the current list.
  // ```
  // // assuming a list length of 3
  // list._normalizeIndex('foo') //=> 'foo'
  // list._normalizeIndex('4') //=> 4
  // list._normalizeIndex(-1) //=> 2
  // ```
  _normalizedIndex: function(wanted) {
    wanted = parseInt(wanted, 10);
    if(!isNaN(wanted) && wanted < 0) wanted += this.data.items.length;
    return wanted;
  },

  // ** pie.list._trackMutations **
  //
  // Track changes to the array which occur during `fn`'s execution.
  _trackMutations: function(options, fn) {

    var oldLength = this.data.items.length,
    changes = pie.array.from(fn.call()),
    newLength = this.data.items.length;

    if(!options || !options.skipTrackMutations) {
      if(oldLength !== newLength) {
        changes.push({
          name: 'length',
          type: 'update',
          object: this,
          oldValue: oldLength,
          value: newLength
        });
      }

      changes.push({
        name: 'items',
        type: 'update',
        object: this,
        oldValue: this.data.items,
        value: this.data.items
      });
    }

    this.changeRecords = this.changeRecords.concat(changes);

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },

  onItemChange: function(changeSet) {
    var item = changeSet[0].object;
    if(!item) return;

    // todo, set a uid based index on the child object which would make this much faster.
    var idx = this.indexOf(item);
    this.changeRecords.push({
      name: 'items',
      type: 'item:change',
      index: idx,
      object: this,
      changes: changeSet,
      oldValue: item,
      value: item
    });

    this.deliverChangeRecords();
  },

  // ** pie.list.forEach **
  //
  // Iterate the list, calling `f` with each item.
  forEach: function(f) {
    return this.get('items').forEach(f);
  },

  map: function(f) {
    return this.get('items').map(f);
  },

  filter: function(f) {
    return this.get('items').filter(f);
  },

  sort: function(f) {
    var items = this.get('items');
    items.sort(f);
    this.changeRecords.push({
      name: 'items',
      type: 'reorder',
      object: this,
      oldValue: items,
      value: items
    });
    return this.deliverChangeRecords();
  },

  // ** pie.list.get **
  //
  // Get an item at a specific index.
  // `key` can be any valid input to `_normalizeIndex`.
  get: function(key) {
    var idx = this._normalizedIndex(key), path;

    if(isNaN(idx)) path = key;
    else path = 'items.' + idx;

    return this._super(path);
  },

  // ** pie.list.indexOf **
  //
  // Find the index of a specific value.
  // Uses the standard array equality check for indexOf.
  indexOf: function(value) {
    return this.get('items').indexOf(value);
  },

  // ** pie.list.insert **
  //
  // Insert `value` at the index specified by `key`.
  // Returns the list.
  insert: function(key, value, options) {
    return this._trackMutations(options, function(){

      value = this._cast(value);

      var idx = this._normalizedIndex(key),
      change = {
        name: 'items',
        type: 'item:add',
        object: this,
        index: idx,
        oldValue: this.data.items[idx],
        value: value
      };

      this.data.items.splice(idx, 0, value);

      return change;
    }.bind(this));
  },

  // ** pie.list.length **
  //
  // The length of the list.
  length: function() {
    return this.get('items.length');
  },

  // ** pie.list.pop **
  //
  // Pop an item off the end of the list.
  // Returns the item.
  pop: function(options) {
    var l = this.length(), value;

    if(!l) return;

    this._trackMutations(options, function() {
      var change = {
        name: 'items',
        type: 'item:delete',
        object: this,
        value: undefined
      };

      change.oldValue = value = this.data.items.pop();
      change.index = this.data.items.length;

      this._unobserveItem(value);

      return change;
    }.bind(this));

    return value;
  },

  // ** pie.list.push **
  //
  // Add an item to the end of the list.
  // Returns the list.
  push: function(value, options) {
    return this._trackMutations(options, function(){

      value = this._cast(value);

      var change = {
        name: 'items',
        type: 'item:add',
        object: this,
        index: this.data.items.length,
        value: value,
        oldValue: undefined
      };

      this.data.items.push(value);

      return change;
    }.bind(this));
  },

  // ** pie.list.remove **
  //
  // Remove a specific index from the list.
  // Returns the removed item.
  remove: function(key, options) {

    var value;

    this._trackMutations(options, function(){
      var idx = this._normalizedIndex(key),
      change = {
        name: 'items',
        type: 'item:delete',
        object: this,
        index: idx
      };

      change.oldValue = value = this.data.items[idx];
      this.data.items.splice(idx, 1);
      change.value = this.data.items[idx];

      this._unobserveItem(value);

      return change;
    }.bind(this));

    return value;
  },

  // ** pie.list.set **
  //
  // Set an attribute or an index based on `key` to `value`.
  set: function(key, value, options) {
    if(key === 'items') return this.setItems(value, options);

    var idx = this._normalizedIndex(key);

    if(isNaN(idx)) {
      return this._super(key, value, options);
    }

    return this._trackMutations(options, function(){
      var change = {
        name: 'items',
        type: 'item:update',
        object: this,
        index: idx,
        oldValue: this.data.items[idx]
      };

      value = this._cast(value);

      this.data.items[idx] = change.value = value;

      return change;
    }.bind(this));
  },

  setItems: function(arr, options) {
    arr = arr || [];

    var innerOptions = pie.object.merge({}, options, {
      skipTrackMutations: true,
      skipObservers: true
    });

    return this._trackMutations(options, function(){

      var currentLength = this.data.items.length,
      newLength = arr.length,
      i;

      /* if the old list is longer than the new, we create change records from the end to the beginning */
      if(currentLength > newLength) {
        i = currentLength;

        while(i > newLength) {
          this.pop(innerOptions);
          i--;
        }

        for(i = newLength - 1; i >= 0; i--) {
          this.set(i, arr[i], innerOptions);
        }

      /* otherwise, we create change records from the beginning to the end */
      } else {

        for(i = 0; i < currentLength; i++) {
          this.set(i, arr[i], innerOptions);
        }

        i = currentLength;
        while(i < newLength) {
          this.push(arr[i], innerOptions);
          i++;
        }
      }

    }.bind(this));
  },

  // ** pie.list.shift **
  //
  // Shift an item off the front of the list.
  // Returns the removed item.
  shift: function(options) {
    return this.remove(0, options);
  },

  // ** pie.list.unshift **
  //
  // Insert an item at the beginning of the list.
  unshift: function(value, options) {
    return this.insert(0, value, options);
  }
});
