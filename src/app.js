// # pie.app
// The app class is the entry point of your application. It acts as container in charge of managing the page's context.
// It provides access to application utilities, routing, templates, i18n, etc.
// It observes navigation and changes the page's context automatically.
pie.app = pie.base.extend('app', {
  init: function(options) {

    // `pie.base.prototype.constructor` handles the setting of an app,
    // but we don't want a reference to another app within this app.
    delete this.app;

    // Set a global instance which can be used as a backup within the pie library.
    pie.appInstance = pie.appInstance || this;

    // Register with pie to allow for nifty global lookups.
    pie.apps[this.pieId] = this;

    // Default application options.
    this.options = pie.object.deepMerge({
      uiTarget: 'body',
      viewNamespace: 'lib.views',
      templateSelector: 'script[type="text/pie-template"]',
      root: '/'
    }, options);

    // `classOption` Allows class configurations to be provided in the following formats:
    // ```
    // new pie.app({
    //   i18n: myCustomI18nClass,
    //   i18nOptions: {foo: 'bar'}
    // });
    // // which will result in `this.i18n = new myCustomI18nClass(this, {foo: 'bar'});`
    // ```
    //
    // ```
    // var instance = new myCustomI18nClass();
    // new pie.app({
    //   i18n: instance,
    // });
    // // which will result in `this.i18n = instance; this.i18n.app = this;`
    // ```
    var classOption = function(key, _default){
      var k = this.options[key] || _default,
      opt = this.options[key + 'Options'] || {};

      return new k(this, opt);
    }.bind(this);

    // `app.emitter` is an interface for subscribing and observing app events
    this.emitter = classOption('emitter', pie.emitter);

    // `app.i18n` is the translation functionality
    this.i18n = classOption('i18n', pie.i18n);

    // `app.ajax` is ajax interface + app specific functionality.
    this.ajax = classOption('ajax', pie.ajax);

    // `app.notifier` is the object responsible for showing page-level notifications, alerts, etc.
    this.notifier = classOption('notifier', pie.notifier);

    // `app.errorHandler` is the object responsible for
    this.errorHandler = classOption('errorHandler', pie.errorHandler);

    // `app.router` is used to determine which view should be rendered based on the url
    this.router = classOption('router', pie.router);

    // `app.resources` is used for managing the loading of external resources.
    this.resources = classOption('resources', pie.resources);

    // Template helper methods are evaluated to the local variable `h` in templates.
    // Any methods registered with this helpers module will be available in templates
    // rendered by this app's `templates` object.
    this.helpers = classOption('helpers', pie.helpers);

    // `app.templates` is used to manage application templates.
    this.templates = classOption('templates', pie.templates);

    // `app.navigator` is the only navigator which should exist and be used within this app.
    this.navigator = classOption('navigator', pie.navigator);

    // `app.validator` a validator intance to be used in conjunction with this app's model activity.
    this.validator = classOption('validator', pie.validator);

    // The view transition class to be used when transitioning between pages.
    // Since a new instance of this is needed on every page change, just provide the class.
    // You can also provide viewTransitionOptions which will be merged into the constructor of this class.
    this.viewTransitionClass = this.options.viewTransitionClass || pie.simpleViewTransition;

    // After a navigation change, app.parsedUrl is the new parsed route
    this.parsedUrl = {};

    // We observe the navigator and handle changing the context of the page.
    this.navigator.observe(this.navigationChanged.bind(this), 'url');

    // Before we get going, observe link navigation & show any notifications stored
    // in localStorage.
    this.emitter.once('beforeStart', this.setupSinglePageLinks.bind(this));
    this.emitter.once('afterStart', this.showStoredNotifications.bind(this));

    if(!this.options.noAutoStart) {
      // Once the dom is loaded, start the app.
      document.addEventListener('DOMContentLoaded', this.start.bind(this));
    }
  },

  // Just in case the client wants to override the standard confirmation dialog.
  // Eventually this could create a confirmation view and provide options to it.
  // The view could have more options but would always end up invoking onConfirm or onDeny.
  confirm: function(options) {
    if(window.confirm(options.text)) {
      if(options.onConfirm) options.onConfirm();
    } else {
      if(options.onDeny) options.onDeny();
    }
  },

  // Print stuff if we're not in prod.
  debug: function(msg) {
    if(this.env === 'production') return;
    if(console && console.log) console.log('[PIE] ' + msg);
  },
  // Use this to navigate. This allows us to apply app-specific navigation logic
  // without altering the underling navigator.
  // This can be called with just a path, a path with a query object, or with notification arguments.
  // app.go('/test-url')
  // app.go('/test-url', true) // replaces state rather than adding
  // app.go(['/test-url', {foo: 'bar'}]) // navigates to /test-url?foo=bar
  // app.go('/test-url', true, 'Thanks for your interest') // replaces state with /test-url and shows the provided notification
  // app.go('/test-url', 'Thanks for your interest') // navigates to /test-url and shows the provided notification
  go: function(){
    var args = pie.array.from(arguments), path, notificationArgs, replaceState, query;

    path = args.shift();


    // ```
    // arguments => '/test-url', {query: 'object'}
    // ```
    if(typeof args[0] === 'object') {
      path = this.router.path(path, args.shift());

    // ```
    // arguments => '/test-url
    // arguments => ['/test-url', {query: 'object'}]
    // ```
    } else {
      path = this.router.path.apply(this.router, pie.array.from(path));
    }

    // If the next argument is a boolean, we care about replaceState
    if(pie.object.isBoolean(args[0])) {
      replaceState = args.shift();
    }

    // Anything left is considered arguments for the notifier.
    notificationArgs = args;

    if(pie.object.has(this.router.parseUrl(path), 'view')) {
      this.navigator.go(path, {}, replaceState);
      if(notificationArgs && notificationArgs.length) {
        this.notifier.notify.apply(this.notifier, notificationArgs);
      }
    } else {

      if(notificationArgs && notificationArgs.length) {
        this.store(this.notifier.storageKey, notificationArgs);
      }

      window.location.href = path;
    }
  },

  // Go back one page.
  goBack: function() {
    window.history.back();
  },

  // Callback for when a link is clicked in our app
  handleSinglePageLinkClick: function(e){

    // If the link is targeting something else, let the browser take over
    if(e.delegateTarget.getAttribute('target')) return;

    // If the user is trying to do something beyond simple navigation, let the browser take over
    if(e.ctrlKey || e.metaKey) return;

    // Extract the location from the link.
    var href = e.delegateTarget.getAttribute('href');

    // If we're going nowhere, somewhere else, or to an anchor on the page, let the browser take over
    if(!href || /^(#|[a-z]+:\/\/)/.test(href)) return;

    // Ensure that relative links are evaluated as relative
    if(href.charAt(0) === '?') href = window.location.pathname + href;

    // Great, we can handle it. let the app decide whether to use pushstate or not
    e.preventDefault();
    this.go(href);
  },

  // When we change urls
  // We always remove the current before instantiating the next. this ensures are views can prepare
  // Context's in removedFromParent before the constructor of the next view is invoked.
  navigationChanged: function() {
    var current  = this.getChild('currentView'),
        transition;

    // Let the router determine our new url
    this.previousUrl = this.parsedUrl;
    this.parsedUrl = this.router.parseUrl(this.navigator.get('fullPath'));

    if(this.previousUrl !== this.parsedUrl) {
      this.emitter.fire('urlChanged');
    }

    // Not necessary for a view to exist on each page.
    // Maybe the entry point is server generated.
    if(!this.parsedUrl.view) {

      if(!this.parsedUrl.redirect) return;

      var redirectTo = this.parsedUrl.redirect;
      redirectTo = app.router.path(redirectTo, this.parsedUrl.data);

      this.go(redirectTo);
      return;
    }

    // if the view that's in there is already loaded, don't remove / add again.
    if(current && current._pieName === this.parsedUrl.view) {
      if(pie.object.has(current, 'navigationUpdated', true)) current.navigationUpdated();
      return;
    }

    this.transitionToNewView();

  },

  // The process for transitioning to a new view.
  // Both the current view and the next view are optional.
  transitionToNewView: function() {
    var target = document.querySelector(this.options.uiTarget),
        current = this.getChild('currentView'),
        viewClass, child, transition;

    // Provide some events that can be observed around the transition process.
    this.emitter.fire('beforeViewChanged');
    this.emitter.fireAround('aroundViewChanged', function() {

      this.emitter.fire('viewChanged');

      // Use the view key of the parsedUrl to find the viewClass.
      // At this point we've already verified the view option exists, so we don't have to check it.
      var viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.parsedUrl.view), child;
      // The instance to be added. If the class is not defined, this could and should blow up.
      child = new viewClass({ app: this });

      // Cache an identifier on the view so we can invoke navigationUpdated instead of reloading
      // if the url changes but the view does not
      child._pieName = this.parsedUrl.view;

      // Instantiate a transition object based on the app configuration.
      transition = new this.viewTransitionClass(this, pie.object.merge({
        oldChild: current,
        newChild: child,
        childName: 'currentView',
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

  // Reload the page without reloading the browser.
  // Alters the current view's _pieName to appear as invalid for the route.
  refresh: function() {
    var current = this.getChild('currentView');
    current._pieName = '__remove__';
    this.navigationChanged();
  },

  // Safely access localStorage, passing along any errors for reporting.
  retrieve: function(key, clear) {
    var encoded, decoded;

    try{
      encoded = window.localStorage.getItem(key);
      decoded = encoded ? JSON.parse(encoded) : undefined;
    }catch(err){
      this.errorHandler.reportError(err, {prefix: "[caught] app#retrieve/getItem:"});
    }

    try{
      if(clear || clear === undefined){
        window.localStorage.removeItem(key);
      }
    }catch(err){
      this.errorHandler.reportError(err, {prefix: "[caught] app#retrieve/removeItem:"});
    }

    return decoded;
  },

  // When a link is clicked, go there without a refresh if we recognize the route.
  setupSinglePageLinks: function() {
    var target = document.querySelector(this.options.uiTarget);
    pie.dom.on(target, 'click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
  },

  // Show any notification which have been preserved via local storage.
  showStoredNotifications: function() {
    var encoded = this.retrieve(this.notifier.storageKey), decoded;

    if(encoded) {
      decoded = JSON.parse(encoded);
      this.notifier.notify.apply(this.notifier, decoded);
    }
  },

  // Start the app by starting the navigator (which we have observed).
  start: function() {
    this.emitter.fireSequence('start', this.navigator.start.bind(this.navigator));
  },

  // Safely access localStorage, passing along any errors for reporting.
  store: function(key, data) {
    try{
      window.localStorage.setItem(key, JSON.stringify(data));
    }catch(err){
      this.errorHandler.reportError(err, {prefix: "[caught] app#store:"});
    }
  }
}, pie.mixins.container);
