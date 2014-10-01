pie.model = function(d, options) {
  this.data = pie.object.extend({}, d);
  this.options = options || {};
  this.uid = pie.unique();
  this.observations = {};
  this.changeRecords = [];
};

pie.object.extend(pie.model.prototype, pie.mixins.inheritance);


pie.model.prototype.deliverChangeRecords = function() {
  var observers = {}, os, o, change, all;

  while(change = this.changeRecords.shift()) {
    os = pie.array.union(this.observations[change.name], this.observations.__all__);

    while(o = os.shift()) {
      observers[o.uid] = observers[o.uid] || {fn: o, changes: []};
      observers[o.uid].changes.push(change);
    }
  }

  pie.object.forEach(observers, function(uid, obj) {
    obj.fn.call(null, obj.changes);
  });

  return this;
};


pie.model.prototype.get = function(key) {
  return pie.object.getPath(this.data, key);
};


pie.model.prototype.gets = function() {
  var args = pie.array.args(arguments), o = {};
  args = pie.array.flatten(args);
  args = pie.array.compact(args);

  args.forEach(function(arg){
    o[arg] = pie.object.getPath(this.data, arg);
  }.bind(this));

  return pie.object.compact(o);
};


// fn[, key1, key2, key3]
pie.model.prototype.observe = function() {
  var keys = pie.array.args(arguments),
  fn = keys.shift();

  fn.uid = fn.uid || String(pie.unique());

  keys = pie.array.flatten(keys);

  if(!keys.length) keys.push('__all__');

  keys.forEach(function(k) {
    this.observations[k] = this.observations[k] || [];
    if(this.observations[k].indexOf(fn) < 0) this.observations[k].push(fn);
  }.bind(this));

  return this;
};


pie.model.prototype.set = function(key, value, skipObservers) {
  var change = { name: key, object: this.data };

  if(pie.object.hasPath(this.data, key)) {
    change.type = 'update';
    change.oldValue = pie.object.getPath(this.data, key);
  } else {
    change.type = 'add';
  }

  change.value = value;
  pie.object.setPath(this.data, key, value);

  this.changeRecords.push(change);
  this.trackTimestamps(key, skipObservers);

  if(skipObservers) return this;
  return this.deliverChangeRecords();
};

pie.model.prototype.sets = function(obj, skipObservers) {
  pie.object.forEach(obj, function(k,v) {
    this.set(k, v, true);
  }.bind(this));

  if(skipObservers) return this;
  return this.deliverChangeRecords();
};


pie.model.prototype.trackTimestamps = function(key, skipObservers) {
  if(!this.options.timestamps) return;
  if(key === 'updated_at') return;
  this.set('updated_at', new Date().getTime(), skipObservers);
};


// fn[, key1, key2, key3]
pie.model.prototype.unobserve = function() {
  var keys = pie.array.args(arguments),
  fn = keys.shift(),
  i;

  if(!keys.length) keys = Object.keys(this.observations);

  keys.forEach(function(k){
    i = this.observations[k].indexOf(fn);
    if(~i) this.observations[k].splice(i,1);
  }.bind(this));

  return this;
};

pie.model.prototype.compute = function(/* name, *properties, fn */) {
  var props = pie.array.args(arguments),
  name = props.shift(),
  fn = props.pop();

  this.observe(function(changes){
    this.set(name, fn.call(this));
  }.bind(this), props);

  // initialize it
  this.set(name, fn.call(this));
};




