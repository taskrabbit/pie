pie.base = {

  __schema: [{

    init: function(){
      pie.uid(this);
    },

    __pieRole: 'object',

    reopen: function(){
      var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
      pie.object.reopen(this, extensions);
      extensions.forEach(function(ext) {
        if(ext.init) ext.init.call(this);
      }.bind(this));
      return this;
    }

  }],

  __pieRole: 'class',

  create: function() {
    return pie.base._create(this, arguments);
  },

  extend: function() {
    var that = this,
    extensions = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    name = pie.object.isString(extensions[0]) ? extensions.shift() : null;

    extensions = pie.array.flatten(extensions.map(function(e){
      if(e.__pieRole === 'class') return e.__schema;
      return e;
    }));

    var schema = pie.array.unique([this.__schema, extensions, {__className: name}]);

    var o = {
      __className: name
    };

    o.__schema = schema;
    o.__pieRole = 'class';

    o.extend = function(){ return that.extend.apply(this, arguments); };
    o.create = function(){ return that.create.apply(this, arguments); };
    o.reopen = function(){ return that.reopen.apply(this, arguments); };

    return o;
  },

  reopen: function() {
    var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
    extensions.forEach(function(e){
      this.__schema.push(e);
    }.bind(this));
  },

  _create: function(clazz, args) {
    var schema = clazz.__schema;

    var o = {};
    pie.uid(o);

    pie.object.reopen(o, schema);

    o.init.apply(o, args);
    o.__class = clazz;

    if(!o.app) {
      if(o.options && o.options.app) o.app = o.options.app;
      else o.app = pie.appInstance;
    }

    // This enables objects to be assigned to a global variable to assist with debugging
    // Any pie object can define a debugName attribute or function and the value will be the name of the global
    // variable to which this object is assigned.
    if(o.debugName) {
      window.pieDebug = window.pieDebug || {};
      window.pieDebug[pie.fn.valueFrom(o.debugName)] = o;
    }

    return o;
  }
};
