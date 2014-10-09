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

  uid: 0,

  unique: function() { return this.uid++; },

  // application utilities
  util: {},

};
pie.array.areAll = function(a, f) {
  var i = 0;
  for(;i < a.length; i++) {
    if(!f.call(null, a[i])) return false;
  }
  return true;
};

pie.array.areAny = function(a, f) {
  var i = 0;
  for(;i < a.length; i++) {
    if(f.call(null, a[i])) return true;
  }
  return false;
};


// turn arguments into an array
pie.array.args = function(argumentsObject) {
  return Array.prototype.slice.call(argumentsObject);
};


pie.array.avg = function(a) {
  var s = pie.array.sum(a), l = a.length;
  return l ? (s / l) : 0;
};


// remove all null or undefined values
// does not remove all falsy values unless the second param is true
pie.array.compact = function(a, removeAllFalsy){
  return a.filter(function(i){
    /* jslint eqeq:true */
    return removeAllFalsy ? !!i : (i != null);
  });
};


// return the first item where the provided function evaluates to a truthy value.
// if a function is not provided, the second argument will be assumed to be an attribute check.
// pie.array.detect([1,3,4,5], function(e){ return e % 2 === 0; }) => 4
// pie.array.detect([{foo: 'bar'}, {baz: 'foo'}], 'baz') => {baz: 'foo'}
pie.array.detect = function(a, f) {
  var i = 0, l = a.length;
  for(;i<l;i++) {
    if(pie.object.getValue(a[i], f)) {
      return a[i];
    }
  }
};


pie.array.dup = function(a) {
  return a.slice(0);
};


// flattens an array of arrays or elements into a single depth array
// pie.array.flatten(['a', ['b', 'c']]) => ['a', 'b', 'c']
// you may also restrict the depth of the flattening:
// pie.array.flatten([['a'], ['b', ['c']]], 1) => ['a', 'b', ['c']]
pie.array.flatten = function(a, depth, into) {
  into = into || [];

  if(Array.isArray(a) && depth !== -1) {

    if(depth != null) depth--;

    a.forEach(function(e){
      pie.array.flatten(e, depth, into);
    });

  } else {
    into.push(a);
  }

  return into;
};


// return an array from a value. if the value is an array it will be returned.
pie.array.from = function(value) {
  return Array.isArray(value) ? value : pie.array.compact([value], false);
};


pie.array.grep = function(arr, regex) {
  return arr.filter(function(a){ return regex.test(String(a)); });
};


pie.array.groupBy = function(arr, groupingF) {
  var h = {}, g;
  arr.forEach(function(a){

    g = pie.object.getValue(a, groupingF);

    /* jslint eqeq:true */
    if(g != null) {
      h[g] = h[g] || [];
      h[g].push(a);
    }
  });

  return h;
};


pie.array.intersect = function(a, b) {
  return a.filter(function(i) { return ~b.indexOf(i); });
};


