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

  uid: 1,

  unique: function() {
    return this.uid++;
  },

  setUid: function(obj) {
    return obj.pieId = obj.pieId || pie.unique();
  },

  // application utilities
  util: {},

};
