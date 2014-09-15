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

// deletes all undefined and null values.
// returns a new object less any empty key/values.
pie.object.compact = function(a, removeEmpty){
  var b = pie.util.extend({}, a);
  Object.keys(b).forEach(function(k) {
    if(b[k] === undefined || b[k] === null || (removeEmpty && b[k].toString().length === 0)) delete b[k];
  });
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

// yield each key value pair to a function
// pie.object.forEach({'foo' : 'bar'}, function(k,v){ console.log(k, v); });
//
// => foo, bar
pie.object.forEach = function(o, f) {
  Object.keys(o).forEach(function(k) {
    f(k, o[k]);
  });
};
