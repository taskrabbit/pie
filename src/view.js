// # Pie View
//
// Views are objects which wrap and interact with DOM. They hold reference to a single element via `this.el`. All
// event obsrevation, delegation, and querying is conducted within the scope of the view's `el`.
//
// Views are equipped with an emitter. The emitter can be utilized for observing any type of lifecycle activity.
// View lifecycle:
//   * init - the constructor
//   * setup - if `setup: true` is provided to the constructor this will happen immediately after instantiation, otherwise this needs to be invoked.
//   * attach - the stage in which the view's el is added to the DOM.
//   * user interaction
//   * teardown - removes any added events from the dom elements, removes any model observations, removes the el from the dom, etc.
//   * detach - when the view's el is removed from the DOM.
pie.view = pie.base.extend('view', {

  __pieRole: 'view',

  // **pie.view.init**
  //
  // Options:
  //   * el - (optional) the root element of the views control. if not provided, a new <div> will be created. `el` can be provided as an object. The tagName attribute will be use
  //   * app - (optional) the app this view is associated with.
  //   * uiTarget - (optional) element to attach to. if provided, after this view is set up it will automatically attach this element.
  //   * setup - (option) if truthy, this view's setup function will be called directly after initialization.
  init: function(options) {
    this.options = options || {},
    this.app = this.options.app || pie.appInstance;

    if(pie.object.isPlainObject(this.options.el)) {
      this.el = document.createElement(this.options.el.tagName || 'div');
      for(var key in this.options.el) {
        if(key !== 'tagName') {
          if(key === 'classes') {
            pie.dom.addClass(this.el, this.options.el[key]);
          } else this.el.setAttribute(key, this.options.el[key]);
        }
      }
    } else {
      this.el = this.options.el || document.createElement('div');
    }

    this.eventedEls = [];
    this.changeCallbacks = {};

    this.emitter = pie.emitter.create();

    if(this.options.uiTarget) {
      this.eonce('afterSetup', this.addToDom.bind(this));
    }

    this._super();
  },

  // **pie.view.addedToParent**
  //
  // Accommodates the `addedToParent` hook event in pie.container.
  // Emits the event via the emitter, meaning this can be subscribed to in the init or setup process.
  addedToParent: function() {
    this.emitter.fire('addedToParent');
  },

  // **pie.view.appendToDom**
  //
  // **deprecated**
  //
  // A function which appends the view's el to the DOM within target (or this.options.uiTarget).
  // An "attach" sequence is fired so views can control how they enter the DOM.
  appendToDom: function(target) {
    this.addToDom(target, 'appendChild');
  },


  // **pie.view.addToDom**
  //
  // A function which adds the view's el to the DOM within target (or this.options.uiTarget).
  // An "attach" sequence is fired so views can control how they enter the DOM.
  // By default the element will be appended, if `prependInstead` is true the element will be
  // prepended.
  addToDom: function(target, prependInstead) {
    target = target || this.options.uiTarget;
    if(target !== this.el.parentNode) {
      this.emitter.fireSequence('attach', function(){
        if(prependInstead) target.insertBefore(this.el, target.firstChild);
        else target.appendChild(this.el);
      }.bind(this));
    }
  },

  // **pie.view.consumeEvent**
  //
  // A utility method for consuming an event, and optionally immediately stopping propagation.
  // ```
  // clickCallback: function(e) {
  //   this.consumeEvent(e);
  //   console.log(e.delegateTarget.href);
  // }
  // ```
  consumeEvent: function(e, immediate) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
      if(immediate) e.stopImmediatePropagation();
    }
  },

  // **pie.view.eon**
  //
  // Register an event with the emitter.
  eon: function() {
    var args = this._normalizedEmitterArgs(arguments);
    return this.emitter.on.apply(this.emitter, args);
  },

  // **pie.view.eoff**
  //
  // Unregister an event from the emitter.
  eoff: function(uid) {
    return this.emitter.off(uid);
  },


  // **pie.view.eonce**
  //
  // Register an event once with the emitter.
  eonce: function() {
    var args = this._normalizedEmitterArgs(arguments);
    this.emitter.once.apply(this.emitter, args);
  },

  _normalizedEmitterArgs: function(args) {
    return pie.array.from(args).map(function(arg, i) {
      if(pie.object.isString(arg) && i > 0) return this[arg].bind(this);
      return arg;
    }.bind(this));
  },

  // **pie.view.eventNamespace**
  //
  // The namespace used for this view's events. All views have a separate namespace to ensure
  // event triggers are propagated efficiently.
  eventNamespace: function() {
    return 'view'+ pie.uid(this);
  },


  // **pie.view.navigationUpdated**
  //
  // When navigation changes but this view is still deemed relevant by the routeHandler, `navigationUpdated` will be invoked.
  // A `navigationUpdated` event is emmitted, then all children are checked for a navigationUpdated function which, if found, is invoked.
  navigationUpdated: function(changeSet) {
    this.emitter.fire('navigationUpdated', changeSet);
    this.children.forEach(function(c){
      if(pie.object.has(c, 'navigationUpdated', true)) c.navigationUpdated(changeSet);
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

    el = pie.object.isDom(pie.array.last(fns)) ? fns.pop() : this.el;

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


  // **pie.view.observe**
  //
  // Observe changes of a model, unobserving them when the view is removed.
  // If the object is not observable, an error will be thrown.
  // The first argument is the observable model OR the function to be executed.
  // If the first argument is not a model, the model will be assumed to be `this.model`.
  // The next arguments (first or second) should be a function name or a function.
  // The remaining arguments are optional filter keys.
  // ```
  // view.observe(user, this.onNameChange.bind(this), 'firstName', 'lastName');
  // view.observe(context, this.onContextChange.bind(this));
  // ```
  observe: function() {
    var args = pie.array.from(arguments),
    observable = pie.object.isModel(args[0]) ? args.shift() : this.model;

    if(!pie.object.has(observable, 'observe', true)) throw new Error("Observable does not respond to observe");

    if(pie.object.isString(args[0])) args[0] = this[args[0]].bind(this);

    var callback = {
      observable: observable,
      args: args
    };

    var uid = pie.uid(callback);

    this.changeCallbacks[uid] = callback;

    observable.observe.apply(observable, args);

    return uid;
  },

  unobserve: function(uid) {
    var a = this.changeCallbacks[uid];
    delete this.changeCallbacks[uid];
    a.observable.unobserve.apply(a.observable, a.args);
  },

  onChange: function() {
    this.app.debug.apply(this.app, pie._debugArgs("view#onChange is deprected. Please use view#observe instead."));
    this.observe.apply(this, arguments);
  },


  // **pie.view.qs**
  //
  // Shortcut for this.el.querySelector
  qs: function(selector) {
    return this.el.querySelector(selector);
  },


  // **pie.view.qsa**
  //
  // shortcut for this.el.querySelectorAll
  qsa: function(selector) {
    return this.el.querySelectorAll(selector);
  },

  // **pie.view.removeFromDom**
  //
  // Assuming the view's el is in the DOM, a detach sequence will be invoked, resulting in the el being removed.
  // Note we don't use pie.dom.remove since we know we're cleaning up our events. Multiple views could be associated
  // with the same el.
  removeFromDom: function() {
    if(this.el.parentNode) {
      this.emitter.fireSequence('detach', function() {
        this.el.parentNode.removeChild(this.el);
      }.bind(this));
    }
  },

  // **pie.view.removedFromParent**
  //
  // Accommodates the `removedFromParent` hook event in pie.container.
  // It emits a `removedFromParent` event which can be observed in the setup process.
  removedFromParent: function() {
    this.emitter.fire('removedFromParent');
  },

  // **pie.view.setup**
  //
  // Placeholder for default functionality.
  // By default, the setup event is triggered on the emitter.
  setup: function(){
    this.emitter.fireSequence('setup');
    return this;
  },

  // **pie.view.cancelSetup**
  //
  // Sometimes when a view is being set up it determines that the app has to redirect and/or it's
  // no longer relevant to the page. If you do not conduct a full setup process this function will
  // short circuit the process.
  cancelSetup: function() {
    this.emitter.fire('afterSetup');
    return this;
  },

  // **pie.view.teardown**
  //
  // This function should be invoked when it's ready to dismiss the view.
  // Upon invocation, a `teardown` sequence is emitted.
  // When teardown runs, the view's `el` is removed from the dom, all observations are removed,
  // and all children have teardown invoked.
  teardown: function() {

    this.emitter.fireSequence('teardown', function() {

      this.removeFromDom();

      this._unobserveEvents();
      this._unobserveChangeCallbacks();

      this.teardownChildren();
      /* views remove their children upon removal to ensure all irrelevant observations are cleaned up. */
      this.removeChildren();

    }.bind(this));

    return this;
  },

  // **pie.view.teardownChildren**
  //
  // Invokes teardown on each child that responds to it.
  teardownChildren: function() {
    this.children.forEach(function(child) {
      if(pie.object.has(child, 'teardown', true)) child.teardown();
    });
  },

  /* release all observed events. */
  _unobserveEvents: function() {
    var key = '*.' + this.eventNamespace();
    this.eventedEls.forEach(function(el) {
      pie.dom.off(el, key);
    });
  },

  /* release all change callbacks. */
  _unobserveChangeCallbacks: function() {
    Object.keys(this.changeCallbacks).forEach(this.unobserve.bind(this));
  }

}, pie.mixins.container);


/* true create function overriden to invoke setup after init() is finished if `setup:true` was provided as an option */
(function(){
  var existing = pie.view.create;
  pie.view.create = function() {
    var instance = existing.apply(this, arguments);
    if(instance.options.setup) instance.setup();
    return instance;
  };
})();
