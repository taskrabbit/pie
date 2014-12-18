pie.resources = pie.base.extend('resources', {

  init: function(app, srcMap) {
    this.app = app;
    this.loaded = {};
    this.srcMap = srcMap || {};
  },

  _appendNode: function(node) {
    var target = document.querySelector('head');
    target = target || document.body;
    target.appendChild(node);
  },

  _inferredResourceType: function(src) {
    return (/(\.|\/)js(\?|$)/).test(src) ? 'script' : 'link';
  },

  _normalizeSrc: function(srcOrOptions) {
    var options = typeof srcOrOptions === 'string' ? {src: srcOrOptions} : pie.object.merge({}, srcOrOptions);
    return options;
  },

  _loadscript: function(options, resourceOnload) {

    var script = document.createElement('script');

    if(options.noAsync) script.async = false;

    if(!options.callbackName) {
      script.onload = resourceOnload;
    }

    this._appendNode(script);
    script.src = options.src;

  },

  _loadlink: function(options, resourceOnload) {
    var link = document.createElement('link');

    link.href = options.src;
    link.media = options.media || 'screen';
    link.rel = options.rel || 'stylesheet';
    link.type = options.type || 'text/css';

    this._appendNode(link);

    // need to record that we added this thing.
    // the resource may not actually be present yet.
    resourceOnload();
  },

  define: function(name, srcOrOptions) {
    var options = this._normalizeSrc(srcOrOptions);
    this.srcMap[name] = options;
  },

  load: function(srcOrOptions, cb) {
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

      var type = options.type || this._inferredResourceType(options.src),
      resourceOnload = function() {

        this.loaded[src].forEach(function(fn) { if(fn) fn(); });
        this.loaded[src] = true;

        if(options.callbackName) delete window[options.callbackName];
      }.bind(this);

      if(options.callbackName) {
        window[options.callbackName] = resourceOnload;
      }


      this['_load' + type](options, resourceOnload);
    }

    return false;
  }
});
