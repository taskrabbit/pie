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
    return String(this.pidId++);
  },

  setUid: function(obj) {
    return obj.pieId = obj.pieId || pie.unique();
  },

  // application utilities
  util: {},

};
