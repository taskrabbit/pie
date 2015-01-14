// Pie Helpers
// A registry for template helpers.
// Any helper function register here will be available in the
// templates rendered by the associated app's `templates` object.
pie.helpers = pie.model.extend('helpers', {

  init: function(app) {
    this._super({}, {
      app: app
    });

    var i18n = this.app.i18n;

    this.register('t', i18n.t.bind(i18n));
    this.register('l', i18n.l.bind(i18n));
    this.register('timeago', i18n.timeago.bind(i18n));
    this.register('path', this.app.router.path.bind(this.app.router));
    this.register('get', pie.object.getPath);
  },

  // Register a function to be available in templates.
  register: function(name, fn) {
    if(!this[name]) this[name] = fn;
    return this.set(name, fn);
  },

  // Provide the functions which should be available in templates.
  provide: function() {
    return this.data;
  }

});
