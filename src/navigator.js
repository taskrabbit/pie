// # Pie Navigator
// The navigator is in charge of observing browser navigation and updating it's data.
// It's also the place to conduct push/replaceState history changes.
pie.navigator = pie.base.extend('navigator', {

  init: function(app, options) {
    this._super();

    this.app = app;
    this.options = options;

    this.state = this.app.state;

    this.app.emitter.once('start', this.start.bind(this));
  },

  evaluateState: function() {

    if(this.state.test('__fullId', this.browserPath())) return;

    var route = this.state.get('__route');
    if(this.app.routeHandler.canRouteBeHandled(route)) this.softGo();
    else this.hardGo();
  },

  softGo: function() {
    var replace = !this.state.is('__history');
    window.history[replace ? 'replaceState' : 'pushState']({}, document.title, this.state.get('__fullId'));
  },

  hardGo: function() {
    window.location.href = this.state.get('__fullId');
  },

  browserPath: function() {
    return window.location.pathname + window.location.search;
  },

  navigateApp: function() {
    this.app.go(this.browserPath(), true);
  },

  // ** pie.navigator.start **
  //
  // Setup the pushstate observations and get our app's state bootstrapped.
  start: function() {
    // on popstate we trigger a pieHistoryChange event so any other navigator-enabled apps
    pie.dom.on(window, 'popstate', this.navigateApp.bind(this));

    this.state.observe(this.evaluateState.bind(this), '__fullId', '__route');
    this.navigateApp();
  }
});
