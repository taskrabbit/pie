pie.resources = pie.model.extend('resources', {

  init: function(app, srcMap) {
    this._super({
      srcMap: srcMap || {},
      loaded: {}
    }, {
      app: app
    });
  },

  _appendNode: function(node) {
    var target = document.querySelector('head');
    target = target || document.body;
    target.appendChild(node);
  },

  _inferredResourceType: function(src) {
    if((/(\.|\/)js(\?|$)/).test(src)) return 'script';
    if((/(\.|\/)css(\?|$)/).test(src)) return 'link';
    return 'ajax';
  },

  _normalizeSrc: function(srcOrOptions) {
    var options = typeof srcOrOptions === 'string' ? {src: srcOrOptions} : pie.object.merge({}, srcOrOptions);
    return options;
  },

  _loadajax: function(options, resourceOnload) {
    var ajaxOptions = pie.object.merge({
      verb: 'GET',
      url: options.src
    }, options, {
      success: resourceOnload
    });

    this.app.ajax.ajax(ajaxOptions);
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
    this.set('srcMap.' + name, options);
  },

  load: function(/* src1, src2, src3, onload */) {
    var sources = pie.array.change(pie.array.from(arguments), 'flatten', 'compact'),
    onload = pie.object.isFunction(pie.array.last(sources)) ? sources.pop() : function(){},
    fns;

    sources = sources.map(this._normalizeSrc.bind(this));

    fns = sources.map(function(options){
      options = this.get('srcMap.' + options.src) || options;

      var src = options.src,
      loadedKey = 'loaded.' + src;

      return function(cb) {
        if(this.get(loadedKey) === true) {
          cb();
          return true;
        }

        if(this.get(loadedKey)) {
          this.get(loadedKey).push(cb);
          return false;
        }

        this.set(loadedKey, [cb]);

        var type = options.type || this._inferredResourceType(options.src),
        resourceOnload = function() {

          this.get(loadedKey).forEach(function(fn) { if(fn) fn(); });
          this.set(loadedKey, true);

          if(options.callbackName) delete window[options.callbackName];
        }.bind(this);

        if(options.callbackName) {
          window[options.callbackName] = resourceOnload;
        }


        this['_load' + type](options, resourceOnload);

        return false;
      }.bind(this);
    }.bind(this));

    pie.fn.async(fns, onload);
  }
});
