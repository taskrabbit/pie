pie.inheritance = {

  _super: function() {
    var args = pie.array.args(arguments),
    name = args.shift(),
    obj = this,
    curr;

    while(true) {
      curr = Object.getPrototypeOf(obj);
      if(curr === obj) return;
      if(curr[name] && curr[name] !== this[name]) {
        return curr[name].apply(this, args);
      } else {
        obj = curr;
      }
    }
  }
};
