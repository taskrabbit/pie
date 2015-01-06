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

    this.emitter.on('beforeTransition', this.manageChildren.bind(this));
  },

  // fire a sequence which looks like
  // ```
  // | beforeTransition
  // | transition
  // |--| beforeRemoveOldChild
  // |  | removeOldChild
  // |  | afterRemoveOldChild
  // |  |--| beforeAddNewChild
  // |     | addNewChild
  // |     | afterAddNewChild
  // | afterTransition
  // ```
  transition: function() {
    this.emitter.prependOnce('transition', function() {
      this.emitter.fireSequence('removeOldChild');
    }.bind(this));

    this.emitter.prependOnce('afterRemoveOldChild', function() {
      this.emitter.fireSequence('addNewChild');
    }.bind(this));

    this.emitter.fireSequence('transition');
  },

  // to be called at the beginning of each transition.
  // this removes the old child from it's parent and adds the new one
  // it also begins the setup process for the new child.
  manageChildren: function() {
    if(this.oldChild) this.parent.removeChild(this.oldChild);
    if(this.newChild) {
      this.parent.addChild(this.childName, this.newChild);
      this.newChild.setup();
    }
  },

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
      this.newChild.emitter.once('afterSetup', function(){
        this.newChild.appendToDom(this.targetEl);
      }.bind(this), {immediate: true});
    }
  },

  removeOldChild: function() {
    if(this.oldChild) {
      this.oldChild.teardown();
    }
  }

});

pie.loadingViewTransition = pie.simpleViewTransition.extend('loadingViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.options.loadingClass = this.options.loadingClass || 'is-loading';
  },

  setLoading: function(bool) {
    this.targetEl.classList[bool ? 'add' : 'remove'](this.options.loadingClass);
  },

  addNewChild: function() {
    if(!this.newChild) return;

    this.begin = pie.date.now();

    this.setLoading(true);

    if(this.options.minDelay) {
      setTimeout(this.attemptToAddChild.bind(this), this.options.minDelay);
    }

    this.newChild.emitter.once('afterSetup', function() {
      this.attemptToAddChild(true);
    }.bind(this), {immediate: true});
  },

  attemptToAddChild: function(partOfAfterSetup) {
    var now = pie.date.now();
    if(partOfAfterSetup || this.newChild.emitter.hasEvent('afterSetup')) {
      if(!this.options.minDelay || now >= (this.begin + this.options.minDelay)) {
        if(!this.newChild.emitter.hasEvent('removedFromParent')) {
          this.setLoading(false);
          this.newChild.appendToDom(this.targetEl);
        }
      }
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
    }, this.options);

    // It's not necessary for an oldChild to exist, if it does we tie into the parts of the process
    // which are relevant to it.
    if(this.oldChild) {
      // we control the transition events via an around event.
      // the callback waits for the transition to end before firing.
      this.emitter.on('aroundTransitionOldChild', this.cancelWrap(this.transitionOldChild.bind(this)));
      // remove the old child from the dom
      this.emitter.on('removeOldChild',           this.cancelWrap(this.removeOldChild.bind(this)));
      // teardown the child since we're done with it.
      this.emitter.on('',                         this.cancelWrap(this.teardownOldChild.bind(this)));
    }

    if(this.newChild) {
      // ok, add the new child to the dom.
      this.emitter.on('addNewChild',              this.cancelWrap(this.addNewChild.bind(this)));
      // make sure the browser is up to date.
      this.emitter.on('beforeTransitionNewChild', this.cancelWrap(this.refresh.bind(this)));
      // ok, start the transition.
      this.emitter.on('aroundTransitionNewChild', this.cancelWrap(this.transitionNewChild.bind(this)));

      // if the new child is pulled before we're able to get it into the dom, we cancel the rest of our transition.
      this.newChild.emitter.once('removedFromParent', this.cancel.bind(this));
    }

  },

  cancelWrap: function(fn) {
    return function(cb){
      if(!this.emitter.hasEvent('cancel')) {
        fn.apply(null, arguments);
      }
    }.bind(this);
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
  // ```
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
  // ```
  //
  // WHEN options.async === true
  // fire a sequence which looks like
  // ```
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
  // ```

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

  cancel: function() {
    if(!this.emitter.hasEvent('afterTransitionNewChild')) {

      // the goal of a transition is to get the old child out and the new child in,
      // we make sure we've done that.
      if(this.oldChild) {
        this.removeOldChild();
        this.teardownOldChild();
      }

      if(this.newChild) {
        this.applyClass(this.newChild.el, true);
        this.newChild.appendToDom(this.targetEl);
      }

      // then we let everyone else know.
      this.emitter.fire('cancel');
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
    if(!this.oldChild.el.parentNode) cb();
    else this.observeTransitionEnd(this.oldChild.el, false, cb);
  },

  // build a transition callback, and apply the appropriate class.
  // when the transition is complete, invoke the callback.
  observeTransitionEnd: function(el, isIn, cb) {
    var trans = this.transitionEndEvent(),
    called = false,
    onTransitionEnd = function() {
      if(called) return;
      called = true;
      if(trans) pie.dom.off(el, trans, onTransitionEnd);
      cb();
    };

    this.emitter.once('cancel', onTransitionEnd);

    if(trans) {
      pie.dom.on(el, trans, onTransitionEnd);
    } else {
      setTimeout(onTransitionEnd, this.options.backupDuration);
    }

    this.applyClass(el, isIn);

    if(trans) {
      var backupDuration = this.determineBackupDuration(el);
      if(!isNaN(backupDuration)) {
        setTimeout(onTransitionEnd, backupDuration * 1.1);
      }
    }
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
