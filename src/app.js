
// operator of the site. contains a router, navigator, etc with the intention of holding page context.
pie.app = function app(options) {

  // general app options
  this.options = pie.object.deepMerge({
    uiTarget: 'body',
    viewNamespace: 'lib.views',
    notificationUiTarget: '.notification-container'
  }, options);

  var classOption = function(key, _default){
    var k = this.options[key] || _default;
    return new k(this);
  }.bind(this);

  // app.emitter is an interface for subscribing and observing app events
  this.emitter = classOption('emitter', pie.emitter);

  // app.i18n is the translation functionality
  this.i18n = classOption('i18n', pie.i18n);

  // app.ajax is ajax interface + app specific functionality.
  this.ajax = classOption('ajax', pie.ajax);

  // app.notifier is the object responsible for showing page-level notifications, alerts, etc.
  this.notifier = classOption('notifier', pie.notifier);

  // app.errorHandler is the object responsible for
  this.errorHandler = classOption('errorHandler', pie.errorHandler);

  // app.router is used to determine which view should be rendered based on the url
  this.router = classOption('router', pie.router);

  // app.resources is used for managing the loading of external resources.
  this.resources = classOption('resources', pie.resources);

  // the only navigator which should exist in this app.
  this.navigator = classOption('navigator', pie.navigator);

  // the validator which should be used in the context of the app
  this.validator = classOption('validator', pie.validator);

  // app.models is globally available. app.models is solely for page context.
  // this is not a singleton container or anything like that. it's just for passing
  // models from one view to the next. the rendered layout may inject values here to initialize the page.
  // after each navigation change, this.models is reset.
  this.models = {};

  // app._templates should not be used. app.template() should be the public interface.
  this._templates = {};

  // after a navigation change, app.parsedUrl is the new parsed route
  this.parsedUrl = {};

  // we observe the navigator and handle changing the context of the page
  this.navigator.observe(this.navigationChanged.bind(this), 'url');

  this.emitter.on('beforeStart', this.setupSinglePageLinks.bind(this), {onceOnly: true});
  this.emitter.on('afterStart', this.showStoredNotifications.bind(this), {onceOnly: true});

  // once the dom is loaded
  document.addEventListener('DOMContentLoaded', this.start.bind(this));

  // set a global instance which can be used as a backup within the pie library.
  window.pieInstance = window.pieInstance || this;
};


pie.extend(pie.app.prototype, pie.mixins.container, pie.mixins.events);


// just in case the client wants to override the standard confirmation dialog.
// eventually this could create a confirmation view and provide options to it.
// the view could have more options but would always end up invoking success or failure.
pie.app.prototype.confirm = function(options) {
  if(window.confirm(options.text)) {
    if(options.success) options.success();
  } else {
    if(options.failure) options.failure();
  }
};


// print stuff if we're not in prod.
pie.app.prototype.debug = function(msg) {
  if(this.env === 'production') return;
  if(console && console.log) console.log('[PIE] ' + msg);
};

// use this to navigate. This allows us to apply app-specific navigation logic
// without altering the underling navigator.
// This can be called with just a path, a path with a query object, or with notification arguments.
// app.go('/test-url')
// app.go('/test-url', true) // replaces state rather than adding
// app.go(['/test-url', {foo: 'bar'}]) // navigates to /test-url?foo=bar
// app.go('/test-url', true, 'Thanks for your interest') // replaces state with /test-url and shows the provided notification
// app.go('/test-url', 'Thanks for your interest') // navigates to /test-url and shows the provided notification
pie.app.prototype.go = function(){
  var args = pie.array.from(arguments), path, notificationArgs, replaceState, query;

  path = args.shift();

  // arguments => '/test-url', '?query=string'
  if(typeof args[0] === 'string' && args[0].indexOf('?') === 0) {
    path = this.router.path(path);
    query = args.shift();
    path = pie.string.urlConcat(this.router.path(path), query);
  // arguments => '/test-url', {query: 'object'}
  } else if(typeof args[0] === 'object') {
    path = this.router.path(path, args.shift());

  // arguments => '/test-url'
  // arguments => ['/test-url', {query: 'object'}]
  } else {
    path = this.router.path.apply(this.router, pie.array.from(path));
  }

  // if the next argument is a boolean, we care about replaceState
  if(args[0] === true || args[0] === false) {
    replaceState = args.shift();
  }

  // anything left is considered arguments for the notifier.
  notificationArgs = args;

  if(this.router.parseUrl(path).hasOwnProperty('view')) {
    this.navigator.go(path, replaceState);
    if(notificationArgs && notificationArgs.length) {
      this.notifier.notify.apply(this.notifier, notificationArgs);
    }
  } else {

    if(notificationArgs && notificationArgs.length) {
      this.store(this.notifier.storageKey, notificationArgs);
    }

    window.location.href = path;
  }
};


