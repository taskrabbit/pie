pie.fn.ease = function(cb, o) {
  o = pie.object.merge({
    name: 'linear',
    duration: 250,
    from: 0,
    to: 1
  }, o);

  if(o.name === 'none') {
    cb(o.to, 1);
    return;
  }

  o.steps = o.steps || Math.max(o.duration / 16, 12);

  /* the easing function */
  var fn = pie.math.easing[o.name],
  // the current "time" 0 to 1.
  t = 0,
  delta = (o.to - o.from),
  dt = (1 / o.steps),
  dy,
  y,
  pid,
  runner = function(){
    dy = fn(t);
    y = o.from + (dy * delta);
    cb(y, t);
    if(t >= 1) clearInterval(pid);
    else t += dt;
    if(t > 1) t = 1;
    // return ourself so we can invoke as part of setInterval
    return runner;
  };

  pid = setInterval(runner(), o.duration / o.steps);
  return pid;
};

pie.fn.async = function(fns, cb, counterObserver) {

  if(!fns.length) {
    cb();
    return;
  }

  var completeCount = fns.length,
  completed = 0,
  counter = function() {
    if(counterObserver) counterObserver.apply(null, arguments);
    if(++completed === completeCount) cb();
  };

  fns.forEach(function(fn) { fn(counter); });
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// Lifted from underscore.js
pie.fn.debounce = function(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = pie.date.now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = pie.date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

pie.fn.valueFrom = function(f, binding, args) {
  if(pie.object.isFunction(f)) return f.apply(binding, args) ;
  return f;
};
