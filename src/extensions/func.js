// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// Lifted from underscore.js
pie.func.debounce = function(func, wait, immediate) {
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

pie.func.valueFrom = function(f, binding, args) {
  if(typeof f === 'function') return f.apply(binding, args) ;
  return f;
};



pie.func.async = function(fns, cb, counterObserver) {
  var completeCount = fns.length,
  completed = 0,
  counter;

  if(!fns.length) {
    cb();
    return;
  }

  counter = function() {
    completed++;
    if(counterObserver) counterObserver.apply(null, arguments);
    if(completed === completeCount) {
      cb();
    }
  };

  fns.forEach(function(fn) {
    fn(counter);
  });

};
