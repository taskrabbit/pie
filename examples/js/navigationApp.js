window.app = pie.app.create({
  routerOptions: {
    root: '/examples/navigation/'
  },
  routeHandlerOptions: {
    uiTarget: '#main'
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


// -----------------------------------


window.subapp = pie.app.create({
  navigator: false,
  routeHandlerOptions: {
    uiTarget: '#subapp'
  }
});

subapp.router.map({
  '/view-a' : {view: 'viewA', name: 'viewA'},
  '/view-b' : {view: 'viewB', name: 'viewB'},
  '/*path' : {view: 'ugh'}
});

subapp.go('/view-a');
