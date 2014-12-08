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

  // maybe this will get more complicated in the future, maybe not.
  extend: function(/* proto, extension1[, extension2, ...] */) {
    var extensions = pie.array.from(arguments),
    proto = extensions.shift();

    extensions = pie.array.compact(pie.array.flatten(extensions), true);

    extensions.forEach(function(ext) {
      pie.object.merge(proto, ext);
    });
  },


  inherit: function(/* child, parent, extensions */) {
    var args = pie.array.from(arguments),
    child = args.shift(),
    parent = args.shift();

    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if(!child.prototype._super) pie.extend(child.prototype, pie.mixins.inheritance);
    if(args.length) pie.extend(child.prototype, args);

    return child;
  },

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
