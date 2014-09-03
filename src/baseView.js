// The, ahem, base view.
// baseView manages events delegation, provides some convenience methods, and some <form> standards.
pie.baseView = function(el, options) {
  sudo.View.call(this, el, options || {});
  this.changeCallbacks = [];
};

pie.baseView.prototype = Object.create(sudo.View.prototype);
pie.baseView.constructor = pie.baseView;


// all events observed using baseView.on() will use the unique namespace for this instance.
pie.baseView.prototype.eventNamespace = function() {
  return this.role + this.uid;
};

// Events should be observed via this .on() method. Using .on() ensures the events will be
// unobserved when the view is removed.
pie.baseView.prototype.on = function(e, sel, f) {
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
pie.baseView.prototype.onChange = function() {
  var observable = arguments[0], fn = arguments[1], attributes = pie.array.args(arguments).slice(2), f2;
  if(!('observe' in observable)) pie.h.extend(observable, pie.m.observable);

  f2 = function(change){
    if(!attributes.length || attributes.indexOf(change.name) >= 0) {
      if(change.oldValue !== change.object[change.name]) fn(change);
    }
  };

  this.changeCallbacks.push([observable, f2]);
  observable.observe(f2);
};

// If the first option passed is a node, it will use that as the query scope.
// Return an object representing the values of fields within this.el.
pie.baseView.prototype.parseFields = function() {
  var o = {}, e = arguments[0], i = 0, n, el;

  if('string' === typeof e) {
    e = this.el;
  } else {
    i++;
  }

  for(;i<arguments.length;i++) {
    n = arguments[i];
    el = e.querySelector('[name="' + n + '"]:not([disabled])');
    if(el) sudo.setPath(n, el.value, o);
  }
  return o;
};

// placeholder for default functionality
pie.baseView.prototype.addedToParent = function(){
  return this;
};

// clean up.
pie.baseView.prototype.removedFromParent = function() {
  this._unobserveEvents_();
  this._unobserveChangeCallbacks_();

  // baseViews remove their children upon removal.
  this.removeChildren();

  return this;
};

// release all observed events.
pie.baseView.prototype._unobserveEvents_ = function() {
  $(this.el).off('*.' + this.eventNamespace());
  $(document.body).off('*.' + this.eventNamespace());
};

// release all change callbacks.
pie.baseView.prototype._unobserveChangeCallbacks_ = function() {
  var a;
  while(this.changeCallbacks.length) {
    a = this.changeCallbacks.pop();
    a[0].unobserve(a[1]);
  }
};

pie.baseView.prototype.navigationUpdated = function() {
  this.children.forEach(function(c){
    if('navigationUpdated' in c) c.navigationUpdated();
  });
};

// add or remove the default loading style.
pie.baseView.prototype.loadingStyle = function(bool) {
  if(bool === undefined) bool = true;
  this._loadingStyle(bool);
};

// convenience method which is useful for ajax callbacks.
pie.baseView.prototype.removeLoadingStyle = function(){
  this._loadingStyle(false);
};

// this.el receives a loading class, specific buttons are disabled and provided with the btn-loading class.
pie.baseView.prototype._loadingStyle = function(bool) {
  this.el.classList[bool ? 'add' : 'remove']('loading');
  $(this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable')).
    all(bool ? 'classList.add' : 'classList.remove', 'btn-loading').
    all(bool ? 'setAttribute' : 'removeAttribute', 'disabled', 'disabled');
};



pie.baseView.extend = function() {
  var parts = pie.array.args(arguments),
  subclass = pie.h.extend.apply(null, parts),
  baseMethods = ['addedToParent', 'removedFromParent', 'navigationUpdated'];

  baseMethods.forEach(function(meth){
    if(meth in subclass) {
      var old = subclass[meth];
      subclass[meth] = function(parent) {
        var val = old.call(this, parent);
        this.base(meth, parent);
        return val;
      };
    }
  });

  return pie.h.extend(Object.create(pie.baseView.prototype), subclass);
};
