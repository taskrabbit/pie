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
  },

  navigationChanged: function() {
    var path = app.navigator.get('path'),
    target = this.qs('ul li a[href="' + path + '"]');

    pie.dom.all(this.qsa('li.is-active'), 'classList.remove', 'is-active');

    if(target) target.parentNode.classList.add('is-active');
  }

});



lib.views.page = function() {
  pie.activeView.prototype.constructor.call(this, {
    renderOnInit: true
  });
};

pie.inherit(lib.views.page, pie.activeView, {

  templateName: function() {
    return app.parsedUrl.name + 'Page';
  }

});


lib.views.gettingStarted = function(){ this._construct(); };
pie.inherit(lib.views.gettingStarted, lib.views.page);


lib.views.models = function(){ this._construct(); };
pie.inherit(lib.views.models, lib.views.page);


lib.views.views = function(){ this._construct(); };
pie.inherit(lib.views.views, lib.views.page);


lib.views.utils = function(){ this._construct(); };
pie.inherit(lib.views.utils, lib.views.page);


window.app = new pie.app({ uiTarget: '.page' });

// get a "nav" view in there. this is "outside" of the normal routed application since it's always present.
// alternatively, we could create a "layout" view to manage this and the current subview.
app.emitter.on('beforeStart', function() {
  var nav = new lib.views.nav();
  app.addChild('nav', nav);
}, {onceOnly: true});


// set up our page routes.


app.router.route({
  '/' : {view: 'gettingStarted', name: 'gettingStarted'},
  '/models' : {view: 'models', name: 'models'},
  '/views' : {view: 'views', name: 'views'},
  '/utils' : {view: 'utils', name: 'utils'}
});
