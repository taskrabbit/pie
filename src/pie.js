// pie namespace;
window.pie = {

  // native extensions
  array: {},
  browser: {},
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
    return pie.object.setPath(window, path, {});
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
