// # Pie App
//
// The app class is the entry point of your application. It acts as the container in charge of managing the page's context.
// It provides access to application utilities, routing, templates, i18n, etc.
// It observes browser and link navigation and changes the page's context automatically.
pie.app = pie.base.extend('app', {

  init: function(options) {

    /* `pie.base.create` handles the setting of an app, */
    /* but we don't want a reference to another app within this app. */
    delete this.app;

    /* Set a global instance which can be used as a backup within the pie library. */
    pie.appInstance = pie.appInstance || this;

    /* Register with pie to allow for nifty global lookups. */
    pie.apps[pie.uid(this)] = this;

    /* Default application options. */
    this.options = pie.object.deepMerge({
      uiTarget: 'body',
      unsupportedPath: '/browser/unsupported',
      verifySupport: true
    }, options);

    if(this.options.verifySupport && !this.verifySupport()) {
      window.location.href = this.options.unsupportedPath;
      return;
    }

    // `classOption` allows class configurations to be provided in the following formats:
    // ```
    // pie.app.create({
    //   i18n: myCustomI18nClass,
    //   i18nOptions: {foo: 'bar'}
    // });
    // ```
    // which will result in `this.i18n = myCustomI18nClass.create(this, {foo: 'bar'});`
    //
    // Alternatively you can provide instances as the option.
    // ```
    // var instance = myCustomI18nClass.create();
    // pie.app.create({
    //   i18n: instance,
    // });
    // ```
    // which will result in `this.i18n = instance; this.i18n.app = this;`
    var classOption = function(key, _default){
      var k = this.options[key],
      opt = this.options[key + 'Options'] || {};

      if(k === false) return;

      k = k || _default;

      if(k.__pieRole === 'class') {
        return k.create(this, opt);
      } else if (pie.object.isFunction(k)) {
        return k(this, opt);
      } else {
        k.app = this;
        return k;
      }
    }.bind(this);


    // `app.config` is a model used to manage configuration objects.
    this.config = classOption('config', pie.config);

    // `app.cache` is a centralized cache store to be used by anyone.
    this.cache = classOption('cache', function(){
      return pie.cache.create({}, {app: this});
    }.bind(this));

    // `app.storage` is used for local, session, cache, etc storage
    this.storage = classOption('storage', pie.dataStore);

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

    // The model that represents the current state of the app.
    this.state = pie.appState.create();

    // `app.router` is used to determine which view should be rendered based on the url
    this.router = classOption('router', pie.router);

    // `app.routeHandler` extracts information from the current route and determines what to do with it.
    this.routeHandler = classOption('routeHandler', pie.routeHandler);

    // `app.navigator` observes app.state and updates the browser.
    // it is imperative that the router is created before the navigator since
    // the navigator observes both state.id and state.route;
    this.navigator = classOption('navigator', pie.navigator);

    // `app.resources` is used for managing the loading of external resources.
    this.resources = classOption('resources', pie.resources);

    // Template helper methods are evaluated to the local variable `h` in templates.
    // Any methods registered with this helpers module will be available in templates
    // rendered by this app's `templates` object.
    this.helpers = classOption('helpers', pie.helpers);

    // `app.templates` is used to manage and render application templates.
    this.templates = classOption('templates', pie.templates);

    // `app.validator` a validator intance to be used in conjunction with this app's model activity.
    this.validator = classOption('validator', pie.validator);

    this.pathHelper = classOption('pathHelper', pie.pathHelper);


    // Before we get going, observe link navigation & show any notifications stored
    // in app.storage.
    // Wrapped in a function for testing purposes.
    this.emitter.once('start:before', function(){ this.setupSinglePageLinks(); }.bind(this));

    if(!this.options.noAutoStart) {
      // Once the dom is loaded, start the app.
      document.addEventListener('DOMContentLoaded', this.start.bind(this));
    }

    this._super();
  },

  // Just in case the client wants to override the standard confirmation dialog.
  // Eventually this could create a confirmation view and provide options to it.
  // The dialog should return a promise which is resolved if the dialog is confirmed
  // and rejected if the dialog is denied.
  confirm: function(text) {
    return pie.promise.create(function(resolve, reject){
      if(window.confirm(text)) resolve();
      else reject();
    });
  },

  debug: function() {
    if(window.console && window.console.log) {
      window.console.log.apply(window.console, arguments);
    }
  },

  // Use this to build paths.
  path: function(path, query) {

    if(pie.object.isObject(path)) {
      query = path;
      path = undefined;
    }

    if(!pie.object.isObject(query)) query = undefined;

    var pq = this.pathHelper.pathAndQuery(path, query);

    // if we don't know our path but have been given a query, try to build a path based on the existing route
    if(pq.path == null && pq.query) {
      var currentRoute = this.state.get('__route');

      if(currentRoute) {
        pq.path = currentRoute.get('pathTemplate');
        pq.query = pie.object.merge({}, this.state.get('__info'), pq.query);
      }
    }

    pq.path = pq.path || '/';
    pq.path = this.pathHelper.stripHost(pq.path, {onlyCurrent: true});

    // if a router is present and we're dealing with a relative path we can allow the passing of named routes.
    if(!this.pathHelper.hasHost(pq.path) && this.router) pq.path = this.router.path(pq.path, query);
    else if(!pie.object.isEmpty(pq.query)) pq.path = pie.string.urlConcat(pq.path, pie.object.serialize(pq.query));

    return pq.path;
  },

  // Use this to navigate around the app.
  // ```
  // app.go('/test-url');
  // app.go('namedUrl');
  // app.go({foo: 'bar'});
  // app.go('/things/:id', {id: 4});
  // ```
  //
  go: function(/* path?, query?, skipHistory? */){
    var id = this.path.apply(this, arguments);

    var skipHistory = pie.array.last(arguments);
    if(!pie.object.isBoolean(skipHistory)) skipHistory = false;

    this.state.transition(id, skipHistory);
  },

  // Callback for when a link is clicked in our app
  handleSinglePageLinkClick: function(e){

    // If the link is targeting something else, let the browser take over
    if(e.delegateTarget.getAttribute('target')) return;

    // If the user is trying to do something beyond simple navigation, let the browser take over
    if(e.ctrlKey || e.metaKey || e.button > 0) return;

    // Extract the location from the link.
    var href = e.delegateTarget.getAttribute('href');

    // If we're going nowhere, somewhere else, or to an anchor on the page, let the browser take over
    if(!href || /^(#|[a-z]+:\/\/)/.test(href)) return;

    this.go(href, !!e.delegateTarget.getAttribute('data-replace-state'));

    if(this.state.is('__route')) e.preventDefault();
  },

  // When a link is clicked, go there without a refresh if we recognize the route.
  setupSinglePageLinks: function() {
    var target = pie.qs(this.routeHandler.options.uiTarget);
    pie.dom.on(target, 'click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
  },

  // Start the app by starting the navigator (which we have observed).
  start: function() {
    this.emitter.fireSequence('start');
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
  },


}, pie.mixins.container);
