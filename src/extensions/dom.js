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


(function(){
  var mod = function(method, originalArgs) {
    var args = pie.array.from(originalArgs);
    var el = args.shift();
    var classes = pie.array.flatten(args).join(' ').split(/[\s,]+/);
    classes = pie.array.map(classes, 'trim', true);
    classes = pie.array.compact(classes, true);
    classes.forEach(function(c){ el.classList[method](c); });
  };

  pie.dom.addClass = function(/* el, class1, class2 */) {
    mod('add', arguments);
  };

  pie.dom.removeClass = function(/* el, class1, class2 */) {
    mod('remove', arguments);
  };
})();


pie.dom.attrs = function(el, setters, prefix) {
  prefix = prefix || '';

  if(setters) {
    pie.object.forEach(setters, function(k,v) {
      if(v == null) {
        el.removeAttribute(prefix + k);
      } else {
        el.setAttribute(prefix + k);
      }
    });
  }

  var out = {};

  pie.object.forEach(el.attributes, function(k,v) {
    if(!prefix || k.indexOf(prefix) === 0) {
      out[k.substr(prefix.length)] = v;
    }
  });

  return out;
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
  pie.elementCache = pie.elementCache || pie.cache.create();
  return pie.elementCache;
};

pie.dom.data = function(el, setters) {
  return pie.dom.attrs(el, setters, 'data-');

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
  if(pie.object.isDom(sel)) return el === sel;

  var fn = pie.dom.prefixed(el, 'matches');
  if(fn) return fn(sel);

  fn = pie.dom.prefixed(el, 'matchesSelector');
  if(fn) return fn(sel);

  var parent = el.parentNode || el.document;
  if(!parent || !parent.querySelector) return false;

  pie.uid(el);
  el.setAttribute('data-pie-id', pie.uid(el));

  sel += '[data-pie-id="' + pie.uid(el) + '"]';
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

  pie.uid(el);
  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  all = event === '*';

  events = pie.dom.cache().getOrSet('element-' + pie.uid(el) + '.dom-events', {});

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
  pie.uid(el);

  // we force capture so that delegation works.
  if(!capture && (event === 'focus' || event === 'blur') && selector) capture = true;

  events = pie.dom.cache().getOrSet('element-' + pie.uid(el)  + '.dom-events', {});
  events[event] = events[event] || [];

  cb = function(e) {
    var targ, qel;

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

// **pie.dom.parseForm**
//
// Given a form element `el` parse the names & values from it.
// Optionally, the fields to parse can be filtered by providing a list of names.
//
// Given the markup:
// ```
// <form>
//   <input name="fullName" />
//   <input name="email" />
//   <select name="interest">...</select>
// </form>
// ```
// We can retrieve the fields using `parseForm`.
// ```
// pie.dom.parseForm(form)
// //=> {fullName: 'foo', email: 'foo@bar.com', interest: 'user'}
// pie.dom.parseForm(form, 'fullName')
// //=> {fullName: 'foo'}
// ```
pie.dom.parseForm = function(/* el, *fields */) {
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

// **pie.dom.prependChild**
//
// Insert a child at the top of the parent.
// ```
// // el = <div><p>Things</p></div>
// // child = <h3>Title</h3>
// pie.dom.prependChild(el, child)
// // el = <div><h3>Title</h3><p>Things</p></div>
// ```
pie.dom.prependChild = function(el, child) {
  el.insertBefore(child, el.firstChild);
};

// **pie.dom.remove**
//
// Remove `el` from the dom, clearing any cache we've constructed.
// If you intend on adding the element back into the dom you should
// remove `el` manually, not via `pie.dom.remove`.
//
// ```
// pie.dom.remove(el)
// // => el.parentNode == null;
// ```
pie.dom.remove = function(el) {
  pie.uid(el);
  pie.dom.cache().set('element-' + pie.uid(el), undefined);
  if(el.parentNode) el.parentNode.removeChild(el);
};

// **pie.dom.scrollParents**
//
// Find all the parent elements of `el` that have a scroll property.
// Useful for spying on scroll and determing element position.
// Optionally, you can provide the following options:
//  * direction = 'x' or 'y', defaults to null (both)
//  * includeSelf - if `true` it will evaluate `el`'s scroll property and include it in the parent list.
//  * closest - if `true` it will return the first scroll parent instead of all of them.
//
// ```
// pie.dom.scrollParents(el)
// //=> document.body
// ```
// **Note** window will not be included in the response.
pie.dom.scrollParents = (function(){
  var regex = /scroll|auto/,
  prop = function(el, dir) {
    var style = getComputedStyle(el),
    flow = style.getPropertyValue('overflow');
    if(!dir || dir === 'x') flow += style.getPropertyValue('overflow-x');
    if(!dir || dir === 'y') flow += style.getPropertyValue('overflow-y');
    return flow;
  };

  return function(el, options) {
    var parents = options && options.closest ? undefined : [],
    style;

    if(!options || !options.includeSelf) el = el.parentNode;

    while(el && !pie.dom.isDocument(el)) {
      style = prop(el, options && options.direction);

      if(regex.test(style)) {
        if(options && options.closest) return el;
        parents.unshift(el);
      }

      el = el.parentNode;
    }

    return parents;
  };
})();

// **pie.dom.scrollTo**
//
// Scroll the page to `sel`.
// If `sel` is a string it will find the first occurrence via a querySelector within the provided container.
// If `sel` is a dom node, the nodes position will be used.
// If `sel` is a number, it will scroll to that position.
// Available options:
//  * container - the container to scroll, defaults to document.body
//  * cb - the callback to invoke when scrolling is finished.
//  * onlyUp - only scrolls if the element is above the current position.
//  * onlyDown - only scrolls if the element is below the current position.
//  * gravity - where the element should appear in the viewport,
//  * * - any option available in pie.fn.ease
//
// ```
// pie.dom.scrollTo('header', {onlyUp: true, cb: fn, name: 'easeInQuart'});
pie.dom.scrollTo = function(sel, options) {
  var position = 0,
  container = options && options.container || pie.dom.rootScrollElement(),
  cb = options && options.cb,
  gravity = options && options.gravity || 'top',
  quit = false;

  if(pie.object.isNumber(sel)) {
    position = sel;
  } else if(pie.object.isString(sel)) {
    sel = container.querySelector(sel);
  }

  if(sel) {
    // ep is the elements position on the page.
    var ep = pie.dom.position(sel, container),
    // cp is the containers position on the page.
    cp = pie.dom.position(container);

    if(gravity === 'center') {
      position = (ep.top + (ep.height / 2)) - (cp.height / 2);
    } else if(gravity === 'bottom') {
      position = (ep.bottom - cp.height);
    } else { // top
      position = ep.top;
    }
  }

  if(options) {
    if(options.onlyUp && container.scrollTop <= position) quit = true;
    if(options.onlyDown && container.scrollTop >= position) quit = true;
  }

  if(position === container.scrollTop) quit = true;

  if(quit) {
    if(cb) cb();
    return;
  }

  options = pie.object.merge({
    from: container.scrollTop,
    to: position,
    name: 'easeInOutCubic',
    duration: 250,
    animation: true
  }, options);

  delete options.cb;
  delete options.container;
  delete options.onlyUp;
  delete options.onlyDown;
  delete options.gravity;

  pie.fn.ease(function(p){
    container.scrollTop = p;
  }, options, cb);

};

// **pie.dom.rootScrollElement**
//
// Returns either the html or body element depending on which one
// is in charge of scrolling the page. If no determination can be
// made the html element is returned since that's what the spec
// states is correct.
//
// This is why you'll often see $('body, html').animate() in jquery apps.
pie.dom.rootScrollElement = function() {
  var body = document.body,
  html = document.documentElement;

  if(body.scrollTop) return body;
  if(html.scrollTop) return html;

  var correct;
  // both are zero, so try to change it by 1
  body.scrollTop = html.scrollTop = 1;
  if(body.scrollTop) correct = body;
  else correct = html;

  body.scrollTop = html.scrollTop = 1;
  return correct;
};


// **pie.dom.trigger**
//
// Trigger an event `e` on `el`.
// If the event is a click, it will invoke the click() handler instead of creating
// a dom event. This is for browser compatability reasons (certain versions of FF).
// If you want to force an event, pass true as the third argument.
//
// ```
// pie.dom.trigger(el, 'click');
// pie.dom.trigger(el, 'foo.bar');
// ```
//
pie.dom.trigger = function(el, e, forceEvent) {

  if(!forceEvent && e === 'click') return el.click();

  var event = document.createEvent('Event');
  event.initEvent(e, true, true);
  return el.dispatchEvent(event);
};

// **pie.dom.prefixed**
//
// Find the first available version of the desired function, including browser specific implementations.
// ```
// pie.dom.prefixed(el, 'matches');
// pie.dom.prefixed(el, 'matchesSelector');
// pie.dom.prefixed(getComputedStyle(document.body), 'animation-delay')
// ```
pie.dom.prefixed = (function(){
  var prefixes = ['', 'webkit', 'moz', 'ms', 'o'],
  returnVal = function(val, el, standard){
    pie.dom.cache().set('browserPrefix.' + standard, val);
    return pie.object.isFunction(val) ? val.bind(el) : val;
  };

  return function(el, standardName) {

    var cacheHit = pie.dom.cache().get('browserPrefix.' + standardName);
    if(cacheHit) return returnVal(cacheHit, el, standardName);

    var prefix, i = 0,
    capd = pie.string.capitalize(standardName);

    for(; i < prefixes.length; i++) {
      prefix = prefixes[i];

      if(el[prefix + standardName]) return returnVal(el[prefix + standardName], el, standardName);
      if(el['-' + prefix + '-' + standardName]) return returnVal(el['-' + prefix + '-' + standardName], el, standardName);
      if(el[prefix + capd]) return returnVal(el[prefix + capd], el, standardName);
    }
  };
})();

pie.dom.viewportPosition = function() {
  var windowW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
  windowH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return {
    top: window.scrollY,
    bottom: window.scrollY + windowH,
    height: windowH,
    left: window.scrollX,
    right: window.scrollX + windowW,
    width: windowW
  };
};

pie.dom.position = function(el, container) {

  if(pie.dom.isWindow(el)) return pie.dom.viewportPosition(el);

  var   top = 0,
  left = 0,
  w = el.offsetWidth,
  h = el.offsetHeight;

  container = container || document.body;

  while(el && el !== container) {
    top += (el.offsetTop - el.scrollTop);
    left += (el.offsetLeft - el.scrollLeft);
    el = el.offsetParent;
  }

  return {
    width: w,
    height: h,
    top: top,
    left: left,
    right: left + w,
    bottom: top + h
  };
};

pie.dom.inViewport = function(el, threshold, vLoc) {
  var viewportLoc = vLoc || pie.dom.viewportPosition(),
  t = threshold || 0,
  elLoc = pie.dom.position(el);

  return  elLoc.bottom >= viewportLoc.top - t &&
          elLoc.top <= viewportLoc.bottom + t &&
          elLoc.right >= viewportLoc.left - t &&
          elLoc.left <= viewportLoc.right + t;
};
