// # Pie Config
// A place to store app configuration information.
// It allows for dynamic subconfigs to be defined as well.
//
// ```
// app.config.set('googleMapsKey', 'xyz');
// app.config.dynamic('env', {
//   "defaults" : {
//     analyticsEnabled: false
//   },
//   "production" : {
//     analyticsEnabled: true
//   }
// });
//
// app.config.get('googleMapsKey')
// //=> 'xyz'
//
// app.config.get('analyticsEnabled');
// //=> false
//
// app.config.set('env', 'production');
// app.config.get('analyticsEnabled');
// //=> true
// ```
pie.config = pie.model.extend('config', {

  init: function(app, options) {
    options = options || {};
    options.app = app;

    this._super({}, options);
    this.dynamicKeys = {};
  },

  _onDynamicChange: function(dynamic) {
    var val = this.get(dynamic),
    defaults, conf;

    defaults = this.get(dynamic + 'Config.defaults');
    conf = val && this.get(dynamic + 'Config.' + val);

    this.sets(pie.object.deepMerge({}, defaults, conf));
  },

  dynamic: function(dynamic, obj) {
    var current = this.get(dynamic + 'Config') || {};
    this.set(dynamic + 'Config', pie.object.deepMerge(current, obj));

    if(!this.dynamicKeys[dynamic]) {
      this.dynamicKeys[dynamic] = true;
      this.observe(function(){
        this._onDynamicChange(dynamic);
      }.bind(this), dynamic);
    }

    this._onDynamicChange(dynamic);
  }

});
