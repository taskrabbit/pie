// pie namespace;
window.pie = {

  // native extensions
  array: {},
  date: {},
  dom: {},
  func: {},
  math: {},
  object: {},
  string: {},

  // extensions to be used within pie apps.
  mixins: {},

  // service objects
  services: {},

  pieId: 1,


  ns: function(path) {
    if(pie.object.hasPath(window, path)) return;
    pie.object.setPath(window, path, {});
  },

  setUid: function(obj) {
    return obj.pieId = obj.pieId || pie.unique();
  },

  unique: function() {
    return String(pie.pieId++);
  },


  // provide a util object for your app which utilizes pie's features.
  // window._ = pie.util();
  // _.a.detect(/* .. */);
  // _.o.merge(a, b);
  // _.inherit(child, parent);
  // _.unique(); //=> '95'
  util: function() {
    var o = {};

    o.a = pie.array;
    o.d = pie.date;
    o.$ = pie.dom;
    o.f = pie.func;
    o.m = pie.math;
    o.o = pie.object;
    o.s = pie.string;
    o.x = pie.mixins;

    o.unique  = pie.unique;
    o.setUid  = pie.setUid;
    o.inherit = pie.inherit;
    o.extend  = pie.extend;

    return o;
  }

};
pie.array.areAll = function(a, f) {
  var i = 0;
  for(;i < a.length; i++) {
    if(!f.call(null, a[i])) return false;
  }
  return true;
};

pie.array.areAny = function(a, f) {
  var i = 0;
  for(;i < a.length; i++) {
    if(f.call(null, a[i])) return true;
  }
  return false;
};

pie.array.change = function() {
  var args = pie.array.from(arguments),
  arr = args.shift();
  args.forEach(function(m) {
    arr = pie.array[m](arr);
  });

  return arr;
};


pie.array.avg = function(a) {
  var s = pie.array.sum(a), l = a.length;
  return l ? (s / l) : 0;
};


// remove all null or undefined values
// does not remove all falsy values unless the second param is true
pie.array.compact = function(a, removeAllFalsy){
  return a.filter(function(i){
    /* jslint eqeq:true */
    return removeAllFalsy ? !!i : (i != null);
  });
};


// return the first item where the provided function evaluates to a truthy value.
// if a function is not provided, the second argument will be assumed to be an attribute check.
// pie.array.detect([1,3,4,5], function(e){ return e % 2 === 0; }) => 4
// pie.array.detect([{foo: 'bar'}, {baz: 'foo'}], 'baz') => {baz: 'foo'}
pie.array.detect = function(a, f) {
  var i = 0, l = a.length;
  for(;i<l;i++) {
    if(pie.object.getValue(a[i], f)) {
      return a[i];
    }
  }
};

pie.array.detectLast = function(a, f) {
  var i = a.length-1, l = 0;
  for(;i>=l;i--) {
    if(pie.object.getValue(a[i], f)) {
      return a[i];
    }
  }
};


pie.array.dup = function(a) {
  return a.slice(0);
};


// flattens an array of arrays or elements into a single depth array
// pie.array.flatten(['a', ['b', 'c']]) => ['a', 'b', 'c']
// you may also restrict the depth of the flattening:
// pie.array.flatten([['a'], ['b', ['c']]], 1) => ['a', 'b', ['c']]
pie.array.flatten = function(a, depth, into) {
  into = into || [];

  if(Array.isArray(a) && depth !== -1) {

    if(depth != null) depth--;

    a.forEach(function(e){
      pie.array.flatten(e, depth, into);
    });

  } else {
    into.push(a);
  }

  return into;
};


// return an array from a value. if the value is an array it will be returned.
pie.array.from = function(value) {
  if(Array.isArray(value)) return value;
  if(pie.object.isArguments(value) || value instanceof NodeList || value instanceof HTMLCollection) return Array.prototype.slice.call(value, 0);
  return pie.array.compact([value], false);
};


pie.array.grep = function(arr, regex) {
  return arr.filter(function(a){ return regex.test(String(a)); });
};


pie.array.groupBy = function(arr, groupingF) {
  var h = {}, g;
  arr.forEach(function(a){

    g = pie.object.getValue(a, groupingF);

    /* jslint eqeq:true */
    if(g != null) {
      h[g] = h[g] || [];
      h[g].push(a);
    }
  });

  return h;
};

pie.array.indexOf = function(a, f) {
  var i = 0, l = a.length;
  for(;i<l;i++) {
    if(pie.object.getValue(a[i], f)) {
      return i;
    }
  }

  return -1;
};

pie.array.intersect = function(a, b) {
  return a.filter(function(i) { return ~b.indexOf(i); });
};


// get the last item
pie.array.last = function(arr) {
  if(arr && arr.length) return arr[arr.length - 1];
};


// return an array filled with the return values of f
// if f is not a function, it will be assumed to be a key of the item.
// if the resulting value is a function, it can be invoked by passing true as the second argument.
// pie.array.map(["a", "b", "c"], function(e){ return e.toUpperCase(); }) => ["A", "B", "C"]
// pie.array.map(["a", "b", "c"], 'length') => [1, 1, 1]
// pie.array.map([0,1,2], 'toFixed') => [toFixed(){}, toFixed(){}, toFixed(){}]
// pie.array.map([0,1,2], 'toFixed', true) => ["0", "1", "2"]
pie.array.map = function(a, f, callInternalFunction){
  var callingF;

  if(!pie.object.isFunction(f)) {
    callingF = function(e){
      var ef = e[f];

      if(callInternalFunction && pie.object.isFunction(ef))
        return ef.apply(e);
      else
        return ef;
    };
  } else {
    callingF = f;
  }

  return a.map(function(e){ return callingF(e); });
};


pie.array.remove = function(a, o) {
  var idx;
  while(~(idx = a.indexOf(o))) {
    a.splice(idx, 1);
  }
  return a;
};


// return an array that consists of any A elements that B does not contain
pie.array.subtract = function(a, b) {
  return a.filter(function(i) { return !~b.indexOf(i); });
};


pie.array.sum = function(a) {
  var s = 0;
  a.forEach(function(i){ s += parseFloat(i); });
  return s;
};


pie.array.sortBy = function(arr, sortF){
  var aVal, bVal;
  return arr.sort(function(a, b) {
    aVal = pie.object.getValue(a, sortF);
    bVal = pie.object.getValue(b, sortF);
    if(aVal === bVal) return 0;
    if(aVal < bVal) return -1;
    return 1;
  });
};


pie.array.toSentence = function(arr, i18n) {
  if(!arr.length) return '';

  var delim = i18n && i18n.t('sentence.delimeter', {default: ''}) || ', ',
  and = i18n && i18n.t('sentence.and', {default: ''}) || ' and ';

  if(arr.length > 2) arr = [arr.slice(0,arr.length-1).join(delim), arr.slice(arr.length-1)];
  return arr.join(and);
};


pie.array.union = function() {
  var arrs = pie.array.from(arguments);
  arrs = pie.array.compact(arrs, true);
  arrs = pie.array.flatten(arrs);
  arrs = pie.array.unique(arrs);
  return arrs;
};


// return unique values
pie.array.unique = function(arr) {
  return arr.filter(function(e, i){ return arr.indexOf(e) === i; });
};

// takes a iso date string and converts to a local time representing 12:00am, on that date.
pie.date.dateFromISO = function(isoDateString) {
  if(!isoDateString) return null;
  var parts = isoDateString.split(/T|\s/)[0].split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};


// current timestamp
pie.date.now = function() {
  return new Date().getTime();
};

/**
 * STOLEN FROM HERE:
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */

pie.date.timeFromISO = (function() {

  var numericKeys = [1, 4, 5, 6, 7, 10, 11];

  return function(date) {
    if(!date) return NaN;
    if(!/T|\s/.test(date)) return pie.date.dateFromISO(date);

    var timestamp, struct, minutesOffset = 0;

    // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
    // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
    // implementations could be faster
    //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
    if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
      // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
      for (var i = 0, k; (k = numericKeys[i]); ++i) {
        struct[k] = +struct[k] || 0;
      }

      // allow undefined days and months
      struct[2] = (+struct[2] || 1) - 1;
      struct[3] = +struct[3] || 1;

      if (struct[8] !== 'Z' && struct[9] !== undefined) {
        minutesOffset = struct[10] * 60 + struct[11];

        if (struct[9] === '+') {
          minutesOffset = 0 - minutesOffset;
        }
      }

      timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
    } else {
      timestamp = NaN;
    }

    return new Date(timestamp);
  };

})();
pie.dom._all = function(originalArgs, returnValues) {
  var nodes = pie.array.from(originalArgs[0]),
  meths = originalArgs[1].split('.'),
  args = Array.prototype.slice.call(originalArgs, 2),
  meth = meths[meths.length-1],
  assign = /=$/.test(meth),
  r, f, i, v;

  if(assign) meth = meth.substr(0,meth.length-1);
  if(returnValues) r = [];

  nodes.forEach(function(e){
    for(i=0;i < meths.length-1;i++) {
      f = e[meths[i]];
      e = pie.func.valueFrom(f);
    }
    if(assign) v = e[meth] = args[0];
    else {
      f = e[meth];
      v = pie.func.valueFrom(f, e, args);
    }

    if(returnValues) r.push(v);
  });

  return returnValues ? r : undefined;
};

// ###all
// Invokes the provided method or method chain with the provided arguments to all elements in the nodeList.
// Example usage:
// * pie.dom.all(nodeList, 'setAttribute', 'foo', 'bar');
// * pie.dom.all(nodeList, 'classList.add', 'active');
// * pie.dom.all(nodeList, 'clicked=', true);
//
// `nodeList` can either be a node, nodeList, or an array of nodes.
// `methodName` can be a string representing a method name, an attribute, or a property. Can be chained with periods. Can end in a `=` to invoke an assignment.
pie.dom.all = function(/* nodeList, methodName[, arg1, arg2, ...] */) {
  return pie.dom._all(arguments, false);
};

// Has the same method signature of `pie.dom.all` but returns the values of the result
// Example usage:
// * pie.dom.getAll(nodeList, 'clicked') //=> [true, true, false]
pie.dom.getAll = function() {
  return pie.dom._all(arguments, true);
};

// create an element based on the content provided.
pie.dom.createElement = function(str) {
  var wrap = document.createElement('div');
  wrap.innerHTML = str;
  return wrap.removeChild(wrap.firstElementChild);
};

pie.dom.cache = function() {
  pie.elementCache = pie.elementCache || new pie.cache();
  return pie.elementCache;
};

pie.dom.remove = function(el) {
  pie.setUid(el);
  pie.dom.cache().del('element-' + el.pieId);
  if(el.parentNode) el.parentNode.removeChild(el);
};


pie.dom.off = function(el, event, fn, selector, cap) {
  var eventSplit = event.split('.'),
    namespace, all, events;

  pie.setUid(el);
  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  all = event === '*';

  events = pie.dom.cache().getOrSet('element-' + el.pieId + '.dom-events', {});

  (all ? Object.keys(events) : [event]).forEach(function(k) {
    pie.array.from(events[k]).forEach(function(obj, i, ary) {
      if(!cap && (k === 'focus' || k === 'blur') && obj.sel) cap = true;
      if((!namespace || namespace === obj.ns) && (!fn || fn === obj.fn) && (!selector || selector === obj.sel) && (cap === obj.cap)) {
        el.removeEventListener(k, obj.cb, obj.cap);
        delete ary[i];
      }

      events[k] = pie.array.compact(pie.array.from(events[k]));
    });
  });
};


pie.dom.on = function(el, event, fn, selector, capture) {
  var eventSplit = event.split('.'),
      cb, namespace, events;

  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  pie.setUid(el);

  // we force capture so that delegation works.
  if(!capture && (event === 'focus' || event === 'blur') && selector) capture = true;

  events = pie.dom.cache().getOrSet('element-' + el.pieId  + '.dom-events', {});
  events[event] = events[event] || [];

  cb = function(e) {
    var targ, els;

    if(namespace) {
      e.namespace = namespace;
    }

    if(!selector) {
      fn.call(el, e);
    } else {
      els = pie.array.from(el.querySelectorAll(selector));

      targ = pie.array.detect(els, function(qel) {
        return qel === e.target || qel.contains(e.target);
      });

      if(targ) {
        e.delegateTarget = targ;
        fn.call(targ, e);
      }
    }
  };

  events[event].push({
    ns: namespace,
    sel: selector,
    cb: cb,
    fn: fn,
    cap: capture
  });

  el.addEventListener(event, cb, capture);
  return cb;
};


pie.dom.trigger = function(el, e) {
  var event = document.createEvent('Event');
  event.initEvent(e, true, true);
  return el.dispatchEvent(event);
};
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
  if(pie.object.isFunction(f)) return f.apply(binding, args) ;
  return f;
};



