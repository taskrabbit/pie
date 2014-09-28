// The, ahem, base view.
// pie.view manages events delegation, provides some convenience methods, and some <form> standards.
pie.view = function(app, options) {
  this.app = app;
  this.options = options || {};
  this.el = this.options.el || pie.util.createElement('<div />');
  this.uid = pie.unique();
  this.changeCallbacks = [];
};

pie.util.extend(pie.view.prototype, pie.mixins.inheritance);
pie.util.extend(pie.view.prototype, pie.container);
pie.util.extend(pie.view.prototype, pie.mixins.bindings);


// placeholder for default functionality
pie.view.prototype.addedToParent = function(){
  return this;
};


// all events observed using view.on() will use the unique namespace for this instance.
pie.view.prototype.eventNamespace = function() {
  return 'view'+ this.uid;
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
    $(this.el).on(ev, f2, sel);
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
    if(el) pie.util.setPath(n, el.value, o);
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

  // remove our el if we still have a parent.
  if(this.el.parentNode) this.el.parentNode.removeChild(this.el);

  return this;
};


// convenience method which is useful for ajax callbacks.
pie.view.prototype.removeLoadingStyle = function(){
  this._loadingStyle(false);
};


// release all observed events.
pie.view.prototype._unobserveEvents = function() {
  $(this.el).off('*.' + this.eventNamespace());
  $(document.body).off('*.' + this.eventNamespace());
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
  $(this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable')).
    all(bool ? 'classList.add' : 'classList.remove', 'btn-loading').
    all(bool ? 'setAttribute' : 'removeAttribute', 'disabled', 'disabled');
};
