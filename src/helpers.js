// # Pie Helpers
// A registry for template helpers.
// Any helper function register here will be available in the
// templates rendered by the associated app's `templates` object.
// ```
// helpers.register('upcase', pie.string.upcase);
// helpers.register('reverse', function(str){
//   return str.split('').reverse().join('');
// });
// ```
// Now, in your templates you'll be able to use these helpers:
// ```
// <h1>[%= h.upcase(data.fullName) %]</h1>
// <p>[%= h.reverse(data.jibberish) %]</p>
// ```
// Note: these do not become global functions but rather are local to each template.
pie.helpers = pie.model.extend('helpers', {

  init: function(app, options) {
    this._super({
      fns: {}
    }, {
      app: app,
      variableName: 'h'
    });

    var i18n = this.app.i18n;

    this.register('t', i18n.t.bind(i18n));
    this.register('l', i18n.l.bind(i18n));
    this.register('timeago', i18n.timeago.bind(i18n));
    this.register('path', this.app.router.path.bind(this.app.router));
    this.register('get', pie.object.getPath);
  },

  /* Register a function to be available in templates. */
  register: function(name, fn) {
    return this.set('fns.' + name, fn);
  },

  /* Provide the functions which should be available in templates. */
  functions: function() {
    return this.get('fns');
  },

  provideVariables: function() {
    return "var " + this.options.variableName + " = pie.apps[" + this.app.pieId + "].helpers.functions();";

  }

});
