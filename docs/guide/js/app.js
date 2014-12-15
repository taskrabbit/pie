/* global lib */

pie.ns('lib.views');


lib.views.nav = function() {
  this._construct({
    el: document.querySelector('.page-nav')
  });
};

pie.inherit(lib.views.nav, pie.view, {

  init: function() {
    this.onChange(app.navigator, this.navigationChanged.bind(this), 'path');
    this._super('init');

    this.on('click', '.nav-toggle', this.toggleNav.bind(this));
  },

  navigationChanged: function() {
    var path = app.navigator.get('path'),
    target = this.qs('ul li a[href="' + path + '"]');

    pie.dom.all(this.qsa('li.is-active'), 'classList.remove', 'is-active');

    if(target) target.parentNode.classList.add('is-active');
    this.el.classList.remove('nav-active');
  },

  toggleNav: function() {
    this.el.classList.toggle('nav-active');
  }

});



lib.views.page = function() {
  pie.activeView.prototype.constructor.call(this, {
    renderOnInit: true
  });
};

pie.inherit(lib.views.page, pie.activeView, {

  init: function(){
    this.retrieveTemplate(function(){
      this._super('init');
    }.bind(this));
  },

  navigationUpdated: function() {
    this.retrieveTemplate(this.render.bind(this));
  },

  pageName: function() {
    return app.parsedUrl.data.page || 'gettingStarted';
  },

  retrieveTemplate: function(cb) {
    var name = this.pageName(),
    tmpl = app._templates[name];

    if(tmpl) {
      cb();
      return;
    }

    app.ajax.get({
      url: app.router.path('/pages/:page.html', {page: name}),
      verb: app.ajax.GET,
      type: 'html',
      dataSuccess: function(html) {
        app._templates[name] = pie.string.template(html);
        cb();
      }.bind(this)
    });
  },

  templateName: function() {
    return this.pageName();
  }

});

window.app = new pie.app({ uiTarget: '.page' });

// get a "nav" view in there. this is "outside" of the normal routed application since it's always present.
// alternatively, we could create a "layout" view to manage this and the current subview.
app.emitter.on('beforeStart', function() {
  var nav = new lib.views.nav();
  app.addChild('nav', nav);
}, {onceOnly: true});


// set up our page routes.


app.router.route({
  '/' : {view: 'page'},
  '/:page' : {view: 'page', name: 'page'}
});


app.i18n.load({
  project: 'pie.js'
});
