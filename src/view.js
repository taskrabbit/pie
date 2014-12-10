// pie.view manages events delegation, provides some convenience methods, and some <form> standards.
pie.view = function(options) {
  this.options = options || {};
  this.app = this.options.app || window.app;
  this.el = this.options.el || pie.dom.createElement('<div />');
  this.changeCallbacks = [];
  pie.setUid(this);
  if(this.options.init) this.init();
};

pie.extend(pie.view.prototype, pie.mixins.inheritance);
pie.extend(pie.view.prototype, pie.mixins.container);


pie.view.prototype.addedToParent = function() {
  this.init();
};

// we extract the functionality of setting our render target so we can override this as we see fit.
// for example, other implementation could store the target, then show a loader until render() is called.
// by default we simply append ourselves to the target.
pie.view.prototype.setRenderTarget = function(target) {
  target.appendChild(this.el);
};

// placeholder for default functionality
pie.view.prototype.init = function(setupFn){
  if(this.isInit) return this;
  if(setupFn) setupFn();
  this.isInit = true;
  return this;
};


// all events observed using view.on() will use the unique namespace for this instance.
pie.view.prototype.eventNamespace = function() {
  return 'view'+ this.pieId;
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
// If the object is not observable, an error will be thrown.
pie.view.prototype.onChange = function() {
  var observable = arguments[0], args = pie.array.from(arguments).slice(1);
  if(!('observe' in observable)) throw new Error("Observable does not respond to observe");

  this.changeCallbacks.push([observable, args]);
  observable.observe.apply(observable, args);
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

  // views remove their children upon removal to ensure all irrelevant observations are cleaned up.
  this.removeChildren();

  return this;
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
