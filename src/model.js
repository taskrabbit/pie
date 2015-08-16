// # Pie Model
// ### Setters and Getters
// pie.model provides a basic interface for object management and observation.
//
// *example:*
//
// ```
// var user = pie.model.create();
// user.set('first_name', 'Doug');
// user.get('first_name') //=> 'Doug'
// user.sets({
//   first_name: 'Douglas',
//   last_name: 'Wilson'
// });
// user.get('last_name') //= 'Wilson'
//
// user.set('location.city', 'Miami')
// user.get('location.city') //=> 'Miami'
// user.get('location') //=> {city: 'Miami'}
// ```
//
// ### Observers
//
// Observers can be added by invoking the model's `observe()` function.
// `pie.model.observe()` optionally accepts 2+ arguments which are used as filters for the observer.
//
// *example:*
//
// ```
// var o = function(changes){ console.log(changes); };
// var user = pie.model.create();
// user.observe(o, 'first_name');
// user.sets({first_name: 'first', last_name: 'last'});
// // => o is called and the following is logged:
// [{...}, {
//   name: 'first_name',
//   type: 'new',
//   oldValue:
//   undefined,
//   value: 'first',
//   object: {...}
// }]
// ```
//
// Note that the changes are extended with the `pie.mixin.changeSet` functionality, so check that out too.
//
// ### Computed Properties
//
// `pie.models` can observe themselves and compute properties. The computed properties can be observed
// just like any other property.
//
// *example:*
//
// ```
// var fullName = function(){ return this.get('first_name') + ' ' + this.get('last_name'); };
// var user = pie.model.create({first_name: 'Doug', last_name: 'Wilson'});
// user.compute('full_name', fullName, 'first_name', 'last_name');
// user.get('full_name') //=> 'Doug Wilson'
// user.observe(function(changes){ console.log(changes); }, 'full_name');
// user.set('first_name', 'Douglas');
// // => the observer is invoked and console.log provides:
// [{..}, {
//   name: 'full_name',
//   oldValue: 'Doug Wilson',
//   value: 'Douglas Wilson',
//   type: 'update',
//   object: {...}
// }]
// ```
//
// If a function is not provided as the definition of the computed property, it will look
// for a matching function name within the model.


