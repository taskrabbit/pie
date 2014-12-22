pie.router = pie.base.extend('router', {

  init: function(app) {
    this.app = app;
    this.routes = [];
    this.routeNames = {};
    this.root = app.options.root || '/';
    this.rootRegex = new RegExp('^' + this.root);
  },

  // get a url based on the current one but with the changes provided.
  // this will even catch interpolated values.
  // Given a named route: /things/page/:page.json
  // And the current path == /things/page/1.json?q=test
  // app.router.changedUrl({page: 3, q: 'newQuery'});
  // # => /things/page/3.json?q=newQuery
  changedUrl: function(changes) {
    var current = this.app.parsedUrl;
    return this.path(current.route && current.route.name || current.path, pie.object.merge({}, current.data, changes));
  },


  // invoke to add routes to the routers routeset.
  // routes objects which contain a "name" key will be added as a name lookup.
  // you can pass a set of defaults which will be extended into each route object.
  route: function(routes, defaults){
    defaults = defaults || {};

    var path, config, route;

    pie.object.forEach(routes, function(k,r) {
      if(pie.object.isObject(r)) {
        path = k;
        config = r;
      } else {
        path = r;
        config = {name: k};
      }

      route = new pie.route(path, config);
      this.routes.push(route);
      if(route.name) this.routeNames[route.name] = route;
    }.bind(this));

    this.sortRoutes();
  },

  // will return the named path. if there is no path with that name it will return itself.
  // you can optionally pass a data hash and it will build the path with query params or
  // with path interpolation path("/foo/bar/:id", {id: '44', q: 'search'}) => "/foo/bar/44?q=search"
  path: function(nameOrPath, data, interpolateOnly) {
    var r = this.routeNames[nameOrPath] || new pie.route(nameOrPath),
    path = r.path(data, interpolateOnly);

    // apply the root.
    if(!pie.string.PROTOCOL_TEST.test(path) && !this.rootRegex.test(path)) {
      path = this.root + path;
      path = pie.string.normalizeUrl(path);
    }

    return path;
  },

  // sorts the routes to be the most exact to the most generic
  sortRoutes: function() {
    var ac, bc, c, d = [];

    this.routes.sort(function(a,b) {
      a = a.pathTemplate;
      b = b.pathTemplate;

      ac = (a.match(/:/g) || d).length;
      bc = (b.match(/:/g) || d).length;
      c = ac - bc;
      c = c || (b.length - a.length);
      c = c || (ac < bc ? 1 : (ac > bc ? -1 : 0));
      return c;
    });
  },

  // look at the path and determine the route which this matches.
  parseUrl: function(path, parseQuery) {
    var pieces, query, match, fullPath, interpolations;

    pieces = path.split('?');

    path = pieces.shift();
    path = path.replace(this.rootRegex, '');
    path = pie.string.normalizeUrl(path);

    query = pieces.join('&') || '';

    // is there an explicit route for this path? it wins if so
    match = pie.array.detect(this.routes, function(r){ return r.isDirectMatch(path); });

    if(!match) {
      match = pie.array.detect(this.routes, function(r){ return r.isMatch(path); });
      interpolations = match && match.interpolations(path, parseQuery);
    }

    query = pie.string.deserialize(query, parseQuery);
    fullPath = pie.array.compact([path, pie.object.serialize(query)], true).join('?');

    return pie.object.merge({
      path: path,
      fullPath: fullPath,
      interpolations: interpolations || {},
      query: query,
      data: pie.object.merge({}, interpolations, query),
      route: match
    }, match && match.options);

  }
});
