pie.emitter = function() {
  this.triggeredEvents = [];
  this.eventCallbacks = {};
};

// invoke fn when the event is triggered.
// if futureOnly is truthy the fn will only be triggered for future events.
pie.emitter.prototype.on = function(event, fn, options) {
  options = options || {};

  if(~this.triggeredEvents.indexOf(event)) {
    if(!options.futureOnly) {
      fn();
      if(options.onceOnly) return;
    }
  }

  this.eventCallbacks[event] = this.eventCallbacks[event] || [];
  this.eventCallbacks[event].push(pie.object.merge({fn: fn}, options));
};

// trigger an event (string) on the app.
// any callbacks associated with that event will be invoked with the extra arguments
pie.emitter.prototype.fire = function(/* event, arg1, arg2, */) {
  var args = pie.array.from(arguments),
  event = args.shift(),
  previouslyTriggered = !!~this.triggeredEvents.indexOf(event),
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

  this.triggeredEvents.push(event);
};

pie.emitter.prototype.around = function(event, fn) {
  var before = pie.string.modularize("before_" + event),
  after = pie.string.modularize("after_" + event);

  this.fire(before);
  fn();
  this.fire(after);
};
