
// create an element based on the content provided.
pie.util.createElement = function() {
  return $.createElement.apply(null, arguments).q[0];
};

// deep merge
pie.util.deepExtend = function() {
  var args = pie.array.args(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {
    if(k in targ && typeof targ[k] === 'object') {
      targ[k] = pie.util.deepExtend(targ[k], obj[k]);
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
pie.util.deserialize = $.deserialize;

// shallow merge
pie.util.extend   = $.extend;

// extract from subobjects
pie.util.getPath  = sudo.getPath;

// does the object have the described path
pie.util.hasPath = function(path, obj) {
  var parts = path.split('.'), part;
  while(part = parts.shift()) {

    /* jslint eqeq:true */
    if(obj != null && obj.hasOwnProperty(part)) {
      obj = obj[part];
    } else {
      return false;
    }
  }

  return true;
};

// serialize object into query string
pie.util.serialize = $.serialize;

// set subobjects
pie.util.setPath = sudo.setPath;

// string templating
pie.util.template = sudo.template;
