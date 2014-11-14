pie.services.navigator = function(app) {
  this.app = app;
  pie.model.prototype.constructor.call(this, {});
};

pie.inherit(pie.services.navigator, pie.model);

pie.services.navigator.prototype.go = function(path, params, replace) {
  var url = path;

  params = params || {};

  if(this.get('path') === path && this.get('query') === params) {
    return this;
  }

  if(Object.keys(params).length) {
    url += '?';
    url += pie.object.serialize(params);
  }

  window.history[replace ? 'replaceState' : 'pushState']({}, document.title, url);

  return this.setDataFromLocation();
};


pie.services.navigator.prototype.start = function() {
  return this.setDataFromLocation();
};

pie.services.navigator.prototype.setDataFromLocation = function() {
  var query = window.location.search.slice(1);
  query = pie.string.deserialize(query);

  this.sets({
    url: window.location.href,
    path: window.location.pathname,
    query: query
  });

  return this;
};
