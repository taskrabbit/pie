pie.base = function() {
  pie.setUid(this);
  this.init.apply(this, arguments);
};
pie.base.prototype.init = function(){};

pie.base.prototype.reopen = function() {
  var extensions = pie.array.change(arguments, 'from', 'flatten');
  extensions.forEach(function(e) {
    pie.object.merge(this, pie.object.except(e, 'init'));
    if(e.init) e.init.call(this);
  }.bind(this));
  return this;
};


pie.base.extend = function() {
  return pie.base._extend(pie.base.prototype, arguments);
};

pie.base.reopen = function() {
  return pie.base._reopen(pie.base.prototype, arguments);
};

pie.base._extend = function(parentProto, extensions) {
  extensions = pie.array.change(extensions, 'from', 'flatten');

  var oldLength = extensions.length;
  extensions = pie.array.compact(extensions);

  if(extensions.length !== oldLength) throw new Error("Null values not allowed");

  var name = "", child;

  if(pie.object.isString(extensions[0])) {
    name = extensions.shift();
  }

  if(pie.object.isFunction(extensions[0])) {
    extensions.unshift({init: extensions.shift()});
  }

  if(!name) {
    name = pie.object.getPath(extensions[0], 'init.name') || '';
  }

  // function name collisions in IE tend to cause headaches.
  if(pie.browser.isIE) name = "";

  child = new Function(
    "return function " + name + "(){\n" +
    "  var myProto = Object.getPrototypeOf(this);\n" +
    "  var parentProto = Object.getPrototypeOf(myProto);\n" +
    "  parentProto.constructor.apply(this, arguments);\n" +
    "};"
  )();

  child.prototype = Object.create(parentProto);
  child.prototype.className = name;

  child.extend = function() {
    return pie.base._extend(child.prototype, arguments);
  };

  child.reopen = function() {
    return pie.base._reopen(child.prototype, arguments);
  };

  if(extensions.length) child.reopen(extensions);

  return child;
};

pie.base._reopen = function(proto, extensions) {
  extensions = pie.array.change(extensions, 'from', 'flatten', 'compact');
  extensions.forEach(function(ext) {
    pie.object.forEach(ext, function(k,v) {
      proto[k] = pie.base._wrap(v, proto[k]);
    });
  });
};

pie.base._wrap = (function() {

  var fnTest = /xyz/.test(function(){ "xyz"; });
  fnTest = fnTest ? /\b_super\b/ : /.*/;

  return function(newF, oldF) {
    /* jslint eqnull:true */

    // if we're not defining anything new, return the old definition.
    if(newF == null) return oldF;
    // if there is no old definition
    if(oldF == null) return newF;
    // if we're not overriding with a function
    if(!pie.object.isFunction(newF)) return newF;
    // if we're not overriding a function
    if(!pie.object.isFunction(oldF)) return newF;
    // if it doesn't call _super, don't bother wrapping.
    if(!fnTest.test(newF)) return newF;

    return function superWrapper() {
      var ret, sup = this._super;
      this._super = oldF;
      ret = newF.apply(this, arguments);
      if(!sup) delete this._super;
      else this._super = sup;
      return ret;
    };
  };
})();
