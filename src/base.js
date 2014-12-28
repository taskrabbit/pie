pie.base = function() {
  pie.setUid(this);
  this.init.apply(this, arguments);
};
pie.base.prototype.init = function(){};


pie.base.extend = function() {
  var args = pie.array.from(arguments);
  args.unshift(pie.base.prototype);
  return pie.base._extend.apply(null, args);
};

pie.base.reopen = function() {
  var args = pie.array.from(arguments);
  args.unshift(pie.base.prototype);
  return pie.base._reopen.apply(null, args);
};

pie.base._extend = function(/* parentProto, name?, initFn[, extension1, extension2 */) {
  var args = pie.array.from(arguments),
  parentProto = args.shift(),
  name = pie.object.isString(args[0]) ? args.shift() : "",
  init, child;

  if(pie.object.isFunction(args[0])) {
    init = args.shift();
  } else if (pie.object.isObject(args[0]) && args[0].init) {
    init = args[0].init;
    args[0] = pie.object.except(args[0], 'init');
  }

  if(!name && init && init.name) name = init.name;

  child = new Function(
    "return function " + name + "(){\n" +
    "  var myProto = Object.getPrototypeOf(this);\n" +
    "  var parentProto = Object.getPrototypeOf(myProto);\n" +
    "  parentProto.constructor.apply(this, arguments);\n" +
    "};"
  )();

  child.prototype = Object.create(parentProto);
  child.prototype.className = name;

  if(init) child.prototype.init = pie.base._wrap(init, child.prototype.init);

  child.extend = function() {
    var extendArgs = pie.array.from(arguments);
    extendArgs.unshift(child.prototype);
    return pie.base._extend.apply(null, extendArgs);
  };

  child.reopen = function() {
    var reopenArgs = pie.array.from(arguments);
    reopenArgs.unshift(child.prototype);
    return pie.base._reopen.apply(null, reopenArgs);
  };

  if(args.length) child.reopen.apply(null, args);

  return child;
};

pie.base._reopen = function(/* proto, extensions[, extension2] */) {
  var extensions = pie.array.from(arguments),
  proto = extensions.shift();

  extensions = pie.array.compact(pie.array.flatten(extensions), true);

  extensions.forEach(function(ext) {
    pie.object.forEach(ext, function(k,v) {
      proto[k] = pie.base._wrap(v, proto[k]);
    });
  });
};

pie.base._wrap = function(newF, oldF) {
  /* jslint eqnull:true */
  if(newF == null) return oldF;
  if(oldF == null) return newF;
  if(!pie.object.isFunction(newF)) return newF;

  return function superWrapper() {
    var ret, sup = this._super;
    this._super = oldF || function(){};
    ret = newF.apply(this, arguments);
    if(!sup) delete this._super;
    else this._super = sup;
    return ret;
  };

};
