/* global lib */

pie.ns('lib.views');


lib.views.nav = pie.view.extend('nav', function() {
  this._super({
    el: document.querySelector('.page-nav')
  });
});

lib.views.nav.reopen({

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
    this.el.classList.remove('nav-active');
  },

  toggleNav: function() {
    this.el.classList.toggle('nav-active');
  }

});



lib.views.page = pie.activeView.extend('page', function() {
  this._super();
});

lib.views.page.reopen({

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
    var name = this.pageName(),
    tmpl = app._templates[name];

    if(tmpl) {
      this.render();
      return;
    }

    app.ajax.get({
      url: app.router.path('/pages/:page.html', {page: name}),
      verb: app.ajax.GET,
      type: 'html',
      dataSuccess: function(html) {
        app._templates[name] = pie.string.template(html);
        this.render();
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
app.emitter.once('beforeStart', function() {
  var nav = new lib.views.nav();
  app.addChild('nav', nav);
});


// set up our page routes.


app.router.route({
  '/' : {view: 'page'},
  '/:page' : {view: 'page', name: 'page'}
});


app.i18n.load({
  project: 'pie.js',
  gist: '994b656c26b16d5c2c77'
});
