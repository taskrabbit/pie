
//    **Setters and Getters**
//    pie.model provides a basic interface for object management and observation.
//
//    *example:*
//
//    ```
//    var user = new pie.model();
//    user.set('first_name', 'Doug');
//    user.get('first_name') //=> 'Doug'
//    user.sets({
//      first_name: 'Douglas',
//      last_name: 'Wilson'
//    });
//    user.get('last_name') //= 'Wilson'
//
//    user.set('location.city', 'Miami')
//    user.get('location.city') //=> 'Miami'
//    user.get('location') //=> {city: 'Miami'}
//    ```
//    ** Observers **
//    Observers can be added by invoking the model's observe() method.
//    pie.model.observe() optionally accepts 2+ arguments which are used as filters for the observer.
//
//    *example:*
//
//    ```
//    var o = function(changes){ console.log(changes); };
//    var user = new pie.model();
//    user.observe(o, 'first_name');
//    user.sets({first_name: 'first', last_name: 'last'});
//    // => o is called and the following is logged:
//    [{
//      name: 'first_name',
//      type: 'new',
//      oldValue:
//      undefined,
//      value: 'first',
//      object: {...}
//    }]
//    ```
//
//    **Computed Properties**
//
//    pie.models can observe themselves and compute properties. The computed properties can be observed
//    just like any other property.
//
//    *example:*
//
//    ```
//    var fullName = function(){ return this.get('first_name') + ' ' + this.get('last_name'); };
//    var user = new pie.model({first_name: 'Doug', last_name: 'Wilson'});
//    user.compute('full_name', fullName, 'first_name', 'last_name');
//    user.get('full_name') //=> 'Doug Wilson'
//    user.observe(function(changes){ console.log(changes); }, 'full_name');
//    user.set('first_name', 'Douglas');
//    # => the observer is invoked and console.log provides:
//    [{
//      name: 'full_name',
//      oldValue: 'Doug Wilson',
//      value: 'Douglas Wilson',
//      type: 'update',
//      object: {...}
//    }]
//    ```


pie.model = pie.base.extend('model', {
  init: function(d, options) {
    this.data = pie.object.merge({_version: 1}, d);
    this.options = options || {};
    this.app = this.options.app || window.app;
    this.observations = {};
    this.changeRecords = [];
    pie.setUid(this);
  },


  trackVersion: function() {
    if(this.options.trackVersion !== false && this.changeRecords.length) {
      this.set('_version', this.get('_version') + 1, {skipObservers: true});
    }
  },


  // After updates have been made we deliver our change records to our observers.
  deliverChangeRecords: function() {
    var observers = {}, os, o, change;

    this.trackVersion();

    // grab each change record
    while(change = this.changeRecords.shift()) {

      // grab all the observers for the attribute specified by change.name
      os = pie.array.union(this.observations[change.name], this.observations.__all__);

      // then for each observer, build or concatenate to the array of changes.
      while(o = os.shift()) {

        if(!observers[o.pieId]) {
          var changeSet = [];
          pie.object.merge(changeSet, pie.mixins.changeSet);
          observers[o.pieId] = {fn: o, changes: changeSet};
        }

        observers[o.pieId].changes.push(change);
      }
    }

    // Iterate each observer, calling it with the changes which it was subscribed for.
    pie.object.forEach(observers, function(uid, obj) {
      obj.fn.call(null, obj.changes);
    });

    return this;
  },

  // Access the value stored at data[key]
  // Key can be multiple levels deep by providing a dot separated key.
  get: function(key) {
    return pie.object.getPath(this.data, key);
  },

  // Retrieve multiple values at once.
  gets: function() {
    var args = pie.array.from(arguments), o = {};
    args = pie.array.flatten(args);
    args = pie.array.compact(args);

    args.forEach(function(arg){
      o[arg] = pie.object.getPath(this.data, arg);
    }.bind(this));

    return pie.object.compact(o);
  },

  has: function(path) {
    return !!pie.object.hasPath(this.data, path);
  },

  // Register an observer and optionally filter by key.
  observe: function(/* fn[, key1, key2, key3] */) {
    var keys = pie.array.from(arguments),
    fn = keys.shift();

    // uid is needed later for ensuring unique change record delivery.
    pie.setUid(fn);

    keys = pie.array.flatten(keys);

    if(!keys.length) keys.push('__all__');

    keys.forEach(function(k) {
      this.observations[k] = this.observations[k] || [];
      if(this.observations[k].indexOf(fn) < 0) this.observations[k].push(fn);
    }.bind(this));

    return this;
  },

  // Set a value and trigger observers.
  // Optionally provide false as the third argument to skip observation.
  // Note: skipping observation does not stop changeRecords from accruing.
  set: function(key, value, options) {
    var change = { name: key, object: this.data };

    if(this.has(key)) {
      change.type = 'update';
      change.oldValue = pie.object.getPath(this.data, key);

      // if we haven't actually changed, don't bother.
      if(value === change.oldValue) return this;

    } else {
      change.type = 'add';
    }

    change.value = value;

    if(value === undefined) {
      pie.object.deletePath(this.data, key, true);
    } else {
      pie.object.setPath(this.data, key, value);
    }

    this.changeRecords.push(change);

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },

  // Set a bunch of stuff at once.
  sets: function(obj, options) {
    pie.object.forEach(obj, function(k,v) {
      this.set(k, v, {skipObservers: true});
    }.bind(this));

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },


  // Unregister an observer. Optionally for specific keys.
  unobserve: function(/* fn[, key1, key2, key3] */) {
    var keys = pie.array.from(arguments),
    fn = keys.shift(),
    i;

    if(!keys.length) keys = Object.keys(this.observations);

    keys.forEach(function(k){
      i = this.observations[k].indexOf(fn);
      if(~i) this.observations[k].splice(i,1);
    }.bind(this));

    return this;
  },

  // Register a computed property which is accessible via `name` and defined by `fn`.
  // Provide all properties which invalidate the definition.
  compute: function(/* name, fn[, prop1, prop2 ] */) {
    var props = pie.array.from(arguments),
    name = props.shift(),
    fn = props.shift();

    this.observe(function(/* changes */){
      this.set(name, fn.call(this));
    }.bind(this), props);

    // initialize it
    this.set(name, fn.call(this));
  }
});