pie.model = pie.base.extend('model', {

  __pieRole: 'model',

  init: function(d, options) {

    if(d && d.__pieRole === 'model') d = d.data;

    this.data = pie.object.deepMerge({__version: 1}, d);
    this.options = options || {};
    this.app = this.app || this.options.app || pie.appInstance;
    this.observations = {};
    this.observedKeyCounts = {};
    this.changeRecords = [];
    this.deliveringRecords = 0;

    this._super();
  },

  // ** pie.model.compute **
  //
  // Register a computed property which is accessible via `name` and defined by `fn`.
  // Provide all properties which invalidate the definition.
  // If the definition of the property is defined by a function of the same name, the function can be ommitted.
  // ```
  // Model.reopen({fullName: function(){ /*...*/ }});
  // model.compute('fullName', 'first_name', 'last_name');
  // model.compute('displayName', function(){}, 'fullName');
  // ```
  compute: function(/* name, fn?[, prop1, prop2 ] */) {
    var props = pie.array.from(arguments),
    name = props.shift(),
    fn = props.shift(),
    wrap;

    props = pie.array.flatten(props);

    if(!pie.object.isFunction(fn)) {
      props.unshift(fn);
      fn = this[name].bind(this);
    }

    wrap = function(/* changes */){
      this.set(name, fn.call(this), {skipObservers: true});
    }.bind(this);

    this.observe(wrap, props);
    this.observations[pie.uid(wrap)].computed = true;

    /* Initialize the computed properties value immediately. */
    this.set(name, fn.call(this));
  },

  // **pie.model.addChangeRecord**
  //
  // Add a change record to this model. If a change record of the same name already exists,
  // update the existing value.
  addChangeRecord: function(name, type, oldValue, value, extras) {
    if(!this.hasObserver(name)) return;

    var existing = !/\*$/.test(name) && pie.array.detect(this.changeRecords, function(r){ return r.name === name; });

    if(existing) {
      var remove = false;
      existing.value = value;

      // if we previously deleted this value but it's been added back in, just report an update.
      if(existing.type === 'delete' && type === 'add') existing.type = 'update';
      else if(existing.type === 'add' && type === 'delete') remove = true;
      // if we previously delete this value but have now added an object, report a path update.
      else if(existing.type === 'delete' && type === 'pathUpdate') existing.type = 'pathUpdate';
      // if we previously deleted this value but have now changed it, inherit the new type.
      else if(type === 'delete') existing.type = type;

      // if the result is an update but the values are identical, remove the change record.
      if(existing.type === 'update' && existing.oldValue === existing.value) remove = true;

      if(remove) {
        this.changeRecords = pie.array.remove(this.changeRecords, existing);
      }

      if(extras) pie.object.merge(existing, extras);

      return;
    }

    var change = {
      name: name,
      type: type,
      value: value,
      object: this
    };

    if(oldValue != null) change.oldValue = oldValue;
    if(extras) pie.object.merge(change, extras);

    this.changeRecords.push(change);
  },

  // ** pie.model.deliverChangeRecords **
  //
  // After updates have been made we deliver our change records to our observers
  deliverChangeRecords: function(options) {
    if(!this.changeRecords.length) return this;
    if(this.deliveringRecords) return this;

    /* This is where the version tracking is incremented. */
    if(!options || !options.skipVersionTracking) this.trackVersion();


    var changeSet = this.changeRecords,
    observers = pie.object.values(this.observations),
    invoker = function(obj) {
      if(changeSet.hasAny.apply(changeSet, obj.keys)) {
        obj.fn.call(null, changeSet);
      }
    },
    o, idx;

    /* We modify the `changeSet` array with the `pie.mixins.changeSet`. */
    pie.object.merge(changeSet, pie.mixins.changeSet);


    /* Deliver change records to all computed properties first. */
    /* This will ensure that the change records include the computed property changes */
    /* along with the original property changes. */
    while(~(idx = pie.array.indexOf(observers, 'computed'))) {
      o = observers[idx];
      observers.splice(idx, 1);
      invoker(o);
    }

    /* Now we reset the changeRecords on this model. */
    this.changeRecords = [];

    /* We increment our deliveringRecords flag to ensure records are delivered in the correct order */
    this.deliveringRecords++;

    /* And deliver the changeSet to each observer. */
    observers.forEach(invoker);

    /* Now we can decrement our deliveringRecords flag and attempt to deliver any leftover records */
    this.deliveringRecords--;
    this.deliverChangeRecords(options);

    return this;

  },

  // ** pie.model.get **
  //
  // Access the value stored at data[key]
  // Key can be multiple levels deep by providing a dot separated key.
  // ```
  // model.get('foo')
  // //=> 'bar'
  // model.get('bar.baz')
  // //=> undefined
  // ```
  get: function(key) {
    return pie.object.getPath(this.data, key);
  },

  // ** pie.model.getOrSet **
  //
  // Retrieve or set a key within the model.
  // The `defaultValue` will only be used if the value at `key` is `== null`.
  // ```
  // model.getOrSet('foo', 'theFirstValue');
  // //=> 'theFirstValue'
  // model.getOrSet('foo', 'theSecondValue');
  // //=> 'theFirstValue'
  // ```
  getOrSet: function(key, defaultValue) {
    var val = this.get(key);
    if(val != null) return val;

    this.set(key, defaultValue);
    return this.get(key);
  },

  // ** pie.model.gets **
  //
  // Retrieve multiple values at once.
  // Returns an object of names & values.
  // Path keys will be transformed into objects.
  // ```
  // model.gets('foo.baz', 'bar');
  // //=> {foo: {baz: 'fooBazValue'}, bar: 'barValue'}
  // ```
  gets: function() {
    var args = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    o = {};

    args.forEach(function(arg){
      if(this.has(arg)) {
        pie.object.setPath(o, arg, this.get(arg));
      }
    }.bind(this));

    return o;
  },

  // ** pie.model.has **
  //
  // Determines whether a path exists in our data.
  // ```
  // model.has('foo.bar')
  // //=> true | false
  // ```
  has: function(path) {
    return !!pie.object.hasPath(this.data, path);
  },

  // ** pie.model.hasAll **
  //
  // Determines whether all paths exist in our data.
  // ```
  // model.hasAll('foo', 'bar')
  // //=> true | false
  // ```
  hasAll: function() {
    var args = pie.array.change(arguments, 'from', 'flatten'), i;

    for(i = 0; i < args.length; i++) {
      if(!this.has(args[i])) return false;
    }
    return true;
  },

  // ** pie.model.hasAny **
  //
  // Determines whether any key given exists
  // ```
  // model.hasAny('foo', 'bar')
  // //=> true | false
  // ```
  hasAny: function() {
    var args = pie.array.change(arguments, 'from', 'flatten'), i;

    for(i = 0; i < args.length; i++) {
      if(this.has(args[i])) return true;
    }
    return !args.length;
  },

  hasObserver: function(key) {
    return !!this.observedKeyCounts['__version'] || !!this.observedKeyCounts[key];
  },

  // ** pie.model.is **
  //
  // Boolean check the value at `path`.
  // ```
  // model.is('foo.bar')
  // //=> true | false
  // ```
  is: function(path) {
    return !!this.get(path);
  },

  // ** pie.model.merge **
  //
  // Set keys, but do so by merging with the current values
  // ```
  // model.set('location.city', "San Francisco")
  // model.set('location.lat', 0);
  // model.set('location.lng', 0);
  // model.merge({location: {lat: 37.77, lng: -122.44}})
  // model.get('location')
  // //=> {city: "San Francico", lat: 37.77, lng: -122.44}
  merge: function(/* objs */) {
    var obj = arguments.length > 1 ? pie.object.deepMerge.apply(null, arguments) : arguments[0];
    obj = pie.object.flatten(obj);
    this.sets(obj);
  },

  // ** pie.model.observe **
  //
  // Register an observer and optionally filter by key.
  // If no keys are provided, any change will result in the observer being triggered.
  // ```
  // model.observe(function(changeSet){
  //   console.log(changeSet);
  // });
  // ```
  // ```
  // model.observe(function(changeSet){
  //   console.log(changeSet);
  // }, 'fullName');
  // ```
  observe: function(/* fn1[, fn2, fn3[, key1, key2, key3]] */) {
    var args = pie.array.change(arguments, 'from', 'flatten'),
    part = pie.array.partition(args, pie.object.isFunction),
    fns = part[0],
    keys = part[1],
    cnt;

    if(!keys.length) keys = ['__version'];

    keys.forEach(function(k) {
      cnt = this.observedKeyCounts[k];
      this.observedKeyCounts[k] = (cnt || 0) + 1;
    }.bind(this));

    fns.forEach(function(fn){

      /* Setting the uid is needed because we'll want to manage unobservation effectively. */
      pie.uid(fn);

      this.observations[pie.uid(fn)] = {
        fn: fn,
        keys: keys
      };

    }.bind(this));

    return this;
  },

  // ** pie.model.reset **
  //
  // Reset a model to it's empty state, without affecting the `__version` attribute.
  // Optionally, you can pass any options which are valid to `sets`.
  // ```
  // model.reset({skipObservers: true});
  // ```
  reset: function(options) {
    var keys = Object.keys(this.data), o = {};

    keys.forEach(function(k){
      if(k === '__version') return;
      o[k] = undefined;
    });

    return this.sets(o, options);
  },

  // ** pie.model.set **
  //
  // Set a `value` on the model at the specified `key`.
  // Valid options are:
  // * skipObservers - when true, observers will not be triggered.
  // * skipParents   - when true, parent change records will not be sent.
  // * skipChildren  - when true, child change records will not be sent.
  //
  // *Note: skipping observation does not stop `changeRecords` from accruing.*
  // ```
  // model.set('foo', 'bar');
  // model.set('foo.baz', 'bar');
  // model.set('foo', 'bar', {skipObservers: true});
  // ```
  set: function(key, value, options) {

    if(pie.object.isPlainObject(value) && !pie.object.isEmpty(value)) {
      // since we're overriding an object we need to unset it.
      // we add change records for the children, but don't worry about the parents
      // since the sets() will take care of that.
      this.set(key, undefined, pie.object.merge({}, options, {
        skipObservers: true,
        skipParents: true
      }));

      value = pie.object.flatten(value, key + '.');
      this.sets(value, options);
      return;
    }

    var changeName = key,
    changeType, changeOldValue, changeValue;

    changeOldValue = pie.object.getPath(this.data, key);

    /* If we haven't actually changed, don't bother doing anything. */
    if((!options || !options.force) && value === changeOldValue) return this;

    if(changeOldValue !== undefined) {
      changeType = 'update';
    }

    var parentKeys = (!options || !options.skipParents) && ~key.indexOf('.') ? pie.string.pathSteps(key).slice(1) : null,
    childKeys, nestedOpts, i;


    if((!options || !options.skipChildren) && pie.object.isPlainObject(changeOldValue)) {
      childKeys = Object.keys(pie.object.flatten(changeOldValue, key + '.'));
    }

    nestedOpts = childKeys || parentKeys ? pie.object.merge({}, options, {skipChildren: true, skipParents: true}) : null;

    if(childKeys && childKeys.length) {
      // add change records for the deleted children.
      for(i = 0; i < childKeys.length; i++) {
        this.set(childKeys[i], undefined, nestedOpts);
      }
    }

    changeValue = value;

    /* If we are "unsetting" the value, delete the path from `this.data`. */
    if(value === undefined) {
      changeType = 'delete';
      pie.object.deletePath(this.data, key);

    /* Otherwise, we set the value within `this.data`. */
    } else {
      pie.object.setPath(this.data, key, value);
      changeType = changeType || 'add';
    }

    if(parentKeys && parentKeys.length) {
      var parentVal;

      for(i = 0; i < parentKeys.length; i++) {

        parentVal = this.get(parentKeys[i]);

        if(changeType === 'delete' && pie.object.isObject(parentVal) && pie.object.isEmpty(parentVal)) {
          this.set(parentKeys[i], undefined, nestedOpts);
        } else {
          this.addChangeRecord(parentKeys[i], 'pathUpdate', undefined, undefined);
        }
      }
    }

    /* Add the change to the `changeRecords`. */
    this.addChangeRecord(changeName, changeType, changeOldValue, changeValue);


    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords(options);
  },

  // ** pie.model.setData **
  //
  // Update data to contain only the keys defined by obj.
  // Results in the same data value as a `reset` + `sets` BUT change records will reflect
  // the updates, not the removal + the additions.
  //
  // ```
  // model.setData({foo: 'bar', bar: 'baz'})
  // model.setData({bar: 'foo'})
  // //=> change records will include a deleted foo, and an updated bar.
  // model.data
  // //=> {__version: 3, bar: 'foo'}
  // ```
  setData: function(obj, options) {
    var existing = Object.keys(pie.object.flatten(this.data)),
    given = Object.keys(pie.object.flatten(obj)),
    removed = pie.array.subtract(existing, given),
    rmOptions = pie.object.merge({}, options, {skipObservers: true});

    removed = pie.array.remove(removed, '__version');

    removed.forEach(function(rm){
      this.set(rm, undefined, rmOptions);
    }.bind(this));

    return this.sets(obj, options);
  },

  // ** pie.model.sets **
  //
  // Set a bunch of stuff at once.
  // Change records will not be delivered until all keys have been set.
  // ```
  // model.sets({foo: 'bar', baz: 'qux'}, {skipObservers: treu});
  // ```
  sets: function(obj, options) {
    var innerOpts = pie.object.merge({}, options, {skipObservers: true});
    pie.object.forEach(obj, function(k,v) {
      this.set(k, v, innerOpts);
    }.bind(this));

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords(options);
  },

  // ** pie.model.test **
  //
  // Test a `value` against the value at `path`.
  // If `value` is a regular expression it will stringify the path's value and test against the regex.
  // ```
  // model.test('foo', 'bar');
  // model.test('firstName', 'Douglas');
  // model.test('firstName', /doug/i);
  // ```
  test: function(path, value) {
    var owned = this.get(path);
    if(owned === value) return true;
    else if(owned == null) return false;
    else if (pie.object.isRegExp(value)) return value.test(String(owned));
    else return false;
  },

  // ** pie.model.touch **
  //
  // Bumps the __version by 1 and delivers change records to observers of __version
  // ```
  // model.touch();
  // ```
  touch: function() {
    this.trackVersion();
    this.deliverChangeRecords({skipVersionTracking: true});
  },

  // ** pie.model.trackVersion **
  //
  // Increment the `__version` of this model.
  // Observers are skipped since this is invoked while change records are delivered.
  trackVersion: function() {
    var oldVal = this.data.__version,
    newVal = oldVal + 1;
    this.data.__version = newVal;
    this.addChangeRecord('__version', 'update', oldVal, newVal);
    return this;
  },

  // ** pie.model.unobserve **
  //
  // Unregister an observer. Optionally for specific keys.
  // If a subset of the original keys are provided it will only unregister
  // for those provided.
  unobserve: function(/* fn1[, fn2, fn3[, key1, key2, key3]] */) {
    var args = pie.array.change(arguments, 'from', 'flatten'),
    part = pie.array.partition(args, pie.object.isFunction),
    fns = part[0],
    keys = part[1],
    observation,
    cnt;

    keys.forEach(function(k) {
      cnt = this.observedKeyCounts[k];
      if(cnt) this.observedKeyCounts[k] = cnt - 1;
    }.bind(this))

    fns.forEach(function(fn){
      pie.uid(fn);

      observation = this.observations[pie.uid(fn)];
      if(!observation) return;

      if(!keys.length) {
        delete this.observations[pie.uid(fn)];
        return;
      }

      observation.keys = pie.array.subtract(observation.keys, keys);

      if(!observation.keys.length) {
        delete this.observations[pie.uid(fn)];
        return;
      }
    }.bind(this));

    return this;
  }
});
