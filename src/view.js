// The, ahem, base view.
// pie.view manages events delegation, provides some convenience methods, and some <form> standards.
pie.view = function(options) {
  this.options = options || {};
  this.app = this.options.app || window.app;
  this.el = this.options.el || pie.dom.createElement('<div />');
  this.changeCallbacks = [];
  pie.setUid(this);
};

pie.object.merge(pie.view.prototype, pie.mixins.inheritance);
pie.object.merge(pie.view.prototype, pie.mixins.container);


// placeholder for default functionality
pie.view.prototype.addedToParent = function(){
  return this;
};


// all events observed using view.on() will use the unique namespace for this instance.
pie.view.prototype.eventNamespace = function() {
  return 'view'+ this.pieId;
};


// add or remove the default loading style.
pie.view.prototype.loadingStyle = function(bool) {
  if(bool === undefined) bool = true;
  this._loadingStyle(bool);
};


pie.view.prototype.navigationUpdated = function() {
  this.children().forEach(function(c){
    if('navigationUpdated' in c) c.navigationUpdated();
  });
};


// Events should be observed via this .on() method. Using .on() ensures the events will be
// unobserved when the view is removed.
pie.view.prototype.on = function(e, sel, f) {
  var ns = this.eventNamespace(),
      f2 = function(e){
        if(e.namespace === ns) {
          return f.apply(this, arguments);
        }
      };

  e.split(' ').forEach(function(ev) {
    ev += "." + ns;
    pie.dom.on(this.el, ev, f2, sel);
  }.bind(this));

  return this;
};


// Observe changes to an observable, unobserving them when the view is removed.
// If the object is not observable, the observable extensions will automatically
// be extended in.
pie.view.prototype.onChange = function() {
  var observable = arguments[0], args = pie.array.args(arguments).slice(1);
  if(!('observe' in observable)) throw new Error("Observable does not respond to observe");

  this.changeCallbacks.push([observable, args]);
  observable.observe.apply(observable, args);
};


// If the first option passed is a node, it will use that as the query scope.
// Return an object representing the values of fields within this.el.
pie.view.prototype.parseFields = function() {
  var o = {}, e = arguments[0], i = 0, n, el;

  if('string' === typeof e) {
    e = this.el;
  } else {
    i++;
  }

  for(;i<arguments.length;i++) {
    n = arguments[i];
    el = e.querySelector('[name="' + n + '"]:not([disabled])');
    if(el) pie.object.setPath(o, n, el.value);
  }
  return o;
};

// shortcut for this.el.querySelector
pie.view.prototype.qs = function(selector) {
  return this.el.querySelector(selector);
};

// shortcut for this.el.querySelectorAll
pie.view.prototype.qsa = function(selector) {
  return this.el.querySelectorAll(selector);
};


// clean up.
pie.view.prototype.removedFromParent = function() {
  this._unobserveEvents();
  this._unobserveChangeCallbacks();

  // views remove their children upon removal.
  this.removeChildren();

  return this;
};


// convenience method which is useful for ajax callbacks.
pie.view.prototype.removeLoadingStyle = function(){
  this._loadingStyle(false);
};


// release all observed events.
pie.view.prototype._unobserveEvents = function() {
  pie.dom.off(this.el, '*.' + this.eventNamespace());
  pie.dom.off(document.body, '*.' + this.eventNamespace());
};


// release all change callbacks.
pie.view.prototype._unobserveChangeCallbacks = function() {
  var a;
  while(this.changeCallbacks.length) {
    a = this.changeCallbacks.pop();
    a[0].unobserve.apply(a[0], a[1]);
  }
};


// this.el receives a loading class, specific buttons are disabled and provided with the btn-loading class.
pie.view.prototype._loadingStyle = function(bool) {
  this.el.classList[bool ? 'add' : 'remove']('loading');
  var buttons = pie.array.from(this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable'));

  buttons.forEach(function(button){
    button.classList[bool ? 'add' : 'remove']('btn-loading');
    button[bool ? 'setAttribute' : 'removeAttribute']('disabled', 'disabled');
  });
};
