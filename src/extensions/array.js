// remove all null or undefined values
// does not remove all falsy values unless the second param is true
pie.array.compact = function(a, removeAllFalsy){
  return a.filter(function(i){
    return removeAllFalsy ? !!i : (i !== undefined && i !== null);
  });
};

pie.array.dup = function(a) {
  return a.slice(0);
};

pie.array.sum = function(a) {
  var s = 0;
  a.forEach(function(i){ s += parseFloat(i); });
  return s;
};

pie.array.avg = function(a) {
  var s = pie.array.sum(a), l = a.length;
  return (s / l);
};

// return an array that consists of any A elements that B does not contain
pie.array.subtract = function(a, b) {
  return a.filter(function(i) {return b.indexOf(i) < 0; });
};

pie.array.intersect = function(a, b) {
  return a.filter(function(i) { return b.indexOf(i) !== -1; });
};

// get the last item
pie.array.last = function(arr) {
  if(arr && arr.length) return arr[arr.length - 1];
};

// return an array from a value. if the value is an array it will be returned.
pie.array.from = function(value) {
  return Array.isArray(value) ? value : pie.array.compact([value], false);
};

pie.array.grep = function(arr, regex) {
  return arr.filter(function(a){ return regex.test(a.toString()); });
};

// flattens an array of arrays or elements into a single depth array
// pie.array.flatten(['a', ['b', 'c']]) => ['a', 'b', 'c']
pie.array.flatten = function(a, into) {
  into = into || [];

  if(pie.array.isArray(a)) {
    a.forEach(function(e){
      pie.array.flatten(e, into);
    });
  } else {
    into.push(a);
  }

  return into;
};


// return an array filled with the return values of f
// if f is not a function, it will be assumed to be a key of the item.
// if the resulting value is a function, it can be invoked by passing true as the second argument.
// pie.array.map(["a", "b", "c"], function(e){ return e.toUpperCase(); }) => ["A", "B", "C"]
// pie.array.map(["a", "b", "c"], 'length') => [1, 1, 1]
// pie.array.map([0,1,2], 'toFixed') => [toFixed(){}, toFixed(){}, toFixed(){}]
// pie.array.map([0,1,2], 'toFixed', true) => ["0", "1", "2"]
pie.array.map = function(a, f, callInternalFunction){
  var b = [], callingF;

  if(typeof(f) !== 'function') {
    callingF = function(e){
      var ef = e[f];

      if(callInternalFunction && typeof(ef) === 'function')
        return ef.apply(e);
      else
        return ef;
    };
  } else {
    callingF = f;
  }

  a.forEach(function(e){
    b.push(callingF(e));
  });

  return b;
};

pie.array.sortBy = function(arr, attribute){
  var aVal, bVal;
  return arr.sort(function(a, b) {
    aVal = pie.func.valueFrom(a[attribute]);
    bVal = pie.func.valueFrom(b[attribute]);
    if(aVal === bVal) return 0;
    if(aVal < bVal) return -1;
    return 1;
  });
};


// return the first item where the provided function evaluates to a truthy value.
// if a function is not provided, the second argument will be assumed to be an attribute check.
// pie.array.detect([1,3,4,5], function(e){ return e % 2 === 0; }) => 4
// pie.array.detect([{foo: 'bar'}, {baz: 'foo'}], 'baz') => {baz: 'foo'}
pie.array.detect = function(a, f) {
  var i = 0, l = a.length;
  for(;i<l;i++) {
    if('function' === typeof f) {
      if(f(a[i])) return a[i];
    } else if(a[i] && pie.func.valueFrom(a[i][f])) {
      return a[i];
    }

  }
};

// turn arguments into an array
pie.array.args = function(argumentsObject) {
  return Array.prototype.slice.call(argumentsObject);
};

// return unique values
pie.array.uniq = function(arr) {
  return arr.filter(function(e, i){ return arr.indexOf(e) === i; });
};

pie.array.toSentence = function(arr) {
  if(!arr.length) return;
  if(arr.length > 2) arr = [arr.slice(0,arr.length-1).join(', '), arr.slice(arr.length-1)];
  // todo: i18n
  return arr.join(' and ');
};
