
// create an element based on the content provided.
pie.util.createElement = function(str) {
  var wrap = document.createElement('div');
  wrap.innerHTML = str;
  return wrap.removeChild(wrap.firstElementChild);
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
  for (; args.length;) {
    obj = args.shift();
    if(obj) Object.keys(obj).forEach(fn);
  }
  return targ;
};

// deserialize query string into object
pie.util.deserialize = function(str) {
  var params = {}, arrRegex = /^(.+)\[\]$/, idx, pieces, segments, arr, key, value, arr;

  if(!str) return params;

  idx = str.indexOf('?');
  if(~idx) str = str.slice(idx+1);

  pieces = str.split('&');
  pieces.forEach(function(piece){
    segments = piece.split('=');
    key = decodeURIComponent(segments[0] || '');
    value = decodeURIComponent(segments[1] || '');

    arr = key.match(arrRegex);
    // array
    if(!!arr) {
      key = arr[1];
      params[key] = params[key] || [];
      params[key].push(value);
    } else {
      params[key] = value;
    }
  });

  return params;
};

// shallow merge
pie.util.extend = function() {
  var args = pie.array.args(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {
    targ[k] = obj[k];
  }

  // iterate over each passed in obj remaining
  for (; args.length; ) {
    obj = args.shift();
    if(obj) Object.keys(obj).forEach(fn);
  }

  return targ;
};

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
pie.util.serialize = function(obj, removeEmpty) {
  if(!obj) return '';
  if(removeEmpty) obj = pie.object.compact(obj, true);

  var arr = [], keys = Object.keys(obj), v;

  keys = keys.sort();

  keys.forEach(function(k){
    v = obj[k];

    if(Array.isArray(v)) {
      k = k + '[]';
      v.forEach(function(av){
        arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(av));
      });
    } else {
      arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  });

  return arr.join('&');
};

// set subobjects
pie.util.setPath = sudo.setPath;

// string templating
pie.util.template = sudo.template;