pie.func.async = function(fns, cb, counterObserver) {

  if(!fns.length) {
    cb();
    return;
  }

  var completeCount = fns.length,
  completed = 0,
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
pie.math.precision = function(number, places) {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
};
// deletes all undefined and null values.
// returns a new object less any empty key/values.
pie.object.compact = function(a, removeEmpty){
  var b = pie.object.merge({}, a);
  Object.keys(b).forEach(function(k) {
    if(b[k] === undefined || b[k] === null || (removeEmpty && b[k].toString().length === 0)) delete b[k];
  });
  return b;
};


// deep merge
pie.object.deepMerge = function() {
  var args = pie.array.from(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {
    if(k in targ && pie.object.isObject(targ[k])) {
      targ[k] = pie.object.deepMerge(targ[k], obj[k]);
    } else {
      targ[k] = obj[k];
    }
  }

  // iterate over each passed in obj remaining
  for (; args.length;) {
    obj = args.shift();
    if(obj) Object.keys(obj).forEach(fn);
  }
  return targ;
};


// grab the sub-object from the provided object less the provided keys.
// pie.object.except({foo: 'bar', biz: 'baz'}, 'biz') => {'foo': 'bar'}
pie.object.except = function(){
  var keys = pie.array.from(arguments),
  a = keys.shift(),
  b = {};

  keys = pie.array.flatten(keys);

  Object.keys(a).forEach(function(k){
    if(keys.indexOf(k) < 0) b[k] = a[k];
  });

  return b;
};


pie.object.flatten = function(a, object, prefix) {
  var b = object || {};
  prefix = prefix || '';

  Object.forEach(a, function(k,v) {
    if(pie.object.isObject(v)) {
      pie.object.flatten(v, b, k + '.');
    } else {
      b[prefix + k] = v;
    }
  });

  return b;
};

// thanks, underscore
['Object','Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Boolean'].forEach(function(name) {
  pie.object['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
});

(function(){
  if(!pie.object.isArguments(arguments)) {
    pie.object.isArguments = function(obj) {
      return obj && obj.hasOwnProperty('callee');
    };
  }
})();

pie.object.isUndefined = function(obj) {
  return obj === void 0;
};

// shallow merge
pie.object.merge = function() {
  var args = pie.array.from(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {
    targ[k] = obj[k];
  }

  // iterate over each passed in obj remaining
  for (; args.length; ) {
    obj = args.shift();
    if(obj) Object.keys(obj).forEach(fn);
  }

  return targ;
};


// yield each key value pair to a function
// pie.object.forEach({'foo' : 'bar'}, function(k,v){ console.log(k, v); });
//
// => foo, bar
pie.object.forEach = function(o, f) {
  Object.keys(o).forEach(function(k) {
    f(k, o[k]);
  });
};


pie.object.getPath = function(obj, path) {
  if(!~path.indexOf('.')) return obj[path];

  var p = path.split('.'), key;
  while(p.length) {
    if(!obj) return obj;
    key = p.shift();
    if (!p.length) return obj[key];
    else obj = obj[key];
  }
  return obj;
};


pie.object.getValue = function(o, attribute) {
  if(pie.object.isFunction(attribute))          return attribute.call(null, o);
  else if (o == null)                           return void 0;
  else if(pie.object.isFunction(o[attribute]))  return o[attribute].call(o);
  else if(pie.object.has(o, attribute))         return o[attribute];
  else                                          return void 0;
};

pie.object.has = function(obj, key) {
  return obj && obj.hasOwnProperty(key);
};

// does the object have the described path
pie.object.hasPath = function(obj, path) {
  if(!~path.indexOf('.')) return pie.object.has(obj, path);

  var parts = path.split('.'), part;
  while(part = parts.shift()) {

    /* jslint eqeq:true */
    if(pie.object.has(obj, part)) {
      obj = obj[part];
    } else {
      return false;
    }
  }

  return true;
};

// serialize object into query string
// {foo: 'bar'} => foo=bar
// {foo: {inner: 'bar'}} => foo[inner]=bar
// {foo: [3]} => foo[]=3
// {foo: [{inner: 'bar'}]} => foo[][inner]=bar
pie.object.serialize = function(obj, removeEmpty) {
  var s = [], append, appendEmpty, build, rbracket = /\[\]$/;

  append = function(k,v){
    v = pie.func.valueFrom(v);
    if(removeEmpty && !rbracket.test(k) && (v == null || !v.toString().length)) return;
    s.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
  };

  appendEmpty = function(k) {
    s.push(encodeURIComponent(k) + '=');
  };

  build = function(prefix, o, append) {
    if(Array.isArray(o)) {
      o.forEach(function(v) {
        build(prefix + '[]', v, append);
      });
    } else if(pie.object.isObject(o)) {
      Object.keys(o).sort().forEach(function(k){
        build(prefix + '[' + k + ']', o[k], append);
      });
    } else {
      append(prefix, o);
    }
  };

  Object.keys(obj).sort().forEach(function(k) {
    build(k, obj[k], append);
  });

  return s.join('&');
};


pie.object.setPath = function(obj, path, value) {
  if(!~path.indexOf('.')) return obj[path] = value;

  var p = path.split('.'), key;
  while(p.length) {
    key = p.shift();
    if (!p.length) obj[key] = value;
    else if (obj[key]) obj = obj[key];
    else obj = obj[key] = {};
  }
};


// grab a sub-object from the provided object.
// pie.object.slice({foo: 'bar', biz: 'baz'}, 'biz') => {'biz': 'baz'}
pie.object.slice = function() {
  var keys = pie.array.from(arguments),
  a = keys.shift(),
  b = {};

  keys = pie.array.flatten(keys);
  keys.forEach(function(k){
    if(pie.object.has(a, k)) b[k] = a[k];
  });

  return b;
};

// return all the values of the object
pie.object.values = function(a) {
  return Object.keys(a).map(function(k) { return a[k]; });
};
pie.string.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};


pie.string.change = function() {
  var args = pie.array.from(arguments),
  str = args.shift();
  args.forEach(function(m) {
    str = pie.string[m](str);
  });

  return str;
};


// deserialize query string into object
pie.string.deserialize = (function(){

  function parseQueryValue(value) {
    if(value === 'undefined') return undefined;
    if(value === 'null') return null;
    if(value === 'true') return true;
    if(value === 'false') return false;
    if(/^-?\d*(\.\d+)?$/.test(value)) {
      var f = parseFloat(value, 10),
          i = parseInt(f, 10);
      if(!isNaN(f) && f % 1) return f;
      if(!isNaN(i)) return i;
    }
    return value;
  }

  // foo[][0][thing]=bar
  // => [{'0' : {thing: 'bar'}}]
  // foo[]=thing&foo[]=bar
  // => {foo: [thing, bar]}
  function applyValue(key, value, params) {
    var pieces = key.split('['),
    segmentRegex = /^\[(.+)?\]$/,
    match, piece, target;

    key = pieces.shift();
    pieces = pieces.map(function(p){ return '[' + p; });

    target = params;

    while(piece = pieces.shift()) {
      match = piece.match(segmentRegex);
      // obj
      if(match[1]) {
        target[key] = target[key] || {};
        target = target[key];
        key = match[1];
      // array
      } else {
        target[key] = target[key] || [];
        target = target[key];
        key = target.length;
      }
    }

    target[key] = value;

    return params;
  }

  return function(str, parse) {
    var params = {}, idx, pieces, segments, key, value;

    if(!str) return params;

    idx = str.indexOf('?');
    if(~idx) str = str.slice(idx+1);

    pieces = str.split('&');
    pieces.forEach(function(piece){
      segments = piece.split('=');
      key = decodeURIComponent(segments[0] || '');
      value = decodeURIComponent(segments[1] || '');

      if(parse) value = parseQueryValue(value);

      applyValue(key, value, params);
    });

    return params;
  };
})();

pie.string.downcase = function(str) {
  return str.toLowerCase();
};

// Escapes a string for HTML interpolation
pie.string.escape = function(str) {
  /* jslint eqnull: true */
  if(str == null) return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
};


// designed to be used with the "%{expression}" placeholders
pie.string.expand = function(str, data) {
  data = data || {};
  return str.replace(/\%\{(.+?)\}/g,
    function(match, key) {return data[key];});
};


pie.string.humanize = function(str) {
  return str.replace(/_id$/, '').replace(/([a-z][A-Z]|[a-z]_[a-z])/g, function(match, a){ return a[0] + ' ' + a[a.length-1]; });
};


pie.string.lowerize = function(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};


pie.string.modularize = function(str) {
  return str.replace(/([^_])_([^_])/g, function(match, a, b){ return a + b.toUpperCase(); });
};


pie.string.pluralize = function(str, count) {
  if(count === 1) return str;
  if(/ss$/i.test(str)) return str + 'es';
  if(/s$/i.test(str)) return str;
  if(/[a-z]$/i.test(str)) return str + 's';
  return str;
};


// string templating via John Resig
pie.string.template = function(str) {
  return new Function("data",
    "var p=[]; with(data){p.push('" +
    str.replace(/[\r\t\n]/g, " ")
       .replace(/'(?=[^%]*%\])/g,"\t")
       .split("'").join("\\'")
       .split("\t").join("'")
       .replace(/\[%=(.+?)%\]/g, "',$1,'")
       .replace(/\[%-(.+?)%\]/g, "',pie.string.escape($1),'")
       .split("[%").join("');")
       .split("%]").join("p.push('") +
       "');}return p.join('');"
  );
};

pie.string.titleize = function(str) {
  return str.replace(/(^| )([a-z])/g, function(match, a, b){ return a + b.toUpperCase(); });
};


pie.string.underscore = function(str) {
  return str.replace(/([a-z])([A-Z])/g, function(match, a, b){ return a + '_' + b.toLowerCase(); }).toLowerCase();
};

pie.string.upcase = function(str) {
  return str.toUpperCase();
};


pie.string.urlConcat = function() {
  var args = pie.array.compact(pie.array.from(arguments), true),
  base = args.shift(),
  query = args.join('&');

  if(!query.length) return base;

  // we always throw a question mark on the end of base
  if(base.indexOf('?') < 0) base += '?';

  // we replace all question marks in the query with &
  if(query.indexOf('?') === 0) query = query.replace('?', '&');

  base += query;
  base = base.replace('?&', '?').replace('&&', '&').replace('??', '?');
  if(base.indexOf('?') === base.length - 1) base = base.substr(0, base.length - 1);
  return base;
};
// this.bind(model, {
//   model: model,
//   type: 'attribute',
//   sel: 'input[name="first_name"]'
//   attr: 'first_name',
//   trigger: 'change',
//   triggerSel: attr,
//   toModel: true,
//   toView: true,
//   debounce: 150,
// })


// A mixin to provide two way data binding between a model and dom elements.
// This mixin should be used with a pie view.
pie.mixins.bindings = (function(){

  var integrations = {

    attribute: (function(){

      var attributeName = function(binding){
        return binding.options.attribute || ('data-' + binding.attr);
      };

      return {

        getValue: function(el, binding) {
          return el.getAttribute(attributeName(binding));
        },

        setValue: function(el, binding) {
          var value = binding.model.get(binding.attr);
          return el.setAttribute(attributeName(binding), value);
        }

      };
    })(),

    value: {

      getValue: function(el, binding) {
        return el.value;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr);;
        /* jslint eqnull:true */
        if(value == null) value = '';
        return el.value = value;
      }

    },

    check: {

      getValue: function(el, binding) {
        var existing = binding.model.get(binding.attr), i;

        if(Array.isArray(existing)) {
          existing = pie.array.dup(existing);
          i = existing.indexOf(el.value);
          // if we are checked and we don't already have it, add it.
          if(el.checked && i < 0) {
            existing.push(el.value);
          // if we are not checked but we do have it, then we add it.
          } else if(!el.checked && i >= 0) {
            existing.splice(i, 1);
          } else {
            return undefined;
          }

          return existing;
        } else {
          return el.checked ? el.value : undefined;
        }
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr),
        elValue = el.value;

        if(Array.isArray(value)) {
          return el.checked = !!~value.indexOf(elValue);
        } else {
          /* jslint eqeq:true */
          return el.checked = elValue == value;
        }
      }

    },

    radio: {

      getValue: function(el, binding) {
        return el.checked ? el.value : undefined;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr),
        elValue = el.value;

        /* jslint eqeq:true */
        return el.checked = elValue == value;
      }

    },

    text: {

      getValue: function(el, binding) {
        return el.innerText;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr);

        /* jslint eqnull:true */
        if(value == null) value = '';
        return el.innerText = value;
      }

    },

    html: {

      getValue: function(el, binding) {
        return el.innerHTML;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr);
        /* jslint eqnull:true */
        if(value == null) value = '';
        return el.innerHTML = value;
      }

    }

  };

  var normalizeBindingOptions = function(given) {
    if(!given.attr) throw new Error("An attr must be provided for data binding. " + JSON.stringify(given));

    var out = {};
    out.attr = given.attr;
    out.model = given.model || this.model;
    out.sel = given.sel || '[name="' + given.attr + '"]';
    out.type = given.type || 'auto';
    out.trigger = given.trigger || 'change keyup';
    out.triggerSel = given.triggerSel || out.sel;
    out.toModel = given.toModel || given.toModel === undefined;
    out.toView = given.toView || given.toView === undefined;
    out.debounce = given.debounce || false;
    out.options = given.options || {};

    if(out.debounce === true) out.debounce = 150;

    return out;
  };

  var determineIntegrationForBinding = function(el, binding) {
    var mod;
    if(el.hasAttribute && el.hasAttribute('data-' + binding.attr)) mod = 'attribute';
    else if(el.nodeName === 'INPUT' && el.getAttribute('type') === 'checkbox') mod = 'check';
    else if(el.nodeName === 'INPUT' && el.getAttribute('type') === 'radio') mod = 'radio';
    else if(el.hasOwnProperty('value')) mod = 'value';
    else mod = 'text';

    return integrations[mod];
  };

  var integrationForBinding = function(el, binding) {
    if(binding.type === 'auto') return determineIntegrationForBinding(el, binding);
    return integrations[binding.type];
  };

  var applyValueToModel = function(value, binding) {
    if(value === undefined) return;

    binding.ignore = true;
    binding.model.set(binding.attr, value);
    binding.ignore = false;
  };

  var applyValueToElement = function(el, binding) {
    integrationForBinding(el, binding).setValue(el, binding);
  };

  var applyValueToElements = function(binding) {
    if(binding.ignore) return;

    var els = pie.array.from(this.qsa(binding.sel));
    els.forEach(function(el) {
      applyValueToElement(el, binding);
    });
  };

  var getValueFromElement = function(el, binding) {
    return integrationForBinding(el, binding).getValue(el, binding);
  };

  var initCallbacks = function(binding) {

    if(binding.toModel) {
      binding.toModel = function(e) {
        var el = e.delegateTarget;
        var value = getValueFromElement(el, binding);
        applyValueToModel(value, binding);
      };

      if(binding.debounce) binding.toModel = Function.debounce(binding.toModel, binding.debounce);

      initViewCallback.call(this, binding);
    }

    if(binding.toView) {
      binding.toView = function() {
        applyValueToElements.call(this, binding);
      }.bind(this);

      initModelCallback.call(this, binding);
    }

    return binding;
  };

  var initModelCallback = function(binding) {
    this.onChange(binding.model, binding.toView, binding.attr);
  };

  var initViewCallback = function(binding) {
    var events = binding.trigger.split(' ');
    events.forEach(function(event){
      this.on(event, binding.triggerSel, binding.toModel);
    }.bind(this));
  };


  return {

    init: function() {
      this._bindings = [];
      if(this._super) this._super.apply(this, arguments);
      if(this.emitter) {
        this.emitter.on('afterRender', this.initBoundFields.bind(this));
      }
    },

    bind: function() {
      var wanted = pie.array.from(arguments);
      wanted = wanted.map(normalizeBindingOptions.bind(this));
      wanted = wanted.map(initCallbacks.bind(this));
      this._bindings = this._bindings.concat(wanted);
    },

    initBoundFields: function() {
      this._bindings.forEach(function(b){
        b.toView();
      });
    }
  };

})();
pie.mixins.changeSet = {

  has: function(name) {
    return pie.array.areAny(this, function(change) {
      return change.name === name;
    });
  },

  hasAny: function() {
    var known = this.names(),
    wanted = pie.array.from(arguments);

    return pie.array.areAny(wanted, function(name) {
      return !!~known.indexOf(name);
    });
  },

  hasAll: function() {
    var known = this.names(),
    wanted = pie.array.from(arguments);
    return pie.array.areAll(wanted, function(name) {
      return !!~known.indexOf(name);
    });
  },

  names: function() {
    return pie.array.unique(pie.array.map(this, 'name'));
  }

};
pie.mixins.container = {

  init: function() {
    this.children = [];
    this.childNames = {};
    if(this._super) this._super.apply(this, arguments);
  },

  addChild: function(name, child) {
    var idx;

    this.children.push(child);
    idx = this.children.length - 1;

    this.childNames[name] = idx;
    child._indexWithinParent = idx;
    child._nameWithinParent = name;
    child.parent = this;

    if('addedToParent' in child) child.addedToParent.call(child);

    return this;
  },

  addChildren: function(obj) {
    pie.object.forEach(obj, function(name, child) {
      this.addChild(name, child);
    }.bind(this));
  },

  getChild: function(obj) {
    var name = obj._nameWithinParent || obj,
    idx = this.childNames[name];

    /* jslint eqeq:true */
    if(idx == null) idx = obj;

    return ~idx && this.children[idx] || undefined;
  },

  bubble: function() {
    var args = pie.array.from(arguments),
    fname = args.shift(),
    obj = this.parent;

    while(obj && !(fname in obj)) {
      obj = obj.parent;
    }

    if(obj) obj[fname].apply(obj, args);
  },

  removeChild: function(obj) {
    var child = this.getChild(obj), i;

    if(child) {
      i = child._indexWithinParent;
      this.children.splice(i, 1);

      for(;i < this.children.length;i++) {
        this.children[i]._indexWithinParent = i;
        this.childNames[this.children[i]._nameWithinParent] = i;
      }

      // clean up
      delete this.childNames[child._nameWithinParent];
      delete child._indexWithinParent;
      delete child._nameWithinParent;
      delete child.parent;

      if('removedFromParent' in child) child.removedFromParent.call(child, this);
    }

    return this;
  },

  removeChildren: function() {
    var child;

    while(child = this.children[this.children.length-1]) {
      this.removeChild(child);
    }

    return this;
  }
};
pie.mixins.externalResources = {

  loadExternalResources: function(/* res1, res2, res3, cb */) {
    var resources = pie.array.from(arguments),
    cb = resources.pop(),
    fns;

    resources = pie.array.change(resources, 'flatten', 'compact');

    fns = resources.map(function(r){
      return function(asyncCb){
        this.app.resources.load(r, asyncCb);
      }.bind(this);
    }.bind(this));

    pie.func.async(fns, cb);
    return void(0);
  }

};
pie.mixins.validatable = {

  // default to a model implementation
  reportValidationError: function(key, errors) {
    this.set('validationErrors.' + key, errors);
  },

  // validates({name: 'presence'});
  // validates({name: {presence: true}});
  // validates({name: ['presence', {format: /[a]/}]})
  validates: function(obj, observeChanges) {
    var configs, resultConfigs;

    this.validations = this.validations || {};

    Object.keys(obj).forEach(function(k) {
      // always convert to an array
      configs = pie.array.from(obj[k]);
      resultConfigs = [];

      configs.forEach(function(conf) {

        // if it's a string or a function, throw it in directly, with no options
        if(pie.object.isString(conf)) {
          resultConfigs.push({type: conf, options: {}});
        // if it's a function, make it a type function, then provide the function as an option
        } else if(pie.object.isFunction(conf)){
          resultConfigs.push({type: 'fn', options: {fn: conf}});
        // otherwise, we have an object
        } else {

          // iterate the keys, adding a validation for each
          Object.keys(conf).forEach(function(confKey){
            if (pie.object.isObject(conf[confKey])) {
              resultConfigs.push({type: confKey, options: conf[confKey]});

            // in this case, we convert the value to an option
            // {presence: true} -> {type: 'presence', {presence: true}}
            // {format: /.+/} -> {type: 'format', {format: /.+/}}
            } else {
              resultConfigs.push({
                type: confKey,
                options: pie.object.merge({}, conf)
              });
            }
          });
        }

      });

      // append the validations to the existing ones
      this.validations[k] = this.validations[k] || [];
      this.validations[k] = this.validations[k].concat(resultConfigs);

      if(observeChanges) {
        this.observe(function(){ this.validate(k); }.bind(this), k);
      }
    }.bind(this));
  },

  // Invoke validateAll with a set of optional callbacks for the success case and the failure case.
  // this.validateAll(function(){ alert('Success!'); }, function(){ alert('Errors!'); });
  // validateAll will perform all registered validations, asynchronously. When all validations have completed, the callbacks
  // will be invoked.
  validateAll: function(cb) {
    var ok = true,
    keys = Object.keys(this.validations),
    fns,
    whenComplete = function() {
      if(cb) cb(ok);
      return void(0);
    },
    counterObserver = function(bool) {
      ok = !!(ok && bool);
    };

    if(!keys.length) {
      return whenComplete();
    } else {

      fns = keys.map(function(k){
        return function(cb) {
          return this.validate(k, cb);
        }.bind(this);
      }.bind(this));

      // start all the validations
      pie.func.async(fns, whenComplete, counterObserver);

      return void(0); // return undefined to ensure we make our point about asynchronous validation.
    }
  },


  // validate a specific key and optionally invoke a callback.
  validate: function(k, cb) {
    var validators = this.app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),
    valid = true,
    fns,
    messages = [],

    // The callback invoked after each individual validation is run.
    // It updates our validity boolean
    counterObserver = function(validation, bool) {
      valid = !!(valid && bool);
      if(!bool) messages.push(validators.errorMessage(validation.type, validation.options));
    },

    // When all validations for the key have run, we report any errors and let the callback know
    // of the result;
    whenComplete = function() {
      this.reportValidationError(k, messages);
      if(cb) cb(valid);
      return void(0);
    }.bind(this);

    if(!validations.length) {
      return whenComplete();
    } else {

      // grab the validator for each validation then invoke it.
      // if true or false is returned immediately, we invoke the callback otherwise we assume
      // the validation is running asynchronously and it will invoke the callback with the result.
      fns = validations.map(function(validation) {

        return function(callback) {
          var validator = validators[validation.type],
          innerCB = function(result) { callback(validation, result); },
          result = validator.call(validators, value, validation.options, innerCB);

          if(result === true || result === false) {
            callback(validation, result);
          } // if anything else, then the validation assumes responsibility for invoking the callback.
        };
      });

      pie.func.async(fns, whenComplete, counterObserver);

      return void(0);
    }
  }
};
pie.base = function() {
  pie.setUid(this);
  this.init.apply(this, arguments);
};
pie.base.prototype.init = function(){};


