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
    this.emitter.fire('navigationUpdated');
    this.children.forEach(function(c){
      if(pie.object.has(c, 'navigationUpdated', true)) c.navigationUpdated();
    });
  },


  // **pie.view.on**
  //
  // Observe a dom event and invoke the provided functions.
  // By default all events are delegated to this.el, but if you pass in an element as the last argument
  // that will be used. If the functions are provided as strings, they will be looked up on `this`.
  //
  // ```
  // view.on('click', 'a', this.handleClick.bind(this), this.trackClickEvent.bind(this));
  // view.on('submit', 'form', 'handleSubmit');
  // view.on('resize', null, 'onResize', window);
  // ```
  on: function(/* e, sel, f1, f2, f3, el */) {
    var fns = pie.array.from(arguments),
        events = fns.shift(),
        sel = fns.shift(),
        ns = this.eventNamespace(),
        f2, el;

    if(!pie.object.isFunction(pie.array.get(fns, -1))) el = fns.pop();
    el = el || this.el;

    if(!~this.eventedEls.indexOf(el)) this.eventedEls.push(el);

    events = events.split(' ');

    fns.forEach(function(fn) {
      fn = pie.object.isString(fn) ? this[fn].bind(this) : fn;

      f2 = function(e){
        if(e.namespace === ns) {
          return fn.apply(this, arguments);
        }
      };

      events.forEach(function(ev) {
        ev += "." + ns;
        pie.dom.on(el, ev, f2, sel);
      }.bind(this));

    }.bind(this));

    return this;
  },

  // Observe changes to an observable, unobserving them when the view is removed.
  // If the object is not observable, an error will be thrown.
  onChange: function() {

    var parts = pie.array.partitionAt(arguments, pie.object.isFunction),
    observables = parts[0],
    args = parts[1];

    observables.forEach(function(observable){
      if(!pie.object.has(observable, 'observe', true)) throw new Error("Observable does not respond to observe");

      this.changeCallbacks.push({
        observable: observable,
        args: args
      });

      observable.observe.apply(observable, args);
    }.bind(this));


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
      a.observable.unobserve.apply(a.observable, a.args);
    }
  }

}, pie.mixins.container);
