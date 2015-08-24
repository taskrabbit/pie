// # Pie Route
//
// Represents a route used by the router.
// Routes understand if they match string paths, they know how to extract interpolations from a path,
// and know how to generate a path given some data.
// ```
// r = pie.route.create('/foo/:id');
//
// r.isDirectMatch('/foo/bar')
// //=> false
// r.isMatch('/foo/bar')
// //=> true
//
// r.interpolations('/foo/bar')
// //=> {id: 'bar'}
//
// r.path({id: 'baz', page: 2})
// //=> '/foo/baz?page=2'
// ```
pie.route = pie.model.extend('route', {

  init: function(path, config) {
    var uid = pie.uid(this);

    this._super({
      pathTemplate: pie.string.normalizeUrl(path),
      config: config,
      name: config && config.name || ("route-" + uid)
    });

    this.set('config.name', undefined);

    this.compute('segments',            'pathTemplate');
    this.compute('pathRegex',           'pathTemplate');
    this.compute('hasInterpolations',   'pathTemplate');
    this.compute('weight',              'segments');
  },

  // **pie.route.segments**
  //
  // The pathTemplate split into segments.
  // Since this is a computed property, we only ever have to do this once.
  segments: function() {
    return this.get('pathTemplate').split('/');
  },

  // **pie.route.pathRegex**
  //
  // A RegExp representing the path.
  // Since this is a computed property, we only ever have to do this once.
  pathRegex: function() {
    var t = this.get('pathTemplate');
    t = pie.string.escapeRegex(t);
    t = t.replace(/(:[^\/\?]+)/g,'([^\\/\\?]+)');
    t = t.replace(/(\\\*[^\/]+)/g, '(.*)');
    return new RegExp('^' + t + '$');
  },

  // **pie.route.weight**
  //
  // A weight representing the specificity of the route. It compiles a number as a string
  // based on the type of segment then casts the number as an integer as part of the return statement.
  // Specificity is determined by:
  //   -
  // Since this is a computed property, we only ever have to do this once.
  weight: function() {
    var tmpls = this.get('segments'),
    w = '';

    tmpls.forEach(function(segment){
      if(segment.match(/^:([^\/]+)$/))
        w += '3';
      else if(segment.match(/^\*([^\/]+)$/))
        w += '2';
      else if(segment === '')
        w += '1';
      else
        w += '4';
    });

    return +w;
  },

  hasInterpolations: function() {
    return /[:\*]/.test(this.get('pathTemplate'));
  },

  // **pie.route.interpolations**
  //
  // Under the assumption that the path is already normalized and we've "matched" it,
  // extract the interpolations from `path`. If `parseValues` is true, the values will
  // be parsed based on `pie.string.deserialize`'s implementation.
  // ```
  // r = pie.route.create('/foo/:id');
  // r.interolations('/foo/bar');
  // //=> {id: 'bar'}
  // ```
  interpolations: function(path) {
    var interpolations = {};

    if(!this.is('hasInterpolations')) return interpolations;

    var splitPaths = path.split('/'),
    tmpls = this.get('segments'),
    splitPath, tmpl;

    for(var i = 0; i < splitPaths.length; i++){
      tmpl = tmpls[i];
      splitPath = splitPaths[i];
      if(splitPath !== tmpl) {
        if(tmpl.charAt(0) === ':') {
          interpolations[tmpl.substr(1)] = splitPath;
        } else if(tmpl.charAt(0) === '*') {
          interpolations[tmpl.substr(1)] = pie.array.get(splitPaths, i, -1).join('/');
          break;
        }
      }
    }

    return interpolations;
  },

  // **pie.route.isDirectMatch**
  //
  // Is the provided `path` a direct match to our definition?
  isDirectMatch: function(path) {
    return path === this.get('pathTemplate');
  },

  // **pie.route.isMatch**
  //
  // is the provided `path` a match based on our `pathRegex`.
  isMatch: function(path) {
    return this.get('pathRegex').test(path);
  },

  // **pie.route.path**
  //
  // Generate a path based on our template & the provided `data`. If `interpolateOnly` is true,
  // a query string will not be appended, even if there are extra items provided by `data`.
  // ```
  // r = pie.route.create('/foo/:id');
  // r.path({id: 'bar'})
  // //=> '/foo/bar'
  // r.path({id: 'baz', page: 2});
  // //=> '/foo/baz?page=2'
  // ```
  path: function(query) {
    var usedKeys = [], path = this.get('pathTemplate');

    path = path.replace(/([:\*])([a-zA-Z0-9_]+)/g, function(match, indicator, key){
      usedKeys.push(key);

      if(indicator === '*') return query && pie.object.has(query, key) ? query[key] : '';

      if(!query || query[key] == null ||  !String(query[key]).length) {
        throw new Error("[PIE] missing route interpolation: " + match);
      }
      return query[key];
    });

    var unusedData = usedKeys.length ? pie.object.except(query, usedKeys) : query;

    if(!pie.object.isEmpty(unusedData)) {
      var params = pie.object.serialize(pie.object.compact(unusedData, true));
      if(params.length) path = pie.string.urlConcat(path, params);
    }

    return path;
  }

});