pie.base.extend = function() {
  var args = pie.array.from(arguments);
  args.unshift(pie.base.prototype);
  return pie.base._extend.apply(null, args);
};

pie.base.reopen = function() {
  var args = pie.array.from(arguments);
  args.unshift(pie.base.prototype);
  return pie.base._reopen.apply(null, args);
};

pie.base._extend = function(/* parentProto, name?, initFn[, extension1, extension2 */) {
  var args = pie.array.from(arguments),
  parentProto = args.shift(),
  name = pie.object.isString(args[0]) ? args.shift() : "",
  init, child;

  if(pie.object.isFunction(args[0])) {
    init = args.shift();
  } else if (pie.object.isObject(args[0])) {
    init = args[0].init;
    args[0] = pie.object.except(args[0], 'init');
  }

  if(!name && init && init.name) name = init.name;

  child = new Function(
    "return function " + name + "(){\n" +
    "  var myProto = Object.getPrototypeOf(this);\n" +
    "  var parentProto = Object.getPrototypeOf(myProto);\n" +
    "  parentProto.constructor.apply(this, arguments);\n" +
    "};"
  )();

  child.prototype = Object.create(parentProto);

  if(init) child.prototype.init = pie.base._wrap(init, child.prototype.init);

  child.extend = function() {
    var extendArgs = pie.array.from(arguments);
    extendArgs.unshift(child.prototype);
    return pie.base._extend.apply(null, extendArgs);
  };

  child.reopen = function() {
    var reopenArgs = pie.array.from(arguments);
    reopenArgs.unshift(child.prototype);
    return pie.base._reopen.apply(null, reopenArgs);
  };

  if(args.length) child.reopen.apply(null, args);

  return child;
};

pie.base._reopen = function(/* proto, extensions[, extension2] */) {
  var extensions = pie.array.from(arguments),
  proto = extensions.shift();

  extensions = pie.array.compact(pie.array.flatten(extensions), true);

  extensions.forEach(function(ext) {
    pie.object.forEach(ext, function(k,v) {
      proto[k] = pie.base._wrap(v, proto[k]);
    });
  });
};

pie.base._wrap = function(newF, oldF) {
  /* jslint eqnull:true */
  if(newF == null) return oldF;
  if(!pie.object.isFunction(newF)) return newF;

  return function() {
    var ret, sup = this._super;
    this._super = oldF || function(){};
    ret = newF.apply(this, arguments);
    this._super = sup;
    return ret;
  };

};

// operator of the site. contains a router, navigator, etc with the intention of holding page context.
pie.app = pie.base.extend('app', function(options) {

  // general app options
  this.options = pie.object.deepMerge({
    uiTarget: 'body',
    viewNamespace: 'lib.views',
    templateSelector: 'script[type="text/pie-template"]'
  }, options);

  var classOption = function(key, _default){
    var k = this.options[key] || _default;
    return new k(this);
  }.bind(this);

  // app.emitter is an interface for subscribing and observing app events
  this.emitter = classOption('emitter', pie.emitter);

  // app.i18n is the translation functionality
  this.i18n = classOption('i18n', pie.i18n);

  // app.ajax is ajax interface + app specific functionality.
  this.ajax = classOption('ajax', pie.ajax);

  // app.notifier is the object responsible for showing page-level notifications, alerts, etc.
  this.notifier = classOption('notifier', pie.notifier);

  // app.errorHandler is the object responsible for
  this.errorHandler = classOption('errorHandler', pie.errorHandler);

  // app.router is used to determine which view should be rendered based on the url
  this.router = classOption('router', pie.router);

  // app.resources is used for managing the loading of external resources.
  this.resources = classOption('resources', pie.resources);

  // the only navigator which should exist in this app.
  this.navigator = classOption('navigator', pie.navigator);

  // the validator which should be used in the context of the app
  this.validator = classOption('validator', pie.validator);

  // app.models is globally available. app.models is solely for page context.
  // this is not a singleton container or anything like that. it's just for passing
  // models from one view to the next. the rendered layout may inject values here to initialize the page.
  // after each navigation change, this.models is reset.
  this.models = {};

  // app._templates should not be used. app.template() should be the public interface.
  this._templates = {};

  // after a navigation change, app.parsedUrl is the new parsed route
  this.parsedUrl = {};

  // we observe the navigator and handle changing the context of the page
  this.navigator.observe(this.navigationChanged.bind(this), 'url');

  this.emitter.once('beforeStart', this.setupSinglePageLinks.bind(this));
  this.emitter.once('afterStart', this.showStoredNotifications.bind(this));

  // once the dom is loaded
  document.addEventListener('DOMContentLoaded', this.start.bind(this));

  // set a global instance which can be used as a backup within the pie library.
  window.pieInstance = window.pieInstance || this;
});


pie.app.reopen(pie.mixins.container, pie.mixins.events);

