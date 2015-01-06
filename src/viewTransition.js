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


pie.inOutViewTransition = pie.abstractViewTransition.extend('inOutViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.options = pie.object.merge({
      inClass: 'view-in',
      outClass: 'view-out',
      backupDuration: 250,
      async: false
    });

    this.emitter.on('beforeTransition', this.manageChildren.bind(this));

    if(this.oldChild) {
      this.emitter.on('beforeTransitionOldChild', this.refresh.bind(this));
      this.emitter.on('aroundTransitionOldChild', this.transitionOldChild.bind(this));
      this.emitter.on('removeOldChild',           this.removeOldChild.bind(this));
      this.emitter.on('afterRemoveOldChild',      this.teardownOldChild.bind(this));
    }

    if(this.newChild) {
      this.emitter.on('transition',               this.setupNewChild.bind(this));
      this.emitter.on('addNewChild',              this.addNewChild.bind(this));
      this.emitter.on('beforeTransitionNewChild', this.refresh.bind(this));
      this.emitter.on('aroundTransitionNewChild', this.transitionNewChild.bind(this));
    }

  },

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

  setupNewChild: function() {
    if(!this.newChild.emitter.hasEvent('beforeSetup')) {
      this.newChild.setup();
    }
  },

  teardownOldChild: function() {
    if(!this.oldChild.emitter.hasEvent('beforeTeardown')) {
      this.oldChild.teardown();
    }
  },

  addNewChild: function() {
    this.applyClass(this.newChild.el, false);
    this.newChild.appendToDom(this.targetEl);
  },

  removeOldChild: function() {
    this.oldChild.removeFromDom();
  },

  // make sure we're rendered, then invoke then begin the ui transition.
  // when complete, invoke the callback.
  transitionNewChild: function(cb) {
    this.newChild.emitter.once('afterRender', function() {
      this.observeTransitionEnd(this.newChild.el, true, cb);
    }.bind(this), {immediate: true});
  },

  transitionOldChild: function(cb) {
    this.observeTransitionEnd(this.oldChild.el, false, cb);
  },

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

  manageChildren: function() {
    if(this.oldChild) this.parent.removeChild(this.oldChild);
    if(this.newChild) this.parent.addChild(this.childName, this.newChild);
  },

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

  transitionProperty: function(prop) {
    var trans = this.transitionEndEvent();
    return trans && trans.replace(/end/i, pie.string.capitalize(prop));
  },

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
