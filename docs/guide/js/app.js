/* global lib */

pie.ns('lib.views');

lib.views.nav = pie.activeView.extend('nav', {

  init: function(el) {
    this._super({
      renderOnSetup: true,
      template: 'nav',
      setup: true,
      uiTarget: document.body
    });
  },

  setup: function() {
    this.onChange(app.navigator, this.navigationChanged.bind(this), 'path');
    this.on('click', '.nav-toggle', this.toggleNav.bind(this));
    this._super();
  },

  navigationChanged: function() {
    var path = app.navigator.get('path'),
    target = this.qs('ul li a[href="' + path + '"]');

    pie.dom.all(this.qsa('li.is-active'), 'classList.remove', 'is-active');

    if(target) target.parentNode.classList.add('is-active');
    this.qs('.page-nav').classList.remove('nav-active');
  },

  toggleNav: function() {
    this.qs('.page-nav').classList.toggle('nav-active');
  }

});



lib.views.page = pie.activeView.extend('page', {

  setup: function(){
    this._super();
    this.retrieveTemplateAndRender();
  },

  navigationUpdated: function() {
    this.retrieveTemplateAndRender();
  },

  pageName: function() {
    return app.parsedUrl.data.page || 'getting-started';
  },

  retrieveTemplateAndRender: function() {
    app.templates.load(this.templateName(), function() {
      this.render();
    }.bind(this));
  },

  templateName: function() {
    return app.router.path('pageApi', {page: this.pageName()});
  }

});

lib.views.about = pie.activeView.extend('about', function() {
  this._super({
    template: 'about',
    renderOnSetup: true
  });
});

window.app = new pie.app({
  uiTarget: '.page',
  root: '/docs/guide',
  viewTransitionClass: pie.inOutViewTransition
});

// get a "nav" view in there. this is "outside" of the normal routed application since it's always present.
// alternatively, we could create a "layout" view to manage this and the current subview.
app.emitter.once('beforeStart', function() {
  var nav = new lib.views.nav();
  app.addChild('nav', nav);
});


// set up our page routes.
app.router.route({
  '/' : {view: 'page', name: 'root'},
  '/about' : {view: 'about', name: 'about'},
  '/:page' : {view: 'page', name: 'page'},
  'pageApi' : '/pages/:page.html'
});


app.i18n.load({
  project: 'pie.js',
  gist: '994b656c26b16d5c2c77'
});
