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
    var em = this.emitter;

    em.on('afterAddNewChild', function() {
      em.fire('afterTransition');
    });

    em.on('afterRemoveOldChild', function() {
      em.fire('beforeAddNewChild');
      em.fireAround('aroundAddNewChlid', function() {
        em.fire('addNewChild');
      });
    });

    em.on('transition', function() {
      em.fire('beforeRemoveOldChild');
      em.fireAround('aroundRemoveOldChild', function() {
        em.fire('removeOldChild');
      });
    });

    em.fire('beforeTransition');
    em.fireAround('aroundTransition', function() {
      em.fire('transition');
    });
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
    this.emitter.on('addNewChild',    this.addNewChild.bind(this));
  },

  addNewChild: function() {
    if(this.newChild) {
      this.newChild.emitter.once('afterSetup', function(){
        this.newChild.appendToDom(this.targetEl);
        this.emitter.fire('afterAddNewChild');
      }.bind(this), {immediate: true});
    } else {
      this.emitter.fire('afterAddNewChild');
    }
  },

  removeOldChild: function() {
    if(this.oldChild) {
      this.oldChild.teardown();
    }
    this.emitter.fire('afterRemoveOldChild');
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
    if(!this.newChild) {
      this.emitter.fire('afterAddNewChild');
      return;
    }

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
          this.emitter.fire('afterAddNewChild');
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

    this.setupObservations();
  },

  setupObservations: function() {
    var em = this.emitter;

    if(this.oldChild) {
      em.on('transitionOldChild',       this.cancelWrap('transitionOldChild'));
      em.on('afterTransitionOldChild',  this.cancelWrap('teardownOldChild'));
    } else {
      em.on('transitionOldChild', function() {
        em.fire('afterTransitionOldChild');
      });
    }

    if(this.newChild) {
      em.on('addNewChild',              this.cancelWrap('addNewChild'));
      em.on('aroundTransitionNewChild', this.cancelWrap('ensureNewChildPrepared'));
      em.on('transitionNewChild',       this.cancelWrap('refresh'));
      em.on('transitionNewChild',       this.cancelWrap('transitionNewChild'));

      this.newChild.emitter.once('removedFromParent', this.cancel.bind(this));
    } else {
      em.on('transitionNewChild', function() {
        em.fire('afterTransitionNewChild');
      });
    }
  },

  cancelWrap: function(fnName) {
    return function(){
      if(!this.emitter.hasEvent('cancel')) {
        this[fnName].apply(this, arguments);
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
  // |  |--| beforeRemoveOldChild
  // |     |--| beforeTransitionOldChild
  // |        | transitionOldChild
  // |        |--| afterTransitionOldChild
  // |           |--| removeOldChild
  // |           |  |--| afterRemoveOldChild
  // |           |
  // |           |--| beforeAddNewChild
  // |              | addNewChild
  // |              |--| afterAddNewChild
  // |                 |--| beforeTransitionNewChild
  // |                    | transitionNewChild
  // |                    |--| afterTransitionNewChild
  // |                       |--| afterTransition
  // ```
  //
  // WHEN options.async === true
  // fire a sequence which looks like
  // ```
  // | beforeTransition
  // | transition
  // |  |--| beforeRemoveOldChild
  // |  |  |--| beforeTransitionOldChild
  // |  |     | transitionOldChild
  // |  |     |--| afterTransitionOldChild
  // |  |        |--| removeOldChild
  // |  |           |--| afterRemoveOldChild
  // |  |
  // |  |--| beforeAddNewChild
  // |     | addNewChild
  // |     |--| afterAddNewChild
  // |        |--| beforeTransitionNewChild
  // |           | transitionNewChild
  // |           |--| afterTransitionNewChild
  // |              |--| afterTransition
  // ```

  transition: function() {
    var em = this.emitter;

    em.on('afterTransitionNewChild', function() {
      em.fire('afterTransition');
    });

    if(this.options.async) {
      em.on('transition', function() {
        em.fireSequence('addNewChild');
      });
    } else {
      em.on('afterRemoveOldChild', function() {
        em.fireSequence('addNewChild');
      });
    }

    em.on('afterAddNewChild', function() {
      em.fire('beforeTransitionNewChild');
      em.fireAround('aroundTransitionNewChild', function() {
        em.fire('transitionNewChild');
      });
    });

    em.on('afterTransitionOldChild', function() {
      em.fireSequence('removeOldChild');
    });

    em.on('transition', function() {
      em.fire('beforeTransitionOldChild');
      em.fireAround('aroundTransitionOldChild', function() {
        em.fire('transitionOldChild');
      });
    });

    em.fire('beforeTransition');
    em.fireAround('aroundTransition', function() {
      em.fire('transition');
    });

  },

  cancel: function() {
    if(!this.emitter.hasEvent('afterTransitionNewChild')) {

      // the goal of a transition is to get the old child out and the new child in,
      // we make sure we've done that.
      if(this.oldChild) {
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

  ensureNewChildPrepared: function(cb) {
    this.newChild.emitter.once('afterRender', cb, {immediate: true});
  },

  // make sure we're rendered, then begin the ui transition in.
  // when complete, invoke the callback.
  transitionNewChild: function() {
    this.observeTransitionEnd(this.newChild.el, true, 'afterTransitionNewChild');
  },

  // start the transition out. when complete, invoke the callback.
  transitionOldChild: function() {
    if(!this.oldChild.el.parentNode) this.emitter.fire('afterTransitionOldChild');
    else this.observeTransitionEnd(this.oldChild.el, false, 'afterTransitionOldChild');
  },

  // build a transition callback, and apply the appropriate class.
  // when the transition is complete, invoke the callback.
  observeTransitionEnd: function(el, isIn, fire) {
    var trans = this.transitionEndEvent(),
    called = false,
    onTransitionEnd = function() {
      if(called) return;
      called = true;
      if(trans) pie.dom.off(el, trans, onTransitionEnd);
      this.emitter.fire(fire);
    }.bind(this);

    this.emitter.once('cancel', onTransitionEnd);

    if(trans) {
      pie.dom.on(el, trans, onTransitionEnd);
    }

    this.applyClass(el, isIn);

    if(trans) {
      var backupDuration = this.determineBackupDuration(el);
      if(!isNaN(backupDuration)) {
        setTimeout(onTransitionEnd, backupDuration * 1.1);
      }
    } else {
      setTimeout(onTransitionEnd, this.options.backupDuration);
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
