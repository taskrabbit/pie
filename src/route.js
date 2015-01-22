// # Pie Route
//
// Represents a route used by the router.
// Routes understand if they match string paths, they know how to extract interpolations from a path,
// and know how to generate a path given some data.
// ```
// r = new pie.route('/foo/:id');
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

  init: function(path, options) {
    this._super({
      pathTemplate: pie.string.normalizeUrl(path)
    }, options);

    this.name = this.options.name;

    this.compute('splitPathTemplate', 'pathTemplate');
    this.compute('interpolationsCount', 'pathTemplate');
    this.compute('pathRegex', 'pathTemplate');
  },

  // **pie.route.splitPathTemplate**
  //
  // The pathTemplate split into segments.
  // Since this is a computed property, we only ever have to do this once.
  splitPathTemplate: function() {
    return this.get('pathTemplate').split('/');
  },

  // **pie.route.interpolationsCount**
  //
  // The number of interpolations this route has.
  // Since this is a computed property, we only ever have to do this once.
  interpolationsCount: function() {
    var m = this.get('pathTemplate').match(/:/g);
    return m && m.length || 0;
  },

  // **pie.route.pathRegex**
  //
  // A RegExp representing the path.
  // Since this is a computed property, we only ever have to do this once.
  pathRegex: function() {
    return new RegExp('^' + this.get('pathTemplate').replace(/(:[^\/]+)/g,'([^\\/]+)') + '$');
  },

  // **pie.route.interpolations**
  //
  // Under the assumption that the path is already normalized and we've "matched" it,
  // extract the interpolations from `path`. If `parseValues` is true, the values will
  // be parsed based on `pie.string.deserialize`'s implementation.
  // ```
  // r = new pie.route('/foo/:id');
  // r.interolations('/foo/bar');
  // //=> {id: 'bar'}
  // ```
  interpolations: function(path, parseValues) {
    var splitPaths = path.split('/'),
    tmpls = this.get('splitPathTemplate'),
    interpolations = {},
    splitPath, tmpl;

    for(var i = 0; i < splitPaths.length; i++){
      tmpl = tmpls[i];
      splitPath = splitPaths[i];
      if(splitPath !== tmpl) {
        if(/^:/.test(tmpl)) {
          interpolations[tmpl.replace(/^:/, '')] = splitPath;
        }
      }
    }

    if(parseValues) interpolations = pie.string.deserialize(pie.object.serialize(interpolations), true);

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
  // r = new pie.route('/foo/:id');
  // r.path({id: 'bar'})
  // //=> '/foo/bar'
  // r.path({id: 'baz', page: 2});
  // //=> '/foo/baz?page=2'
  // r.path({id: 'qux', page: 2}, true);
  // //=> '/foo/qux'
  // ```
  path: function(data, interpolateOnly) {
    var usedKeys = [],
    s = this.get('pathTemplate'),
    params,
    unusedData;

    data = data || {};

    s = s.replace(/\:([a-zA-Z0-9_]+)/g, function(match, key){
      usedKeys.push(key);
      if(data[key] === undefined || data[key] === null || data[key].toString().length === 0) {
        throw new Error("[PIE] missing route interpolation: " + match);
      }
      return data[key];
    });

    s = pie.string.normalizeUrl(s);

    unusedData = pie.object.except(data, usedKeys);
    params = pie.object.serialize(pie.object.compact(unusedData, true));

    if(!interpolateOnly && params.length) {
      s = pie.string.urlConcat(s, params);
    }

    return s;
  }

});
