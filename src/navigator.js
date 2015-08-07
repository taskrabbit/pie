// # Pie Navigator
// The navigator is in charge of observing browser navigation and updating it's data.
// It's also the place to conduct push/replaceState history changes.
// The navigator is simply a model, enabling observation, computed values, etc.
pie.navigator = pie.model.extend('navigator', {

  init: function(app, options) {
    this._super({
      root: options && options.root || '/'
    }, pie.object.merge({ app: app }, options));

    this.state = this.app.state;

    this.compute('rootRegex', 'root');
    this.state.observe(this.evaluateState.bind(this), 'id', 'route');

    this.app.emitter.once('start', this.start.bind(this));
  },


  // **pie.router.rootRegex**
  //
  // A regex for testing whether a path starts with the declared root
  rootRegex: function() {
    return new RegExp('^' + this.get('root') + '(.+)');
  },

  evaluateState: function() {
    if(this.state.is('route')) this.softGo();
    else this.hardGo();
  },

  softGo: function() {
    var replace = !this.state.is('history');
    window.history[replace ? 'replaceState' : 'pushState']({}, document.title, this.navigatorStateId());
  },

  hardGo: function() {
    window.location.href = this.navigatorStateId();
  },

  navigatorStateId: function(id) {
    id = id || this.state.get('id')
    return pie.string.normalizeUrl( this.get('root') + '/' +  id);
  },

  navigateApp: function() {
    var path = window.location.href;
    var match = this.get('rootRegex').exec(path);
    if(match) path = match[1];
    this.app.go(path, true);
  },

  // ** pie.navigator.start **
  //
  // Setup the pushstate observations and get our app's state bootstrapped.
  start: function() {
    pie.dom.on(window, 'popstate', this.navigateApp.bind(this));
    this.navigateApp();
  }
});
