pie.model = function(d, options) {
  this.data = $.extend({}, d);
  this.options = options || {};
  this.uid = pie.unique();
  this.observations = {};
  this.changeRecords = [];
};

pie.util.extend(pie.model.prototype, pie.mixins.inheritance);


pie.model.prototype.deliverChangeRecords = function() {
  var observers, change, o;

  while(change = this.changeRecords.shift()) {
    observers = pie.array.union(this.observations[change.name], this.observations.__all__);
    while(o = observers.shift()) {
      o.call(null, change);
    }
  }

  return this;
};


pie.model.prototype.get = function(key) {
  return pie.util.getPath(key, this.data);
};


pie.model.prototype.gets = function() {
  var args = pie.array.args(arguments), o = {};
  args = pie.array.flatten(args);
  args = pie.array.compact(args);

  args.forEach(function(arg){
    o[arg] = pie.util.getPath(arg, this.data);
  }.bind(this));

  return pie.object.compact(o);
};


// fn[, key1, key2, key3]
pie.model.prototype.observe = function() {
  var keys = pie.array.args(arguments),
  fn = keys.shift();

  if(!keys.length) keys.push('__all__');

  keys.forEach(function(k) {
    this.observations[k] = this.observations[k] || [];
    if(this.observations[k].indexOf(fn) < 0) this.observations[k].push(fn);
  }.bind(this));

  return this;
};


pie.model.prototype.set = function(key, value, skipObservers) {
  var change = { name: key, object: this.data };

  if(pie.util.hasPath(key, this.data)) {
    change.type = 'update';
    change.oldValue = pie.util.getPath(key, this.data);
  } else {
    change.type = 'add';
  }

  change.value = value;
  pie.util.setPath(key, value, this.data);

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




