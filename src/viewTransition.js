// general framework for transitioning between views.
pie.abstractViewTransition = pie.base.extend('abstractViewTransition', {

  init: function(parent, options) {
    options = options || {};

    this.emitter    = new pie.emitter();
    this.parent     = parent;
    this.oldChild   = options.oldChild;
    this.newChild   = options.newChild;
    this.childName  = options.childName || this.oldChild && this.oldChild._nameWithinParent;
    this.targetEl   = options.targetEl || this.oldChild && this.oldChild.el.parentNode;

    if(!this.childName) throw new Error("No child name provided for view transition");
    if(!this.targetEl) throw new Error("No target element provided for view transition");

    this.options = options;
  },

  // fire a sequence which looks like
  //
  // beforeTransition
  //  | transition
  //  | beforeRemoveOldChild
  //  |  | removeOldChild
  //  | afterRemoveOldChild
  //  | beforeAddNewChild
  //  |  | addNewChild
  //  | afterAddNewChild
  // afterTransition
  //
  transition: function() {
    this.emitter.prependOnce('transition', function() {
      this.emitter.fireSequence('removeOldChild');
    });

    this.emitter.prependOnce('afterRemoveOldChild', function() {
      this.emitter.fireSequence('addNewChild');
    });

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

  removeOldChild: function() {
    if(this.oldChild) {
      this.parent.removeChild(this.oldChild);
      if(this.oldChild.el.parentNode) this.oldChild.el.parentNode.removeChild(this.oldChild.el);
    }
  },

  addNewChild: function() {
    if(this.newChild) {
      this.parent.addChild(name, this.newChild);
      this.targetEl.appendChild(this.newChild.el);
    }
  }
});


pie.inOutViewTransition = pie.abstractViewTransition.extend('inOutViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.options.inClass        = this.options.inClass || 'view-in';
    this.options.outClass       = this.options.outClass || 'view-out';
    this.options.backupDuration = 250;
    this.async                  = !!this.options.async;

    this.emitter.on('transition', this.beginTransition.bind(this));
  },

  beginTransition: function() {
    if(this.oldChild) {
      this.beginTransitionFromOldChild();
    } else {
      this.beginTransitionToNewChild();
    }
  },

  beginTransitionFromOldChild: function() {
    var el = this.oldChild.el,
    trans = this.transitionEndEvent(el);

    this.parent.removeChild(this.oldChild);

    if(!this.async) {

      if(trans) {
        var onTransitionEnd;
        onTransitionEnd = function(){
          pie.dom.off(el, trans, onTransitionEnd);
          if(el.parentNode) el.parentNode.removeChild(el);
          this.beginTransitionToNewChild();
        };

        pie.dom.on(el, trans, onTransitionEnd);

      } else {
        setTimeout(function(){
          if(el.parentNode) el.parentNode.removeChild(el);
          this.beginTransitionToNewChild();
        }, this.options.backupDuration);
      }

    }

    el.classList.add(this.options.outClass);
    if(this.async) this.beginTransitionToNewChild();
  },

  beginTransitionToNewChild: function() {
    this.parent.addChild(this.childName, this.newChild);
    this.targetEl.appendChild(this.newChild.el);
    this.newChild.el.classList.add(this.options.inClass);
  },

  transitionEndEvent: function(el) {
    if('ontransitionend' in window) {
      return 'transitionend';
    } else if('onwebkittransitionend' in window) {
      return 'webkitTransitionEnd';
    } else if('msTransitionEnd' in window) {
      return 'msTransitionEnd';
    } else if('onotransitionend' in el || navigator.appName === 'Opera') {
      return 'oTransitionEnd';
    } else {
      return false;
    }
  }

});
