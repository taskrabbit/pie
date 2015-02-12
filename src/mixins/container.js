pie.mixins.container = {

  init: function() {
    this.children = [];
    this.childNames = {};
    if(this._super) this._super.apply(this, arguments);
  },

  addChild: function(name, child) {
    var idx;

    this.children.push(child);
    idx = this.children.length - 1;

    this.childNames[name] = idx;
    child._indexWithinParent = idx;
    child._nameWithinParent = name;
    child.parent = this;

    if(pie.object.has(child, 'addedToParent', true)) child.addedToParent.call(child);

    return this;
  },

  addChildren: function(obj) {
    pie.object.forEach(obj, function(name, child) {
      this.addChild(name, child);
    }.bind(this));
  },

  getChild: function(obj) {
    /* jslint eqeq:true */
    if(obj == null) return;
    if(obj._nameWithinParent) return obj;

    var idx = this.childNames[obj];
    if(idx == null) idx = obj;

    // It's a path.
    if(String(idx).match(/\./)) {
      var steps = idx.split('.'),
      step, child = this;
      while(step = steps.shift()) {
        child = child.getChild(step);
        if(!child) return undefined;
      }

      return child;
    }

    return ~idx && this.children[idx] || undefined;
  },

  bubble: function() {
    var args = pie.array.from(arguments),
    fname = args.shift(),
    obj = this.parent;

    while(obj && !(fname in obj)) {
      obj = obj.parent;
    }

    if(obj) return obj[fname].apply(obj, args);
  },

  sendToChildren: function(/* fnName, arg1, arg2 */) {
    var allArgs = pie.array.change(arguments, 'from'),
    fnName = allArgs[0],
    args = allArgs.slice(1);

    this.children.forEach(function(child){
      if(pie.object.has(child, fnName, true)) child[fnName].apply(child, args);
      if(pie.object.has(child, 'sendToChildren', true)) child.sendToChildren.apply(child, allArgs);
    }.bind(this));
  },

  removeChild: function(obj) {
    var child = this.getChild(obj), i;

    if(child) {
      i = child._indexWithinParent;
      this.children.splice(i, 1);

      for(;i < this.children.length;i++) {
        this.children[i]._indexWithinParent = i;
        this.childNames[this.children[i]._nameWithinParent] = i;
      }

      // clean up
      delete this.childNames[child._nameWithinParent];
      delete child._indexWithinParent;
      delete child._nameWithinParent;
      delete child.parent;

      if(pie.object.has(child, 'removedFromParent', true)) child.removedFromParent.call(child, this);
    }

    return this;
  },

  removeChildren: function() {
    var child;

    while(child = this.children[this.children.length-1]) {
      this.removeChild(child);
    }

    return this;
  },

  __tree: function(indent) {
    indent = indent || 0;
    var pad = function(s, i){
      if(!i) return s;
      while(i-- > 0) s = " " + s;
      return s;
    };
    var str = "\n", nextIndent = indent + (indent ? 4 : 1);
    str += pad((indent ? '|- ' : '') + (this._nameWithinParent || this._indexWithinParent || this.className) + ' (' + (this.className || this.pieId) + ')', indent);

    this.children.forEach(function(child) {
      str += "\n" + pad('|', nextIndent);
      str += child.__tree(nextIndent);
    });

    if(!indent) str += "\n";

    return str;
  }
};