pie.app.reopen({
  // just in case the client wants to override the standard confirmation dialog.
  // eventually this could create a confirmation view and provide options to it.
  // the view could have more options but would always end up invoking success or failure.
  confirm: function(options) {
    if(window.confirm(options.text)) {
      if(options.success) options.success();
    } else {
      if(options.failure) options.failure();
    }
  },

  // print stuff if we're not in prod.
  debug: function(msg) {
    if(this.env === 'production') return;
    if(console && console.log) console.log('[PIE] ' + msg);
  },
  // use this to navigate. This allows us to apply app-specific navigation logic
  // without altering the underling navigator.
  // This can be called with just a path, a path with a query object, or with notification arguments.
  // app.go('/test-url')
  // app.go('/test-url', true) // replaces state rather than adding
  // app.go(['/test-url', {foo: 'bar'}]) // navigates to /test-url?foo=bar
  // app.go('/test-url', true, 'Thanks for your interest') // replaces state with /test-url and shows the provided notification
  // app.go('/test-url', 'Thanks for your interest') // navigates to /test-url and shows the provided notification
  go: function(){
    var args = pie.array.from(arguments), path, notificationArgs, replaceState, query;

    path = args.shift();

    // arguments => '/test-url', '?query=string'
    if(typeof args[0] === 'string' && args[0].indexOf('?') === 0) {
      path = this.router.path(path);
      query = args.shift();
      path = pie.string.urlConcat(this.router.path(path), query);
    // arguments => '/test-url', {query: 'object'}
    } else if(typeof args[0] === 'object') {
      path = this.router.path(path, args.shift());

    // arguments => '/test-url'
    // arguments => ['/test-url', {query: 'object'}]
    } else {
      path = this.router.path.apply(this.router, pie.array.from(path));
    }

    // if the next argument is a boolean, we care about replaceState
    if(args[0] === true || args[0] === false) {
      replaceState = args.shift();
    }

    // anything left is considered arguments for the notifier.
    notificationArgs = args;

    if(this.router.parseUrl(path).hasOwnProperty('view')) {
      this.navigator.go(path, replaceState);
      if(notificationArgs && notificationArgs.length) {
        this.notifier.notify.apply(this.notifier, notificationArgs);
      }
    } else {

      if(notificationArgs && notificationArgs.length) {
        this.store(this.notifier.storageKey, notificationArgs);
      }

      window.location.href = path;
    }
  },

  // go back one page.
  goBack: function() {
    window.history.back();
  },

  // callback for when a link is clicked in our app
  handleSinglePageLinkClick: function(e){
    // if the link is targeting something else, let the browser take over
    if(e.delegateTarget.getAttribute('target')) return;

    // if the user is trying to do something beyond navigate, let the browser take over
    if(e.ctrlKey || e.metaKey) return;


    var href = e.delegateTarget.getAttribute('href');
    // if we're going nowhere, somewhere else, or to an anchor on the page, let the browser take over
    if(!href || /^(#|[a-z]+:\/\/)/.test(href)) return;

    // ensure that relative links are evaluated as relative
    if(href.charAt(0) === '?') href = window.location.pathname + href;

    // great, we can handle it. let the app decide whether to use pushstate or not
    e.preventDefault();
    this.go(href);
  },

  // when we change urls
  // we always remove the current before instantiating the next. this ensures are views can prepare
  // context's in removedFromParent before the constructor of the next view is invoked.
  navigationChanged: function() {
    var target = document.querySelector(this.options.uiTarget),
      current  = this.getChild('currentView');

    // let the router determine our new url
    this.previousUrl = this.parsedUrl;
    this.parsedUrl = this.router.parseUrl(this.navigator.get('fullPath'));

    if(this.previousUrl !== this.parsedUrl) {
      this.emitter.fire('urlChanged');
    }

    // not necessary for a view to exist on each page.
    // Maybe the entry point is server generated.
    if(!this.parsedUrl.view) {
      return;
    }

    // if the view that's in there is already loaded, don't remove / add again.
    if(current && current._pieName === this.parsedUrl.view) {
      if('navigationUpdated' in current) current.navigationUpdated();
      return;
    }

    // remove the existing view if there is one.
    if(current) {
      this.removeChild(current);
      if(current.el.parentNode) current.el.parentNode.removeChild(current.el);
      this.emitter.fire('oldViewRemoved', current);
    }

    // clear any leftover notifications
    this.notifier.clear();

    // use the view key of the parsedUrl to find the viewClass
    var viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.parsedUrl.view), child;
    // the instance to be added.

    // add the instance as our 'currentView'
    child = new viewClass(this);
    child._pieName = this.parsedUrl.view;
    child.setRenderTarget(target);
    this.addChild('currentView', child);


    // remove the leftover model references
    this.models = {},

    // get us back to the top of the page.
    window.scrollTo(0,0);

    this.emitter.fire('newViewLoaded', child);
  },
  // reload the page without reloading the browser.
  // alters the current view's _pieName to appear as invalid for the route.
  refresh: function() {
    var current = this.getChild('currentView');
    current._pieName = '__remove__';
    this.navigationChanged();
  },

  // safely access localStorage, passing along any errors for reporting.
  retrieve: function(key, clear) {
    var encoded, decoded;

    try{
      encoded = window.localStorage.getItem(key);
      decoded = encoded ? JSON.parse(encoded) : undefined;
    }catch(err){
      this.errorHandler.reportError(err, {prefix: "[caught] app#retrieve/getItem:"});
    }

    try{
      if(clear || clear === undefined){
        window.localStorage.removeItem(key);
      }
    }catch(err){
      this.errorHandler.reportError(err, {prefix: "[caught] app#retrieve/removeItem:"});
    }

    return decoded;
  },

  // when a link is clicked, go there without a refresh if we recognize the route.
  setupSinglePageLinks: function() {
    pie.dom.on(document.body, 'click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
  },

  // show any notification which have been preserved via local storage.
  showStoredNotifications: function() {
    var encoded = this.retrieve(this.notifier.storageKey), decoded;

    if(encoded) {
      decoded = JSON.parse(encoded);
      this.notifier.notify.apply(this.notifier, decoded);
    }
  },

  // start the app, apply fake navigation to the current url to get our navigation observation underway.
  start: function() {
    this.emitter.around('start', function() {
      this.navigator.start();
      this.emitter.fire('start');
    }.bind(this));
  },

  // safely access localStorage, passing along any errors for reporting.
  store: function(key, data) {
    try{
      window.localStorage.setItem(key, JSON.stringify(data));
    }catch(err){
      this.errorHandler.reportError(err, {prefix: "[caught] app#store:"});
    }
  },

  // compile templates on demand and evaluate them with `data`.
  // Templates are assumed to be script tags with type="text/pie-template".
  // Once compiled, the templates are cached in this._templates for later use.
  template: function(name, data) {
    if(!this._templates[name]) {

      var node = document.querySelector(this.options.templateSelector + '[id="' + name + '"]');

      if(node) {
        this.debug('Compiling and storing template: ' + name);
        this._templates[name] = pie.string.template(node.content || node.textContent);
      } else {
        throw new Error("[PIE] Unknown template error: " + name);
      }
    }

    data = data || {};

    return this._templates[name](data);
  }
});

//    **Setters and Getters**
//    pie.model provides a basic interface for object management and observation.
//
//    *example:*
//
//    ```
//    var user = new pie.model();
//    user.set('first_name', 'Doug');
//    user.get('first_name') //=> 'Doug'
//    user.sets({
//      first_name: 'Douglas',
//      last_name: 'Wilson'
//    });
//    user.get('last_name') //= 'Wilson'
//
//    user.set('location.city', 'Miami')
//    user.get('location.city') //=> 'Miami'
//    user.get('location') //=> {city: 'Miami'}
//    ```
//    ** Observers **
//    Observers can be added by invoking the model's observe() method.
//    pie.model.observe() optionally accepts 2+ arguments which are used as filters for the observer.
//
//    *example:*
//
//    ```
//    var o = function(changes){ console.log(changes); };
//    var user = new pie.model();
//    user.observe(o, 'first_name');
//    user.sets({first_name: 'first', last_name: 'last'});
//    // => o is called and the following is logged:
//    [{
//      name: 'first_name',
//      type: 'new',
//      oldValue:
//      undefined,
//      value: 'first',
//      object: {...}
//    }]
//    ```
//
//    **Computed Properties**
//
//    pie.models can observe themselves and compute properties. The computed properties can be observed
//    just like any other property.
//
//    *example:*
//
//    ```
//    var fullName = function(){ return this.get('first_name') + ' ' + this.get('last_name'); };
//    var user = new pie.model({first_name: 'Doug', last_name: 'Wilson'});
//    user.compute('full_name', fullName, 'first_name', 'last_name');
//    user.get('full_name') //=> 'Doug Wilson'
//    user.observe(function(changes){ console.log(changes); }, 'full_name');
//    user.set('first_name', 'Douglas');
//    # => the observer is invoked and console.log provides:
//    [{
//      name: 'full_name',
//      oldValue: 'Doug Wilson',
//      value: 'Douglas Wilson',
//      type: 'update',
//      object: {...}
//    }]
//    ```


pie.model = pie.base.extend('model', {
  init: function(d, options) {
    this.data = pie.object.merge({_version: 1}, d);
    this.options = options || {};
    this.app = this.options.app || window.app;
    this.observations = {};
    this.changeRecords = [];
    pie.setUid(this);
  },


  trackVersion: function() {
    if(this.options.trackVersion !== false && this.changeRecords.length) {
      this.set('_version', this.get('_version') + 1, {skipObservers: true});
    }
  },


  // After updates have been made we deliver our change records to our observers.
  deliverChangeRecords: function() {
    var observers = {}, os, o, change;

    this.trackVersion();

    // grab each change record
    while(change = this.changeRecords.shift()) {

      // grab all the observers for the attribute specified by change.name
      os = pie.array.union(this.observations[change.name], this.observations.__all__);

      // then for each observer, build or concatenate to the array of changes.
      while(o = os.shift()) {

        if(!observers[o.pieId]) {
          var changeSet = [];
          pie.object.merge(changeSet, pie.mixins.changeSet);
          observers[o.pieId] = {fn: o, changes: changeSet};
        }

        observers[o.pieId].changes.push(change);
      }
    }

    // Iterate each observer, calling it with the changes which it was subscribed for.
    pie.object.forEach(observers, function(uid, obj) {
      obj.fn.call(null, obj.changes);
    });

    return this;
  },

  // Access the value stored at data[key]
  // Key can be multiple levels deep by providing a dot separated key.
  get: function(key) {
    return pie.object.getPath(this.data, key);
  },

  // Retrieve multiple values at once.
  gets: function() {
    var args = pie.array.from(arguments), o = {};
    args = pie.array.flatten(args);
    args = pie.array.compact(args);

    args.forEach(function(arg){
      o[arg] = pie.object.getPath(this.data, arg);
    }.bind(this));

    return pie.object.compact(o);
  },


  // Register an observer and optionally filter by key.
  observe: function(/* fn[, key1, key2, key3] */) {
    var keys = pie.array.from(arguments),
    fn = keys.shift();

    // uid is needed later for ensuring unique change record delivery.
    pie.setUid(fn);

    keys = pie.array.flatten(keys);

    if(!keys.length) keys.push('__all__');

    keys.forEach(function(k) {
      this.observations[k] = this.observations[k] || [];
      if(this.observations[k].indexOf(fn) < 0) this.observations[k].push(fn);
    }.bind(this));

    return this;
  },

  // Set a value and trigger observers.
  // Optionally provide false as the third argument to skip observation.
  // Note: skipping observation does not stop changeRecords from accruing.
  set: function(key, value, options) {
    var change = { name: key, object: this.data };

    if(pie.object.hasPath(this.data, key)) {
      change.type = 'update';
      change.oldValue = pie.object.getPath(this.data, key);
    } else {
      change.type = 'add';
    }

    change.value = value;
    pie.object.setPath(this.data, key, value);

    this.changeRecords.push(change);

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },

  // Set a bunch of stuff at once.
  sets: function(obj, options) {
    pie.object.forEach(obj, function(k,v) {
      this.set(k, v, {skipObservers: true});
    }.bind(this));

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },


  // Unregister an observer. Optionally for specific keys.
  unobserve: function(/* fn[, key1, key2, key3] */) {
    var keys = pie.array.from(arguments),
    fn = keys.shift(),
    i;

    if(!keys.length) keys = Object.keys(this.observations);

    keys.forEach(function(k){
      i = this.observations[k].indexOf(fn);
      if(~i) this.observations[k].splice(i,1);
    }.bind(this));

    return this;
  },

  // Register a computed property which is accessible via `name` and defined by `fn`.
  // Provide all properties which invalidate the definition.
  compute: function(/* name, fn[, prop1, prop2 ] */) {
    var props = pie.array.from(arguments),
    name = props.shift(),
    fn = props.shift();

    this.observe(function(/* changes */){
      this.set(name, fn.call(this));
    }.bind(this), props);

    // initialize it
    this.set(name, fn.call(this));
  }
});
// pie.view manages events delegation, provides some convenience methods, and some <form> standards.
pie.view = pie.base.extend('view', function(options) {
  this.options = options || {},
  this.app = this.options.app || window.app;
  this.el = this.options.el || pie.dom.createElement('<div />');
  this.changeCallbacks = [];
  if(this.options.setup) this.setup();
});

pie.view.reopen(pie.mixins.container);

pie.view.reopen({

  addedToParent: function() {
    this.setup();
  },

  // we extract the functionality of setting our render target so we can override this as we see fit.
  // for example, other implementation could store the target, then show a loader until render() is called.
  // by default we simply append ourselves to the target.
  setRenderTarget: function(target) {
    target.appendChild(this.el);
  },

  // placeholder for default functionality
  setup: function(){
    return this;
  },


  // all events observed using view.on() will use the unique namespace for this instance.
  eventNamespace: function() {
    return 'view'+ this.pieId;
  },


  navigationUpdated: function() {
    this.children().forEach(function(c){
      if('navigationUpdated' in c) c.navigationUpdated();
    });
  },


  // Events should be observed via this .on() method. Using .on() ensures the events will be
  // unobserved when the view is removed.
  on: function(e, sel, f) {
    var ns = this.eventNamespace(),
        f2 = function(e){
          if(e.namespace === ns) {
            return f.apply(this, arguments);
          }
        };

    e.split(' ').forEach(function(ev) {
      ev += "." + ns;
      pie.dom.on(this.el, ev, f2, sel);
    }.bind(this));

    return this;
  },


  // Observe changes to an observable, unobserving them when the view is removed.
  // If the object is not observable, an error will be thrown.
  onChange: function() {
    var observable = arguments[0], args = pie.array.from(arguments).slice(1);
    if(!('observe' in observable)) throw new Error("Observable does not respond to observe");

    this.changeCallbacks.push([observable, args]);
    observable.observe.apply(observable, args);
  },


  // shortcut for this.el.querySelector
  qs: function(selector) {
    return this.el.querySelector(selector);
  },

  // shortcut for this.el.querySelectorAll
  qsa: function(selector) {
    return this.el.querySelectorAll(selector);
  },


  // clean up.
  removedFromParent: function() {
    this._unobserveEvents();
    this._unobserveChangeCallbacks();

    // views remove their children upon removal to ensure all irrelevant observations are cleaned up.
    this.removeChildren();

    return this;
  },


  // release all observed events.
  _unobserveEvents: function() {
    pie.dom.off(this.el, '*.' + this.eventNamespace());
    pie.dom.off(document.body, '*.' + this.eventNamespace());
  },


  // release all change callbacks.
  _unobserveChangeCallbacks: function() {
    var a;
    while(this.changeCallbacks.length) {
      a = this.changeCallbacks.pop();
      a[0].unobserve.apply(a[0], a[1]);
    }
  }

});
// a view class which handles some basic functionality
pie.activeView = pie.view.extend('activeView', function(options) {
  this._super(options);

  this.emitter = new pie.emitter();
  this.emitter.on('render', this._renderTemplateToDom.bind(this));
  this.emitter.once('afterRender', this._appendToDom.bind(this));
});

pie.activeView.reopen(pie.mixins.externalResources);
pie.activeView.reopen({

  _appendToDom: function() {
    if(!this.renderTarget) return;
    if(this.el.parentNode) return;
    this.renderTarget.appendChild(this.el);
  },


  // this.el receives a loading class, specific buttons are disabled and provided with the btn-loading class.
  _loadingStyle: function(bool) {
    this.el.classList[bool ? 'add' : 'remove']('loading');

    var buttons = this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable');

    pie.dom.all(buttons, bool ? 'classList.add' : 'classList.remove', 'btn-loading');
    pie.dom.all(buttons, bool ? 'setAttribute' : 'removeAttribute', 'disabled', 'disabled');
  },

  _removeFromDom: function() {
    // remove our el if we still have a parent node.
    // don't use pie.dom.remove since we don't want to remove the cache.
    if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },

  _renderTemplateToDom: function() {
    var templateName = this.templateName();

    if(templateName) {
      var content = this.app.template(templateName, this.renderData());
      this.el.innerHTML = content;
    }
  },


  setup: function() {
    this.emitter.once('setup', this._super.bind(this));

    this.emitter.around('setup', function(){

      this.loadExternalResources(this.options.resources, function() {

        this.emitter.fire('setup');

        if(this.options.autoRender && this.model) {
          var field = pie.object.isString(this.options.autoRender) ? this.options.autoRender : '_version';
          this.onChange(this.model, this.render.bind(this), field);
        }

        if(this.options.renderOnSetup) {
          this.render();
        }

      }.bind(this));

    }.bind(this));

  },

  // add or remove the default loading style.
  loadingStyle: function(bool) {
    if(bool === undefined) bool = true;
    this._loadingStyle(bool);
  },

  // If the first option passed is a node, it will use that as the query scope.
  // Return an object representing the values of fields within this.el.
  parseFields: function() {
    var o = {}, e = arguments[0], i = 0, n, el;

    if(pie.object.isString(e)) {
      e = this.el;
    } else {
      i++;
    }

    for(;i<arguments.length;i++) {
      n = arguments[i];
      el = e.querySelector('[name="' + n + '"]:not([disabled])');
      if(el) pie.object.setPath(o, n, el.value);
    }
    return o;
  },

  removedFromParent: function(parent) {
    pie.view.prototype.removedFromParent.call(this, parent);
    this._removeFromDom();
  },


  // convenience method which is useful for ajax callbacks.
  removeLoadingStyle: function(){
    this._loadingStyle(false);
  },


  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.around('render', function(){
      this.emitter.fire('render');
    }.bind(this));
  },


  setRenderTarget: function(target) {
    this.renderTarget = target;
    if(this.emitter.has('afterRender')) this._appendToDom();
  },

  templateName: function() {
    return this.options.template;
  }

});
pie.ajax = pie.base.extend('ajax', {

  init: function(app){
    this.app = app;
    this.defaultAjaxOptions = {};
  },

  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',

  // default ajax options. override this method to
  _defaultAjaxOptions: function() {
    return pie.object.merge({}, this.defaultAjaxOptions, {
      type: 'json',
      verb: this.GET,
      error: this.app.errorHandler.handleXhrError.bind(this.app.errorHandler)
    });
  },


  // interface for conducting ajax requests.
  // app.ajax.post({
  //  url: '/login',
  //  data: { email: 'xxx', password: 'yyy' },
  //  progress: this.progressCallback.bind(this),
  //  success: this.
  // })
  ajax: function(options) {

    options = pie.object.compact(options);
    options = pie.object.merge({}, this._defaultAjaxOptions(), options);

    if(options.extraError) {
      var oldError = options.error;
      options.error = function(xhr){ oldError(xhr); options.extraError(xhr); };
    }

    var xhr = new XMLHttpRequest(),
    url = options.url,
    that = this,
    d;

    if(options.verb === this.GET && options.data) {
      url = this.app.router.path(url, options.data);
    } else {
      url = this.app.router.path(url);
    }

    if(options.progress) {
      xhr.addEventListener('progress', options.progress, false);
    } else if(options.uploadProgress) {
      xhr.upload.addEventListener('progress', options.uploadProgress, false);
    }

    xhr.open(options.verb, url, true);

    this._applyHeaders(xhr, options);

    xhr.onload = function() {
      if(options.tracker) options.tracker(this);

      that._parseResponse(this, options);

      if(this.status >= 200 && this.status < 300 || this.status === 304) {
        if(options.dataSuccess) options.dataSuccess(this.data);
        if(options.success) options.success(this.data, this);
      } else if(options.error){
        options.error(this);
      }

      if(options.complete) options.complete(this);
    };

    if(options.verb !== this.GET) {
      d = options.data ? (pie.object.isString(options.data) ? options.data : JSON.stringify(pie.object.compact(options.data))) : undefined;
    }

    xhr.send(d);
    return xhr;
  },

  get: function(options) {
    options = pie.object.merge({verb: this.GET}, options);
    return this.ajax(options);
  },

  post: function(options) {
    options = pie.object.merge({verb: this.POST}, options);
    return this.ajax(options);
  },

  put: function(options) {
    options = pie.object.merge({verb: this.PUT}, options);
    return this.ajax(options);
  },

  del: function(options) {
    options = pie.object.merge({verb: this.DELETE}, options);
    return this.ajax(options);
  },

  _applyCsrfToken: function(xhr, options) {
    var token = pie.func.valueFrom(options.csrfToken),
    tokenEl;

    if(!token) {
      tokenEl = document.querySelector('meta[name="csrf-token"]'),
      token = tokenEl ? tokenEl.getAttribute('content') : null;
    }

    if(token) {
      xhr.setRequestHeader('X-CSRF-Token', token);
    }
  },

  _applyHeaders: function(xhr, options) {
    var meth = pie.string.modularize('_apply_' + options.type + '_headers');
    (this[meth] || this._applyDefaultHeaders)(xhr, options);

    this._applyCsrfToken(xhr, options);

    if(pie.object.isString(options.data)) {
      xhr.setRequestHeader('Content-Type', options.contentType || 'application/x-www-form-urlencoded');
    // if we aren't already sending a string, we will encode to json.
    } else {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }
  },

  _applyDefaultHeaders: function(xhr, options) {},

  _applyJsonHeaders: function(xhr, options) {
    xhr.setRequestHeader('Accept', 'application/json');
  },

  _applyHtmlHeaders: function(xhr, options) {
    xhr.setRequestHeader('Accept', 'text/html');
  },

  _applyTextHeaders: function(xhr, options) {
    xhr.setRequestHeader('Accept', 'text/plain');
  },

  _parseResponse: function(xhr, options) {
    var meth = pie.string.modularize('_parse_' + options.type + '_response');
    (this[meth] || this._parseDefaultResponse)(xhr, options);
  },

  _parseDefaultResponse: function(xhr, options) {
    xhr.data = xhr.responseText;
  },

  _parseJsonResponse: function(xhr, options) {
    try{
      xhr.data = xhr.responseText.trim().length ? JSON.parse(xhr.responseText) : {};
    } catch(err) {
      this.app.debug("could not parse JSON response: " + err);
      xhr.data = {};
    }
  }
});
pie.cache = pie.model.extend('cache', {

  init: function(data, options) {
    this._super(data, options);
  },

  del: function(path) {
    this.set(path, undefined);
  },

  expire: function(path, ttl) {
    var value = this.get(path);

    if(value === undefined) return false;

    this.set(path, value, {ttl: ttl});
    return true;
  },

  get: function(path) {
    var wrap = pie.model.prototype.get.call(this, path);
    if(!wrap) return undefined;
    if(wrap.expiresAt && wrap.expiresAt <= this.currentTime()) {
      this.set(path, undefined);
      return undefined;
    }

    return wrap.data;
  },

  getOrSet: function(path, value, options) {
    var result = this.get(path);
    if(result !== undefined) return result;
    this.set(path, value, options);
    return value;
  },

  set: function(path, value, options) {
    if(value === undefined) {
      pie.model.prototype.set.call(this, path, undefined, options);
    } else {
      var wrap = this.wrap(value, options);
      pie.model.prototype.set.call(this, path, wrap, options);
    }
  },

  wrap: function(obj, options) {
    options = options || {};
    // it could come in on a couple different keys.
    var expiresAt = options.expiresAt || options.expiresIn || options.ttl;

    if(expiresAt) {
      // make sure we don't have a date.
      if(expiresAt instanceof Date) expiresAt = expiresAt.getTime();
      // or a string
      if(pie.object.isString(expiresAt)) {
        // check for a numeric
        if(/^\d+$/.test(expiresAt)) expiresAt = parseInt(expiresAt, 10);
        // otherwise assume ISO
        else expiresAt = pie.date.timeFromISO(expiresAt).getTime();
      }

      // we're dealing with something smaller than a current milli epoch, assume we're dealing with a ttl.
      if(String(expiresAt).length < 13) expiresAt = this.currentTime() + expiresAt;
    }

    return {
      data: obj,
      expiresAt: expiresAt
    };
  },

  currentTime: function() {
    return pie.date.now();
  }
});
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
pie.errorHandler = pie.base.extend('errorHandler', {

  init: function(app) {
    this.app = app;
    this.responseCodeHandlers = {};
  },


  // extract the "data" object out of an xhr
  data: function(xhr) {
    return xhr.data = xhr.data || (xhr.status ? JSON.parse(xhr.response) : {});
  },


  // extract an error message from a response. Try to extract the error message from
  // the xhr data diretly, or allow overriding by response code.
  errorMessagesFromRequest: function(xhr) {
    var d = this.data(xhr),
    errors  = pie.array.map(d.errors || [], 'message'),
    clean;

    errors = pie.array.compact(errors, true);
    clean   = this.app.i18n.t('app.errors.' + xhr.status, {default: errors});

    this.app.debug(errors);

    return pie.array.from(clean);
  },

  // find a handler for the xhr via response code or the app default.
  handleXhrError: function(xhr) {

    var handler = this.responseCodeHandlers[xhr.status.toString()];

    if(handler) {
      handler.call(xhr, xhr);
    } else {
      this.notifyErrors(xhr);
    }

  },

  // build errors and send them to the notifier.
  notifyErrors: function(xhr){
    var n = this.app.notifier, errors = this.errorMessagesFromRequest(xhr);

    if(errors.length) {
      // clear all alerts when an error occurs.
      n.clear();

      // delay so UI will visibly change when the same content is shown.
      setTimeout(function(){
        n.clear('error');
        n.notify(errors, 'error', 10000);
      }, 100);
    }
  },


  // register a response code handler
  // registerHandler('401', myRedirectCallback);
  registerHandler: function(responseCode, handler) {
    this.responseCodeHandlers[responseCode.toString()] = handler;
  },


  // provide an interface for sending errors to a bug reporting service.
  reportError: function(err, options) {
    options = options || {};

    if(options.prefix && 'message' in err) {
      err.message = options.prefix + ' ' + err.message;
    }

    if(options.prefix && 'name' in err) {
      err.name = options.prefix + ' ' + err.name;
    }

    this._reportError(err, options);
  },


  // hook in your own error reporting service. bugsnag, airbrake, etc.
  _reportError: function(err) {
    this.app.debug(err);
  }
});
// made to be used as an instance so multiple translations could exist if we so choose.
pie.i18n = pie.base.extend('i18n', {
  init: function(app) {
    this.translations = pie.object.merge({}, pie.i18n.defaultTranslations);
    this.app = app;
  },

  _ampm: function(num) {
    return this.t('app.time.meridiems.' + (num >= 12 ? 'pm' : 'am'));
  },


  _countAlias: {
    '0' : 'zero',
    '1' : 'one',
    '-1' : 'negone'
  },


  _dayName: function(d) {
    return this.t('app.time.day_names.' + d);
  },


  _hour: function(h) {
    if(h > 12) h -= 12;
    if(!h) h += 12;
    return h;
  },


  _monthName: function(m) {
    return this.t('app.time.month_names.' + m);
  },


  _nestedTranslate: function(t, data) {
    return t.replace(/\$\{([^\}]+)\}/, function(match, path) {
      return this.translate(path, data);
    }.bind(this));
  },


  // assumes that dates either come in as dates, iso strings, or epoch timestamps
  _normalizedDate: function(d) {
    if(String(d).match(/^\d+$/)) {
      d = parseInt(d, 10);
      if(String(d).length < 13) d *= 1000;
      d = new Date(d);
    } else if(pie.object.isString(d)) {
      d = pie.date.timeFromISO(d);
    } else {
      // let the system parse
      d = new Date(d);
    }
    return d;
  },


  _shortDayName: function(d) {
    return this.t('app.time.short_day_names.' + d) || this._dayName(d).slice(0, 3);
  },


  _shortMonthName: function(m) {
    return this.t('app.time.short_month_names.' + m) || this._monthName(m).slice(0, 3);
  },


  _pad: function(num, cnt, pad) {
    var s = '',
        p = cnt - num.toString().length;
    if(pad === undefined) pad = ' ';
    while(p>0){
      s += pad;
      p -= 1;
    }
    return s + num.toString();
  },

  _ordinal: function(number) {
    var unit = number % 100;

    if(unit >= 11 && unit <= 13) unit = 0;
    else unit = number % 10;

    return this.t('app.time.ordinals.o' + unit);
  },

  _timezoneAbbr: function(date) {
    var str = date && date.toString();
    return str && str.split(/\((.*)\)/)[1];
  },


  _utc: function(t) {
    var t2 = new Date(t.getTime());
    t2.setMinutes(t2.getMinutes() + t2.getTimezoneOffset());
    return t2;
  },


  load: function(data, shallow) {
    var f = shallow ? pie.object.merge : pie.object.deepMerge;
    f.call(null, this.translations, data);
  },


  translate: function(/* path, data, stringChange1, stringChange2 */) {
    var changes = pie.array.from(arguments),
    path = changes.shift(),
    data = pie.object.isObject(changes[0]) ? changes.shift() : undefined,
    translation = pie.object.getPath(this.translations, path),
    count;

    if (pie.object.has(data, 'count') && pie.object.isObject(translation)) {
      count = (data.count || 0).toString();
      count = this._countAlias[count] || (count > 0 ? 'other' : 'negother');
      translation = translation[count] === undefined ? translation.other : translation[count];
    }

    if(!translation) {

      if(data && data.hasOwnProperty('default')) {
        translation = pie.func.valueFrom(data.default);
      } else {
        this.app.debug("Translation not found: " + path);
        return "";
      }
    }


    if(pie.object.isString(translation)) {
      translation = translation.indexOf('${') === -1 ? translation : this._nestedTranslate(translation, data);
      translation = translation.indexOf('%{') === -1 ? translation : pie.string.expand(translation, data);
    }

    if(changes.length) {
      changes.unshift(translation);
      translation = pie.string.change.apply(null, changes);
    }

    return translation;
  },


  timeago: function(t, now, scope) {
    t = this._normalizedDate(t).getTime()  / 1000;
    now = this._normalizedDate(now || new Date()).getTime() / 1000;

    var diff = now - t, c;

    scope = scope || 'app';

    if(diff < 60) { // less than a minute
      return this.t(scope + '.timeago.now', {count: diff});
    } else if (diff < 3600) { // less than an hour
      c = Math.floor(diff / 60);
      return this.t(scope + '.timeago.minutes', {count: c});
    } else if (diff < 86400) { // less than a day
      c = Math.floor(diff / 3600);
      return this.t(scope + '.timeago.hours', {count: c});
    } else if (diff < 86400 * 7) { // less than a week (
      c = Math.floor(diff / 86400);
      return this.t(scope + '.timeago.days', {count: c});
    } else if (diff < 86400 * 30) { // less than a month
      c = Math.floor(diff / (86400 * 7));
      return this.t(scope + '.timeago.weeks', {count: c});
    } else if (diff < 86500 * 365.25) { // less than a year
      c = Math.floor(diff / (86400 * 365.25 / 12));
      return this.t(scope + '.timeago.months', {count: c});
    } else {
      c = Math.floor(diff / (86400 * 365.25));
      return this.t(scope + '.timeago.years', {count: c});
    }
  },

  // pass in the date instance and the string 'format'
  strftime: function(date, f) {
    date = this._normalizedDate(date);

    // named format from translations.time.
    if(!~f.indexOf('%')) f = this.t('app.time.formats.' + f);

    var weekDay           = date.getDay(),
        day               = date.getDate(),
        year              = date.getFullYear(),
        month             = date.getMonth() + 1,
        hour              = date.getHours(),
        hour12            = this._hour(hour),
        meridiem          = this._ampm(hour),
        secs              = date.getSeconds(),
        mins              = date.getMinutes(),
        mills             = date.getMilliseconds(),
        offset            = date.getTimezoneOffset(),
        absOffsetHours    = Math.floor(Math.abs(offset / 60)),
        absOffsetMinutes  = Math.abs(offset) - (absOffsetHours * 60),
        timezoneoffset    = (offset > 0 ? "-" : "+") + this._pad(absOffsetHours, 2, '0') + this._pad(absOffsetMinutes, 2, '0');

    f = f.replace("%a", this._shortDayName(weekDay))
        .replace("%A",  this._dayName(weekDay))
        .replace("%B",  this._monthName(month - 1))
        .replace("%b",  this._shortMonthName(month - 1))
        .replace("%d",  this._pad(day, 2, '0'))
        .replace("%e",  this._pad(day, 2, ' '))
        .replace("%-do", day + this._ordinal(day))
        .replace("%-d", day)
        .replace("%H",  this._pad(hour, 2, '0'))
        .replace("%k",  this._pad(hour, 2, ' '))
        .replace('%-H', hour)
        .replace('%-k', hour)
        .replace("%I",  this._pad(hour12, 2, '0'))
        .replace("%l",  hour12)
        .replace("%m",  this._pad(month, 2, '0'))
        .replace("%-m", month)
        .replace("%M",  this._pad(mins, 2, '0'))
        .replace("%p",  meridiem.toUpperCase())
        .replace("%P",  meridiem)
        .replace("%S",  this._pad(secs, 2, '0'))
        .replace("%-S", secs)
        .replace('%L',  this._pad(mills, 3, '0'))
        .replace('%-L', mills)
        .replace("%w",  weekDay)
        .replace("%y",  this._pad(year % 100))
        .replace("%Y",  year)
        .replace("%z",  timezoneoffset)
        .replace("%:z", timezoneoffset.slice(0,3) + ':' + timezoneoffset.slice(3))
        .replace("%Z",  this._timezoneAbbr(date));

    return f;
  },
});

