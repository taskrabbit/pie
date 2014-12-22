pie.route = pie.base.extend('route', {

  init: function(path, options) {
    this.pathTemplate = pie.string.normalizeUrl(path);
    this.splitPathTemplate = this.pathTemplate.split('/');
    this.pathRegex = new RegExp('^' + this.pathTemplate.replace(/(:[^\/]+)/g,'([^\\/]+)') + '$');
    this.options = options || {};
    this.name = this.options.name;
  },

  // assume path is already normalized and we've "matched" it.
  interpolations: function(path, parseValues) {
    var splitPath = path.split('/'),
    interpolations = {};

    for(var i = 0; i < splitPath.length; i++){
      if(/^:/.test(this.splitPathTemplate[i])) {
        interpolations[this.splitPathTemplate[i].replace(/^:/, '')] = splitPath[i];
      }
    }

    if(parseValues) interpolations = pie.string.deserialize(pie.object.serialize(interpolations), true);

    return interpolations;
  },

  isDirectMatch: function(path) {
    return path === this.pathTemplate;
  },

  isMatch: function(path) {
    return this.pathRegex.test(path);
  },

  path: function(data, interpolateOnly) {
    var usedKeys = [],
    s = this.pathTemplate,
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
