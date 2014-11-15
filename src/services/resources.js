pie.services.resources = function(app) {
  this.app = app;
  this.loaded = {};
  this.srcMap = {};
};

pie.services.resources.prototype.define = function(name, src) {
  this.srcMap[name] = src;
};

pie.services.resources.prototype.require = function(src, cb) {
  src = this.srcMap[src] || src;

  // we've already taken care of this.
  if(this.loaded[src]) {
    if(cb) cb();
    return true;
  }

  this.loaded[src] = true;

  var script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = cb;

  document.querySelector('head').appendChild(script);

  return false;
};
