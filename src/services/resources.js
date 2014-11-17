pie.services.resources = function(app) {
  this.app = app;
  this.loaded = {};
  this.srcMap = {};
};

pie.services.resources.prototype.define = function(name, src) {
  this.srcMap[name] = src;
};

pie.services.resources.prototype.load = function(src, cb) {
  src = this.srcMap[src] || src;

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

    var script = document.createElement('script');
    script.async = true;
    script.onload = function() {
      console.log('loaded ' + src);
      pie.array.map(pie.array.compact(this.loaded[src]), 'call', true);
      this.loaded[src] = true;
    }.bind(this);

    document.querySelector('head').appendChild(script);
    script.src = src;
  }

  return false;
};
