var root = ~window.location.pathname.indexOf('/example/') ? window.location.pathname.split('/example/')[0] + '/example/' : '/';

window.app = new pie.app({
  uiTarget: '#main',
  viewNamespace: 'example.views'
});

// Routes

app.router.route({
  '/index.html' : { view: 'layout' }
});


// VIEWS

window.example = {
  views: {}
};

window.example.views.layout = function layout() {
  debugger;
  pie.view.call(this, {
    template: 'layoutContainer',
    renderOnAddedToParent: true
  });
};

window.example.views.layout.prototype = pie.util.extend(Object.create(pie.simpleView.prototype), {

});

