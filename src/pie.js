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


  // application helpers
  h: {},

  // template helpers
  t: {},

  // modules for extending objects with functionality
  m: {},

  // service objects
  services: {}
};
