pie.base = {

  schema: [{

    init: function(){},

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
    return pie.base._create(this.schema, arguments);
  },

  extend: function() {
    var that = this,
    extensions = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    name = pie.object.isString(extensions[0]) ? extensions.shift() : null;

    extensions = pie.array.flatten(extensions.map(function(e){
      if(e.__pieRole === 'class') return e.schema;
      return e;
    }));

    var schema = [this.schema, extensions];

    var o = {
      __className: name
    };

    o.schema = schema;
    o.__pieRole = 'class';

    o.extend = function(){ return that.extend.apply(this, arguments); };
    o.create = function(){ return that.create.apply(this, arguments); };
    o.reopen = function(){ return that.reopen.apply(this, arguments); };

    return o;
  },

  reopen: function() {
    var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
    extensions.forEach(function(e){
      this.schema.push(e);
    }.bind(this));
  },

  _create: function(schema, args) {
    var o = {};
    pie.setUid(o);

    pie.object.reopen(o, schema);

    o.init.apply(o, args);

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
