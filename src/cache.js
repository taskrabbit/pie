pie.cache = function(data, options) {
  pie.model.prototype.constructor.call(this, data, options);
};

pie.inherit(pie.cache, pie.model);


pie.cache.prototype.del = function(path) {
  this.set(path, undefined);
};

pie.cache.prototype.expire = function(path, ttl) {
  var value = this.get(path);

  if(value === undefined) return false;

  this.set(path, value, {ttl: ttl});
  return true;
};


pie.cache.prototype.get = function(path) {
  var wrap = pie.model.prototype.get.call(this, path);
  if(!wrap) return undefined;
  if(wrap.expiresAt && wrap.expiresAt <= this.currentTime()) {
    this.set(path, undefined);
    return undefined;
  }

  return wrap.data;
};


pie.cache.prototype.getOrSet = function(path, value, options) {
  var result = this.get(path);
  if(result !== undefined) return result;
  this.set(path, value, options);
  return value;
};


pie.cache.prototype.set = function(path, value, options) {
  if(value === undefined) {
    pie.model.prototype.set.call(this, path, undefined);
  } else {
    var wrap = this.wrap(value, options);
    pie.model.prototype.set.call(this, path, wrap);
  }
};


pie.cache.prototype.wrap = function(obj, options) {
  options = options || {};

  // it could come in on a couple different keys.
  var expiresAt = options.expiresAt || options.expiresIn || options.ttl;

  if(expiresAt) {
    // make sure we don't have a date.
    if(expiresAt instanceof Date) expiresAt = expiresAt.getTime();
    // or a string
    if(typeof expiresAt === 'string') {
      // check for a numeric
      if(/^\d+$/.test(expiresAt)) expiresAt = parseInt(expiresAt, 10);
      // otherwise assume ISO
      else expiresAt = pie.date.timeFromISO(expiresAt).getTime();
    }

    // we're dealing with something smaller than a current milli epoch, assume we're dealing with a ttl.
    if(String(expiresAt).length < 13) expiresAt = this.currentTime() + expiresAt;
  }

  return {
    data: obj,
    expiresAt: expiresAt
  };
};


pie.cache.prototype.currentTime = function() {
  return pie.date.now();
};
