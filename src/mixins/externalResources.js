pie.mixins.externalResources = {

  loadExternalResources: function(/* res1, res2, res3, cb */) {
    var resources = pie.array.args(arguments),
    cb = resources.pop(),
    fns;

    resources = pie.array.change(resources, 'flatten', 'compact');

    fns = resources.map(function(r){
      return function(asyncCb){
        this.app.resources.load(r, asyncCb);
      }.bind(this);
    }.bind(this));

    pie.func.async(fns, cb);
    return void(0);
  }

};
