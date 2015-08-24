pie.pathHelper = pie.base.extend('pathHelper', {

  hostRegex: /^(https?:\/\/)([^\/]+)(.+)/,

  currentHost: function() {
    return window.location.host;
  },

  isCurrentHost: function(incoming) {
    return this.currentHost() === incoming;
  },

  stripHost: function(incoming, options) {
    var m = incoming.match(this.hostRegex);
    if(!m) return incoming;
    if(options && options.onlyCurrent && this.isCurrentHost(m[1])) return m[3];
    if(options && options.onlyOther && !this.isCurrentHost(m[1])) return m[3];
    return m[3];
  },

  hasHost: function(incoming) {
    return this.hostRegex.test(incoming);
  },

  pathAndQuery: function(path, query) {
    var o = {
      path: path,
      query: query
    };

    if(path && path.indexOf('?') >= 0) {
      var split = path.split('?');
      o.query = pie.object.merge(pie.string.deserialize(split[1]), query);
      o.path = split[0];
    }

    return o;
  }

});
