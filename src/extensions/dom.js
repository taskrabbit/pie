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
  var uid = pie.setUid(el);
  pie.dom.cache().del('element-' + el.uid);
  if(el.parentNode) el.parentNode.removeChild(el);
};


pie.dom.off = function(el, event, fn, cap) {
  var eventSplit = event.split('.'),
    uid = pie.setUid(el),
    namespace, all, events;

  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  all = event === '*';

  events = pie.dom.cache().getOrSet('element-' + uid + '.dom-events', {});

  (all ? Object.keys(events) : [event]).forEach(function(k) {
    pie.array.from(events[k]).forEach(function(obj, i, ary) {
      if(!cap && (k === 'focus' || k === 'blur') && obj.sel) cap = true;
      if((!namespace || namespace === obj.ns) && (!fn || fn === obj.fn) && (cap === obj.cap)) {
        el.removeEventListener(k, obj.cb, obj.cap);
        delete ary[i];
      }

      events[k] = pie.array.compact(pie.array.from(events[k]));
    });
  });
};


pie.dom.on = function(el, event, fn, selector, capture) {
  var eventSplit = event.split('.'),
      cb, namespace, uid, events;

  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  uid = pie.setUid(el);

  // we force capture so that delegation works.
  if(!capture && (event === 'focus' || event === 'blur') && selector) capture = true;

  events = pie.dom.cache().getOrSet('element-' + uid  + '.dom-events', {});
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
