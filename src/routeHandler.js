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

    this.urlModel = this.app.parsedUrl;
    this.emitter  = this.app.emitter;

    this._super();
  },

  // Reload the page without reloading the browser.
  // Alters the current view's _pieName to appear as invalid for the route.
  refresh: function() {
    var current = this.app.getChild('currentView');
    current._pieName = '__remove__';
    this.urlModel.touch();
  },


  currentView: function() {
    return this.app.getChild("currentView");
  },

  handle: function(changeSet) {
    return this.handleRedirect(changeSet) || this.handleView(changeSet);
  },

  handleRedirect: function(/* changeSet */) {
    var redirectTo = this.urlModel.get('redirect');
    if(redirectTo) {
      this.app.go(redirectTo);
      return true;
    } else {
      return false;
    }
  },

  handleView: function(changeSet) {
    var current = this.currentView();

    // if the view that's in there is already loaded, don't remove / add again.
    if(current && current._pieName === this.urlModel.get(this.options.viewKey)) {
      this.emitter.fire('navigationUpdated', changeSet);
      if(pie.object.has(current, 'navigationUpdated', true)) current.navigationUpdated(changeSet);
      return true;
    }

    if(!this.urlModel.get(this.options.viewKey)) return false;

    this.transitionToNewView(changeSet);
    return true;
  },

  // The process for transitioning to a new view.
  // Both the current view and the next view are optional.
  transitionToNewView: function(changeSet) {
    var current = this.currentView(),
        target, viewClass, child, transition;

    target = pie.object.isString(this.options.uiTarget) ? pie.qs(this.options.uiTarget) : this.options.uiTarget;

    // Provide some events that can be observed around the transition process.
    this.emitter.fire('beforeViewChanged', changeSet);
    this.emitter.fireAround('aroundViewChanged', function() {

      this.emitter.fire('viewChanged', changeSet);

      // Use the view key of the urlModel to find the viewClass.
      // At this point we've already verified the view option exists, so we don't have to check it.
      viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.urlModel.get(this.options.viewKey));

      // The instance to be added. If the class is not defined, this could and should blow up.
      child = viewClass.create({ app: this.app });

      // Cache an identifier on the view so we can invoke navigationUpdated instead of reloading
      // if the url changes but the view does not
      child._pieName = this.urlModel.get(this.options.viewKey);

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
        this.emitter.fire('afterViewChanged', changeSet);
      }.bind(this));

    }.bind(this));
  },
});
