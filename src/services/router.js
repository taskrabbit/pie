pie.services.router = function(app) {
  this.app = app;
  this.routes = {};
  this.namedRoutes = {};
};



// get a url based on the current one but with the changes provided.
// this will even catch interpolated values.
// Given a named route: /things/page/:page.json
// And the current path == /things/page/1.json?q=test
// app.changedUrl({page: 3, q: 'newQuery'});
// # => /things/page/3.json?q=newQuery
pie.services.router.prototype.changedUrl = function(changes) {
  var current = this.app.parsedUrl;
  return this.router.path(current.name || current.path, pie.h.extend({}, current.interpolations, current.query, changes));
},


// normalize a path to be evaluated by the router
pie.services.router.prototype.normalizePath = function(path) {

  // ensure there's a leading slash
  if(path.charAt(0) !== '/') {
    path = '/' + path;
  }

  if(path.indexOf('?') > 0) {
    var split = path.split('?');
    path = this.normalizePath(split.shift());
    split.unshift(path);
    path = split.join('?');
  }

  // remove trailing hashtags
  if(path.charAt(path.length - 1) === '#') {
    path = path.substr(0, path.length - 1);
  }

  // remove trailing slashes
  if(path.charAt(path.length - 1) === '/') {
    path = path.substr(0, path.length - 1);
  }

  // remove

  return path;
},


// invoke to add routes to the routers routeset.
// routes objects which contain a "name" key will be added as a name lookup.
// you can pass a set of defaults which will be extended into each route object.
pie.services.router.prototype.route = function(routes, defaults){
  defaults = defaults || {};

  // remove the cache
  delete this._routeKeys;

  pie.object.forEach(routes, function(k,r) {

    if('object' === typeof r) {

      k = this.normalizePath(k);

      this.routes[k] = pie.h.extend({}, defaults, r);

      if(r.hasOwnProperty('name')) {
        this.namedRoutes[r.name] = k;
      }
    } else {
      this.namedRoutes[k] = r;
    }
  }.bind(this));
};

// will return the named path. if there is no path with that name it will return itself.
// you can optionally pass a data hash and it will build the path with query params or
// with path interpolation path("/foo/bar/:id", {id: '44', q: 'search'}) => "/foo/bar/44?q=search"
pie.services.router.prototype.path = function(nameOrPath, data, interpolateOnly) {
  var o = this.namedRoutes[nameOrPath],
  s = ('string' === typeof o) ? o : nameOrPath,
  usedKeys = [],
  params,
  unusedData;

  data = data || {};
  s = this.normalizePath(s);

  s = s.replace(/\:([a-zA-Z0-9_]+)/g, function(match, key){
    usedKeys.push(key);
    if(data[key] === undefined || data[key] === null || data[key].toString().length === 0) {
      throw new Error("[PIE] missing route interpolation: " + match);
    }
    return data[key];
  });

  unusedData = pie.object.except(data, usedKeys);
  params = pie.h.serialize(pie.object.compact(unusedData, true));

  if(!interpolateOnly && params.length) {
    s = pie.string.urlConcat(s, params);
  }

  return s;

};

// provides the keys of the routes in a sorted order relevant for matching most descriptive to least
pie.services.router.prototype.routeKeys = function() {
  if(this._routeKeys) return this._routeKeys;
  this._routeKeys = Object.keys(this.routes);

  var ac, bc, c, d = [];

  // sorts the route keys to be the most exact to the most generic
  this._routeKeys.sort(function(a,b) {
    ac = (a.match(/:/g) || d).length;
    bc = (b.match(/:/g) || d).length;
    c = ac - bc;
    c = c || (b.length - a.length);
    c = c || (ac < bc ? 1 : (ac > bc ? -1 : 0));
    return c;
  });

  return this._routeKeys;
};

// look at the path and determine the route which this matches.
pie.services.router.prototype.parseUrl = function(path) {

  var keys = this.routeKeys(),
    i = 0,
    j, key, match, splitUrl, splitKey, query,
    interpolations, fullPath, pieces;

  pieces = path.split('?');

  path = pieces.shift();
  path = this.normalizePath(path);

  query = pieces.join('&') || '';

  // a trailing slash will bork stuff
  if (path.length > 1 && path[path.length - 1] === '/') path = path.slice(0, -1);

  // is there an explicit route for this path? it wins if so
  match = this.routes[path];
  interpolations = {};
  splitUrl = path.split('/');

  if(match) {
    match = pie.h.extend({routeKey: path}, match);
  } else {
    while (i < keys.length && !match) {
      key = keys[i];

      if(typeof this.routes[key] !== 'object') {
        i++;
        continue;
      }

      this.routes[key].regex = this.routes[key].regex || new RegExp('^' + key.replace(/(:[^\/]+)/g,'([^\\/]+)') + '$');

      if (this.routes[key].regex.test(path)) {
        match = pie.h.extend({routeKey: key}, this.routes[key]);
        splitKey = key.split('/');
        for(j = 0; j < splitKey.length; j++){
          if(/^:/.test(splitKey[j])) {
            interpolations[splitKey[j].replace(/^:/, '')] = splitUrl[j];
            match[splitKey[j]] = splitUrl[j];
          }
        }
      }
      i++;
    }
  }

  query = pie.h.deserialize(query);
  fullPath = pie.array.compact([path, pie.h.serialize(query)], true).join('?');

  return pie.h.extend({
    interpolations: interpolations,
    path: path,
    query: query,
    fullPath: fullPath
  }, match);
};
