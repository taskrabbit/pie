// # Pie DOM Utilities
// A series of helpful methods for working with DOM elements.

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
      e = pie.fn.valueFrom(f);
    }
    if(assign) v = e[meth] = args[0];
    else {
      f = e[meth];
      v = pie.fn.valueFrom(f, e, args);
    }

    if(returnValues) r.push(v);
  });

  return returnValues ? r : undefined;
};

// **pie.dom.all**
//
// Invokes the provided method or method chain with the provided arguments to all elements in the nodeList.
// `nodeList` can either be a node, nodeList, or an array of nodes.
// `methodName` can be a string representing a method name, an attribute, or a property. Can be chained with periods. Can end in a `=` to invoke an assignment.
// ```
// pie.dom.all(nodeList, 'setAttribute', 'foo', 'bar');
// pie.dom.all(nodeList, 'classList.add', 'active');
// pie.dom.all(nodeList, 'clicked=', true);
// ```
pie.dom.all = function(/* nodeList, methodName[, arg1, arg2, ...] */) {
  return pie.dom._all(arguments, false);
};

// **pie.dom.closest**
//
// Retrieve the closest ancestor of `el` which matches the provided `sel`.
// ```
// var form = pie.dom.closest(input, 'form');
// form.submit();
// ```
pie.dom.closest = function(el, sel) {
  while((el = el.parentNode) && !pie.dom.isDocument(el)) {
    if(pie.dom.matches(el, sel)) return el;
  }
};

// **pie.dom.createElement**
//
// Create an element based on the string content provided.
// ```
// var el = pie.dom.createElement('<div class="foo"><strong>Hi</strong>, John</div>')
// el.innerHTML
// //=> "<strong>Hi</strong>, John"
// el.classList
// //=> ['foo']
// ```
pie.dom.createElement = function(str) {
  var wrap = document.createElement('div');
  wrap.innerHTML = str;
  return wrap.removeChild(wrap.firstElementChild);
};

// **pie.dom.cache**
//
// A cache created solely for caching element specific information,
// easier for cleanup via `pie.dom.remove()`.
pie.dom.cache = function() {
  pie.elementCache = pie.elementCache || new pie.cache();
  return pie.elementCache;
};

// **pie.dom.getAll**
//
// Has the same method signature of `pie.dom.all` but returns the values of the result
// ```
// pie.dom.getAll(nodeList, 'clicked')
// //=> [true, true, false]
// ```
pie.dom.getAll = function() {
  return pie.dom._all(arguments, true);
};

// **pie.dom.isDocument**
//
// Determine whether the `el` is a document node.
pie.dom.isDocument = function(el) {
  return el && el.nodeType === el.DOCUMENT_NODE;
};

// **pie.dom.isWindow**
//
// Determine whether the provided `el` is the `window`.
pie.dom.isWindow = function(el) {
  return el === window;
};

// **pie.dom.matches**
//
// Test whether an element matches a given selector.
// ```
// pie.dom.matches(form, 'input');
// //=> false
// pie.dom.matches(form, 'form');
// //=> true
// ```
pie.dom.matches = function(el, sel) {
  var fn = pie.dom.prefixed(el, 'matches');
  if(fn) return fn(sel);

  fn = pie.dom.prefixed(el, 'matchesSelector');
  if(fn) return fn(sel);

  var parent = el.parentNode || el.document;
  if(!parent || !parent.querySelector) return false;

  pie.setUid(el);
  el.setAttribute('data-pie-id', el.pieId);

  sel += '[data-pie-id="' + el.pieId + '"]';
  return parent.querySelector(sel) === el;
};

// **pie.dom.off**
//
// Remove an observer from an element. The more information provided the more tests will be run to determine
// whether the observer is a match. Support of namespaces are the same as `pie.dom.on`, however, in the case
// of `off`, `"*"` can be provided to remove all events within a namespace.
// ```
// pie.dom.off(document.body, 'click');
// pie.dom.off(document.body', 'click.fooNs');
// pie.dom.off(document.body', '*.fooNs');
// ```

