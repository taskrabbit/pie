pie.cache = pie.model.extend('cache', {

  init: function(data, options) {
    this._super(data, options);
  },

  clear: function() {
    this.reset();
  },

  del: function(path) {
    this.set(path, undefined);
  },

  expire: function(path, ttl) {
    var value = this.get(path);

    if(value === undefined) return false;

    this.set(path, value, {ttl: ttl});
    return true;
  },

  get: function(path) {
    var wrap = this._super(path);
    if(!wrap || !wrap.__data) return wrap;
    if(wrap.__expiresAt && wrap.__expiresAt <= this.currentTime()) {
      this.set(path, undefined);
      return undefined;
    }

    return wrap.__data;
  },

  set: function(path, value, options) {
    if(value == null || path === '_version' || (options && options.noWrap)) {
      this._super(path, value, options);
    } else {
      var wrap = this.wrap(value, options);
      this._super(path, wrap, pie.object.merge({noWrap: true}, options));
    }
  },

  wrap: function(obj, options) {
    options = options || {};
    // it could come in on a couple different keys.
    var expiresAt = options.expiresAt || options.expiresIn || options.ttl;

    if(expiresAt) {
      // make sure we don't have a date.
      if(pie.object.instanceOf(expiresAt, 'Date')) expiresAt = expiresAt.getTime();
      // or a string
      if(pie.object.isString(expiresAt)) {
        // check for a numeric
        if(/^\d+$/.test(expiresAt)) expiresAt = parseInt(expiresAt, 10);
        // otherwise assume ISO
        else expiresAt = pie.date.timeFromISO(expiresAt).getTime();
      }

      // we're dealing with something smaller than a current milli epoch, assume we're dealing with a ttl.
      if(String(expiresAt).length < 13) expiresAt = this.currentTime() + expiresAt;
    }

    return {
      __data: pie.fn.valueFrom(obj),
      __expiresAt: expiresAt,
      __notPlain: true
    };
  },

  currentTime: function() {
    return pie.date.now();
  }
});
