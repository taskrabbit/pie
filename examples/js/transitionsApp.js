/* globals lib */

pie.ns('lib.mixins').toggler = {

  setup: function() {
    this.on('click', '.js-toggle', 'toggleView')
    this._super();
    this.el.classList.add('view');
  },

  toggleView: function() {
    var target = this.app.state.get('__fullId').match(/\/a\.html/) ? 'b' : 'a';
    this.app.go(target);
  }
};

pie.ns('lib.views').viewA = pie.activeView.extend('viewA', {templateName: 'viewA'}, lib.mixins.toggler);
pie.ns('lib.views').viewB = pie.activeView.extend('viewB', {templateName: 'viewB'}, lib.mixins.toggler);

var basicApp, fadeApp, loadingApp, slideApp;

basicApp = pie.app.create({
  routeHandlerOptions: {
    uiTarget: '#basic'
  }
});

fadeApp = pie.app.create({
  routeHandlerOptions: {
    uiTarget: '#fade',
    viewTransitionClass: pie.inOutViewTransition,
    viewTransitionOptions: { async: true }
  }
});

loadingApp = pie.app.create({
  routeHandlerOptions: {
    uiTarget: '#loading',
    viewTransitionClass: pie.loadingViewTransition,
    viewTransitionOptions: {minDelay: 1000}
  }
});

slideApp = pie.app.create({
  routeHandlerOptions: {
    uiTarget: '#slide',
    viewTransitionClass: pie.inOutViewTransition
  }
});

[basicApp, fadeApp, loadingApp, slideApp].forEach(function(app) {
  if(app) {
    app.router.map({
      '/examples/transitions/a.html' : {view: 'viewA', name: 'a'},
      '/examples/transitions/b.html' : {view: 'viewB', name: 'b'}
    });
  }
});
