/* globals lib */

pie.ns('lib.mixins').toggler = {

  setup: function() {
    this.on('click', '.js-toggle', this.toggleView.bind(this));
    this._super();
    this.el.classList.add('view');
  },

  toggleView: function() {
    var target = this.app.parsedUrl.path.match(/\/a\.html/) ? 'b' : 'a';
    this.app.go(target);
  }
};

pie.ns('lib.views').viewA = pie.activeView.extend('viewA', {
  init: function() {
    this._super({
      template: 'viewA',
      renderOnSetup: true
    });
  }
}, lib.mixins.toggler);

pie.ns('lib.views').viewB = pie.activeView.extend('viewB', {
  init: function() {
    this._super({
      template: 'viewB',
      renderOnSetup: true
    });
  }
}, lib.mixins.toggler);


var basicApp, fadeApp, loadingApp, slideApp;

basicApp = new pie.app({
  uiTarget: '#basic'
});

fadeApp = new pie.app({
  uiTarget: '#fade',
  viewTransitionClass: pie.inOutViewTransition,
  viewTransitionOptions: { async: true }
});

loadingApp = new pie.app({
  uiTarget: '#loading',
  viewTransitionClass: pie.loadingViewTransition,
  viewTransitionOptions: {minDelay: 1000}
});

slideApp = new pie.app({
  uiTarget: '#slide',
  viewTransitionClass: pie.inOutViewTransition
});

[basicApp, fadeApp, loadingApp, slideApp].forEach(function(app) {
  if(app) {
    app.router.map({
      '/examples/transitions/a.html' : {view: 'viewA', name: 'a'},
      '/examples/transitions/b.html' : {view: 'viewB', name: 'b'}
    });
  }
});
