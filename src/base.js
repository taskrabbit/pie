pie.base = {

  schema: [{

    init: function(){},

    pieRole: 'object',

    reopen: function(){
      var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
      pie.object.reopen(this, extensions);
      extensions.forEach(function(ext) {
        if(ext.init) ext.init.call(this);
      }.bind(this));
      return this;
    }

  }],

  pieRole: 'class',

  create: function() {
    return pie.base._create(this.schema, arguments);
  },

  extend: function() {
    var that = this,
    schema = pie.array.dup(this.schema),
    extensions = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    name = pie.object.isString(extensions[0]) ? extensions.shift() : null;

    extensions = pie.array.flatten(extensions.map(function(e){
      if(e.pieRole === 'class') return e.schema;
      return e;
    }));

    schema = pie.array.unique(schema.concat(extensions));

    var o = {
      __className: name
    };

    o.schema = schema;
    o.pieRole = 'class';

    o.extend = function(){ return that.extend.apply(this, arguments); };
    o.create = function(){ return that.create.apply(this, arguments); };
    o.reopen = function(){ return that.reopen.apply(this, arguments); };

    return o;
  },

  reopen: function() {
    var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
    this.schema = pie.array.unique(this.schema.concat(extensions));
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
