// pie namespace;
window.pie = {

  apps: {},

  // native extensions
  array: {},
  browser: {},
  date: {},
  dom: {},
  fn: {},
  math: {},
  object: {},
  string: {},

  // extensions to be used within pie apps.
  mixins: {},

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

  guid: function() {
    var r, v;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      r = Math.random()*16|0,
      v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },

  // provide a util object for your app which utilizes pie's features.
  // window._ = pie.util();
  // _.a.detect(/* .. */);
  // _.o.merge(a, b);
  // _.unique(); //=> '95'
  util: function() {
    var o = {};

    o.a   = pie.array;
    o.b   = pie.browser;
    o.d   = pie.date;
    o.$   = pie.dom;
    o.fn  = pie.fn;
    o.m   = pie.math;
    o.o   = pie.object;
    o.s   = pie.string;
    o.x   = pie.mixins;

    o.unique  = pie.unique;
    o.setUid  = pie.setUid;

    return o;
  }

};
