/* global lib */

pie.ns('lib.views');

lib.views.nav = pie.view.extend('nav', {

  init: function(el) {
    this._super({
      renderOnSetup: true,
      template: 'nav',
      setup: true,
      el: document.body,
    });
  },

  setup: function() {
    app.emitter.on('urlChanged', this.navigationChanged.bind(this));
    this.emitter.on('afterSetup', this.render.bind(this));

    this.on('click', '.nav-toggle', this.toggleNav.bind(this));
    this._super();
  },

  render: function() {
    this.qs('.page-nav').innerHTML = app.templates.render('nav');
  },

  navigationChanged: function() {
    var path = app.parsedUrl.pathWithRoot,
    target = this.qs('.page-nav ul li a[href="' + path + '"]');

    pie.dom.all(this.qsa('.page-nav li.is-active'), 'classList.remove', 'is-active');

    if(target) target.parentNode.classList.add('is-active');
    this.el.classList.remove('nav-active');
  },

  toggleNav: function() {
    this.el.classList.toggle('nav-active');
  }

});



lib.views.page = pie.activeView.extend('page', {
  init: function() {
    this._super({
      renderOnSetup: true
    });
  },

  setup: function(){
    this.emitter.on('aroundRender', this.loadTemplate.bind(this));
    this._super();
  },

  loadTemplate: function(cb) {
    app.templates.load(this.templateName(), {url: this.templateUrl()}, cb);
  },

  navigationUpdated: function() {
    this.render();
  },

  templateName: function() {
    return app.parsedUrl.data.page || 'getting-started';
  },

  templateUrl: function() {
    return app.router.path('pageApi', {page: this.templateName()});
  }

});

window.app = new pie.app({
  uiTarget: '.page',
  navigationContainer: 'body',
  routerOptions: {
    root: '/docs/guide'
  }
});

// get a "nav" view in there. this is "outside" of the normal routed application since it's always present.
// alternatively, we could create a "layout" view to manage this and the current subview.
app.emitter.once('beforeStart', function() {
  var nav = new lib.views.nav();
  app.addChild('nav', nav);
});


// set up our page routes.
app.router.map({
  '/' : {view: 'page', name: 'root'},
  '/about' : {view: 'about', name: 'about'},
  '/:page' : {view: 'page', name: 'page'},
  'pageApi' : '/pages/:page.html'
});


app.i18n.load({
  project: 'pie.js',
  ns: 'pie',
  gist: '994b656c26b16d5c2c77'
});

app.helpers.register('gist', function(filename, gistId) {
  gistId = gistId || app.i18n.t('gist');
  return '<x-gist gist="' + gistId + '" filename="' + filename + '"></x-gist>';
});
