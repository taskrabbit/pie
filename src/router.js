pie.router = pie.model.extend('router', {

  init: function(app) {
    this._super({
      routes: [],
      routeNames: {},
      root: app.options.root || '/',
      cache: {}
    }, {
      app: app
    });


    this.compute('rootRegex', 'root');
  },

  rootRegex: function() {
    return new RegExp('^' + this.get('root'));
  },

  // get a url based on the current one but with the changes provided.
  // this will even catch interpolated values.
  // Given a named route: /things/page/:page.json
  // And the current path == /things/page/1.json?q=test
  // app.router.changedUrl({page: 3, q: 'newQuery'});
  // => /things/page/3.json?q=newQuery
  changedUrl: function(changes) {
    var current = this.app.parsedUrl;
    return this.path(current.route && current.route.name || current.path, pie.object.merge({}, current.data, changes));
  },


  findRoute: function(nameOrPath) {
    var route = this.get('routeNames.' + nameOrPath);
    route = route || pie.array.detect(this.get('routes'), function(r){ return r.isDirectMatch(nameOrPath); });
    route = route || pie.array.detect(this.get('routes'), function(r){ return r.isMatch(nameOrPath); });
    return route;
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

      if(defaults) config = pie.object.merge({}, defaults, config);

      route = new pie.route(path, config);
      this.get('routes').push(route);
      if(route.name) this.set('routeNames.' + route.name, route);
    }.bind(this));

    this.sortRoutes();
    this.set('cache', {});
  },

  // will return the named path. if there is no path with that name it will return itself.
  // you can optionally pass a data hash and it will build the path with query params or
  // with path interpolation path("/foo/bar/:id", {id: '44', q: 'search'}) => "/foo/bar/44?q=search"
  path: function(nameOrPath, data, interpolateOnly) {
    var r = this.findRoute(nameOrPath) || new pie.route(nameOrPath),
    path;

    data = pie.object.merge(r.interpolations(nameOrPath), data);
    path = r.path(data, interpolateOnly);

    // apply the root.
    if(!pie.string.PROTOCOL_TEST.test(path) && !this.get('rootRegex').test(path)) {
      path = this.get('root') + path;
      path = pie.string.normalizeUrl(path);
    }

    return path;
  },

  // sorts the routes to be the most exact to the most generic
  sortRoutes: function() {
    var ac, bc, c, d = Array(0);

    this.get('routes').sort(function(a,b) {
      a = a.get('pathTemplate');
      b = b.get('pathTemplate');

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
    var result = this.get('cache')[path];
    if(result) return result;

    var pieces, query, match, fullPath, interpolations;

    pieces = path.split('?');

    path = pieces.shift();
    path = path.replace(this.get('rootRegex'), '');
    path = pie.string.normalizeUrl(path);

    query = pieces.join('&') || '';

    match = this.findRoute(path);

    query = pie.string.deserialize(query, parseQuery);
    fullPath = pie.array.compact([path, pie.object.serialize(query)], true).join('?');
    interpolations = match && match.interpolations(path, parseQuery);

    result = pie.object.merge({
      path: path,
      fullPath: fullPath,
      interpolations: interpolations || {},
      query: query,
      data: pie.object.merge({}, interpolations, query),
      route: match
    }, match && match.options);

    this.get('cache')[path] = result;
    return result;

  }
});