pie.i18n.prototype.t = pie.i18n.prototype.translate;
pie.i18n.prototype.l = pie.i18n.prototype.strftime;

pie.i18n.defaultTranslations = {
  app: {
    timeago: {
      now: "just now",
      minutes: {
        one: "%{count} minute ago",
        other: "%{count} minutes ago"
      },
      hours: {
        one: "%{count} hour ago",
        other: "%{count} hours ago"
      },
      days: {
        one: "%{count} day ago",
        other: "%{count} days ago"
      },
      weeks: {
        one: "%{count} week ago",
        other: "%{count} weeks ago"
      },
      months: {
        one: "%{count} month ago",
        other: "%{count} months ago"
      },
      years: {
        one: "%{count} year ago",
        other: "%{count} years ago"
      }
    },
    time: {
      formats: {
        isoDate: '%Y-%m-%d',
        isoTime: '%Y-%m-%dT%H:%M:%S.%L%:z',
        shortDate: '%m/%d/%Y',
        longDate: '%B %-do, %Y'
      },
      meridiems: {
        am: 'am',
        pm: 'pm'
      },
      ordinals: {
        o0: "th",
        o1: "st",
        o2: "nd",
        o3: "rd",
        o4: "th",
        o5: "th",
        o6: "th",
        o7: "th",
        o8: "th",
        o9: "th"
      },
      day_names: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      short_day_names: [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ],
      month_names: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      short_month_names: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
      ]
    },

    validations: {

      cc:       "does not look like a credit card number",
      chosen:   "must be chosen",
      cvv:      "is not a valid security code",
      date:     "is not a valid date",
      email:    "must be a valid email",
      format:   "is invalid",
      integer:  "must be an integer",
      length:   "length must be",
      number:   "must be a number",
      phone:    "is not a valid phone number",
      presence: "can't be blank",
      url:      "must be a valid url",

      range_messages: {
        eq:  "equal to %{count}",
        lt:  "less than %{count}",
        gt:  "greater than %{count}",
        lte: "less than or equal to %{count}",
        gte: "greater than or equal to %{count}"
      }
    }
  }
};
pie.list = pie.model.extend('list', {
  init: function(array, options) {
    array = array || [];
    this._super({items: array}, options);
  },


  _normalizedIndex: function(wanted) {
    wanted = parseInt(wanted, 10);
    if(!isNaN(wanted) && wanted < 0) wanted += this.data.items.length;
    return wanted;
  },


  _trackMutations: function(options, fn) {
    var oldLength = this.data.items.length,
    changes = [fn.call()],
    newLength = this.data.items.length;

    if(oldLength !== newLength) {
      changes.push({
        name: 'length',
        type: 'update',
        object: this.data.items,
        oldValue: oldLength,
        value: newLength
      });
    }

    this.changeRecords = this.changeRecords.concat(changes);

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },


  forEach: function(f) {
    return this.get('items').forEach(f);
  },


  get: function(key) {
    var idx = this._normalizedIndex(key), path;

    if(isNaN(idx)) path = key;
    else path = 'items.' + idx;

    return pie.model.prototype.get.call(this, path);
  },


  indexOf: function(value) {
    return this.get('items').indexOf(value);
  },


  insert: function(key, value, options) {
    var idx = this._normalizedIndex(key);

    return this._trackMutations(options, function(){
      var change = {
        name: String(idx),
        object: this.data.items,
        type: 'add',
        oldValue: this.data.items[idx],
        value: value
      };

      this.data.items.splice(idx, 0, value);

      return change;
    }.bind(this));
  },


  length: function() {
    return this.get('items.length');
  },


  push: function(value, options) {
    return this._trackMutations(options, function(){
      var change = {
        name: String(this.data.items.length),
        object: this.data.items,
        type: 'add',
        value: value,
        oldValue: undefined
      };

      this.data.items.push(value);

      return change;
    }.bind(this));
  },


  remove: function(key, options) {
    var idx = this._normalizedIndex(key);

    return this._trackMutations(options, function(){
      var change = {
        name: String(idx),
        object: this.data.items,
        type: 'delete',
        oldValue: this.data.items[idx],
        value: undefined
      };

      this.data.items.splice(idx, 1);

      return change;
    }.bind(this));
  },


  set: function(key, value, options) {
    var idx = this._normalizedIndex(key);

    if(isNaN(idx)) {
      return pie.model.prototype.set.call(this, key, value, options);
    }

    return this._trackMutations(options, function(){
      var change = {
        name: String(idx),
        object: this.data.items,
        type: 'update',
        oldValue: this.data.items[idx]
      };

      this.data.items[idx] = change.value = value;

      return change;
    }.bind(this));
  },


  shift: function(options) {
    return this._trackMutations(options, function(){
      var change = {
        name: '0',
        object: this.data.items,
        type: 'delete'
      };

      change.oldValue = this.data.items.shift();
      change.value = this.data.items[0];

      return change;
    }.bind(this));
  },


  unshift: function(value, options) {
    return this.insert(0, value, options);
  }
});
pie.navigator = pie.model.extend('navigator', {

  init: function(app) {
    this.app = app;
    this._super({});
  },

  go: function(path, params, replace) {
    var url = path;

    params = params || {};

    if(this.get('path') === path && this.get('query') === params) {
      return this;
    }

    if(Object.keys(params).length) {
      url += '?';
      url += pie.object.serialize(params);
    }

    window.history[replace ? 'replaceState' : 'pushState']({}, document.title, url);

    return this.setDataFromLocation();
  },


  start: function() {
    return this.setDataFromLocation();
  },

  setDataFromLocation: function() {
    var stringQuery = window.location.search.slice(1),
    query = pie.string.deserialize(stringQuery);

    this.sets({
      url: window.location.href,
      path: window.location.pathname,
      fullPath: pie.array.compact([window.location.pathname, stringQuery], true).join('?'),
      query: query
    });

    return this;
  }
});
// notifier is a class which provides an interface for rendering page-level notifications.
pie.notifier = pie.base.extend('notifier', {
  init: function(app, options) {
    this.options = options || {};
    this.app = this.options.app || window.app;
    this.notifications = new pie.list([]);
  },

  // remove all alerts, potentially filtering by the type of alert.
  clear: function(type) {
    if(type) {
      this.notifications.forEach(function(n) {
        this.remove(n.id);
      }.bind(this));
    } else {
      while(this.notifications.length()) {
        this.remove(this.notifications.get(0).id);
      }
    }
  },

  // Show a notification or notifications.
  // Messages can be a string or an array of messages.
  // You can choose to close a notification automatically by providing `true` as the third arg.
  // You can provide a number in milliseconds as the autoClose value as well.
  notify: function(messages, type, autoRemove) {
    type = type || 'message';
    autoRemove = this.getAutoRemoveTimeout(autoRemove);

    messages = pie.array.from(messages);

    messages = messages.map(function(msg) {
      msg = {
        id: pie.unique(),
        message: msg,
        type: type
      };

      this.notifications.push(msg);

      return msg;
    }.bind(this));

    if(autoRemove) {
      setTimeout(function(){
        messages.forEach(function(msg){
          this.remove(msg.id);
        }.bind(this));
      }.bind(this), autoRemove);
    }

  },

  getAutoRemoveTimeout: function(timeout) {
    if(timeout === undefined) timeout = true;
    if(timeout && !pie.object.isNumber(timeout)) timeout = 7000;
    return timeout;
  },

  remove: function(msgId) {
    var msgIdx = pie.array.indexOf(this.notifications.get('items'), function(m) {
      return m.id === msgId;
    });

    if(~msgIdx) {
      this.notifications.remove(msgIdx);
    }
  }
});
pie.resources = pie.base.extend('resources', {

  init: function(app, srcMap) {
    this.app = app;
    this.loaded = {};
    this.srcMap = srcMap || {};
  },

  _appendNode: function(node) {
    var target = document.querySelector('head');
    target = target || document.body;
    target.appendChild(node);
  },

  _inferredResourceType: function(src) {
    return (/(\.|\/)js(\?|$)/).test(src) ? 'script' : 'link';
  },

  _normalizeSrc: function(srcOrOptions) {
    var options = typeof srcOrOptions === 'string' ? {src: srcOrOptions} : pie.object.merge({}, srcOrOptions);
    return options;
  },

  _loadscript: function(options, resourceOnload) {

    var script = document.createElement('script');

    if(options.noAsync) script.async = false;

    if(!options.callbackName) {
      script.onload = resourceOnload;
    }

    this._appendNode(script);
    script.src = options.src;

  },

  _loadlink: function(options, resourceOnload) {
    var link = document.createElement('link');

    link.href = options.src;
    link.media = options.media || 'screen';
    link.rel = options.rel || 'stylesheet';
    link.type = options.type || 'text/css';

    this._appendNode(link);

    // need to record that we added this thing.
    // the resource may not actually be present yet.
    resourceOnload();
  },

  define: function(name, srcOrOptions) {
    var options = this._normalizeSrc(srcOrOptions);
    this.srcMap[name] = options;
  },

  load: function(srcOrOptions, cb) {
    var options = this._normalizeSrc(srcOrOptions), src;
    options = this.srcMap[options.src] || options;
    src = options.src;

    // we've already taken care of this.
    if(this.loaded[src] === true) {
      if(cb) cb();
      return true;
    }

    // we're already working on retrieving this src, just append our cb to the callbacks..
    if(this.loaded[src]) {
      this.loaded[src].push(cb);
    } else {
      this.loaded[src] = [cb];

      var type = options.type || this._inferredResourceType(options.src),
      resourceOnload = function() {

        this.loaded[src].forEach(function(fn) { if(fn) fn(); });
        this.loaded[src] = true;

        if(options.callbackName) delete window[options.callbackName];
      }.bind(this);

      if(options.callbackName) {
        window[options.callbackName] = resourceOnload;
      }


      this['_load' + type](options, resourceOnload);
    }

    return false;
  }
});
pie.router = pie.base.extend('router', {
  init: function(app) {
    this.app = app;
    this.routes = {};
    this.namedRoutes = {};
  },

  // get a url based on the current one but with the changes provided.
  // this will even catch interpolated values.
  // Given a named route: /things/page/:page.json
  // And the current path == /things/page/1.json?q=test
  // app.router.changedUrl({page: 3, q: 'newQuery'});
  // # => /things/page/3.json?q=newQuery
  changedUrl: function(changes) {
    var current = this.app.parsedUrl;
    return this.path(current.name || current.path, pie.object.merge({}, current.interpolations, current.query, changes));
  },


  // normalize a path to be evaluated by the router
  normalizePath: function(path) {

    // ensure there's a leading slash
    if(!path.match(/\w+:\/\//) && path.charAt(0) !== '/') {
      path = '/' + path;
    }

    if(path.indexOf('?') > 0) {
      var split = path.split('?');
      path = this.normalizePath(split.shift());
      split.unshift(path);
      path = split.join('?');
    }

    // remove trailing hashtags
    if(path.charAt(path.length - 1) === '#') {
      path = path.substr(0, path.length - 1);
    }

    // remove trailing slashes
    if(path.length > 1 && path.charAt(path.length - 1) === '/') {
      path = path.substr(0, path.length - 1);
    }

    return path;
  },


  // invoke to add routes to the routers routeset.
  // routes objects which contain a "name" key will be added as a name lookup.
  // you can pass a set of defaults which will be extended into each route object.
  route: function(routes, defaults){
    defaults = defaults || {};

    // remove the cache
    delete this._routeKeys;

    pie.object.forEach(routes, function(k,r) {

      if(pie.object.isObject(r)) {

        k = this.normalizePath(k);

        this.routes[k] = pie.object.merge({}, defaults, r);

        if(r.hasOwnProperty('name')) {
          this.namedRoutes[r.name] = k;
        }
      } else {
        this.namedRoutes[k] = r;
      }
    }.bind(this));
  },

  // will return the named path. if there is no path with that name it will return itself.
  // you can optionally pass a data hash and it will build the path with query params or
  // with path interpolation path("/foo/bar/:id", {id: '44', q: 'search'}) => "/foo/bar/44?q=search"
  path: function(nameOrPath, data, interpolateOnly) {
    var o = this.namedRoutes[nameOrPath],
    s = pie.object.isString(o) ? o : nameOrPath,
    usedKeys = [],
    params,
    unusedData;

    data = data || {};
    s = this.normalizePath(s);

    s = s.replace(/\:([a-zA-Z0-9_]+)/g, function(match, key){
      usedKeys.push(key);
      if(data[key] === undefined || data[key] === null || data[key].toString().length === 0) {
        throw new Error("[PIE] missing route interpolation: " + match);
      }
      return data[key];
    });

    unusedData = pie.object.except(data, usedKeys);
    params = pie.object.serialize(pie.object.compact(unusedData, true));

    if(!interpolateOnly && params.length) {
      s = pie.string.urlConcat(s, params);
    }

    return s;

  },

  // provides the keys of the routes in a sorted order relevant for matching most descriptive to least
  routeKeys: function() {
    if(this._routeKeys) return this._routeKeys;
    this._routeKeys = Object.keys(this.routes);

    var ac, bc, c, d = [];

    // sorts the route keys to be the most exact to the most generic
    this._routeKeys.sort(function(a,b) {
      ac = (a.match(/:/g) || d).length;
      bc = (b.match(/:/g) || d).length;
      c = ac - bc;
      c = c || (b.length - a.length);
      c = c || (ac < bc ? 1 : (ac > bc ? -1 : 0));
      return c;
    });

    return this._routeKeys;
  },

  // look at the path and determine the route which this matches.
  parseUrl: function(path, parseQuery) {

    var keys = this.routeKeys(),
      i = 0,
      j, key, match, splitUrl, splitKey, query,
      interpolations, fullPath, pieces;

    pieces = path.split('?');

    path = pieces.shift();
    path = this.normalizePath(path);

    query = pieces.join('&') || '';

    // a trailing slash will bork stuff
    if (path.length > 1 && path[path.length - 1] === '/') path = path.slice(0, -1);

    // is there an explicit route for this path? it wins if so
    match = this.routes[path];
    interpolations = {};
    splitUrl = path.split('/');

    if(match) {
      match = pie.object.merge({routeKey: path}, match);
    } else {
      while (i < keys.length && !match) {
        key = keys[i];

        if(!pie.object.isObject(this.routes[key])) {
          i++;
          continue;
        }

        this.routes[key].regex = this.routes[key].regex || new RegExp('^' + key.replace(/(:[^\/]+)/g,'([^\\/]+)') + '$');

        if (this.routes[key].regex.test(path)) {
          match = pie.object.merge({routeKey: key}, this.routes[key]);
          splitKey = key.split('/');
          for(j = 0; j < splitKey.length; j++){
            if(/^:/.test(splitKey[j])) {
              interpolations[splitKey[j].replace(/^:/, '')] = splitUrl[j];
              match[splitKey[j]] = splitUrl[j];
            }
          }
        }
        i++;
      }
    }

    query = pie.string.deserialize(query, parseQuery);

    // if we are expected to parse the values of the query, lets do it for the interpolations as well.
    if(parseQuery) interpolations = pie.string.deserialize(pie.object.serialize(interpolations), parseQuery);

    fullPath = pie.array.compact([path, pie.object.serialize(query)], true).join('?');

    return pie.object.merge({
      interpolations: interpolations,
      query: query,
      data: pie.object.merge({}, interpolations, query),
      path: path,
      fullPath: fullPath
    }, match);
  }
});
pie.validator = pie.base.extend('validator', {

  init: function(app) {
    this.app = app || window.app;
    this.i18n = app.i18n;
  },


  errorMessage: function(validationType, validationOptions) {
    if(validationOptions.message) return validationOptions.message;

    var base = this.i18n.t('app.validations.' + validationType),
    rangeOptions = new pie.validator.rangeOptions(this.app, validationOptions),
    range = rangeOptions.message();

    if(!range && validationType === 'length') {
      rangeOptions = new pie.validator.rangeOptions(this.app, {gt: 0});
      range = rangeOptions.message();
    }

    return (base + ' ' + range).trim();
  },


  withStandardChecks: function(value, options, f){
    options = options || {};

    if(options.allowBlank && !this.presence(value))
      return true;
    else if(options.unless && options.unless.call())
      return true;
    else if(options['if'] && !options['if'].call())
      return true;
    else
      return f.call();
  },


  cc: function(value, options){
    return this.withStandardChecks(value, options, function(){

      // don't get rid of letters because we don't want a mix of letters and numbers passing through
      var sanitized = String(value).replace(/[^a-zA-Z0-9]/g, '');
      return this.number(sanitized) &&
             this.length(sanitized, {gte: 15, lte: 16});
    }.bind(this));
  },


  chosen: function(value, options){
    return this.presence(value, options);
  },


  cvv: function(value, options) {
    return this.withStandardChecks(value, options, function() {
      return this.number(value) &&
              this.length(value, {gte: 3, lte: 4});
    }.bind(this));
  },


  // a date should be in the ISO format yyyy-mm-dd
  date: function(value, options) {
    options = options || {};
    return this.withStandardChecks(value, options, function() {
      var split = value.split('-'), y = split[0], m = split[1], d = split[2], iso;

      if(!y || !m || !d) return false;
      if(!this.length(y, {eq: 4}) && this.length(m, {eq: 2}) && this.length(d, {eq: 2})) return false;

      if(!options.sanitized) {
        Object.keys(options).forEach(function(k){
          iso = options[k];
          iso = this.app.i18n.l(iso, 'isoDate');
          options[k] = iso;
        });
        options.sanitized = true;
      }

      var ro = new pie.validator.rangeOptions(this.app, options);
      return ro.matches(value);

    }.bind(this));
  },


  email: function email(value, options) {
    options = pie.object.merge({allowBlank: false}, options || {});
    return this.withStandardChecks(value, options, function(){
      return (/^.+@.+\..+$/).test(value);
    });
  },


  fn: function(value, options, cb) {
    return this.withStandardChecks(value, options, function(){
      return options.fn.call(null, value, options, cb);
    });
  },


  format: function(value, options) {
    options = options || {};
    return this.withStandardChecks(value, options, function() {
      var fmt = options.format || options['with'];

      if(fmt === 'isoDate'){
        fmt = /^\d{4}\-\d{2}\-\d{2}$/;
      } else if(fmt === 'epochs'){
        fmt = /^\d{10}$/;
      } else if(fmt === 'epochms'){
        fmt = /^\d{13}$/;
      }

      return !!fmt.test(String(value));
    });
  },


  // must be an integer (2.0 is ok) (good for quantities)
  integer: function(value, options){
    return  this.withStandardChecks(value, options, function(){
      return  this.number(value, options) &&
              parseInt(value, 10) === parseFloat(value, 10);
    }.bind(this));
  },


  // min/max length of the field
  length: function length(value, options){
    options = pie.object.merge({allowBlank: false}, options);

    if(!('gt'  in options)  &&
       !('gte' in options)  &&
       !('lt'  in options)  &&
       !('lte' in options)  &&
       !('eq'  in options) ){
      options.gt = 0;
    }

    return this.withStandardChecks(value, options, function(){
      var length = String(value).trim().length;
      return this.number(length, options);
    }.bind(this));
  },


  // must be some kind of number (good for money input)
  number: function number(value, options){
    options = options || {};

    return this.withStandardChecks(value, options, function(){

      // not using parseFloat because it accepts multiple decimals
      if(!/^([\-])?([\d]+)?\.?[\d]+$/.test(String(value))) return false;

      var number = parseFloat(value),
      ro = new pie.validator.rangeOptions(this.app, options);

      return ro.matches(number);
    });
  },


  // clean out all things that are not numbers and + and get a minimum of 10 digits.
  phone: function phone(value, options) {
    options = pie.object.merge({allowBlank: false}, options || {});

    return this.withStandardChecks(value, options, function(){
      var clean = String(value).replace(/[^\+\d]+/g, '');
      return this.length(clean, {gte: 10});
    }.bind(this));
  },


  // does the value have any non-whitespace characters
  presence: function presence(value, options){
    return this.withStandardChecks(value, pie.object.merge({}, options, {allowBlank: false}), function(){
      return !!(value && (/[^ ]/).test(String(value)));
    });
  },


  url: function(value, options) {
    return this.withStandardChecks(value, options, function() {
      return (/^.+\..+$/).test(value);
    });
  }
});



// small utility class to handle range options.
pie.validator.rangeOptions = pie.base.extend('rangeOptions', {

  init: function(app, hash) {
    this.i18n = app.i18n;
    this.rangedata = hash || {};
    // for double casting new RangeOptions(new RangeOptions({}));
    if(this.rangedata.rangedata) this.rangedata = this.rangedata.rangedata ;
  },

  get: function(key) {
    return pie.func.valueFrom(this.rangedata[key]);
  },

  has: function(key) {
    return !!(key in this.rangedata);
  },

  t: function(key, options) {
    return this.i18n.t('app.validations.range_messages.' + key, options);
  },

  matches: function(value) {
    var valid = true;
    valid = valid && (!this.has('gt') || value > this.get('gt'));
    valid = valid && (!this.has('lt') || value < this.get('lt'));
    valid = valid && (!this.has('gte') || value >= this.get('gte'));
    valid = valid && (!this.has('lte') || value <= this.get('lte'));
    valid = valid && (!this.has('eq') || value === this.get('eq'));
    return valid;
  },

  message: function() {
    if(this.has('eq')) {
      return this.t('eq', {count: this.get('eq')});
    } else {
      var s = ["", ""];

      if(this.has('gt')) s[0] += this.t('gt', {count: this.get('gt')});
      else if(this.has('gte')) s[0] += this.t('gte', {count: this.get('gte')});

      if(this.has('lt')) s[1] += this.t('lt', {count: this.get('lt')});
      else if(this.has('lte')) s[1] += this.t('lte', {count: this.get('lte')});

      return pie.array.toSentence(pie.array.compact(s, true), this.i18n).trim();
    }
  },
});
!function(e){"undefined"!=typeof exports?e(exports):(window.hljs=e({}),"function"==typeof define&&define.amd&&define([],function(){return window.hljs}))}(function(e){function n(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(e){return e.nodeName.toLowerCase()}function r(e,n){var t=e&&e.exec(n);return t&&0==t.index}function a(e){var n=(e.className+" "+(e.parentNode?e.parentNode.className:"")).split(/\s+/);return n=n.map(function(e){return e.replace(/^lang(uage)?-/,"")}),n.filter(function(e){return N(e)||/no(-?)highlight/.test(e)})[0]}function o(e,n){var t={};for(var r in e)t[r]=e[r];if(n)for(var r in n)t[r]=n[r];return t}function i(e){var n=[];return function r(e,a){for(var o=e.firstChild;o;o=o.nextSibling)3==o.nodeType?a+=o.nodeValue.length:1==o.nodeType&&(n.push({event:"start",offset:a,node:o}),a=r(o,a),t(o).match(/br|hr|img|input/)||n.push({event:"stop",offset:a,node:o}));return a}(e,0),n}function c(e,r,a){function o(){return e.length&&r.length?e[0].offset!=r[0].offset?e[0].offset<r[0].offset?e:r:"start"==r[0].event?e:r:e.length?e:r}function i(e){function r(e){return" "+e.nodeName+'="'+n(e.value)+'"'}l+="<"+t(e)+Array.prototype.map.call(e.attributes,r).join("")+">"}function c(e){l+="</"+t(e)+">"}function u(e){("start"==e.event?i:c)(e.node)}for(var s=0,l="",f=[];e.length||r.length;){var g=o();if(l+=n(a.substr(s,g[0].offset-s)),s=g[0].offset,g==e){f.reverse().forEach(c);do u(g.splice(0,1)[0]),g=o();while(g==e&&g.length&&g[0].offset==s);f.reverse().forEach(i)}else"start"==g[0].event?f.push(g[0].node):f.pop(),u(g.splice(0,1)[0])}return l+n(a.substr(s))}function u(e){function n(e){return e&&e.source||e}function t(t,r){return RegExp(n(t),"m"+(e.cI?"i":"")+(r?"g":""))}function r(a,i){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var c={},u=function(n,t){e.cI&&(t=t.toLowerCase()),t.split(" ").forEach(function(e){var t=e.split("|");c[t[0]]=[n,t[1]?Number(t[1]):1]})};"string"==typeof a.k?u("keyword",a.k):Object.keys(a.k).forEach(function(e){u(e,a.k[e])}),a.k=c}a.lR=t(a.l||/\b[A-Za-z0-9_]+\b/,!0),i&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=t(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=t(a.e)),a.tE=n(a.e)||"",a.eW&&i.tE&&(a.tE+=(a.e?"|":"")+i.tE)),a.i&&(a.iR=t(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var s=[];a.c.forEach(function(e){e.v?e.v.forEach(function(n){s.push(o(e,n))}):s.push("self"==e?a:e)}),a.c=s,a.c.forEach(function(e){r(e,a)}),a.starts&&r(a.starts,i);var l=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(n).filter(Boolean);a.t=l.length?t(l.join("|"),!0):{exec:function(){return null}}}}r(e)}function s(e,t,a,o){function i(e,n){for(var t=0;t<n.c.length;t++)if(r(n.c[t].bR,e))return n.c[t]}function c(e,n){return r(e.eR,n)?e:e.eW?c(e.parent,n):void 0}function f(e,n){return!a&&r(n.iR,e)}function g(e,n){var t=x.cI?n[0].toLowerCase():n[0];return e.k.hasOwnProperty(t)&&e.k[t]}function p(e,n,t,r){var a=r?"":E.classPrefix,o='<span class="'+a,i=t?"":"</span>";return o+=e+'">',o+n+i}function d(){if(!w.k)return n(y);var e="",t=0;w.lR.lastIndex=0;for(var r=w.lR.exec(y);r;){e+=n(y.substr(t,r.index-t));var a=g(w,r);a?(B+=a[1],e+=p(a[0],n(r[0]))):e+=n(r[0]),t=w.lR.lastIndex,r=w.lR.exec(y)}return e+n(y.substr(t))}function h(){if(w.sL&&!R[w.sL])return n(y);var e=w.sL?s(w.sL,y,!0,L[w.sL]):l(y);return w.r>0&&(B+=e.r),"continuous"==w.subLanguageMode&&(L[w.sL]=e.top),p(e.language,e.value,!1,!0)}function v(){return void 0!==w.sL?h():d()}function b(e,t){var r=e.cN?p(e.cN,"",!0):"";e.rB?(M+=r,y=""):e.eB?(M+=n(t)+r,y=""):(M+=r,y=t),w=Object.create(e,{parent:{value:w}})}function m(e,t){if(y+=e,void 0===t)return M+=v(),0;var r=i(t,w);if(r)return M+=v(),b(r,t),r.rB?0:t.length;var a=c(w,t);if(a){var o=w;o.rE||o.eE||(y+=t),M+=v();do w.cN&&(M+="</span>"),B+=w.r,w=w.parent;while(w!=a.parent);return o.eE&&(M+=n(t)),y="",a.starts&&b(a.starts,""),o.rE?0:t.length}if(f(t,w))throw new Error('Illegal lexeme "'+t+'" for mode "'+(w.cN||"<unnamed>")+'"');return y+=t,t.length||1}var x=N(e);if(!x)throw new Error('Unknown language: "'+e+'"');u(x);for(var w=o||x,L={},M="",k=w;k!=x;k=k.parent)k.cN&&(M=p(k.cN,"",!0)+M);var y="",B=0;try{for(var C,j,I=0;;){if(w.t.lastIndex=I,C=w.t.exec(t),!C)break;j=m(t.substr(I,C.index-I),C[0]),I=C.index+j}m(t.substr(I));for(var k=w;k.parent;k=k.parent)k.cN&&(M+="</span>");return{r:B,value:M,language:e,top:w}}catch(A){if(-1!=A.message.indexOf("Illegal"))return{r:0,value:n(t)};throw A}}function l(e,t){t=t||E.languages||Object.keys(R);var r={r:0,value:n(e)},a=r;return t.forEach(function(n){if(N(n)){var t=s(n,e,!1);t.language=n,t.r>a.r&&(a=t),t.r>r.r&&(a=r,r=t)}}),a.language&&(r.second_best=a),r}function f(e){return E.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,n){return n.replace(/\t/g,E.tabReplace)})),E.useBR&&(e=e.replace(/\n/g,"<br>")),e}function g(e,n,t){var r=n?x[n]:t,a=[e.trim()];return e.match(/(\s|^)hljs(\s|$)/)||a.push("hljs"),r&&a.push(r),a.join(" ").trim()}function p(e){var n=a(e);if(!/no(-?)highlight/.test(n)){var t;E.useBR?(t=document.createElementNS("http://www.w3.org/1999/xhtml","div"),t.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):t=e;var r=t.textContent,o=n?s(n,r,!0):l(r),u=i(t);if(u.length){var p=document.createElementNS("http://www.w3.org/1999/xhtml","div");p.innerHTML=o.value,o.value=c(u,i(p),r)}o.value=f(o.value),e.innerHTML=o.value,e.className=g(e.className,n,o.language),e.result={language:o.language,re:o.r},o.second_best&&(e.second_best={language:o.second_best.language,re:o.second_best.r})}}function d(e){E=o(E,e)}function h(){if(!h.called){h.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,p)}}function v(){addEventListener("DOMContentLoaded",h,!1),addEventListener("load",h,!1)}function b(n,t){var r=R[n]=t(e);r.aliases&&r.aliases.forEach(function(e){x[e]=n})}function m(){return Object.keys(R)}function N(e){return R[e]||R[x[e]]}var E={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},R={},x={};return e.highlight=s,e.highlightAuto=l,e.fixMarkup=f,e.highlightBlock=p,e.configure=d,e.initHighlighting=h,e.initHighlightingOnLoad=v,e.registerLanguage=b,e.listLanguages=m,e.getLanguage=N,e.inherit=o,e.IR="[a-zA-Z][a-zA-Z0-9_]*",e.UIR="[a-zA-Z_][a-zA-Z0-9_]*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/},e.CLCM={cN:"comment",b:"//",e:"$",c:[e.PWM]},e.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[e.PWM]},e.HCM={cN:"comment",b:"#",e:"$",c:[e.PWM]},e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e});hljs.registerLanguage("json",function(e){var t={literal:"true false null"},i=[e.QSM,e.CNM],l={cN:"value",e:",",eW:!0,eE:!0,c:i,k:t},c={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:l}],i:"\\S"},n={b:"\\[",e:"\\]",c:[e.inherit(l,{cN:null})],i:"\\S"};return i.splice(i.length,0,c,n),{c:i,k:t,i:"\\S"}});hljs.registerLanguage("javascript",function(r){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},c:[{cN:"pi",r:10,v:[{b:/^\s*('|")use strict('|")/},{b:/^\s*('|")use asm('|")/}]},r.ASM,r.QSM,r.CLCM,r.CBCM,r.CNM,{b:"("+r.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[r.CLCM,r.CBCM,r.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[r.inherit(r.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[r.CLCM,r.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+r.IR,r:0}]}});
/* global hljs */