// get the last item
pie.array.last = function(arr) {
  if(arr && arr.length) return arr[arr.length - 1];
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


pie.array.remove = function(a, o) {
  var idx;
  while(~(idx = a.indexOf(o))) {
    a.splice(idx, 1);
  }
  return a;
};


// return an array that consists of any A elements that B does not contain
pie.array.subtract = function(a, b) {
  return a.filter(function(i) { return !~b.indexOf(i); });
};


pie.array.sum = function(a) {
  var s = 0;
  a.forEach(function(i){ s += parseFloat(i); });
  return s;
};


pie.array.sortBy = function(arr, sortF){
  var aVal, bVal;
  return arr.sort(function(a, b) {
    aVal = pie.object.getValue(a, sortF);
    bVal = pie.object.getValue(b, sortF);
    if(aVal === bVal) return 0;
    if(aVal < bVal) return -1;
    return 1;
  });
};


pie.array.toSentence = function(arr, i18n) {
  if(!arr.length) return '';

  var delim = i18n && i18n.t('sentence.delimeter', {default: ''}) || ', ',
  and = i18n && i18n.t('sentence.and', {default: ''}) || ' and ';

  if(arr.length > 2) arr = [arr.slice(0,arr.length-1).join(delim), arr.slice(arr.length-1)];
  return arr.join(and);
};


pie.array.union = function() {
  var arrs = pie.array.args(arguments);
  arrs = pie.array.compact(arrs, true);
  arrs = pie.array.flatten(arrs);
  arrs = pie.array.unique(arrs);
  return arrs;
};


// return unique values
pie.array.unique = function(arr) {
  return arr.filter(function(e, i){ return arr.indexOf(e) === i; });
};

// takes a iso date string and converts to a local time representing 12:00am, on that date.
pie.date.dateFromISO = function(isoDateString) {
  if(!isoDateString) return null;
  var parts = isoDateString.split(/T|\s/)[0].split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

// assuming that we're on ES5 and can use new Date(isoString).
pie.date.timeFromISO = function(isoTimeString) {
  if(!isoTimeString) return null;
  if(!/T|\s/.test(isoTimeString)) return pie.date.dateFromISO(isoTimeString);
  return new Date(isoTimeString);
};
// create an element based on the content provided.
pie.dom.createElement = function(str) {
  var wrap = document.createElement('div');
  wrap.innerHTML = str;
  return wrap.removeChild(wrap.firstElementChild);
};
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
pie.func.debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

pie.func.valueFrom = function(f, binding) {
  if(typeof f === 'function') return f.call(binding);
  return f;
};
pie.math.precision = function(number, places) {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
};
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
pie.string.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};


pie.string.change = function() {
  var args = pie.array.args(arguments),
  str = args[0];
  args = args.slice(1);
  args.forEach(function(m) {
    str = pie.string[m](str);
  });

  return str;
};


// deserialize query string into object
pie.string.deserialize = (function(){

  function parseQueryValue(value) {
    if(value === 'undefined') return undefined;
    if(value === 'null') return null;
    if(value === 'true') return true;
    if(value === 'false') return false;
    var f = parseFloat(value);
    if(isNaN(f)) return value;
    if(/\./.test(value)) return f;
    return parseInt(f, 10);
  }

  return function(str, parse) {
    var params = {}, arrRegex = /^(.+)\[\]$/, idx, pieces, segments, arr, key, value;

    if(!str) return params;

    idx = str.indexOf('?');
    if(~idx) str = str.slice(idx+1);

    pieces = str.split('&');
    pieces.forEach(function(piece){
      segments = piece.split('=');
      key = decodeURIComponent(segments[0] || '');
      value = decodeURIComponent(segments[1] || '');

      if(parse) value = parseQueryValue(value);
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
})();


// Escapes a string for HTML interpolation
pie.string.escape = function(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
};


// designed to be used with the "%{expression}" placeholders
pie.string.expand = function(str, data) {
  data = data || {};
  return str.replace(/\%\{(.+?)\}/g,
    function(match, key) {return data[key];});
};


pie.string.humanize = function(str) {
  return str.replace(/_id$/, '').replace(/([a-z][A-Z]|[a-z]_[a-z])/g, function(match, a){ return a[0] + ' ' + a[a.length-1]; });
};


pie.string.lowerize = function(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};


pie.string.modularize = function(str) {
  return str.replace(/([^_])_([^_])/g, function(match, a, b){ return a + b.toUpperCase(); });
};


pie.string.pluralize = function(str) {
  if(/ss$/i.test(str)) return str + 'es';
  if(/s$/i.test(str)) return str;
  if(/[a-z]$/i.test(str)) return str + 's';
  return str;
};


// string templating
pie.string.template = sudo.template;


pie.string.titleize = function(str) {
  return str.replace(/(^| )([a-z])/g, function(match, a, b){ return a + b.toUpperCase(); });
};


pie.string.underscore = function(str) {
  return str.replace(/([a-z])([A-Z])/g, function(match, a, b){ return a + '_' + b.toLowerCase(); }).toLowerCase();
};


pie.string.urlConcat = function() {
  var args = pie.array.compact(pie.array.args(arguments), true),
  base = args.shift(),
  query = args.join('&');

  if(!query.length) return base;

  // we always throw a question mark on the end of base
  if(base.indexOf('?') < 0) base += '?';

  // we replace all question marks in the query with &
  if(query.indexOf('?') === 0) query = query.replace('?', '&');

  base += query;
  base = base.replace('?&', '?').replace('&&', '&').replace('??', '?');
  if(base.indexOf('?') === base.length - 1) base = base.substr(0, base.length - 1);
  return base;
};

// A mixin to provide two way data binding between a model and form inputs.
// This mixin should be used with a pie view.
pie.mixins.bindings = (function(){

  function setFieldValue(input, value) {
    var t = input.getAttribute('type');

    /* jslint eqeq:true */
    if(t === 'checkbox' || t === 'radio') {

      // in the checkbox case, we could have an array of values
      if(Array.isArray(value)) {
        // this input is checked if that array contains it's value
        return input.checked = !!(~value.indexOf(input.value));

      // if the field has no value, then we just determine it's checked state based on the truthyness of the model value
      } else if(!input.hasAttribute('value')) {
        return input.checked = !!value;
      // otherwise, we check the input against the value and base that as our checked state.
      } else {
        return input.checked = (input.value == value);
      }
    }

    // normal inputs just receive the value.
    return input.value = value;
  }

  function setValue(view, sel, value) {
    var i = 0, list = view.qsa(sel);
    for(;i < list.length; i++){
      setFieldValue(list[i], value);
    }
  }

  function getUpdatedValue(input, currentVal) {
    var v = input.value, t = input.getAttribute('type'), i;

    // if it's a checkbox
    if(t === 'checkbox' || t === 'radio') {

      // and we're dealing with an array.
      if(Array.isArray(currentVal)) {
        // the current index of the value
        i = currentVal.indexOf(v);

        // if we want the value to be included but it's not, push it on
        if(input.checked && !~i) {
          currentVal.push(input.value);
          return currentVal;

        // if the value should not be included but is, splice it out.
        } else if(!input.checked && ~i) {
          currentVal.splice(i,1);
          return currentVal;
        } else {
          return currentVal;
        }

      // not an array
      } else {

        // if the input has a value attribute use that, otherwise return a bool.
        if(input.hasAttribute('value')) {
          return input.checked ? input.value : null;
        } else {
          return input.checked;
        }
      }
    }

    return input.value;
  }


  return {

    // Ex: this.bind({attr: 'name', model: this.user});
    // If this.model is defined, you don't have to pass the model.
    // Ex: this.model = user; this.bind({attr: 'name'});
    // Here are all the options:
    // this.bind({
    //   model: this.user,
    //   attr: 'name',
    //   sel: 'input[name="user_name"]',
    //   trigger: 'keyup',
    //   debounce: true
    // });
    //
    // Bind currently only supports form fields. Todo: support applying to attributes, innerHTML, etc.
    bind: function(options) {
      options = options || {};

      var model = options.model || this.model,
      attr = options.attr || options.attribute || undefined,
      sel = options.sel || 'input[name="' + attr + '"]',
      triggers = (options.trigger || 'keyup change').split(' '),
      debounce = options.debounce,
      ignore = false,
      toModel = function(e) {
        var value = getUpdatedValue(e.delegateTarget, model.get(attr));
        ignore = true;
        model.set(attr, value);
        ignore = false;
      },
      toElement = function(changes) {
        if(ignore) return;
        setValue(this, sel, changes[changes.length-1].value);
      }.bind(this);

      if(debounce) {
        if(debounce === true) debounce = 150;
        toModel = Function.debounce(toModel, debounce);
      }

      triggers.forEach(function(trigger){
        this.on(trigger, sel, toModel);
      }.bind(this));

      this.onChange(model, toElement, attr);

      this._bindings = pie.array.from(this._bindings);
      this._bindings.push({model: model, sel: sel, attr: attr});
    },

    // A way to initialize form fields with the values of a model.
    initBoundFields: function() {
      pie.array.from(this._bindings).forEach(function(binding){
        setValue(this, binding.sel, binding.model.get(binding.attr));
      }.bind(this));
    }

  };
})();
pie.mixins.inheritance = {

  _super: function() {
    var args = pie.array.args(arguments),
    name = args.shift(),
    obj = this,
    curr;

    if(args.length === 1 && String(args[0]) === "[object Arguments]") args = pie.array.args(args[0]);

    while(true) {
      curr = Object.getPrototypeOf(obj);
      if(!curr) throw new Error("No super method defined: " + name);
      if(curr === obj) return;
      if(curr[name] && curr[name] !== this[name]) {
        return curr[name].apply(this, args);
      } else {
        obj = curr;
      }
    }
  }

};
pie.container = {

  addChild: function(name, child) {
    var children = this.children(),
    names = this.childNames(),
    idx;

    children.push(child);
    idx = children.length - 1;

    names[name] = idx;
    child._indexWithinParent = idx;
    child._nameWithinParent = name;
    child.parent = this;

    if('addedToParent' in child) child.addedToParent.call(child, this);

    return this;
  },

  addChildren: function(obj) {
    pie.object.forEach(obj, function(name, child) {
      this.addChild(name, child);
    }.bind(this));
  },

  childNames: function() {
    return this._childNames = this._childNames || {};
  },

  children: function() {
    return this._children = this._children || [];
  },

  getChild: function(obj) {
    var name = obj._nameWithinParent || obj,
    idx = this.childNames()[name];

    /* jslint eqeq:true */
    if(idx == null) idx = obj;

    return ~idx && this.children()[idx] || undefined;
  },

  send: function() {
    var args = pie.array.args(arguments),
    fname = args.shift(),
    obj = this.parent;

    while(obj && !(fname in obj)) {
      obj = obj.parent;
    }

    if(obj) obj[fname].apply(obj, args);
  },

  removeChild: function(obj) {
    var child = this.getChild(obj),
    names = this.childNames(),
    children = this.children(),
    i;

    if(child) {
      i = child._indexWithinParent;
      children.splice(i, 1);

      for(;i < children.length;i++) {
        children[i]._indexWithinParent = i;
        names[children[i]._nameWithinParent] = i;
      }

      // clean up
      delete names[child._nameWithinParent];
      delete child._indexWithinParent;
      delete child._nameWithinParent;
      delete child.parent;

      if('removedFromParent' in child) child.removedFromParent.call(child, this);
    }

    return this;
  },

  removeChildren: function() {
    var children = this.children(),
    child;

    while(child = children[children.length-1]) {
      this.removeChild(child);
    }

    return this;
  }
};

//    **Setters and Getters**
//    pie.model provides a basic interface for object management and observation.
//
//    *example:*
//
//    ```
//    var user = new pie.model();
//    user.set('first_name', 'Doug');
//    user.get('first_name') //=> 'Doug'
//    user.sets({
//      first_name: 'Douglas',
//      last_name: 'Wilson'
//    });
//    user.get('last_name') //= 'Wilson'
//
//    user.set('location.city', 'Miami')
//    user.get('location.city') //=> 'Miami'
//    user.get('location') //=> {city: 'Miami'}
//    ```
//    ** Observers **
//    Observers can be added by invoking the model's observe() method.
//    pie.model.observe() optionally accepts 2+ arguments which are used as filters for the observer.
//
//    *example:*
//
//    ```
//    var o = function(changes){ console.log(changes); };
//    var user = new pie.model();
//    user.observe(o, 'first_name');
//    user.sets({first_name: 'first', last_name: 'last'});
//    // => o is called and the following is logged:
//    [{
//      name: 'first_name',
//      type: 'new',
//      oldValue:
//      undefined,
//      value: 'first',
//      object: {..}
//    }]
//    ```
//
//    **Computed Properties**
//
//    pie.models can observe themselves and compute properties. The computed properties can be observed
//    just like any other property.
//
//    *example:*
//
//    ```
//    var fullName = function(){ return this.get('first_name') + ' ' + this.get('last_name'); };
//    var user = new pie.model({first_name: 'Doug', last_name: 'Wilson'});
//    user.compute('full_name', fullName, 'first_name', 'last_name');
//    user.get('full_name') //=> 'Doug Wilson'
//    user.observe(function(changes){ console.log(changes); }, 'full_name');
//    user.set('first_name', 'Douglas');
//    # => the observer is invoked and console.log provides:
//    [{
//      name: 'full_name',
//      oldValue: 'Doug Wilson',
//      value: 'Douglas Wilson',
//      type: 'update',
//      object: {...}
//    }]
//    ```


pie.model = function(d, options) {
  this.data = pie.object.extend({}, d);
  this.options = options || {};
  this.uid = pie.unique();
  this.observations = {};
  this.changeRecords = [];
};

// Give ourselves _super functionality.
pie.object.extend(pie.model.prototype, pie.mixins.inheritance);


// After updates have been made we deliver our change records to our observers.
pie.model.prototype.deliverChangeRecords = function() {
  var observers = {}, os, o, change, all;

  // grab each change record
  while(change = this.changeRecords.shift()) {

    // grab all the observers for the attribute specified by change.name
    os = pie.array.union(this.observations[change.name], this.observations.__all__);

    // then for each observer, build or concatenate to the array of changes.
    while(o = os.shift()) {
      observers[o.uid] = observers[o.uid] || {fn: o, changes: []};
      observers[o.uid].changes.push(change);
    }
  }

  // Iterate each observer, calling it with the changes which it was subscribed for.
  pie.object.forEach(observers, function(uid, obj) {
    obj.fn.call(null, obj.changes);
  });

  return this;
};

// Access the value stored at data[key]
// Key can be multiple levels deep by providing a dot separated key.
pie.model.prototype.get = function(key) {
  return pie.object.getPath(this.data, key);
};

// Retrieve multiple values at once.
pie.model.prototype.gets = function() {
  var args = pie.array.args(arguments), o = {};
  args = pie.array.flatten(args);
  args = pie.array.compact(args);

  args.forEach(function(arg){
    o[arg] = pie.object.getPath(this.data, arg);
  }.bind(this));

  return pie.object.compact(o);
};


// Register an observer and optionally filter by key.
pie.model.prototype.observe = function(/* fn[, key1, key2, key3] */) {
  var keys = pie.array.args(arguments),
  fn = keys.shift();

  fn.uid = fn.uid || String(pie.unique());

  keys = pie.array.flatten(keys);

  if(!keys.length) keys.push('__all__');

  keys.forEach(function(k) {
    this.observations[k] = this.observations[k] || [];
    if(this.observations[k].indexOf(fn) < 0) this.observations[k].push(fn);
  }.bind(this));

  return this;
};

// Set a value and trigger observers.
// Optionally provide false as the third argument to skip observation.
// Note: skipping observation does not stop changeRecords from accruing.
pie.model.prototype.set = function(key, value, skipObservers) {
  var change = { name: key, object: this.data };

  if(pie.object.hasPath(this.data, key)) {
    change.type = 'update';
    change.oldValue = pie.object.getPath(this.data, key);
  } else {
    change.type = 'add';
  }

  change.value = value;
  pie.object.setPath(this.data, key, value);

  this.changeRecords.push(change);

  if(skipObservers) return this;
  return this.deliverChangeRecords();
};

// Set a bunch of stuff at once.
pie.model.prototype.sets = function(obj, skipObservers) {
  pie.object.forEach(obj, function(k,v) {
    this.set(k, v, true);
  }.bind(this));

  if(skipObservers) return this;
  return this.deliverChangeRecords();
};


// Unregister an observer. Optionally for specific keys.
pie.model.prototype.unobserve = function(/* fn[, key1, key2, key3] */) {
  var keys = pie.array.args(arguments),
  fn = keys.shift(),
  i;

  if(!keys.length) keys = Object.keys(this.observations);

  keys.forEach(function(k){
    i = this.observations[k].indexOf(fn);
    if(~i) this.observations[k].splice(i,1);
  }.bind(this));

  return this;
};

// Register a computed property which is accessible via `name` and defined by `fn`.
// Provide all properties which invalidate the definition.
pie.model.prototype.compute = function(/* name, fn[, prop1, prop2 ] */) {
  var props = pie.array.args(arguments),
  name = props.shift(),
  fn = props.shift();

  this.observe(function(changes){
    this.set(name, fn.call(this));
  }.bind(this), props);

  // initialize it
  this.set(name, fn.call(this));
};




pie.list = function(array, options) {
  array = array || [];
  pie.model.call(this, {items: array}, options);
};


pie.list.prototype = Object.create(pie.model.prototype);


pie.list.prototype._normalizedIndex = function(wanted) {
  wanted = parseInt(wanted, 10);
  if(!isNaN(wanted) && wanted < 0) wanted += this.data.items.length;
  return wanted;
};


pie.list.prototype._trackMutations = function(skipObservers, fn) {
  var oldLength = this.data.items.length,
  changes = [fn.call()],
  newLength = this.data.items.length;

  if(oldLength !== newLength) {
    changes.push({
      name: 'length',
      type: 'update',
      object: this.data.items,
      oldValue: oldLength,
      value: newLength
    });
  }

  this.changeRecords = this.changeRecords.concat(changes);

  if(skipObservers) return this;
  return this.deliverChangeRecords();
};


pie.list.prototype.forEach = function(f) {
  return this.get('items').forEach(f);
};


pie.list.prototype.get = function(key) {
  var idx = this._normalizedIndex(key), path;

  if(isNaN(idx)) path = key;
  else path = 'items.' + idx;

  return this._super('get', path);
};


pie.list.prototype.indexOf = function(value) {
  return this.get('items').indexOf(value);
},


pie.list.prototype.insert = function(key, value, skipObservers) {
  var idx = this._normalizedIndex(key);

  return this._trackMutations(skipObservers, function(){
    var change = {
      name: String(idx),
      object: this.data.items,
      type: 'add',
      oldValue: this.data.items[idx],
      value: value
    };

    this.data.items.splice(idx, 0, value);

    return change;
  }.bind(this));
};


pie.list.prototype.length = function() {
  return this.get('items.length');
};


pie.list.prototype.push = function(value, skipObservers) {
  return this._trackMutations(skipObservers, function(){
    var change = {
      name: String(this.data.items.length),
      object: this.data.items,
      type: 'add',
      value: value,
      oldValue: undefined
    };

    this.data.items.push(value);

    return change;
  }.bind(this));
};


pie.list.prototype.remove = function(key, skipObservers) {
  var idx = this._normalizedIndex(key);

  return this._trackMutations(skipObservers, function(){
    var change = {
      name: String(idx),
      object: this.data.items,
      type: 'delete',
      oldValue: this.data.items[idx],
      value: undefined
    };

    this.data.items.splice(idx, 1);

    return change;
  }.bind(this));
};


pie.list.prototype.set = function(key, value, skipObservers) {
  var idx = this._normalizedIndex(key);

  if(isNaN(idx)) {
    return this._super('set', key, value, skipObservers);
  }

  return this._trackMutations(skipObservers, function(){
    var change = {
      name: String(idx),
      object: this.data.items,
      type: 'update',
      oldValue: this.data.items[idx]
    };

    this.data.items[idx] = change.value = value;

    return change;
  }.bind(this));
};


pie.list.prototype.shift = function(skipObservers) {
  return this._trackMutations(skipObservers, function(){
    var change = {
      name: '0',
      object: this.data.items,
      type: 'delete'
    };

    change.oldValue = this.data.items.shift();
    change.value = this.data.items[0];

    return change;
  }.bind(this));
};


pie.list.prototype.unshift = function(value, skipObservers) {
  return this.insert(0, value, skipObservers);
};
// The, ahem, base view.
// pie.view manages events delegation, provides some convenience methods, and some <form> standards.
pie.view = function(app, options) {
  this.app = app;
  this.options = options || {};
  this.el = this.options.el || pie.dom.createElement('<div />');
  this.uid = pie.unique();
  this.changeCallbacks = [];
};

pie.object.extend(pie.view.prototype, pie.mixins.inheritance);
pie.object.extend(pie.view.prototype, pie.container);
pie.object.extend(pie.view.prototype, pie.mixins.bindings);


// placeholder for default functionality
pie.view.prototype.addedToParent = function(){
  return this;
};


// all events observed using view.on() will use the unique namespace for this instance.
pie.view.prototype.eventNamespace = function() {
  return 'view'+ this.uid;
};


// add or remove the default loading style.
pie.view.prototype.loadingStyle = function(bool) {
  if(bool === undefined) bool = true;
  this._loadingStyle(bool);
};


pie.view.prototype.navigationUpdated = function() {
  this.children().forEach(function(c){
    if('navigationUpdated' in c) c.navigationUpdated();
  });
};


// Events should be observed via this .on() method. Using .on() ensures the events will be
// unobserved when the view is removed.
pie.view.prototype.on = function(e, sel, f) {
  var ns = this.eventNamespace(),
      f2 = function(e){
        if(e.namespace === ns) {
          return f.apply(this, arguments);
        }
      };

  e.split(' ').forEach(function(ev) {
    ev += "." + ns;
    $(this.el).on(ev, f2, sel);
  }.bind(this));

  return this;
};


// Observe changes to an observable, unobserving them when the view is removed.
// If the object is not observable, the observable extensions will automatically
// be extended in.
pie.view.prototype.onChange = function() {
  var observable = arguments[0], args = pie.array.args(arguments).slice(1);
  if(!('observe' in observable)) throw new Error("Observable does not respond to observe");

  this.changeCallbacks.push([observable, args]);
  observable.observe.apply(observable, args);
};


// If the first option passed is a node, it will use that as the query scope.
// Return an object representing the values of fields within this.el.
pie.view.prototype.parseFields = function() {
  var o = {}, e = arguments[0], i = 0, n, el;

  if('string' === typeof e) {
    e = this.el;
  } else {
    i++;
  }

  for(;i<arguments.length;i++) {
    n = arguments[i];
    el = e.querySelector('[name="' + n + '"]:not([disabled])');
    if(el) pie.object.setPath(o, n, el.value);
  }
  return o;
};

// shortcut for this.el.querySelector
pie.view.prototype.qs = function(selector) {
  return this.el.querySelector(selector);
};

// shortcut for this.el.querySelectorAll
pie.view.prototype.qsa = function(selector) {
  return this.el.querySelectorAll(selector);
};


// clean up.
pie.view.prototype.removedFromParent = function() {
  this._unobserveEvents();
  this._unobserveChangeCallbacks();

  // views remove their children upon removal.
  this.removeChildren();

  return this;
};


// convenience method which is useful for ajax callbacks.
pie.view.prototype.removeLoadingStyle = function(){
  this._loadingStyle(false);
};


// release all observed events.
pie.view.prototype._unobserveEvents = function() {
  $(this.el).off('*.' + this.eventNamespace());
  $(document.body).off('*.' + this.eventNamespace());
};


// release all change callbacks.
pie.view.prototype._unobserveChangeCallbacks = function() {
  var a;
  while(this.changeCallbacks.length) {
    a = this.changeCallbacks.pop();
    a[0].unobserve.apply(a[0], a[1]);
  }
};


// this.el receives a loading class, specific buttons are disabled and provided with the btn-loading class.
pie.view.prototype._loadingStyle = function(bool) {
  this.el.classList[bool ? 'add' : 'remove']('loading');
  $(this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable')).
    all(bool ? 'classList.add' : 'classList.remove', 'btn-loading').
    all(bool ? 'setAttribute' : 'removeAttribute', 'disabled', 'disabled');
};
pie.simpleView = function simpleView(app, options) {
  pie.view.call(this, app, options);
};

pie.simpleView.prototype = Object.create(pie.view.prototype);
pie.simpleView.prototype.constructor = pie.simpleView;

pie.simpleView.prototype.addedToParent = function(parent) {
  pie.view.prototype.addedToParent.call(this, parent);

  if(this.options.autoRender && this.model) {
    var field = typeof this.options.autoRender === 'string' ? this.options.autoRender : 'updated_at';
    this.onChange(this.model, this.render.bind(this), field);
  }

  if(this.options.renderOnAddedToParent) {
    this.render();
  }

  return this;
};

pie.simpleView.prototype.removedFromParent = function(parent) {
  pie.view.prototype.removedFromParent.call(this, parent);

  // remove our el if we still have a parent node.
  if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
}

pie.simpleView.prototype.renderData = function() {
  if(this.model) {
    return this.model.data;
  }

  return {};
};

pie.simpleView.prototype.render = function() {

  if(this.options.template) {
    var content = this.app.template(this.options.template, this.renderData());
    this.el.innerHTML = content;
  }

  return this;
};
pie.services.ajax = function ajax(app) {
  this.app = app;
  this.defaultAjaxOptions = {};
};


// default ajax options. override this method to
pie.services.ajax.prototype._defaultAjaxOptions = function() {
  return pie.object.extend({}, this.defaultAjaxOptions, {
    dataType: 'json',
    type: 'GET',
    error: this.app.errorHandler.handleXhrError
  });
};


// interface for conducting ajax requests.
// app.ajax.post({
//  url: '/login',
//  data: { email: 'xxx', password: 'yyy' },
//  progress: this.progressCallback.bind(this),
//  success: this.
// })
pie.services.ajax.prototype.ajax = function(options) {

  options = pie.object.compact(options);
  options = pie.object.extend({}, this._defaultAjaxOptions(), options);

  if(options.extraError) {
    var oldError = options.error;
    options.error = function(xhr){ oldError(xhr); options.extraError(xhr); };
  }

  var app = this.app, xhr = new XMLHttpRequest(), url = options.url, d;

  if(options.type === 'GET' && options.data) {
    url = app.router.path(url, options.data);
  } else {
    url = app.router.path(url);
  }

  if(options.progress) {
    xhr.addEventListener('progress', options.progress, false);
  } else if(options.uploadProgress) {
    xhr.upload.addEventListener('progress', options.uploadProgress, false);
  }

  xhr.open(options.type, url, true);

  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');

  this._applyCsrfToken(xhr);

  xhr.onload = function() {
    if(options.tracker) options.tracker(this);

    try{
      this.data = this.responseText.trim().length ? JSON.parse(this.responseText) : {};
    } catch(err) {
      app.debug("could not parse JSON response: " + err);
      this.data = {};
    }

    if(this.status >= 200 && this.status < 300 || this.status === 304) {
      if(options.dataSuccess) options.dataSuccess(this.data);
      if(options.success) options.success(this.data, this);
    } else if(options.error){
      options.error(this);
    }

    if(options.complete) options.complete(this);
  };

  if(options.type !== 'GET') {
    d = options.data ? (typeof options.data === 'string' ? options.data : JSON.stringify(pie.object.compact(options.data))) : undefined;
  }

  xhr.send(d);
  return xhr;
};

pie.services.ajax.prototype.get = function(options) {
  options = pie.object.extend({type: 'GET'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype.post = function(options) {
  options = pie.object.extend({type: 'POST'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype.put = function(options) {
  options = pie.object.extend({type: 'PUT'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype.del = function(options) {
  options = pie.object.extend({type: 'DELETE'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype._applyCsrfToken = function(xhr) {
  var tokenEl = document.querySelector('meta[name="csrf-token"]'),
  token = tokenEl ? tokenEl.getAttribute('content') : null;
  if(token) {
    xhr.setRequestHeader('X-CSRF-Token', token);
  }
};
pie.services.errorHandler = function errorHandler(app) {
  this.app = app;
  this.responseCodeHandlers = {};
};


// extract the "data" object out of an xhr
pie.services.errorHandler.prototype.data = function(xhr) {
  return xhr.data = xhr.data || (xhr.status ? JSON.parse(xhr.response) : {});
};


// extract an error message from a response. Try to extract the error message from
// the xhr data diretly, or allow overriding by response code.
pie.services.errorHandler.prototype.errorMessagesFromRequest = function(xhr) {
  var d = this.data(xhr),
  errors  = pie.array.map(d.errors || [], 'message'),
  clean;

  errors = pie.array.compact(errors, true);
  clean   = this.app.i18n.t('app.errors.' + xhr.status, {default: errors});

  this.app.debug(errors);

  return pie.array.from(clean);
};

// find a handler for the xhr via response code or the app default.
pie.services.errorHandler.prototype.handleXhrError = function(xhr) {

  var handler = this.responseCodeHandlers[xhr.status.toString()];

  if(handler) {
    handler.call(xhr, xhr);
  } else {
    this.notifyErrors(xhr);
  }

};

// build errors and send them to the notifier.
pie.services.errorHandler.prototype.notifyErrors = function(xhr){
  var n = this.app.notifier, errors = this.errorMessagesFromRequest(xhr);

  if(errors.length) {
    // clear all alerts when an error occurs.
    n.clear();

    // delay so UI will visibly change when the same content is shown.
    setTimeout(function(){
      n.clear('error');
      n.notify(errors, 'error', 10000);
    }, 100);
  }
};


// register a response code handler
// registerHandler('401', myRedirectCallback);
pie.services.errorHandler.prototype.registerHandler = function(responseCode, handler) {
  this.responseCodeHandlers[responseCode.toString()] = handler;
};


// provide an interface for sending errors to a bug reporting service.
pie.services.errorHandler.prototype.reportError = function(err, options) {
  options = options || {};

  if(options.prefix && 'message' in err) {
    err.message = options.prefix + ' ' + err.message;
  }

  if(options.prefix && 'name' in err) {
    err.name = options.prefix + ' ' + err.name;
  }

  this._reportError(err, options);
};


// hook in your own error reporting service. bugsnag, airbrake, etc.
pie.services.errorHandler.prototype._reportError = function(err) {
  this.app.debug(err);
};
// made to be used as an instance so multiple translations could exist if we so choose.
pie.services.i18n = function i18n(app) {
  this.translations = {};
  this.app = app;
};


pie.services.i18n.prototype._ampm = function(num) {
  return num >= 12 ? 'pm' : 'am';
};


pie.services.i18n.prototype._countAlias = {
  '0' : 'zero',
  '1' : 'one',
  '-1' : 'negone'
};


pie.services.i18n.prototype._dayName = function(d) {
  return this.t('app.time.day_names.' + d);
};


pie.services.i18n.prototype._hour = function(h) {
  if(h > 12) h -= 12;
  if(!h) h += 12;
  return h;
};


pie.services.i18n.prototype._isoDate = function(t, convertToUtc) {
  if(convertToUtc) t = this._utc(t);
  return t.getFullYear() + '-' + this._pad(t.getMonth() + 1, 2, '0') + '-' + this._pad(t.getDate(), 2, '0');
};


pie.services.i18n.prototype._isoTime = function(t) {
  t = this._utc(t);
  return  this._pad(t.getHours(), 2, '0') + ':' +
          this._pad(t.getMinutes(), 2, '0') + ':' +
          this._pad(t.getSeconds(), 2, '0') + '.' +
          this._pad(t.getMilliseconds(), 3, '0') +
          'Z';
};


pie.services.i18n.prototype._monthName = function(m) {
  return this.t('app.time.month_names.' + m);
};


pie.services.i18n.prototype._nestedTranslate = function(t, data) {
  return t.replace(/\$\{([^\}]+)\}/, function(match, path) {
    return this.translate(path, data);
  }.bind(this));
},


// assumes that dates either come in as dates, iso strings, or epoch timestamps
pie.services.i18n.prototype._normalizedDate = function(d) {
  if(String(d).match(/^\d+$/)) {
    d = parseInt(d, 10);
    if(String(d).length < 13) d *= 1000;
    d = new Date(d);
  } else if(typeof d === 'string') {
    d = pie.date.timeFromISO(d);
  } else {
    // let the system parse
    d = new Date(d);
  }
  return d;
},


pie.services.i18n.prototype._shortDayName = function(d) {
  return this.t('app.time.short_day_names.' + d) || this._dayName(d).slice(0, 3);
};


pie.services.i18n.prototype._shortMonthName = function(m) {
  return this.t('app.time.short_month_names.' + m) || this._monthName(m).slice(0, 3);
};


pie.services.i18n.prototype._pad = function(num, cnt, pad) {
  var s = '',
      p = cnt - num.toString().length;
  if(pad === undefined) pad = ' ';
  while(p>0){
    s += pad;
    p -= 1;
  }
  return s + num.toString();
};


pie.services.i18n.prototype._timezoneAbbr = function(date) {
  var str = date && date.toString();
  return str && str.split(/\((.*)\)/)[1];
},


pie.services.i18n.prototype._utc = function(t) {
  var t2 = new Date(t.getTime());
  t2.setMinutes(t2.getMinutes() + t2.getTimezoneOffset());
  return t2;
};


pie.services.i18n.prototype.load = function(data, shallow) {
  var f = shallow ? pie.object.extend : pie.object.deepExtend;
  f.call(null, this.translations, data);
};


pie.services.i18n.prototype.translate = function(path, data) {
  var translation = pie.object.getPath(this.translations, path), count;

  if (data && data.hasOwnProperty('count') && typeof translation === 'object') {
    count = (data.count || 0).toString();
    count = this._countAlias[count] || (count > 0 ? 'other' : 'negother');
    translation = translation[count] === undefined ? translation.other : translation[count];
  }

  if(!translation) {

    if(data && data.hasOwnProperty('default')) {
      translation = data.default;
    } else {
      this.app.debug("Translation not found: " + path);
      return "";
    }
  }


  if(typeof translation === 'string') {

    translation = translation.indexOf('${') === -1 ? translation : this._nestedTranslate(translation, data);
    return translation.indexOf('%{') === -1 ? translation : pie.string.expand(translation, data);
  }

  return translation;
};


pie.services.i18n.prototype.timeago = function(t, now, scope) {
  t = this._normalizedDate(t).getTime()  / 1000;
  now = this._normalizedDate(now || new Date()).getTime() / 1000;

  var diff = now - t, c;

  scope = scope || 'app';

  if(diff < 60) { // less than a minute
    return this.t(scope + '.timeago.now', {count: diff});
  } else if (diff < 3600) { // less than an hour
    c = Math.floor(diff / 60);
    return this.t(scope + '.timeago.minutes', {count: c});
  } else if (diff < 86400) { // less than a day
    c = Math.floor(diff / 3600);
    return this.t(scope + '.timeago.hours', {count: c});
  } else if (diff < 86400 * 7) { // less than a week (
    c = Math.floor(diff / 86400);
    return this.t(scope + '.timeago.days', {count: c});
  } else if (diff < 86400 * 30) { // less than a month
    c = Math.floor(diff / (86400 * 7));
    return this.t(scope + '.timeago.weeks', {count: c});
  } else if (diff < 86500 * 365.25) { // less than a year
    c = Math.floor(diff / (86400 * 365.25 / 12));
    return this.t(scope + '.timeago.months', {count: c});
  } else {
    c = Math.floor(diff / (86400 * 365.25));
    return this.t(scope + '.timeago.years', {count: c});
  }
};

// pass in the date instance and the string 'format'
pie.services.i18n.prototype.strftime = function(date, f) {
  date = this._normalizedDate(date);

  // named format from translations.time.
  if(f && f.charAt(0) !== '%') f = this.t('app.time.formats.' + f);

  var weekDay           = date.getDay(),
      day               = date.getDate(),
      year              = date.getFullYear(),
      month             = date.getMonth() + 1,
      hour              = date.getHours(),
      hour12            = this._hour(hour),
      meridian          = this._ampm(hour),
      secs              = date.getSeconds(),
      mins              = date.getMinutes(),
      offset            = date.getTimezoneOffset(),
      absOffsetHours    = Math.floor(Math.abs(offset / 60)),
      absOffsetMinutes  = Math.abs(offset) - (absOffsetHours * 60),
      timezoneoffset    = (offset > 0 ? "-" : "+") + this._pad(absOffsetHours, 2, '0') + this._pad(absOffsetMinutes, 2, '0');

  f = f.replace("%a", this._shortDayName(weekDay))
      .replace("%A",  this._dayName(weekDay))
      .replace("%b",  this._shortMonthName(month - 1))
      .replace("%d",  this._pad(day, 2, '0'))
      .replace("%e",  this._pad(day, 2, ' '))
      .replace("%-d", day)
      .replace("%H",  this._pad(hour, 2, '0'))
      .replace("%k",  hour)
      .replace("%I",  this._pad(hour12, 2, '0'))
      .replace("%l",  hour12)
      .replace("%m",  this._pad(month, 2, '0'))
      .replace("%-m", month)
      .replace("%M",  this._pad(mins, 2, '0'))
      .replace("%p",  meridian.toUpperCase())
      .replace("%P",  meridian)
      .replace("%S",  this._pad(secs, 2, '0'))
      .replace("%-S", secs)
      .replace("%w",  weekDay)
      .replace("%y",  this._pad(year % 100))
      .replace("%Y",  year)
      .replace("%z",  timezoneoffset)
      .replace("%Z",  this._timezoneAbbr(date));

  return f;
};

pie.services.i18n.prototype.t = pie.services.i18n.prototype.translate;
pie.services.i18n.prototype.l = pie.services.i18n.prototype.strftime;
pie.services.navigator = function(app) {
  this.app = app;
  pie.model.prototype.constructor.call(this, {});
};

pie.services.navigator.prototype = Object.create(pie.model.prototype);


pie.services.navigator.prototype.go = function(path, params, replace) {
  var url = path;

  params = params || {};

  if(this.get('path') === path && this.get('query') === params) {
    return this;
  }

  if(Object.keys(params).length) {
    url += '?';
    url += $.serialize(params);
  }

  window.history[replace ? 'replaceState' : 'pushState']({}, document.title, url);

  return this.setDataFromLocation();
};


pie.services.navigator.prototype.start = function() {
  return this.setDataFromLocation();
};

pie.services.navigator.prototype.setDataFromLocation = function() {
  var query = window.location.search.slice(1);
  query = pie.string.deserialize(query);

  this.sets({
    url: window.location.href,
    path: window.location.pathname,
    query: query
  });

  return this;
};
// notifier is a class which provides an interface for rendering page-level notifications.
pie.services.notifier = function notifier(app) {
  pie.view.prototype.constructor.call(this);
  this.app = app;
  this.notifications = {};
};

pie.services.notifier.prototype = Object.create(pie.view.prototype);


pie.services.notifier.prototype.addedToParent = function() {
  this.on('click', '.page-alert', this.handleAlertClick.bind(this));
};


// remove all alerts, potentially filtering by the type of alert.
pie.services.notifier.prototype.clear = function(type) {
  if(type) {
    var nodes = this.notifications[type] || [];
    while(nodes.length) {
      this.remove(nodes[nodes.length-1]);
    }
  } else {
    while(this.el.childNodes.length) {
      this.remove(this.el.childNodes[0]);
    }
  }
};

// Show a notification or notifications.
// Messages can be a string or an array of messages.
// Multiple messages will be shown in the same notification, but on separate lines.
// You can choose to close a notification automatically by providing `true` as the third arg.
// You can provide a number in milliseconds as the autoClose value as well.
pie.services.notifier.prototype.notify = function(messages, type, autoClose) {
  type = type || 'message';
  autoClose = this.getAutoCloseTimeout(autoClose);

  messages = pie.array.from(messages);

  var content = this.app.template('alert', {"type" : type, "messages": messages});
  content = pie.dom.createElement(content);

  this.notifications[type] = this.notifications[type] || [];
  this.notifications[type].push(content);

  content._pieNotificationType = type;
  this.el.insertBefore(content, this.el.firstElementChild);

  if(autoClose) {
    setTimeout(function(){
      this.remove(content);
    }.bind(this), autoClose);
  }

};

pie.services.notifier.prototype.getAutoCloseTimeout = function(autoClose) {
  if(autoClose === undefined) autoClose = true;
  if(autoClose && typeof autoClose !== 'number') autoClose = 7000;
  return autoClose;
};

pie.services.notifier.prototype.remove = function(el) {
  var type = el._pieNotificationType;
  if(type) {
    pie.array.remove(this.notifications[type] || [], el);
  }
  $(el).remove();
};

// remove the alert that was clicked.
pie.services.notifier.prototype.handleAlertClick = function(e) {
  this.remove(e.delegateTarget);
  e.preventDefault();
};
pie.services.router = function(app) {
  this.app = app;
  this.routes = {};
  this.namedRoutes = {};
};



// get a url based on the current one but with the changes provided.
// this will even catch interpolated values.
// Given a named route: /things/page/:page.json
// And the current path == /things/page/1.json?q=test
// app.changedUrl({page: 3, q: 'newQuery'});
// # => /things/page/3.json?q=newQuery
pie.services.router.prototype.changedUrl = function(changes) {
  var current = this.app.parsedUrl;
  return this.router.path(current.name || current.path, pie.object.extend({}, current.interpolations, current.query, changes));
},


// normalize a path to be evaluated by the router
pie.services.router.prototype.normalizePath = function(path) {

  // ensure there's a leading slash
  if(path.charAt(0) !== '/') {
    path = '/' + path;
  }

  if(path.indexOf('?') > 0) {
    var split = path.split('?');
    path = this.normalizePath(split.shift());
    split.unshift(path);
    path = split.join('?');
  }

  // remove trailing hashtags
  if(path.charAt(path.length - 1) === '#') {
    path = path.substr(0, path.length - 1);
  }

  // remove trailing slashes
  if(path.charAt(path.length - 1) === '/') {
    path = path.substr(0, path.length - 1);
  }

  // remove

  return path;
},


// invoke to add routes to the routers routeset.
// routes objects which contain a "name" key will be added as a name lookup.
// you can pass a set of defaults which will be extended into each route object.
pie.services.router.prototype.route = function(routes, defaults){
  defaults = defaults || {};

  // remove the cache
  delete this._routeKeys;

  pie.object.forEach(routes, function(k,r) {

    if('object' === typeof r) {

      k = this.normalizePath(k);

      this.routes[k] = pie.object.extend({}, defaults, r);

      if(r.hasOwnProperty('name')) {
        this.namedRoutes[r.name] = k;
      }
    } else {
      this.namedRoutes[k] = r;
    }
  }.bind(this));
};

// will return the named path. if there is no path with that name it will return itself.
// you can optionally pass a data hash and it will build the path with query params or
// with path interpolation path("/foo/bar/:id", {id: '44', q: 'search'}) => "/foo/bar/44?q=search"
pie.services.router.prototype.path = function(nameOrPath, data, interpolateOnly) {
  var o = this.namedRoutes[nameOrPath],
  s = ('string' === typeof o) ? o : nameOrPath,
  usedKeys = [],
  params,
  unusedData;

  data = data || {};
  s = this.normalizePath(s);

  s = s.replace(/\:([a-zA-Z0-9_]+)/g, function(match, key){
    usedKeys.push(key);
    if(data[key] === undefined || data[key] === null || data[key].toString().length === 0) {
      throw new Error("[PIE] missing route interpolation: " + match);
    }
    return data[key];
  });

  unusedData = pie.object.except(data, usedKeys);
  params = pie.object.serialize(pie.object.compact(unusedData, true));

  if(!interpolateOnly && params.length) {
    s = pie.string.urlConcat(s, params);
  }

  return s;

};

// provides the keys of the routes in a sorted order relevant for matching most descriptive to least
pie.services.router.prototype.routeKeys = function() {
  if(this._routeKeys) return this._routeKeys;
  this._routeKeys = Object.keys(this.routes);

  var ac, bc, c, d = [];

  // sorts the route keys to be the most exact to the most generic
  this._routeKeys.sort(function(a,b) {
    ac = (a.match(/:/g) || d).length;
    bc = (b.match(/:/g) || d).length;
    c = ac - bc;
    c = c || (b.length - a.length);
    c = c || (ac < bc ? 1 : (ac > bc ? -1 : 0));
    return c;
  });

  return this._routeKeys;
};

// look at the path and determine the route which this matches.
pie.services.router.prototype.parseUrl = function(path) {

  var keys = this.routeKeys(),
    i = 0,
    j, key, match, splitUrl, splitKey, query,
    interpolations, fullPath, pieces;

  pieces = path.split('?');

  path = pieces.shift();
  path = this.normalizePath(path);

  query = pieces.join('&') || '';

  // a trailing slash will bork stuff
  if (path.length > 1 && path[path.length - 1] === '/') path = path.slice(0, -1);

  // is there an explicit route for this path? it wins if so
  match = this.routes[path];
  interpolations = {};
  splitUrl = path.split('/');

  if(match) {
    match = pie.object.extend({routeKey: path}, match);
  } else {
    while (i < keys.length && !match) {
      key = keys[i];

      if(typeof this.routes[key] !== 'object') {
        i++;
        continue;
      }

      this.routes[key].regex = this.routes[key].regex || new RegExp('^' + key.replace(/(:[^\/]+)/g,'([^\\/]+)') + '$');

      if (this.routes[key].regex.test(path)) {
        match = pie.object.extend({routeKey: key}, this.routes[key]);
        splitKey = key.split('/');
        for(j = 0; j < splitKey.length; j++){
          if(/^:/.test(splitKey[j])) {
            interpolations[splitKey[j].replace(/^:/, '')] = splitUrl[j];
            match[splitKey[j]] = splitUrl[j];
          }
        }
      }
      i++;
    }
  }

  query = pie.string.deserialize(query);
  fullPath = pie.array.compact([path, pie.object.serialize(query)], true).join('?');

  return pie.object.extend({
    interpolations: interpolations,
    path: path,
    query: query,
    fullPath: fullPath
  }, match);
};

// operator of the site. contains a router, navigator, etc with the intention of holding page context.
pie.app = function app(options) {

  // general app options
  this.options = pie.object.deepExtend({
    uiTarget: 'body',
    viewNamespace: 'lib.views',
    notificationUiTarget: '.notification-container'
  }, options);

  var classOption = function(key, _default){
    var k = this.options[key] || _default;
    return new k(this);
  }.bind(this);

  // app.i18n is the translation functionality
  this.i18n = classOption('i18n', pie.services.i18n);
  this.addChild('i18n', this.i18n);

  // app.ajax is ajax interface + app specific functionality.
  this.ajax = classOption('ajax', pie.services.ajax);
  this.addChild('ajax', this.ajax);

  // app.notifier is the object responsible for showing page-level notifications, alerts, etc.
  this.notifier = classOption('notifier', pie.services.notifier);
  this.addChild('notifier', this.notifier);

  // app.errorHandler is the object responsible for
  this.errorHandler = classOption('errorHandler', pie.services.errorHandler);
  this.addChild('errorHandler', this.errorHandler);

  // app.router is used to determine which view should be rendered based on the url
  this.router = classOption('router', pie.services.router);
  this.addChild('router', this.router);


  // the only navigator which should exist in this app.
  this.navigator = classOption('navigator', pie.services.navigator);
  this.addChild('navigator', this.navigator);

  // app.models is globally available. app.models is solely for page context.
  // this is not a singleton container or anything like that. it's just for passing
  // models from one view to the next. the rendered layout may inject values here to initialize the page.
  // after each navigation change, this.models is reset.
  this.models = {};

  // app._templates should not be used. app.template() should be the public interface.
  this._templates = {};

  // after a navigation change, app.parsedUrl is the new parsed route
  this.parsedUrl = {};

  // the functions to invoke as part of the app's lifecycle. see app.on().
  this.eventCallbacks = {};
  this.triggeredEvents = [];

  // we observe the navigator and handle changing the context of the page
  this.navigator.observe(this.navigationChanged.bind(this), 'url');

  this.on('beforeStart', this.showStoredNotifications.bind(this));
  this.on('beforeStart', this.setupSinglePageLinks.bind(this));
  this.on('beforeStart', this.setupNotifier.bind(this));

  // once the dom is loaded
  document.addEventListener('DOMContentLoaded', this.start.bind(this));
};


pie.object.extend(pie.app.prototype, pie.container);


// just in case the client wants to override the standard confirmation dialog.
// eventually this could create a confirmation view and provide options to it.
// the view could have more options but would always end up invoking success or failure.
pie.app.prototype.confirm = function(options) {
  if(window.confirm(options.text)) {
    if(options.success) options.success();
  } else {
    if(options.failure) options.failure();
  }
};


// print stuff if we're not in prod.
pie.app.prototype.debug = function(msg) {
  if(this.env === 'production') return;
  if(console && console.log) console.log('[PIE] ' + msg);
};

// use this to navigate. This allows us to apply app-specific navigation logic
// without altering the underling navigator.
// This can be called with just a path, a path with a query object, or with notification arguments.
// app.go('/test-url')
// app.go('/test-url', true) // replaces state rather than adding
// app.go(['/test-url', {foo: 'bar'}]) // navigates to /test-url?foo=bar
// app.go('/test-url', true, 'Thanks for your interest') // replaces state with /test-url and shows the provided notification
// app.go('/test-url', 'Thanks for your interest') // navigates to /test-url and shows the provided notification
pie.app.prototype.go = function(){
  var args = pie.array.args(arguments), path, notificationArgs, replaceState, query;

  path = args.shift();

  // arguments => '/test-url', '?query=string'
  if(typeof args[0] === 'string' && args[0].indexOf('?') === 0) {
    path = this.router.path(path);
    query = args.shift();
    path = pie.string.urlConcat(this.router.path(path), query);
  // arguments => '/test-url', {query: 'object'}
  } else if(typeof args[0] === 'object') {
    path = this.router.path(path, args.shift());

  // arguments => '/test-url'
  // arguments => ['/test-url', {query: 'object'}]
  } else {
    path = this.router.path.apply(this.router, pie.array.from(path));
  }

  // if the next argument is a boolean, we care about replaceState
  if(args[0] === true || args[0] === false) {
    replaceState = args.shift();
  }

  // anything left is considered arguments for the notifier.
  notificationArgs = args;

  if(this.router.parseUrl(path).hasOwnProperty('view')) {
    this.navigator.go(path, replaceState);
    if(notificationArgs && notificationArgs.length) {
      this.notifier.notify.apply(this.notifier, notificationArgs);
    }
  } else {

    if(notificationArgs && notificationArgs.length) {
      this.store(this.notifier.storageKey, notificationArgs);
    }

    window.location.href = path;
  }
};


// go back one page.
pie.app.prototype.goBack = function() {
  window.history.back();
};


// callback for when a link is clicked in our app
pie.app.prototype.handleSinglePageLinkClick = function(e){
  // if the link is targeting something else, let the browser take over
  if(e.delegateTarget.getAttribute('target')) return;

  // if the user is trying to do something beyond navigate, let the browser take over
  if(e.ctrlKey || e.metaKey) return;


  var href = e.delegateTarget.getAttribute('href');

  // if we're going nowhere, somewhere else, or to an anchor on the page, let the browser take over
  if(!href || /^(#|[a-z]+:\/\/)/.test(href)) return;

  // ensure that relative links are evaluated as relative
  if(href.charAt(0) === '?') href = window.location.pathname + href;

  // great, we can handle it. let the app decide whether to use pushstate or not
  e.preventDefault();
  this.go(href);
};


// when we change urls
// we always remove the current before instantiating the next. this ensures are views can prepare
// context's in removedFromParent before the constructor of the next view is invoked.
pie.app.prototype.navigationChanged = function() {
  var target = document.querySelector(this.options.uiTarget),
    current  = this.getChild('currentView');

  // let the router determine our new url
  this.previousUrl = this.parsedUrl;
  this.parsedUrl = this.router.parseUrl(this.navigator.get('path'));

  if(this.previousUrl !== this.parsedUrl) {
    this.trigger('urlChanged');
  }

  // not necessary for a view to exist on each page.
  // Maybe the entry point is server generated.
  if(!this.parsedUrl.view) {
    return;
  }

  // if the view that's in there is already loaded, don't remove / add again.
  if(current && current._pieName === this.parsedUrl.view) {
    if('navigationUpdated' in current) current.navigationUpdated();
    return;
  }

  // remove the existing view if there is one.
  if(current) {
    this.removeChild(current);
    if(current.el.parentNode) current.el.parentNode.removeChild(current.el);
    this.on('oldViewRemoved');
  }

  // clear any leftover notifications
  this.notifier.clear();

  // use the view key of the parsedUrl to find the viewClass
  var viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + this.parsedUrl.view), child;
  // the instance to be added.

  // add the instance as our 'currentView'
  child = new viewClass(this);
  child._pieName = this.parsedUrl.view;
  this.addChild('currentView', child);
  target.appendChild(child.el);


  // remove the leftover model references
  this.models = {};

  // get us back to the top of the page.
  window.scrollTo(0,0);

  this.trigger('newViewLoaded');
};


// invoke fn when the event is triggered.
// if futureOnly is truthy the fn will only be triggered for future events.
// todo: allow once-only events.
pie.app.prototype.on = function(event, fn, futureOnly) {
  if(!futureOnly && ~this.triggeredEvents.indexOf(event)) {
    fn();
  } else {
    this.eventCallbacks[event] = this.eventCallbacks[event] || [];
    this.eventCallbacks[event].push(fn);
  }
};


// reload the page without reloading the browser.
// alters the current view's _pieName to appear as invalid for the route.
pie.app.prototype.refresh = function() {
  var current = this.getChild('currentView');
  current._pieName = '__remove__';
  this.navigationChanged();
};


// safely access localStorage, passing along any errors for reporting.
pie.app.prototype.retrieve = function(key, clear) {
  var encoded, decoded;

  try{
    encoded = window.localStorage.getItem(key);
    decoded = encoded ? JSON.parse(encoded) : undefined;
  }catch(err){
    this.errorHandler.reportError(err, {prefix: "[caught] app#retrieve/getItem:"});
  }

  try{
    if(clear || clear === undefined){
      window.localStorage.removeItem(key);
    }
  }catch(err){
    this.errorHandler.reportError(err, {prefix: "[caught] app#retrieve/removeItem:"});
  }

  return decoded;
};


// add the notifier's el to the page if possible
pie.app.prototype.setupNotifier = function() {
  var parent = document.querySelector(this.options.notificationUiTarget);
  if(parent) parent.appendChild(this.getChild('notifier').el);
};


// when a link is clicked, go there without a refresh if we recognize the route.
pie.app.prototype.setupSinglePageLinks = function() {
  $(document.body).on('click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
};


// show any notification which have been preserved via local storage.
pie.app.prototype.showStoredNotifications = function() {
  var encoded = this.retrieve(this.notifier.storageKey), decoded;

  if(encoded) {
    decoded = JSON.parse(encoded);
    this.on('afterStart', function(){
      this.notifier.notify.apply(this.notifier, decoded);
    }.bind(this));
  }
};


// start the app, apply fake navigation to the current url to get our navigation observation underway.
pie.app.prototype.start = function() {

  this.navigator.start();

  this.trigger('beforeStart');

  // invoke a nav change event on page load.
  var url = this.navigator.get('url');
  this.navigator.data.url = null;
  this.navigator.set('url', url);

  this.started = true;
  this.trigger('afterStart');
};


// safely access localStorage, passing along any errors for reporting.
pie.app.prototype.store = function(key, data) {
  try{
    window.localStorage.setItem(key, JSON.stringify(data));
  }catch(err){
    this.errorHandler.reportError(err, {prefix: "[caught] app#store:"});
  }
};


// compile templates on demand and evaluate them with `data`.
// Templates are assumed to be script tags with type="text/pie-template".
// Once compiled, the templates are cached in this._templates for later use.
pie.app.prototype.template = function(name, data) {
  if(!this._templates[name]) {

    var node = document.querySelector('script[id="' + name + '"][type="text/pie-template"]');

    if(node) {
      this.debug('Compiling and storing template: ' + name);
      this._templates[name] = pie.string.template(node.textContent);
    } else {
      throw new Error("[PIE] Unknown template error: " + name);
    }
  }

  data = data || {};

  return this._templates[name](data);
};


// trigger an event (string) on the app.
// any callbacks associated with that event will be invoked.
pie.app.prototype.trigger = function(event) {
  if(this.triggeredEvents.indexOf(event) < 0) {
    this.triggeredEvents.push(event);
  }

  (this.eventCallbacks[event] || []).forEach(function(f){
    f();
  });
};
