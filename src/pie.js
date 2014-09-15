// prepare sudo for pie standards
// [% evaluate %], [%= interpolate %], [%- sanitize(interpolate) %]
sudo.templateSettings = {
  evaluate:    /\[%([\s\S]+?)%\]/g,
  interpolate: /\[%=([\s\S]+?)%\]/g,
  escape:      /\[%-([\s\S]+?)%\]/g
};


// pie namespace;
window.pie = {

  // native extensions
  array: {},
  date: {},
  func: {},
  math: {},
  object: {},
  string: {},

  // inheritance helper
  inheritance: {},

  // service objects
  services: {},

  uid: 0,

  unique: function() { return this.uid++; },

  // application utilities
  util: {},

};
