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

  create: function(/* extension1, extension2 */) {
    var extensions = pie.array.from(arguments),
    name = pie.object.isString(extensions[0]) ? extensions.shift() : "",
    init,
    proto;

    if(pie.object.isFunction(extensions[0])) {
      init = extensions.shift();
    } else if (pie.object.isObject(extensions[0])) {
      init = extensions[0].init;
      extensions[0] = pie.object.except(extensions[0], 'init');
    }

    if(!name && init && init.name) name = init.name;
    proto = new Function("return function " + name + "(){ if(this.init) this.init.apply(this, arguments); };")();

    proto.prototype.init = init;

    pie.extend(proto.prototype, extensions);

    return proto;
  },

  inherit: function(/* child, parent, extensions */) {
    var args = pie.array.from(arguments),
    child = args.shift(),
    parent = args.shift(),
    oldInit = child.prototype.init;

    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    if(oldInit) child.prototype.init = oldInit;


    if(!child.prototype._super) args.unshift(pie.mixins.inheritance);
    if(args.length) pie.extend(child.prototype, args);

    return child;
  },

  // maybe this will get more complicated in the future, maybe not.
  extend: function(/* proto, extension1[, extension2, ...] */) {
    var extensions = pie.array.from(arguments),
    proto = extensions.shift();

    extensions = pie.array.compact(pie.array.flatten(extensions), true);

    extensions.forEach(function(ext) {
      var beforeInit = ext.beforeInit || ext.init;
      var afterInit = ext.afterInit;
      var onInherit = ext.onInherit;

      pie.object.merge(proto, pie.object.except(ext, 'onInherit', 'init', 'afterInit', 'beforeInit'));

      if(onInherit) onInherit(proto);

      if((beforeInit || afterInit) && proto.init) {
        var oldInit = proto.init;
        proto.init = function(){
          if(beforeInit) beforeInit.apply(this, arguments);
          oldInit.apply(this, arguments);
          if(afterInit) afterInit.apply(this, arguments);
        };
      }
    });
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
