pie.mixins.changeSet = {

  has: function(name) {
    return pie.array.areAny(this, function(change) {
      return change.name === name;
    });
  },

  get: function(name) {
    return pie.array.detectLast(this, function(change) {
      return change.name === name;
    });
  },

  hasAny: function() {
    for(var i = 0; i < arguments.length; i++) {
      if(this.has(arguments[i])) return true;
    }
    return false;
  },

  hasAll: function() {
    for(var i = 0; i < arguments.length; i++) {
      if(!this.has(arguments[i])) return false;
    }
    return true;
  }

};