// go back one page.
pie.app.prototype.goBack = function() {
  window.history.back();
};


// callback for when a link is clicked in our app
pie.app.prototype.handleSinglePageLinkClick = function(e){
  // if the link is targeting something else, let the browser take over
  if(e.delegateTarget.getAttribute('target')) return;

  // if the user is trying to do something beyond navigate, let the browser take over
  if(e.ctrlKey || e.metaKey) return;


  var href = e.delegateTarget.getAttribute('href');

  // if we're going nowhere, somewhere else, or to an anchor on the page, let the browser take over
  if(!href || /^(#|[a-z]+:\/\/)/.test(href)) return;

  // ensure that relative links are evaluated as relative
  if(href.charAt(0) === '?') href = window.location.pathname + href;

  // great, we can handle it. let the app decide whether to use pushstate or not
  e.preventDefault();
  this.go(href);
};


// when we change urls
// we always remove the current before instantiating the next. this ensures are views can prepare
// context's in removedFromParent before the constructor of the next view is invoked.
pie.app.prototype.navigationChanged = function() {
  var target = document.querySelector(this.options.uiTarget),
    current  = this.getChild('currentView');

  // let the router determine our new url
  this.previousUrl = this.parsedUrl;
  this.parsedUrl = this.router.parseUrl(this.navigator.get('path'));

  if(this.previousUrl !== this.parsedUrl) {
    this.emitter.fire('urlChanged');
  }

  // not necessary for a view to exist on each page.
  // Maybe the entry point is server generated.
  if(!this.parsedUrl.view) {
    return;
  }

  // if the view that's in there is already loaded, don't remove / add again.
  if(current && current._pieName === this.parsedUrl.view) {
    if('navigationUpdated' in current) current.navigationUpdated();
    return;
  }

  // remove the existing view if there is one.
  if(current) {
    this.removeChild(current);
    if(current.el.parentNode) current.el.parentNode.removeChild(current.el);
    this.emitter.fire('oldViewRemoved', current);
  }

  // clear any leftover notifications
  this.notifier.clear();

  // use the view key of the parsedUrl to find the viewClass
  var viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.parsedUrl.view), child;
  // the instance to be added.

  // add the instance as our 'currentView'
  child = new viewClass(this);
  child._pieName = this.parsedUrl.view;
  child.setRenderTarget(target);
  this.addChild('currentView', child);


  // remove the leftover model references
  this.models = {};

  // get us back to the top of the page.
  window.scrollTo(0,0);

  this.emitter.fire('newViewLoaded', child);
};

// reload the page without reloading the browser.
// alters the current view's _pieName to appear as invalid for the route.
pie.app.prototype.refresh = function() {
  var current = this.getChild('currentView');
  current._pieName = '__remove__';
  this.navigationChanged();
};


// safely access localStorage, passing along any errors for reporting.
pie.app.prototype.retrieve = function(key, clear) {
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
};


// when a link is clicked, go there without a refresh if we recognize the route.
pie.app.prototype.setupSinglePageLinks = function() {
  pie.dom.on(document.body, 'click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
};


// show any notification which have been preserved via local storage.
pie.app.prototype.showStoredNotifications = function() {
  var encoded = this.retrieve(this.notifier.storageKey), decoded;

  if(encoded) {
    decoded = JSON.parse(encoded);
    this.notifier.notify.apply(this.notifier, decoded);
  }
};


// start the app, apply fake navigation to the current url to get our navigation observation underway.
pie.app.prototype.start = function() {
  this.emitter.around('start', function() {

    this.navigator.start();

    // invoke a nav change event on page load.
    var url = this.navigator.get('url');
    this.navigator.data.url = null;
    this.navigator.set('url', url);

  }.bind(this));
};


// safely access localStorage, passing along any errors for reporting.
pie.app.prototype.store = function(key, data) {
  try{
    window.localStorage.setItem(key, JSON.stringify(data));
  }catch(err){
    this.errorHandler.reportError(err, {prefix: "[caught] app#store:"});
  }
};


// compile templates on demand and evaluate them with `data`.
// Templates are assumed to be script tags with type="text/pie-template".
// Once compiled, the templates are cached in this._templates for later use.
pie.app.prototype.template = function(name, data) {
  if(!this._templates[name]) {

    var node = document.querySelector('script[id="' + name + '"][type="text/pie-template"]');

    if(node) {
      this.debug('Compiling and storing template: ' + name);
      this._templates[name] = pie.string.template(node.textContent);
    } else {
      throw new Error("[PIE] Unknown template error: " + name);
    }
  }

  data = data || {};

  return this._templates[name](data);
};
