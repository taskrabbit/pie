
// create an element based on the content provided.
pie.h.createElement = $.createElement;

// deep merge
pie.h.deepExtend = function() {
  var args = pie.array.args(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {
    if(k in targ && typeof targ[k] === 'object') {
      targ[k] = pie.h.deepExtend(targ[k], obj[k]);
    } else {
      targ[k] = obj[k];
    }
  }

  // iterate over each passed in obj remaining
  for (; args.length && (obj = args.shift());) {
    Object.keys(obj).forEach(fn);
  }
  return targ;
};

// deserialize query string into object
pie.h.deserialize = $.deserialize;

// shallow merge
pie.h.extend   = $.extend;

// extract from subobjects
pie.h.getPath  = sudo.getPath;

// serialize object into query string
pie.h.serialize = $.serialize;

// string templating
pie.h.template = sudo.template;
