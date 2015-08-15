// # Pie Router
//
// An interface for declaring, processing, and determing a collection of routes.
pie.router = pie.model.extend('router', {

  // **pie.router.init**
  //
  // Initialize a new router given an `app` and a set of options.
  // Options:
  // * **root** - the root to be prepended to all constructed routes. Defaults to `'/'`.
  init: function(app, options) {
    this._super({
      root: options && options.root || '/'
    }, pie.object.merge({app: app}, options));

    this.cache = pie.cache.create();
    this.state = this.app.state;

    if(!pie.string.endsWith(this.get('root'), '/')) throw new Error("The root option must end in a /");

    this.compute('rootRegex', 'root');
  },


  // **pie.router.rootRegex**
  //
  // A regex for testing whether a path starts with the declared root
  rootRegex: function() {
    return new RegExp('^' + this.get('root') + '(.+)?');
  },


  stateWillChange: function(path, query) {
    return this.cache.fetch('states::' + path, function() {
      path = this.stripRoot(path);

      var route = this.findRoute(path);
      var changes = { __route: route };

      if(route) {
        pie.object.merge(changes, route.get('config.state'), route.interpolations(path));
      }

      return changes;
    }.bind(this));
  },


  // **pie.router.findRoute**
  //
  // Find the most relevant route based on `nameOrPath`.
  // Direct matches match first, then the most relevant pattern match comes next.
  findRoute: function(path) {
    return this.cache.fetch('routes::' + path, function(){
      /* if a direct match is present, we return that */
      return this.findDirectMatch(path) || this.findPatternMatch(path);
    }.bind(this));
  },

  findDirectMatch: function(path) {
    return pie.array.detect(this.children, function(r){ return r.isDirectMatch(path); });
  },

  findPatternMatch: function(path) {
    return pie.array.detect(this.children, function(r){ return r.isMatch(path); });
  },


  // **pie.router.map**
  //
  // Add routes to this router.
  // Routes objects which contain a "name" key will be added as a name lookup.
  // You can pass a set of defaults which will be extended into each route object.
  // ```
  // router.map({
  //
  //   '/foo/:id' : {subView: 'foo',  name: 'foo'},
  //   '/bars'    : {subView: 'bars', name: 'bars'},
  //
  //   'api.whatever' : '/api/whatever.json'
  // }, {
  //   view: 'sublayout'
  // });
  // ```
  map: function(routes, defaults){
    defaults = defaults || {};

    var path, config, route, existing;

    pie.object.forEach(routes, function(k,r) {

      if(pie.object.isObject(r)) {
        path = k;
        config = r;
        if(defaults) config = pie.object.merge({}, defaults, config);
      } else {
        path = r;
        config = {name: k};
      }

      existing = this.findDirectMatch(path) || config.name;
      this.removeChild(existing);

      route = pie.route.create(path, config);
      this.registerRoute(route);
    }.bind(this));

    this.sortRoutes();
    this.cache.reset();
  },

  registerRoute: function(route) {
    this.addChild(route.get('name'), route);
  },

  // **pie.router.path**
  //
  // Will return the named path. If there is no path with that name it will return itself.
  // You can optionally pass a data hash and it will build the path with query params or
  // with path interpolation.
  // ```
  // router.path("/foo/bar/:id", {id: '44', q: 'search'})
  // //=> "/foo/bar/44?q=search"
  // ```
  // nameOrPath = 'viewB'
  // nameOrPath = '/examples/navigation/view-b'
  // nameOrPath = '/view-b'
  // nameOrPath = 'view-b'
  path: function(nameOrPath, query) {
    var route, path;

    if(nameOrPath.indexOf('/') === 0) {
      nameOrPath = this.stripRoot(nameOrPath);
      route = this.findRoute(nameOrPath);
    } else {
      route = this.getChild(nameOrPath, false)
    }

    if(!route) {
      route = pie.route.create(nameOrPath);
      this.registerRoute(route);
    // if we had a route, we might have interpolations
    } else {
      var interps = route.interpolations(nameOrPath);
      if(!pie.object.isEmpty(interps)) {
        query = pie.object.merge({}, query, interps);
      }
    }

    path = route.path(query);
    path = this.ensureRoot(path);

    return path;
  },

  // **pie.router.sortRoutes**
  //
  // Sorts the routes to be the most exact to the most generic.
  // * prefers fewer interpolations to more
  // * prefers more segments to less
  // * prefers more characters to less
  sortRoutes: function() {
    var c;

    this.sortChildren(function(a,b) {
      c = b.get('weight') - a.get('weight');
      c = c || b.get('pathTemplate').length - a.get('pathTemplate').length;
      c = c || a.get('pathTemplate').localeCompare(b.get('pathTemplate'));
      return c;
    });
  },

  stripRoot: function(path) {
    var match = path.match(this.get('rootRegex'));
    if(match) path = '/' + (match[1] || '');
    return path;
  },

  ensureRoot: function(path) {
    if(path.match(this.get('rootRegex'))) return path;

    var root = this.get('root');
    /* if path is representative of root, use our root. */
    if(path === '/' || path === '') return root;
    /* if the path is our root, but missing the trailing slash, use our root. */
    if(path === root.substr(0, root.length-1)) return root;
    return pie.string.normalizeUrl(root + path);
  }

}, pie.mixins.container);
