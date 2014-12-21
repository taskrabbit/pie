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
    var known = this.names(),
    wanted = pie.array.from(arguments);

    return pie.array.areAny(wanted, function(name) {
      return !!~known.indexOf(name);
    });
  },

  hasAll: function() {
    var known = this.names(),
    wanted = pie.array.from(arguments);
    return pie.array.areAll(wanted, function(name) {
      return !!~known.indexOf(name);
    });
  },

  names: function() {
    return pie.array.unique(pie.array.map(this, 'name'));
  }

};
