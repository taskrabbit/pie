// general framework for transitioning between views.
pie.abstractViewTransition = pie.base.extend('abstractViewTransition', {

  init: function(parent, options) {
    options = options || {};

    this.emitter    = new pie.emitter();
    this.parent     = parent;
    this.oldChild   = options.oldChild;
    this.newChild   = options.newChild;
    this.childName  = options.childName || this.oldChild && this.oldChild._nameWithinParent;
    this.targetEl   = options.targetEl  || this.oldChild && this.oldChild.el.parentNode;

    if(!this.childName) throw new Error("No child name provided for view transition");
    if(!this.targetEl)  throw new Error("No target element provided for view transition");

    this.options = options;
  },

  // fire a sequence which looks like
  //
  // | beforeTransition
  // | transition
  // |--| beforeRemoveOldChild
  // |  | removeOldChild
  // |  | afterRemoveOldChild
  // |  |--| beforeAddNewChild
  // |     | addNewChild
  // |     | afterAddNewChild
  // | afterTransition
  //
  transition: function() {
    this.emitter.prependOnce('transition', function() {
      this.emitter.fireSequence('removeOldChild');
    }.bind(this));

    this.emitter.prependOnce('afterRemoveOldChild', function() {
      this.emitter.fireSequence('addNewChild');
    }.bind(this));

    this.emitter.fireSequence('transition');
  }

});


// Simple view transition: remove the old child from the view and dom, add the new child immediately after.
// Uses the default sequence of events.
pie.simpleViewTransition = pie.abstractViewTransition.extend('simpleViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.emitter.on('removeOldChild', this.removeOldChild.bind(this));
    this.emitter.on('addNewChild', this.addNewChild.bind(this));
  },

  addNewChild: function() {
    if(this.newChild) {
      this.parent.addChild(this.childName, this.newChild);
      this.newChild.emitter.once('afterSetup', function(){
        this.newChild.appendToDom(this.targetEl);
      }.bind(this));
      this.newChild.setup();
    }
  },

  removeOldChild: function() {
    if(this.oldChild) {
      this.parent.removeChild(this.oldChild);
      this.oldChild.teardown();
    }
  }

});

