pie.services.resources = function(app, srcMap) {
  this.app = app;
  this.loaded = {};
  this.srcMap = srcMap || {};
};

pie.services.resources.prototype._normalizeSrc = function(srcOrOptions) {
  var options = pie.object.isString(srcOrOptions) ? {src: srcOrOptions} : pie.object.merge({}, srcOrOptions);
  return options;
};

pie.services.resources.prototype.define = function(name, srcOrOptions) {
  var options = this._normalizeSrc(srcOrOptions);
  this.srcMap[name] = options;
};

pie.services.resources.prototype.load = function(srcOrOptions, cb) {
  var options = this._normalizeSrc(srcOrOptions), src;
  options = this.srcMap[options.src] || options;
  src = options.src;

  // we've already taken care of this.
  if(this.loaded[src] === true) {
    if(cb) cb();
    return true;
  }

  // we're already working on retrieving this src, just append our cb to the callbacks..
  if(this.loaded[src]) {
    this.loaded[src].push(cb);
  } else {
    this.loaded[src] = [cb];

    var scriptOnload = function() {
      this.loaded[src].forEach(function(fn) { if(fn) fn(); });
      this.loaded[src] = true;

      if(options.callbackName) delete window[options.callbackName];
    }.bind(this);

    var script = document.createElement('script');

    if(!options.noAsync) script.async = true;
    if(options.callbackName) {
      window[options.callbackName] = scriptOnload;
    } else {
      script.onload = scriptOnload;
    }

    document.querySelector('head').appendChild(script);
    script.src = src;
  }

  return false;
};
