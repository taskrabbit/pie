// deletes all undefined and null values.
// returns a new object less any empty key/values.
pie.object.compact = function(a, removeEmpty){
  var b = pie.object.extend({}, a);
  Object.keys(b).forEach(function(k) {
    if(b[k] === undefined || b[k] === null || (removeEmpty && b[k].toString().length === 0)) delete b[k];
  });
  return b;
};


// deep merge
pie.object.deepExtend = function() {
  var args = pie.array.args(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {
    if(k in targ && typeof targ[k] === 'object') {
      targ[k] = pie.object.deepExtend(targ[k], obj[k]);
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


// grab the sub-object from the provided object less the provided keys.
// pie.object.except({foo: 'bar', biz: 'baz'}, 'biz') => {'foo': 'bar'}
pie.object.except = function(){
  var b = {}, args = pie.array.args(arguments), a = args[0];
  args = pie.array.flatten(args.splice(1));
  Object.keys(a).forEach(function(k){
    if(args.indexOf(k) < 0) b[k] = a[k];
  });
  return b;
};


// shallow merge
pie.object.extend = function() {
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


// yield each key value pair to a function
// pie.object.forEach({'foo' : 'bar'}, function(k,v){ console.log(k, v); });
//
// => foo, bar
pie.object.forEach = function(o, f) {
  Object.keys(o).forEach(function(k) {
    f(k, o[k]);
  });
};


pie.object.getPath = function(o, path) {
  return sudo.getPath(path, o);
};


pie.object.getValue = function(o, attribute) {
  if(typeof attribute === 'function')                     return attribute.call(null, o);
  else if (o == null)                                     return undefined;
  else if(typeof o[attribute] === 'function')             return o[attribute].call(o);
  else if(o.hasOwnProperty(attribute) || attribute in o)  return o[attribute];
  else                                                    return undefined;
};


// does the object have the described path
pie.object.hasPath = function(obj, path) {
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
pie.object.serialize = function(obj, removeEmpty) {
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


pie.object.setPath = function(o, path, value) {
  return sudo.setPath(path, value, o);
};


// grab a sub-object from the provided object.
// pie.object.slice({foo: 'bar', biz: 'baz'}, 'biz') => {'biz': 'baz'}
pie.object.slice = function(){
  var b = {}, i = 1, arg = arguments, a = arg[0];
  if(Array.isArray(arg[1])) {
    arg = arg[1];
    i = 0;
  }
  for(;i < arg.length; i++)
    if(a.hasOwnProperty(arg[i])) b[arg[i]] = a[arg[i]];
  return b;
};

// return all the values of the object
pie.object.values = function(a) {
  var values = [];
  Object.keys(a).forEach(function(k) {
    values.push(a[k]);
  });
  return values;
};