(function() {
  'use strict';

  var proto = Object.create(HTMLElement.prototype);

  proto.createdCallback = function() {
    // prefetch as much as possible.
    app.resources.load('/css/highlight.css');
    app.resources.load('/js/highlight.js');
  };

  proto.contentCallback = function(data) {
    var filename = this.getAttribute('filename') || Object.keys(data.files)[0],
    file = data.files[filename],
    content = pie.string.escape(file.content);

    var lines = content.split("\n");

    // remove empty lines from the beginning
    while(lines.length && !lines[0].trim().length) lines.shift();

    // and from the end
    while(lines.length && !lines[lines.length - 1].trim().length) lines.pop();

    // then remove the block of whitespace from the left.
    if(lines.length) {
      var toStrip = lines[0].match(/^(\s+)/);

      if(toStrip && toStrip.length) {
        toStrip = toStrip[0];
        var regex = new RegExp("^[\\s]{" + toStrip.length + "}");
        lines = lines.map(function(l){ return l.replace(regex, ""); });
      }
    }

    app.resources.load('/css/highlight.css', function() {
      app.resources.load('/js/highlight.js', function(){

        this.innerHTML = "<code><pre>" + lines.join("\n") + "</pre></code>";

        hljs.configure({useBr: true, language: file.language || ['javascript', 'json']});
        hljs.highlightBlock(this.querySelector('pre'));

      }.bind(this));
    }.bind(this));
  };

  proto.attachedCallback = function() {
    var gistId = this.getAttribute('gist'),
    path = 'https://api.github.com/gists/' + gistId;

    this.classList.add('gist-loading');

    app.ajax.get({
      url: path,
      dataSuccess: this.contentCallback.bind(this),
      success: function(){
        this.classList.remove('gist-loading');
      }.bind(this)
    });

  };

  // register element as x-gist
  window.GistElement = document.registerElement('x-gist', {
    prototype: proto
  });
})();
/* global lib */

