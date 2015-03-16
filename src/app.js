// # Pie App
//
// The app class is the entry point of your application. It acts as the container in charge of managing the page's context.
// It provides access to application utilities, routing, templates, i18n, etc.
// It observes browser and link navigation and changes the page's context automatically.
pie.app = pie.base.extend('app', {
  init: function(options) {


    /* `pie.base.prototype.constructor` handles the setting of an app, */
    /* but we don't want a reference to another app within this app. */
    delete this.app;

    /* Set a global instance which can be used as a backup within the pie library. */
    pie.appInstance = pie.appInstance || this;

    /* Register with pie to allow for nifty global lookups. */
    pie.apps[this.pieId] = this;

    /* Default application options. */
    this.options = pie.object.deepMerge({
      uiTarget: 'body',
      viewNamespace: 'lib.views',
      unsupportedPath: '/browser/unsupported',
      notificationStorageKey: 'js-alerts',
      verifySupport: true
    }, options);

    if(this.options.verifySupport && !this.verifySupport()) {
      window.location.href = this.options.unsupportedPath;
      return;
    }

    // `classOption` allows class configurations to be provided in the following formats:
    // ```
    // new pie.app({
    //   i18n: myCustomI18nClass,
    //   i18nOptions: {foo: 'bar'}
    // });
    // ```
    // which will result in `this.i18n = new myCustomI18nClass(this, {foo: 'bar'});`
    //
    // Alternatively you can provide instances as the option.
    // ```
    // var instance = new myCustomI18nClass();
    // new pie.app({
    //   i18n: instance,
    // });
    // ```
    // which will result in `this.i18n = instance; this.i18n.app = this;`
    var classOption = function(key, _default){
      var k = this.options[key] || _default,
      opt = this.options[key + 'Options'] || {};

      if(pie.object.isFunction(k)) {
        return new k(this, opt);
      } else {
        k.app = this;
        return k;
      }
    }.bind(this);


    // `app.config` is a model used to manage configuration objects.
    this.config = classOption('config', pie.config);

    // `app.cache` is a centralized cache store to be used by anyone.
    this.cache = classOption('cache', pie.cache);

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

    // `app.templates` is used to manage and render application templates.
    this.templates = classOption('templates', pie.templates);

    // `app.navigator` is the only navigator which should exist and be used within this app.
    // Multiple apps and navigators can exist but one must take the lead for actually changing
    // browser state. See more in the pie.navigator class.
    this.navigator = classOption('navigator', pie.navigator);

    // `app.validator` a validator intance to be used in conjunction with this app's model activity.
    this.validator = classOption('validator', pie.validator);

    // The view transition class to be used when transitioning between pages.
    // Since a new instance of this is needed on every page change, just provide the class.
    this.viewTransitionClass = this.options.viewTransitionClass || pie.simpleViewTransition;

    // You can also provide `viewTransitionOptions` which will be merged into the constructor of this class.
    this.viewTransitionOptions = this.options.viewTransitionOptions || {};

    // After a navigation change, app.parsedUrl is the new parsed route
    this.parsedUrl = new pie.model({});

    // We observe the navigator and handle changing the context of the page.
    this.navigator.observe(this.navigationChanged.bind(this));

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

  debug: function() {
    if(window.console && window.console.log) {
      window.console.log.apply(window.console, arguments);
    }
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
    var args = pie.array.from(arguments), path, notificationArgs, replaceState;

    /* Path is always first. */
    path = args.shift();


    /* Next we check for a query object */
    if(pie.object.isPlainObject(args[0])) {
      path = this.router.path(path, args.shift());

    /* If there is no query object we treat the first arg as an array and apply to router.path */
    /* This enables the user to pass anything to the router.path function by providing an array as the first arg */
    } else {
      path = this.router.path.apply(this.router, pie.array.from(path));
    }

    if(path === this.parsedUrl.get('fullPath')) return;

    /* If the next argument is a boolean, we care about replaceState */
    if(pie.object.isBoolean(args[0])) {
      replaceState = args.shift();
    } else {
      replaceState = false;
    }

    /* Anything left is considered arguments for the notifier. */
    notificationArgs = args;

    if(notificationArgs.length) {
      /* The first argument is the message content, we make sure it's evaluated in our current context */
      /* since we could lose the translation when we move. */
      notificationArgs[0] = this.i18n.attempt(notificationArgs[0]);
    }

    var parsed = this.router.parseUrl(path);
    if(parsed.route && (parsed.view || parsed.redirect)) {

      this.navigator.go(path, {}, replaceState);

      if(notificationArgs.length) {
        this.notifier.notify.apply(this.notifier, notificationArgs);
      }

    } else {

      if(notificationArgs.length) {
        this.store(this.options.notificationStorageKey, notificationArgs);
      }

      this.hardGo(path);
    }
  },

  // Extracted so we can effectively test the logic within `go()` without redirection.
  hardGo: function(path) {
    window.location.href = path;
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

  parseUrl: function() {
    var fromRouter = this.router.parseUrl(this.navigator.get('fullPath'));

    this.parsedUrl.reset({skipObservers: true});
    this.parsedUrl.sets(fromRouter);
  },

  // When we change urls
  // We always remove the current before instantiating the next. this ensures are views can prepare
  // Context's in removedFromParent before the constructor of the next view is invoked.
  navigationChanged: function() {
    var current  = this.getChild('currentView');

    // Let the router determine our new url
    this.previousUrl = this.parsedUrl.get('fullPath');
    this.parseUrl();

    if(this.previousUrl !== this.parsedUrl.get('fullPath')) {
      this.emitter.fire('urlChanged');
    }

    var redirectTo = this.parsedUrl.get('redirect');
    if(redirectTo) {
      this.go(redirectTo);
      return;
    }

    if(!this.parsedUrl.get('view')) return;

    // if the view that's in there is already loaded, don't remove / add again.
    if(current && current._pieName === this.parsedUrl.get('view')) {
      if(pie.object.has(current, 'navigationUpdated', true)) current.navigationUpdated();
      return;
    }

    this.transitionToNewView();

  },

  // The process for transitioning to a new view.
  // Both the current view and the next view are optional.
  transitionToNewView: function() {
    var target = pie.qs(this.options.uiTarget),
        current = this.getChild('currentView'),
        viewClass, child, transition;

    // Provide some events that can be observed around the transition process.
    this.emitter.fire('beforeViewChanged');
    this.emitter.fireAround('aroundViewChanged', function() {

      this.emitter.fire('viewChanged');

      // Use the view key of the parsedUrl to find the viewClass.
      // At this point we've already verified the view option exists, so we don't have to check it.
      viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.parsedUrl.get('view'));
      // The instance to be added. If the class is not defined, this could and should blow up.
      child = new viewClass({ app: this });

      // Cache an identifier on the view so we can invoke navigationUpdated instead of reloading
      // if the url changes but the view does not
      child._pieName = this.parsedUrl.get('view');

      // Instantiate a transition object based on the app configuration.
      transition = new this.viewTransitionClass(this, pie.object.merge({
        oldChild: current,
        newChild: child,
        childName: 'currentView',
        targetEl: target
      }, this.viewTransitionOptions));

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

    if(!window.localStorage) return undefined;

    try {
      encoded = window.localStorage.getItem(key);
      decoded = encoded ? JSON.parse(encoded) : undefined;
    } catch(err) {
      this.errorHandler.reportError(err, {
        handledBy: "pie.app#retrieve/getItem",
        key: key
      });
    }

    try {
      if(clear || clear === undefined){
        window.localStorage.removeItem(key);
      }
    } catch(err) {
      this.errorHandler.reportError(err, {
        handledBy: "pie.app#retrieve/removeItem",
        key: key,
        clear: clear
      });
    }

    return decoded;
  },

  // When a link is clicked, go there without a refresh if we recognize the route.
  setupSinglePageLinks: function() {
    var target = pie.qs(this.options.navigationContainer || this.options.uiTarget);
    pie.dom.on(target, 'click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
  },

  // Show any notification which have been preserved via local storage.
  showStoredNotifications: function() {
    var messages = this.retrieve(this.options.notificationStorageKey);

    if(messages && messages.length) {
      this.notifier.notify.apply(this.notifier, messages);
    }
  },

  // Start the app by starting the navigator (which we have observed).
  start: function() {
    this.emitter.fireSequence('start', this.navigator.start.bind(this.navigator));
  },

  // Safely access localStorage, passing along any errors for reporting.
  store: function(key, data) {
    if(!window.localStorage) return false;

    var str;
    try {
      str = JSON.stringify(data);
      window.localStorage.setItem(key, str);
      return true;
    } catch(err) {
      this.errorHandler.reportError(err, {
        handledBy: "pie.app#store",
        key: key,
        data: str
      });
    }
  },

  verifySupport: function() {
    var el = document.createElement('_');

    return !!(el.classList &&
      window.history.pushState &&
      Date.prototype.toISOString &&
      Array.isArray &&
      Array.prototype.forEach &&
      Object.keys &&
      Number.prototype.toFixed);
  }
}, pie.mixins.container);
