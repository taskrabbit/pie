// # Pie Resources
//
// An external resource loader. It specializes in retrieving scripts, stylesheets, and generic ajax content.
// Upon load of the external resource a callback can be fired. Resources can be registered beforehand to make
// development a bit easier and more standardized.
// ```
// resources.define('googleMaps', '//maps.google.com/.../js');
// resources.define('templates', {src: '/my-templates.html', dataSuccess: parseTemplates});
//
// resources.load('googleMaps', 'templates', 'customI18n', function(){
//   google.Maps.doStuff();
// });
// ```
pie.resources = pie.model.extend('resources', {

  // ** pie.resources.init **
  //
  // Provide an app and a source map (shortcut all the `resources.define()` calls).
  // ```
  // pie.resources.create(app, {googleMaps: '//maps.google.com/.../js'});
  // ```
  init: function(app, srcMap) {
    this._super({
      srcMap: srcMap || {},
      loaded: {}
    }, {
      app: app
    });

    pie.object.forEach(function(k,v) {
      this.define(k, v);
    }.bind(this));
  },

  _appendNode: function(node) {
    var target = pie.qs('head');
    target = target || document.body;
    target.appendChild(node);
  },

  _inferredResourceType: function(src) {
    if((/(\.|\/)js(\?|$)/).test(src)) return 'script';
    if((/(\.|\/)css(\?|$)/).test(src)) return 'link';
    if((/\.(png|jpeg|jpg|gif|svg|tiff|tif)(\?|$)/).test(src)) return 'image';
    return 'ajax';
  },

  _normalizeSrc: function(srcOrOptions) {
    var options = typeof srcOrOptions === 'string' ? {src: srcOrOptions} : pie.object.merge({}, srcOrOptions);
    return options;
  },

  // **pie.resources.\_loadajax**
  //
  // Conduct an ajax request and invoke the `resourceOnload` function when complete
  //
  // Options:
  // * **src** - the url of the request
  // * ** * ** - any valid ajax options
  _loadajax: function(options) {
    var ajaxOptions = pie.object.merge({
      verb: 'GET',
      url: options.src
    }, options);

    return this.app.ajax.ajax(ajaxOptions).promise();
  },

  // **pie.resources.\_loadimage**
  //
  // Load an image and invoke `resourceOnload` when complete.
  // Options:
  // * **src** - the url of the image.
  _loadimage: function(options, resourceOnload) {
    return pie.promise.create(function(resolve, reject){
      var img = new Image();
      img.onload = function(){ resolve(pie.object.merge({ img: img }, options)); };
      img.onerror = reject;
      img.src = options.src;
    });

  },

  // **pie.resources.\_loadlink**
  //
  // Adds a `<link>` tag to the dom if the "type" of the resource is "link".
  //
  // Options:
  // * **src** - the url of the resource
  // * **media** - _(optional)_ defaulting to `screen`, it's the media attribute of the `<link>`
  // * **rel** - _(optional)_ defaulting to `stylesheet`, it's the rel attribute of the `<link>`
  // * **contentType** - _(optional)_ defaulting to `text/css`, it's the type attribute of the `<link>`
  //
  // _Note that since `<link>` tags don't provide a callback, the onload happens immediately._
  _loadlink: function(options) {
    var link = document.createElement('link');

    link.href = options.src;
    link.media = options.media || 'screen';
    link.rel = options.rel || 'stylesheet';
    link.type = options.contentType || 'text/css';

    this._appendNode(link);

    /* Need to record that we added this thing. */
    /* The resource may not actually be present yet. */
    return pie.promise.resolve();
  },

  // **pie.resources.\_loadscript**
  //
  // Adds a `<script>` tag to the dom if the "type" is "script"
  //
  // Options:
  // * **src** - the url of the script.
  // * **callbackName** - _(optional)_ the global callback name the loading library will invoke
  // * **noAsync** - _(optional)_ if true, the script will be loaded synchronously.
  _loadscript: function(options) {

    return pie.promise.create(function(resolve, reject) {
      var script = document.createElement('script');

      if(options.noAsync) script.async = false;

      /* If options.callbackName is present, the invoking method self-references itself so it can clean itself up. */
      /* Because of this, we don't need to invoke the onload */
      if(!options.callbackName) {
        var done = false;
        script.onload = script.onreadystatechange = function loadScriptCallback(){
          if(!done && (!this.readyState || this.readyState==='loaded' || this.readyState==='complete')) {
            done = true;
            resolve();
          }
        };

        script.onerror = reject;
      }

      this._appendNode(script);
      script.src = options.src;

    }.bind(this));
  },

  // ** pie.resources.define **
  //
  // Define a resource by human readable `name`. `srcOrOptions` is a url or
  // an options hash as described by the relevant `_load` function.
  // ```
  // resources.define('googleMaps', '//maps.google.com/.../js');
  // ```
  define: function(name, srcOrOptions) {
    var options = this._normalizeSrc(srcOrOptions);
    this.set('srcMap.' + name, options);
  },

  // ** pie.resources.load **
  //
  // Load resources defined by each argument.
  // If the last argument is a function it will be invoked after all resources have loaded.
  // ```
  // resources.load('foo', 'bar', function callback(){});
  // resources.load(['foo', 'bar'], function(){});
  // resources.load('//maps.google.com/.../js');
  // resources.load({src: '/templates.html', dataSuccess: parseTemplates}, function callback(){});
  // ```
  load: function(/* src1, src2, src3, onload */) {
    var sources = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    promises;

    sources = sources.map(this._normalizeSrc.bind(this));

    /* we generate a series of functions to be invoked by pie.fn.async */
    /* each function's responsibility is to invoke the provided callback when the resource is loaded */
    promises = sources.map(function resourceLoadPromiseGenerator(options){

      /* we could be dealing with an alias, so make sure to grab the real source */
      options = this.get('srcMap.' + options.src) || options;

      /* we cache the loading promise on our promises object */
      var promise = this.get('promises.' + options.src);
      var type = options.type || this._inferredResourceType(options.src)

      if(!promise) {
        promise = this['_load' + type](options);

        /* if a global callback name is desired, set it up then tear it down when the promise resolves */
        if(options.callbackName) {
          window[options.callbackName] = promise.resolve.bind(promise);
          promise = promise.then(function(){ delete window[options.callbackName]; });
        }

        this.set('promises.' + options.src, promise);
      }

      return promise;
    }.bind(this));

    return pie.promise.all(promises);
  }
});
