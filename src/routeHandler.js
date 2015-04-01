pie.ns('pie.routeHandlers');



pie.routeHandlers.base = pie.base.extend('routeHandler', {
  init: function(app, options) {
    this.app = app;
    this.options = options || {};
    this.urlModel = this.app.parsedUrl;
    this.emitter = this.app.emitter;
    this._super();
  },

  handle: function() {
    // concrete classes override this.
  }
});



// Look for a "redirect" key and tell the app to go there.
pie.routeHandlers.redirect = pie.routeHandlers.base.extend('redirectRouteHandler', {
  handle: function() {
    var redirectTo = this.urlModel.get('redirect');
    if(redirectTo) this.app.go(redirectTo);
  }
});




pie.routeHandlers.view = pie.routeHandlers.base.extend('viewRouteHandler', {

  init: function(app, options) {
    this._super(app, options);

    var setOpt = function(name, defalt) {
      if(pie.object.has(this.options, name)) return;
      if(pie.object.has(this.app.options, name)) return this.options[name] = this.app.options[name];
      this.options[name] = defalt;
    }.bind(this);

    // the place to search for matching views.
    setOpt('viewNamespace', 'lib.views');

    // the element or selector to attach our view to
    setOpt('uiTarget', 'body');

    // the key to access in the urlModel
    setOpt('viewKey', 'view');

    // The view transition class to be used when transitioning between pages.
    setOpt('viewTransitionClass', pie.simpleViewTransition);

    // You can also provide `viewTransitionOptions` which will be merged into the constructor of this class.
    setOpt('viewTransitionOptions', {});
  },

  currentView: function() {
    return app.getChild(this.options.viewKey + ".currentView");
  },

  handle: function() {
    var current = this.currentView();

    // if the view that's in there is already loaded, don't remove / add again.
    if(current && current._pieName === this.urlModel.get(this.options.viewKey)) {
      this.emitter.fire('navigationUpdated', this);
      if(pie.object.has(current, 'navigationUpdated', true)) current.navigationUpdated();
      return;
    }

    this.transitionToNewView();
  },

  // The process for transitioning to a new view.
  // Both the current view and the next view are optional.
  transitionToNewView: function() {
    var current = this.currentView(),
        target, viewClass, child, transition;

    target = (this.options.parentView || pie).qs(this.options.uiTarget);

    // Provide some events that can be observed around the transition process.
    this.emitter.fire('beforeViewChanged', this);
    this.emitter.fireAround('aroundViewChanged', function() {

      this.emitter.fire('viewChanged', this);

      // Use the view key of the urlModel to find the viewClass.
      // At this point we've already verified the view option exists, so we don't have to check it.
      viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.urlModel.get(this.options.viewKey));

      // The instance to be added. If the class is not defined, this could and should blow up.
      child = new viewClass({ app: this.app });

      // Cache an identifier on the view so we can invoke navigationUpdated instead of reloading
      // if the url changes but the view does not
      child._pieName = this.urlModel.get(this.options.viewKey);

      // Instantiate a transition object based on the app configuration.
      transition = new this.options.viewTransitionClass(this.app, pie.object.merge({
        oldChild: current,
        newChild: child,
        childName: this.options.viewKey + ".currentView",
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
        this.emitter.fire('afterViewChanged', this);
      }.bind(this));

    }.bind(this));
  },
});
