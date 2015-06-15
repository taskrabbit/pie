pie.cache = pie.model.extend('cache', {

  fetch: function(path, fn) {
    var value = this.get(path);
    if(value !== undefined) return value;
    value = pie.fn.valueFrom(fn);
    this.set(path, value);
    return value;
  }

});