pie.ns('lib.views');


lib.views.nav = pie.view.extend('nav', function() {
  this._super({
    el: document.querySelector('.page-nav')
  });
});

lib.views.nav.reopen({

  setup: function() {
    this.onChange(app.navigator, this.navigationChanged.bind(this), 'path');
    this.on('click', '.nav-toggle', this.toggleNav.bind(this));
    this._super();
  },

  navigationChanged: function() {
    var path = app.navigator.get('path'),
    target = this.qs('ul li a[href="' + path + '"]');

    pie.dom.all(this.qsa('li.is-active'), 'classList.remove', 'is-active');

    if(target) target.parentNode.classList.add('is-active');
    this.el.classList.remove('nav-active');
  },

  toggleNav: function() {
    this.el.classList.toggle('nav-active');
  }

});



lib.views.page = pie.activeView.extend('page', function() {
  this._super();
});

lib.views.page.reopen({

  setup: function(){
    this._super();
    this.retrieveTemplateAndRender();
  },

  navigationUpdated: function() {
    this.retrieveTemplateAndRender();
  },

  pageName: function() {
    return app.parsedUrl.data.page || 'getting-started';
  },

  retrieveTemplateAndRender: function() {
    var name = this.pageName(),
    tmpl = app._templates[name];

    if(tmpl) {
      this.render();
      return;
    }

    app.ajax.get({
      url: app.router.path('/pages/:page.html', {page: name}),
      verb: app.ajax.GET,
      type: 'html',
      dataSuccess: function(html) {
        app._templates[name] = pie.string.template(html);
        this.render();
      }.bind(this)
    });
  },

  templateName: function() {
    return this.pageName();
  }

});

window.app = new pie.app({ uiTarget: '.page' });

// get a "nav" view in there. this is "outside" of the normal routed application since it's always present.
// alternatively, we could create a "layout" view to manage this and the current subview.
app.emitter.once('beforeStart', function() {
  var nav = new lib.views.nav();
  app.addChild('nav', nav);
});


// set up our page routes.


app.router.route({
  '/' : {view: 'page'},
  '/:page' : {view: 'page', name: 'page'}
});


app.i18n.load({
  project: 'pie.js',
  gist: '994b656c26b16d5c2c77'
});
