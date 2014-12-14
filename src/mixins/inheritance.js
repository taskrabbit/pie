pie.mixins.inheritance = {

  _construct: function() {
    var proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
    proto.constructor.apply(this, arguments);
  },

  _super: function() {
    var args = pie.array.from(arguments),
    name = args.shift(),
    obj = this,
    curr;

    if(args.length === 1 && String(args[0]) === "[object Arguments]") args = pie.array.from(args[0]);

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