pie.dom.off = function(el, event, fn, selector, cap) {
  var eventSplit = event.split('.'),
    namespace, all, events, compactNeeded;

  pie.setUid(el);
  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  all = event === '*';

  events = pie.dom.cache().getOrSet('element-' + el.pieId + '.dom-events', {});

  (all ? Object.keys(events) : [event]).forEach(function(k) {
    compactNeeded = false;

    pie.array.from(events[k]).forEach(function(obj, i, ary) {
      if(cap == null && (k === 'focus' || k === 'blur') && obj.sel) cap = true;
      if((namespace == null || namespace === obj.ns) &&
          (fn == null || fn === obj.fn) &&
          (selector == null || selector === obj.sel) &&
          (cap === obj.cap)) {
        el.removeEventListener(k, obj.cb, obj.cap);
        delete ary[i];
        compactNeeded = true;
      }
    });

    if(compactNeeded) events[k] = pie.array.compact(events[k]);

  });
};

// **pie.dom.on**
//
// Observe an event on a particular `el`.
// ```
// var handler = function(e){
//   var btn = e.delegateTarget;
//   btn.classList.toggle('is-loading');
// }
// pie.dom.on(pie.qs('.btn'), 'click', handler);
// // => all events on the first .btn will be observed.
// ```
// Optionally, the event can be filtered by a `selector`.
// If a selector is provided, a `delegateTarget` which represents the
// matching target as defined by `selector` will be placed
// on the event. The event is then provided to `fn`.
//
// ```
// pie.dom.on(document.body, 'click', handler, '.btn');
// //=> all events that bubble to document.body and pass through or
// //=> originate from a .btn, will be observed.
// ```
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
    var targ, els, qel;

    if(namespace) {
      e.namespace = namespace;
    }

    if(!selector) {
      fn.call(el, e);
    } else {
      // if the target matches the selector, it is the delegateTarget.
      targ = pie.dom.matches(e.target, selector) ? e.target : null;

      // othwerwise, try to find a parent that is a child of el which matches the selector.
      if(!targ) {
        qel = pie.dom.closest(e.target, selector);
        if(qel && el.contains(qel)) targ = qel;
      }

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

pie.dom.parseForm = function() {
  var args = pie.array.from(arguments),
  form = args.shift(),
  names = pie.array.flatten(args),
  inputs = form.querySelectorAll('input[name], select[name], textarea[name]'),
  o = {},
  origLength;

  inputs = pie.array.groupBy(inputs, 'name');

  pie.object.forEach(inputs, function(name,fields) {
    if(names.length && names.indexOf(name) < 0) return;

    origLength = fields.length;

    if(fields[0].type === 'radio') {
      origLength = 1;
      fields = fields.filter(function(f){ return f.checked; });
    } else {
      fields = fields.filter(function(f){ return f.type === 'checkbox' ? f.checked : true; });
    }


    if(origLength > 1) o[name] = pie.array.map(fields, 'value');
    else o[name] = fields[0] && fields[0].value;
  });

  return o;
};

pie.dom.prependChild = function(el, child) {
  el.insertBefore(child, el.firstChild);
};

pie.dom.remove = function(el) {
  pie.setUid(el);
  pie.dom.cache().del('element-' + el.pieId);
  if(el.parentNode) el.parentNode.removeChild(el);
};

pie.dom.trigger = function(el, e, forceEvent) {

  if(!forceEvent && e === 'click') return el.click();

  var event = document.createEvent('Event');
  event.initEvent(e, true, true);
  return el.dispatchEvent(event);
};

pie.dom.prefixed = (function(){
  var prefixes = ['', 'webkit', 'moz', 'ms', 'o'];

  return function(el, standardName) {
    var prefix, i = 0,
    capd = pie.string.capitalize(standardName);

    for(; i < prefixes.length; i++) {
      prefix = prefixes[i];

      if(el[prefix + standardName]) return el[prefix + standardName].bind(el);
      if(el[prefix + capd]) return el[prefix + capd].bind(el);
    }
  };
})();
