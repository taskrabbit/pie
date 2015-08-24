// general framework for transitioning between views.
pie.abstractViewTransition = pie.base.extend('abstractViewTransition', {

  init: function(parent, options) {
    options = options || {};

    this.emitter    = pie.emitter.create();
    this.parent     = parent;
    this.oldChild   = options.oldChild;
    this.newChild   = options.newChild;
    this.childName  = options.childName || this.oldChild && this.oldChild._nameWithinParent;
    this.targetEl   = options.targetEl  || this.oldChild && this.oldChild.el.parentNode;

    if(!this.childName) throw new Error("No child name provided for view transition");
    if(!this.targetEl)  throw new Error("No target element provided for view transition");

    this.options = options;

    this.emitter.on('transition:before', this.manageChildren.bind(this));
    this.propagateTransitionEvents();

    this._super();
  },

  // fire a sequence which looks like
  // ```
  // | transition:before
  // | transition
  // |--| removeOldChild:before
  // |  | removeOldChild
  // |  | removeOldChild:after
  // |  |--| addNewChild:before
  // |     | addNewChild
  // |     | addNewChild:after
  // | transition:after
  // ```
  transition: function(cb) {
    var em = this.emitter;

    em.on('addNewChild:after', function() {
      em.fire('transition:after');
      if(cb) cb();
    });

    em.on('removeOldChild:after', function() {
      em.fire('addNewChild:before');
      em.fireAround('addNewChild:around', function() {
        em.fire('addNewChild');
      });
    });

    em.on('transition', function() {
      em.fire('removeOldChild:before');
      em.fireAround('removeOldChild:around', function() {
        em.fire('removeOldChild');
      });
    });

    em.fire('transition:before');
    em.fireAround('transition:around', function() {
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
      if(!this.newChild.emitter.hasEvent('setup:before')) this.newChild.setup();
    }
  },

  propagateTransitionEvents: function() {
    var em = this.emitter,
    oldEm = this.oldChild && this.oldChild.emitter,
    newEm = this.newChild && this.newChild.emitter;

    if(oldEm) {
      em.on('removeOldChild:before', function() {
        oldEm.fire('transitionOut:before');
      });

      em.on('removeOldChild:after', function() {
        oldEm.fire('transitionOut:after');
      });
    }

    if(newEm) {
      em.on('addNewChild:before', function() {
        newEm.fire('transitionIn:before');
      });

      em.on('transition:after', function() {
        newEm.fire('transitionIn:after');
      });
    }
  }

});


// Simple view transition: remove the old child from the view and dom, add the new child immediately after.
// Uses the default sequence of events.
pie.simpleViewTransition = pie.abstractViewTransition.extend('simpleViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.emitter.on('removeOldChild', this.removeOldChild.bind(this));
    this.emitter.on('addNewChild',    this.addNewChild.bind(this));
  },

  setLoading: function(bool) {
    if(!this.options.loadingClass) return;
    this.targetEl.classList[bool ? 'add' : 'remove'](this.options.loadingClass);
  },

  addNewChild: function() {
    if(!this.newChild) {
      this.emitter.fire('addNewChild:after');
      return;
    }

    this.begin = pie.date.now();

    this.setLoading(true);

    if(this.options.minDelay) {
      setTimeout(this.attemptToAddChild.bind(this), this.options.minDelay);
    }

    this.newChild.emitter.once('setup:after', this.attemptToAddChild.bind(this), {immediate: true});
  },

  attemptToAddChild: function() {
    var now = pie.date.now();

    /* ensure our child has been setup */
    if(!this.newChild.emitter.hasEvent('setup:after')) return;

    /* ensure the minimum delay has been reached */
    if(this.options.minDelay && now < (this.begin + this.options.minDelay)) return;

    this.setLoading(false);

    /* ensure our view was not removed from our parent */
    if(this.newChild.parent !== this.parent) return;

    this.newChild.addToDom(this.targetEl);
    this.emitter.fire('addNewChild:after');
  },

  removeOldChild: function() {
    if(this.oldChild) this.oldChild.teardown();
    this.emitter.fire('removeOldChild:after');
  }

});