// A transition which applies an "out" class to the old view, removes it after it transitions out, then adds
// the new view to the dom and applies an "in" class.
// Preparation of the new view is done as soon as the transition is started, enabling the shortest possible
// amount of delay before the next view is added to the dom.
pie.inOutViewTransition = pie.abstractViewTransition.extend('inOutViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.options = pie.object.merge({
      // the new view will gain this class
      inClass: 'view-in',
      // the old view will gain this class
      outClass: 'view-out',
      // if the browser doesn't support onTransitionEnd, here's the backup transition duration
      backupDuration: 250,
      // async=true means the new view doesn't wait for the old one to leave.
      // async=false means the new view won't be added to the dom until the previous is removed.
      async: false
    });

    // We update the parent immediately, adding & removing the appropriate children.
    this.emitter.on('beforeTransition', this.manageChildren.bind(this));

    // It's not necessary for an oldChild to exist, if it does we tie into the parts of the process
    // which are relevant to it.
    if(this.oldChild) {
      // we control the transition events via an around event.
      // the callback waits for the transition to end before firing.
      this.emitter.on('aroundTransitionOldChild', this.transitionOldChild.bind(this));
      // remove the old child from the dom
      this.emitter.on('removeOldChild',           this.removeOldChild.bind(this));
      // teardown the child since we're done with it.
      this.emitter.on('afterRemoveOldChild',      this.teardownOldChild.bind(this));
    }

    if(this.newChild) {
      // we setup() the new child as soon as possible.
      this.emitter.on('beforeTransition',         this.setupNewChild.bind(this));
      // ok, add the new child to the dom.
      this.emitter.on('addNewChild',              this.addNewChild.bind(this));
      // make sure the browser is up to date.
      this.emitter.on('beforeTransitionNewChild', this.refresh.bind(this));
      // ok, start the transition.
      this.emitter.on('aroundTransitionNewChild', this.transitionNewChild.bind(this));
    }

  },

  // apply the relevant class(es) to the element.
  applyClass: function(el, isIn) {
    var add = isIn ? this.options.inClass : this.options.outClass,
        remove = isIn ? this.options.outClass : this.options.inClass;

    if(add) el.classList.add(add);
    if(remove) el.classList.remove(remove);
  },

  // WHEN options.async !== true
  // fire a sequence which looks like
  //
  // | beforeTransition
  // | transition
  // |--| beforeRemoveOldChild
  // |  |--| beforeTransitionOldChild
  // |     | transitionOldChild
  // |     | afterTransitionOldChild
  // |  | removeOldChild
  // |  | afterRemoveOldChild
  // |  |--| beforeAddNewChild
  // |     | addNewChild
  // |     | afterAddNewChild
  // |     |--| beforeTransitionNewChild
  // |        | transitionNewChild
  // |        | afterTransitionNewChild
  // | afterTransition

  // WHEN options.async === true
  // fire a sequence which looks like
  //
  // | beforeTransition
  // | transition
  // |--| beforeRemoveOldChild
  // |  |--| beforeTransitionOldChild
  // |     | transitionOldChild
  // |     | afterTransitionOldChild
  // |  | removeOldChild
  // |  | afterRemoveOldChild
  // ....
  // |--| beforeAddNewChild
  // |  | addNewChild
  // |  | afterAddNewChild
  // |  |--| beforeTransitionNewChild
  // |     | transitionNewChild
  // |     | afterTransitionNewChild
  // | afterTransition

  transition: function() {
    this.emitter.on('transition', function() {
      this.emitter.fireSequence('removeOldChild');
    }.bind(this));

    this.emitter.on('aroundRemoveOldChild', function(cb) {
      this.emitter.once('afterTransitionOldChild', cb);
      this.emitter.fireSequence('transitionOldChild');
    }.bind(this));

    this.emitter.on('afterAddNewChild', function() {
      this.emitter.fireSequence('transitionNewChild');
    }.bind(this));

    if(this.options.async) {
      this.emitter.on('transition', function() {
        this.emitter.fireSequence('addNewChild');
      }.bind(this));
    } else {
      this.emitter.on('afterRemoveOldChild', function() {
        this.emitter.fireSequence('addNewChild');
      }.bind(this));
    }

    this.emitter.fireSequence('transition');
  },

  // if the new child hasn't setup() yet, do so.
  setupNewChild: function() {
    if(!this.newChild.emitter.hasEvent('beforeSetup')) {
      this.newChild.setup();
    }
  },

  // teardown() the child if it hasn't already.
  teardownOldChild: function() {
    if(!this.oldChild.emitter.hasEvent('beforeTeardown')) {
      this.oldChild.teardown();
    }
  },

  // give the new child the "out" classes, then add it to the dom.
  addNewChild: function() {
    this.applyClass(this.newChild.el, false);
    this.newChild.appendToDom(this.targetEl);
  },

  // remove the old child from the dom.
  removeOldChild: function() {
    this.oldChild.removeFromDom();
  },

  // make sure we're rendered, then begin the ui transition in.
  // when complete, invoke the callback.
  transitionNewChild: function(cb) {
    this.newChild.emitter.once('afterRender', function() {
      this.observeTransitionEnd(this.newChild.el, true, cb);
    }.bind(this), {immediate: true});
  },

  // start the transition out. when complete, invoke the callback.
  transitionOldChild: function(cb) {
    this.observeTransitionEnd(this.oldChild.el, false, cb);
  },

  // build a transition callback, and apply the appropriate class.
  // when the transition is complete, invoke the callback.
  observeTransitionEnd: function(el, isIn, cb) {
    var trans = this.transitionEndEvent(),
    onTransitionEnd, backupDuration;

    if(trans) {
      onTransitionEnd = (function() {
        var called = false;
        return function() {
          if(called) return;
          called = true;
          pie.dom.off(el, trans, onTransitionEnd);
          cb();
        };
      })();

      pie.dom.on(el, trans, onTransitionEnd);
    } else {
      setTimeout(cb, this.options.backupDuration);
    }

    this.applyClass(el, isIn);

    if(trans) {

      backupDuration = this.determineBackupDuration(el);
      if(!isNaN(backupDuration)) {
        setTimeout(onTransitionEnd, backupDuration * 1.1);
      }
    }
  },

  // add & remove the children from the parent.
  manageChildren: function() {
    if(this.oldChild) this.parent.removeChild(this.oldChild);
    if(this.newChild) this.parent.addChild(this.childName, this.newChild);
  },

  // which transition event should we use?
  transitionEndEvent: function(){

    if(this._transitionEndEvent === undefined) {
      if('ontransitionend' in window) {
        this._transitionEndEvent = 'transitionend';
      } else if('onwebkittransitionend' in window) {
        this._transitionEndEvent = 'webkitTransitionEnd';
      } else if('msTransitionEnd' in window) {
        this._transitionEndEvent = 'msTransitionEnd';
      } else if('onotransitionend' in document.body || navigator.appName === 'Opera') {
        this._transitionEndEvent = 'oTransitionEnd';
      } else {
        this._transitionEndEvent = false;
      }
    }

    return this._transitionEndEvent;
  },

  // get a transition property based on the browser's compatability.
  transitionProperty: function(prop) {
    var trans = this.transitionEndEvent();
    return trans && trans.replace(/end/i, pie.string.capitalize(prop));
  },

  //
  refresh: function(cb) {
    if(this.oldChild) this.oldChild.el.getBoundingClientRect();
    if(this.newChild) this.newChild.el.getBoundingClientRect();
    if(cb) cb();
  },

  determineBackupDuration: function(el) {
    var durProp = this.transitionProperty('duration'),
      delayProp = this.transitionProperty('delay'),
      style = window.getComputedStyle(el),
      dur, delay;

    dur = parseInt(style[durProp].toLowerCase(), 10);
    delay = parseInt(style[delayProp].toLowerCase(), 10);

    if(durProp.indexOf('ms') < 0) {
      dur = dur * 1000;
      delay = delay * 1000;
    }

    return dur + delay;
  }

});
