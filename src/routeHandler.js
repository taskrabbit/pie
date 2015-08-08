pie.routeHandler = pie.base.extend('routeHandler', {

  init: function(app, options) {
    this.app = app;
    this.options = pie.object.merge({
      viewNamespace: 'lib.views',
      uiTarget: 'body',
      viewKey: 'view',
      viewTransitionClass: pie.simpleViewTransition,
      viewTransitionOptions: {}
    }, options);

    this.state = this.app.state;
    this.emitter  = this.app.emitter;

    this.state.observe(this.onRouteChange.bind(this), '__route');
    this._super();
  },

  currentView: function() {
    return this.app.getChild("currentView");
  },

  onRouteChange: function() {
    var route = this.state.get('__route');
    this.handleRedirect(route) || this.handleView(route);
  },

  handleRedirect: function(route) {
    var redirectTo = route && route.get('config.redirect');
    if(redirectTo) {
      this.app.go(redirectTo);
      return true;
    } else {
      return false;
    }
  },

  handleView: function(route) {

    if(route) {
      var current = this.currentView();
      // if the view that's in there is already loaded, don't remove / add again.
      if(current && current._pieName === route.get('config.' + this.options.viewKey)) return true;
      if(!route.get('config.' + this.options.viewKey)) return false;
    }

    this.transitionToNewView(route);
    return true;
  },

  // The process for transitioning to a new view.
  // Both the current view and the next view are optional.
  transitionToNewView: function(route) {
    var current = this.currentView(),
        target, viewClass, child, transition;

    target = pie.object.isString(this.options.uiTarget) ? pie.qs(this.options.uiTarget) : this.options.uiTarget;

    // Provide some events that can be observed around the transition process.
    this.emitter.fire('beforeViewChanged');
    this.emitter.fireAround('aroundViewChanged', function() {

      this.emitter.fire('viewChanged');

      if(route) {
        // Use the view key of the route to find the viewClass.
        // At this point we've already verified the view option exists, so we don't have to check it.
        viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + route.get('config.' + this.options.viewKey));

        // The instance to be added. If the class is not defined, this could and should blow up.
        child = viewClass.create({ app: this.app });

        // Cache an identifier on the view so we can invoke navigationUpdated instead of reloading
        // if the url changes but the view does not
        child._pieName = route.get('config.' + this.options.viewKey);
      }

      // Instantiate a transition object based on the app configuration.
      transition = this.options.viewTransitionClass.create(this.app, pie.object.merge({
        oldChild: current,
        newChild: child,
        childName: "currentView",
        targetEl: target
      }, this.options.viewTransitionOptions));

      // Provide a couple common events out of the app.
      transition.emitter.on('afterRemoveOldChild', function() {
        this.emitter.fire('oldViewRemoved', current);
      }.bind(this));

      transition.emitter.on('afterTransition', function() {
        this.emitter.fire('newViewLoaded', child);
      }.bind(this));

      transition.transition(function(){
        // The instance is now our 'currentView'
        this.emitter.fire('afterViewChanged');
      }.bind(this));

    }.bind(this));
  },
});
