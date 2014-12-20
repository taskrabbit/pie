pie.emitter = pie.base.extend('emitter', {

  init: function() {
    this.triggeredEvents = [];
    this.eventCallbacks = {};
  },

  _on: function(event, fn, options, meth) {
    options = options || {},

    this.eventCallbacks[event] = this.eventCallbacks[event] || [];
    this.eventCallbacks[event][meth](pie.object.merge({fn: fn}, options));
  },

  has: function(event) {
    return !!~this.triggeredEvents.indexOf(event);
  },

  // invoke fn when the event is triggered.
  // options:
  //  - onceOnly: if the callback should be called a single time then removed.
  on: function(event, fn, options) {
    this._on(event, fn, options, 'push');
  },

  prepend: function(event, fn, options) {
    this._on(event, fn, options, 'unshift');
  },

  once: function(event, fn, options) {
    options = options || {};

    if(options.immediate && this.has(event)) {
      fn();
      return;
    }

    this.on(event, fn, {onceOnly: true});
  },

  // trigger an event (string) on the app.
  // any callbacks associated with that event will be invoked with the extra arguments
  fire: function(/* event, arg1, arg2, */) {
    var args = pie.array.from(arguments),
    event = args.shift(),
    callbacks = this.eventCallbacks[event],
    compactNeeded = false;

    if(callbacks) {
      callbacks.forEach(function(cb, i) {
        cb.fn.apply(null, args);
        if(cb.onceOnly) {
          compactNeeded = true;
          cb[i] = undefined;
        }
      });
    }

    if(compactNeeded) this.eventCallbacks[event] = pie.array.compact(this.eventCallbacks[event]);

    if(!this.has(event)) this.triggeredEvents.push(event);
  },

  around: function(event, fn) {
    var before = pie.string.modularize("before_" + event),
    after = pie.string.modularize("after_" + event);

    this.fire(before);
    fn();
    this.fire(after);
  }

});
