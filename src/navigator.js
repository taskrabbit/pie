// # Pie Navigator
// The navigator is in charge of observing browser navigation and updating it's data.
// It's also the place to conduct push/replaceState history changes.
// The navigator is simply a model, enabling observation, computed values, etc.
pie.navigator = pie.model.extend('navigator', {

  init: function(app, options) {
    this._super({}, pie.object.merge({ app: app }, options));

    this.state = this.app.state;
    this.state.observe(this.evaluateState.bind(this), '__fullId', '__route');

    this.app.emitter.once('start', this.start.bind(this));
  },

  evaluateState: function() {
    if(this.state.is('__route')) this.softGo();
    else this.hardGo();
  },

  softGo: function() {
    var replace = !this.state.is('__history');
    window.history[replace ? 'replaceState' : 'pushState']({}, document.title, this.state.get('__fullId'));
  },

  hardGo: function() {
    window.location.href = this.state.get('__fullId');
  },

  navigateApp: function() {
    var path = window.location.pathname + window.location.search;
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