pie.loadingViewTransition = pie.simpleViewTransition.extend('loadingViewTransition', {
  init: function() {
    this._super.apply(this, arguments);
    this.options.loadingClass = this.options.loadingClass || 'is-loading';
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
      em.on('transitionOldChild:after',  this.cancelWrap('teardownOldChild'));
    } else {
      em.on('transitionOldChild', function() {
        em.fire('transitionOldChild:after');
      });
    }

    if(this.newChild) {
      em.on('addNewChild',              this.cancelWrap('addNewChild'));
      em.on('transitionNewChild:around', this.cancelWrap('ensureNewChildPrepared'));
      em.on('transitionNewChild',       this.cancelWrap('refresh'));
      em.on('transitionNewChild',       this.cancelWrap('transitionNewChild'));

      this.newChild.emitter.once('removedFromParent', this.cancel.bind(this));
    } else {
      em.on('transitionNewChild', function() {
        em.fire('transitionNewChild:after');
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

    if(add) pie.dom.addClass(el, add);
    if(remove) pie.dom.removeClass(el, remove);
  },

  // WHEN options.async !== true
  // fire a sequence which looks like
  // ```
  // | transition:before
  // | transition
  // |  |--| removeOldChild:before
  // |     |--| transitionOldChild:before
  // |        | transitionOldChild
  // |        |--| transitionOldChild:after
  // |           |--| removeOldChild
  // |           |  |--| removeOldChild:after
  // |           |
  // |           |--| addNewChild:before
  // |              | addNewChild
  // |              |--| addNewChild:after
  // |                 |--| transitionNewChild:before
  // |                    | transitionNewChild
  // |                    |--| transitionNewChild:after
  // |                       |--| transition:after
  // ```
  //
  // WHEN options.async === true
  // fire a sequence which looks like
  // ```
  // | transition:before
  // | transition
  // |  |--| removeOldChild:before
  // |  |  |--| transitionOldChild:before
  // |  |     | transitionOldChild
  // |  |     |--| transitionOldChild:after
  // |  |        |--| removeOldChild
  // |  |           |--| removeOldChild:after
  // |  |
  // |  |--| addNewChild:before
  // |     | addNewChild
  // |     |--| addNewChild:after
  // |        |--| transitionNewChild:before
  // |           | transitionNewChild
  // |           |--| transitionNewChild:after
  // |              |--| transition:after
  // ```

  transition: function(cb) {
    var em = this.emitter;

    em.on('transitionNewChild:after', function() {
      em.fire('transition:after');
      if(cb) cb();
    });

    if(this.options.async) {
      em.on('transition', function() {
        em.fireSequence('addNewChild');
      });
    } else {
      em.on('removeOldChild:after', function() {
        em.fireSequence('addNewChild');
      });
    }

    em.on('addNewChild:after', function() {
      em.fire('transitionNewChild:before');
      em.fireAround('transitionNewChild:around', function() {
        em.fire('transitionNewChild');
      });
    });

    em.on('transitionOldChild:after', function() {
      em.fireSequence('removeOldChild');
    });

    em.on('transition', function() {
      em.fire('transitionOldChild:before');
      em.fireAround('transitionOldChild:around', function() {
        em.fire('transitionOldChild');
      });
    });

    em.fire('transition:before');
    em.fireAround('transition:around', function() {
      em.fire('transition');
    });

  },

  cancel: function() {
    if(!this.emitter.hasEvent('transitionNewChild:after')) {

      // the goal of a transition is to get the old child out and the new child in,
      // we make sure we've done that.
      if(this.oldChild) {
        this.teardownOldChild();
      }

      if(this.newChild) {
        this.applyClass(this.newChild.el, true);
        this.newChild.addToDom(this.targetEl);
      }

      // then we let everyone else know.
      this.emitter.fire('cancel');
    }
  },

  // teardown() the child if it hasn't already.
  teardownOldChild: function() {
    if(!this.oldChild.emitter.hasEvent('teardown:before')) {
      this.oldChild.teardown();
    }
  },

  // Add the new child to the dom.
  addNewChild: function() {
    this.newChild.addToDom(this.targetEl);
  },

  ensureNewChildPrepared: function(cb) {
    this.newChild.emitter.once('render:after', cb, {immediate: true});
  },

  // make sure we're rendered, then begin the ui transition in.
  // when complete, invoke the callback.
  transitionNewChild: function() {
    this.observeTransitionEnd(this.newChild.el, true, 'transitionNewChild:after');
  },

  // start the transition out. when complete, invoke the callback.
  transitionOldChild: function() {
    if(!this.oldChild.el.parentNode) this.emitter.fire('transitionOldChild:after');
    else this.observeTransitionEnd(this.oldChild.el, false, 'transitionOldChild:after');
  },

  // ensure the browser has redrawn and locations are up to date.
  refresh: function(cb) {
    if(this.oldChild) this.oldChild.el.getBoundingClientRect();
    if(this.newChild) this.newChild.el.getBoundingClientRect();
    if(cb) cb();
  },

  // build a transition callback, and apply the appropriate class.
  // when the transition is complete, invoke the callback.
  observeTransitionEnd: function(el, isIn, fire) {
    var transitionEvent = this.transitionEvent(el),
    trans = transitionEvent.event,
    dur = transitionEvent.duration,
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
      if(!isNaN(dur)) {
        setTimeout(onTransitionEnd, dur * 1.1);
      }
    } else {
      setTimeout(onTransitionEnd, this.options.backupDuration);
    }
  },

  // which transition event should we use?
  transitionEndEvent: function(base){
    var cap = pie.string.capitalize(base);

    if(this._transitionEndEvent === undefined) {
      if(pie.object.has(window, 'on' + base + 'end', true)) {
        this._transitionEndEvent = base + 'end';
      } else if(pie.object.has(window, 'onwebkit' + base + 'end', true)) {
        this._transitionEndEvent = 'webkit' + cap + 'End';
      } else if(pie.object.has(window, 'ms' + cap + 'End', true)) {
        this._transitionEndEvent = 'ms' + cap + 'End';
      } else if(pie.object.has(document.body, 'ono' + base + 'end', true) || navigator.appName === 'Opera') {
        this._transitionEndEvent = 'o' + cap + 'End';
      } else {
        this._transitionEndEvent = false;
      }
    }

    return this._transitionEndEvent;
  },

  // get a transition or animation property based on the browser's compatability.
  subProperty: function(endEvent, prop) {
    return endEvent.replace(/end/i, pie.string.capitalize(prop));
  },

  transitionEvent: function(el) {
    var endA = this.transitionEndEvent('transition'),
        endB = this.transitionEndEvent('animation'),
        objA = this._transitionEvent(endA, el),
        objB = this._transitionEvent(endB, el);


    return objA.duration > objB.duration ? objA : objB;
  },

  _transitionEvent: function(endEvent, el) {
    if(!endEvent) {
      return {
        duration: 0
      };
    }

    var durProp = this.subProperty(endEvent, 'duration'),
        delayProp = this.subProperty(endEvent, 'delay'),
        style = window.getComputedStyle(el),
        durs = durProp && style[durProp] && style[durProp].split(',') || ['0'],
        delays = delayProp && style[delayProp] && style[delayProp].split(',') || ['0'],
        dur, delay;

    durs = durs.map(function(d){ return parseFloat(d.toLowerCase(), 10); });
    delays = delays.map(function(d){ return parseFloat(d.toLowerCase(), 10); });

    dur = Math.max.apply(null, durs);
    delay = Math.max.apply(null, delays);

    if(durProp && durProp.indexOf('ms') < 0) {
      dur *= 1000;
    }

    if(delayProp && delayProp.indexOf('ms') < 0) {
      delay *= 1000;
    }

    return {
      event: endEvent,
      duration: parseInt(dur + delay, 10)
    };
  }

});
