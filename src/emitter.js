pie.emitter = pie.model.extend('emitter', {

  init: function() {
    this._super({
      triggeredEvents: [],
      eventCallbacks: {}
    });
  },

  _on: function(event, fn, options, meth) {
    options = options || {},

    this.getOrSet('eventCallbacks.' + event, [])[meth](pie.object.merge({fn: fn}, options));
  },

  hasEvent: function(event) {
    return !!~this.get('triggeredEvents').indexOf(event);
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

    if(options.immediate && this.hasEvent(event)) {
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
    callbacks = this.get('eventCallbacks.' + event),
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

    if(compactNeeded) this.set('eventCallbacks.' + event, pie.array.compact(this.get('eventCallbacks.' + event)));
    if(!this.hasEvent(event)) this.get('triggeredEvents').push(event);
  },

  fireAround: function(event, onComplete) {
    var callbacks = this.get('eventCallbacks.' + event) || [],
    compactNeeded = false,
    fns;

    fns = callbacks.map(function(cb, i) {
      if(cb.onceOnly) {
        compactNeeded = true;
        cb[i] = undefined;
      }
      return cb.fn;
    });

    if(compactNeeded) this.set('eventCallbacks.' + event, pie.array.compact(this.get('eventCallbacks.' + event)));
    if(!this.hasEvent(event)) this.get('triggeredEvents').push(event);

    pie.fn.async(fns, onComplete);
  },

  around: function(event, fn) {
    var before = pie.string.modularize("before_" + event),
    after = pie.string.modularize("after_" + event),
    around = pie.string.modularize('around_' + event);

    this.fire(before);
    this.fireAround(around, function() {
      fn();
      this.fire(after);
    }.bind(this));
  }

});
