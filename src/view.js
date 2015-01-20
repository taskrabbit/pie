// pie.view manages events delegation, provides some convenience methods, and some <form> standards.
pie.view = pie.base.extend('view');

pie.view.prototype.constructor = function view() {
  pie.base.prototype.constructor.apply(this, arguments);
  if(this.options.setup) this.setup();
};

pie.view.reopen({

  init: function(options) {
    this.options = options || {},
    this.app = this.options.app || pie.appInstance;
    this.el = this.options.el || pie.dom.createElement('<div></div>');
    this.eventedEls = [];
    this.changeCallbacks = [];

    this.emitter = new pie.emitter();

    if(this.options.uiTarget) {
      this.emitter.once('afterSetup', this.appendToDom.bind(this));
    }
  },

  addedToParent: function() {
    this.emitter.fire('addedToParent');
  },

  appendToDom: function(target) {
    target = target || this.options.uiTarget;
    if(target !== this.el.parentNode) {
      this.emitter.fireSequence('attach', function(){
        target.appendChild(this.el);
      }.bind(this));
    }
  },

  consumeEvent: function(e, immediate) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
      if(immediate) e.stopImmediatePropagation();
    }
  },

  // all events observed using view.on() will use the unique namespace for this instance.
  eventNamespace: function() {
    return 'view'+ this.pieId;
  },


  navigationUpdated: function() {
    this.children.forEach(function(c){
      if(pie.object.has(c, 'navigationUpdated', true)) c.navigationUpdated();
    });
  },


  // Events should be observed via this .on() method. Using .on() ensures the events will be
  // unobserved when the view is removed.
  on: function(e, sel, f, el) {
    el = el || this.el;
    if(!~this.eventedEls.indexOf(el)) this.eventedEls.push(el);

    var ns = this.eventNamespace(),
        f2 = function(e){
          if(e.namespace === ns) {
            return f.apply(this, arguments);
          }
        };

    e.split(' ').forEach(function(ev) {
      ev += "." + ns;
      pie.dom.on(el, ev, f2, sel);
    }.bind(this));

    return this;
  },

  // Observe changes to an observable, unobserving them when the view is removed.
  // If the object is not observable, an error will be thrown.
  onChange: function() {
    var observable = arguments[0], args = pie.array.from(arguments).slice(1);
    if(!pie.object.has(observable, 'observe', true)) throw new Error("Observable does not respond to observe");

    this.changeCallbacks.push([observable, args]);
    observable.observe.apply(observable, args);
  },


  // shortcut for this.el.querySelector
  qs: function(selector) {
    return this.el.querySelector(selector);
  },


  // shortcut for this.el.querySelectorAll
  qsa: function(selector) {
    return this.el.querySelectorAll(selector);
  },

  removeFromDom: function() {
    if(this.el.parentNode) {
      this.emitter.fireSequence('detach', function() {
        this.el.parentNode.removeChild(this.el);
      }.bind(this));
    }
  },

  removedFromParent: function() {
    this.emitter.fire('removedFromParent');
  },

  // placeholder for default functionality
  setup: function(){
    this.emitter.fireSequence('setup');
    return this;
  },

  teardown: function() {

    this.emitter.fireSequence('teardown', function() {

      this.removeFromDom();

      this._unobserveEvents();
      this._unobserveChangeCallbacks();

      this.teardownChildren();
      // views remove their children upon removal to ensure all irrelevant observations are cleaned up.
      this.removeChildren();

    }.bind(this));

    return this;
  },

  teardownChildren: function() {
    this.children.forEach(function(child) {
      if(child.teardown) child.teardown();
    });
  },

  // release all observed events.
  _unobserveEvents: function() {
    var key = '*.' + this.eventNamespace();
    this.eventedEls.forEach(function(el) {
      pie.dom.off(el, key);
    });
  },


  // release all change callbacks.
  _unobserveChangeCallbacks: function() {
    var a;
    while(this.changeCallbacks.length) {
      a = this.changeCallbacks.pop();
      a[0].unobserve.apply(a[0], a[1]);
    }
  }

}, pie.mixins.container);
