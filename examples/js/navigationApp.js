/* global bindings */
window.app = pie.app.create({
  routerOptions: {
    root: '/examples/navigation/'
  }
});

app.router.map({
  '/view-a' : {view: 'viewA', name: 'viewA'},
  '/view-b' : {view: 'viewB', name: 'viewB'},
  '/*path' : {view: 'ugh'}
});

pie.ns('lib.views').viewA = pie.activeView.extend({templateName: function(){ return 'viewA'; }});
pie.ns('lib.views').viewB = pie.activeView.extend({templateName: function(){ return 'viewB'; }});
pie.ns('lib.views').ugh = pie.activeView.extend({templateName: function(){ return 'ugh'; }});
