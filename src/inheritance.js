pie.inheritance = {

  _super: function() {
    var args = pie.array.args(arguments),
    name = args.shift(),
    obj = this,
    curr;

    if(args.length === 1 && args[0].toString() === "[object Arguments]") args = pie.array.args(args[0]);

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
