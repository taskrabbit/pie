pie.emitter = pie.create('emitter', function() {
  this.triggeredEvents = [];
  this.eventCallbacks = {};
});

pie.emitter.prototype.has = function(event) {
  return !!~this.triggeredEvents.indexOf(event);
};

// invoke fn when the event is triggered.
// options:
//  - onceOnly: if the callback should be called a single time then removed.
pie.emitter.prototype.on = function(event, fn, options) {
  options = options || {};

  this.eventCallbacks[event] = this.eventCallbacks[event] || [];
  this.eventCallbacks[event].push(pie.object.merge({fn: fn}, options));
};

pie.emitter.prototype.once = function(event, fn, nowIfPrevious) {
  if(nowIfPrevious && this.has(event)) {
    fn();
    return;
  }

  this.on(event, fn, {onceOnly: true});
};

// trigger an event (string) on the app.
// any callbacks associated with that event will be invoked with the extra arguments
pie.emitter.prototype.fire = function(/* event, arg1, arg2, */) {
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

  this.triggeredEvents.push(event);
};

pie.emitter.prototype.around = function(event, fn) {
  var before = pie.string.modularize("before_" + event),
  after = pie.string.modularize("after_" + event);

  this.fire(before);
  fn();
  this.fire(after);
};
