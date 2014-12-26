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

  register: function(name, fn) {
    this.set(name, fn);
  },

  provide: function() {
    return this.data;
  }

});
