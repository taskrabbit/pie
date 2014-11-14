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

  // inheritance helper
  inheritance: {},

  // extensions to be used within pie apps.
  mixins: {},

  // service objects
  services: {},

  pieId: 1,

  unique: function() {
    return String(this.pieId++);
  },

  setUid: function(obj) {
    return obj.pieId = obj.pieId || pie.unique();
  },

  // application utilities
  util: {},


  inherit: function(/* child, parent, extensions */) {
    var args = pie.array.args(arguments),
    child = args.shift(),
    parent = args.shift();

    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;

    if(!child.prototype._super) pie.extend(child.prototype, pie.mixins.inheritance);
    if(args.length) pie.extend(child.prototype, args);

    return child;
  },

  // maybe this will get more complicated in the future, maybe not.
  extend: function(/* proto, extension1[, extension2, ...] */) {
    var extensions = pie.array.args(arguments),
    proto = extensions.shift();

    extensions = pie.array.compact(pie.array.flatten(extensions), true);

    extensions.forEach(function(ext) {
      pie.object.merge(proto, ext);
    });
  }

};
