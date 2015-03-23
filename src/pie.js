// # Pie
// The top level namespace of the framework.
var pie = window.pie = {

  apps: {},

  /* native extensions */
  array: {},
  browser: {},
  date: {},
  dom: {},
  fn: {},
  math: {},
  object: {},
  string: {},

  /* extensions to be used within pie apps. */
  mixins: {},

  pieId: 1,


  // ** pie.guid **
  //
  // Generate a globally unique id.
  guid: function() {
    var r, v;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      r = Math.random()*16|0,
      v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },

  // ** pie.ns **
  //
  // If it's not already present, build a path on `base`.
  // By default, `base` is the global `window`.
  // The deepest namespace object is returned so you can immediately use it.
  // ```
  // pie.ns('lib.foo.bar').baz = function(){};
  // //=> generates { lib: { foo: { bar: { baz: function(){} } } } }
  // ```
  ns: function(path, base) {
    base = base || window;
    return pie.object.getPath(base, path) || pie.object.setPath(base, path, {});
  },

  // ** pie.qs **
  //
  // Alias for `document.querySelector`
  qs: function() {
    return document.querySelector.apply(document, arguments);
  },

  // ** pie.qsa **
  //
  // Alias for `document.querySelectorAll`
  qsa: function() {
    return document.querySelectorAll.apply(document, arguments);
  },

  // ** pie.setUid **
  //
  // Set the `pieId` of `obj` if it isn't already present.
  setUid: function(obj) {
    return obj.pieId = obj.pieId || pie.unique();
  },

  // ** pie.unique **
  //
  // Provide a unique integer not yet used by pie.
  // This is good for unique local ids.
  unique: function() {
    return String(pie.pieId++);
  },

  // ** pie.util **
  //
  // Provide a util object for your app which utilizes pie's features.
  // ```
  // window._ = pie.util();
  // _.a.detect(/* .. */);
  // _.o.merge(a, b);
  // _.unique(); //=> '95'
  // ```
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

    o.guid    = pie.guid;
    o.ns      = pie.ns;
    o.qs      = pie.qs;
    o.qsa     = pie.qsa;
    o.setUid  = pie.setUid;
    o.unique  = pie.unique;

    return o;
  },

  _debugArgs: function(msg) {
    return ["%c[pie] %c" + msg, "color: orange; font-weight: bold;", "color: inherit; font-weight: inherit;"];
  }

};
