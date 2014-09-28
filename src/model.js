pie.model = function(d, options) {
  this.data = {};
  this.options = options || {};
  this.uid = pie.unique();
  this.observations = {};
  this.changeRecords = [];
  this.sets(d || {});
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
  return this.data[key];
};


pie.model.prototype.gets = function() {
  var args = pie.array.args(arguments);
  args = pie.array.flatten(args);
  args = pie.array.compact(args);

  args.unshift(this.data);

  return pie.object.slice.apply(null, args);
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

  if(key in this.data) {
    change.type = 'update';
    change.oldValue = this.data[key];
  } else {
    change.type = 'add';
  }

  this.data[key] = change.value = value;
  this.changeRecords.push(change);

  this.trackTimestamps(key);

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


pie.model.prototype.trackTimestamps = function(key) {
  if(!this.options.timestamps) return;
  if(key === 'updated_at') return;
  this.set('updated_at', new Date().getTime());
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




