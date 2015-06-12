// # Bindings Mixin
// A mixin to provide two way data binding between a model and dom elements.
// This mixin should be used with a pie view.
pie.mixins.bindings = {

  // The registration & configuration of bindings is kept in this._bindings.
  init: function() {
    this._bindings = [];
    if(this._super) this._super.apply(this, arguments);
  },

  // If we have an emitter, tap into the afterRender event and initialize the dom
  // with our model values.
  setup: function() {
    this.eon('setup', 'setupBindings');
    this.eon('afterRender', 'initBindings');

    this._super.apply(this);
  },

  // Register 1+ bindings within the view.
  //
  // ```
  // this.bind({ attr: 'first_name' }, { attr: 'last_name' })
  // ```;
  bind: function() {
    var opts;
    for(var i = 0; i < arguments.length; i++) {
      opts = arguments[i];
      this._bindings.push(pie.binding.create(this, opts.model || this.model, opts));
    }
  },

  setupBindings: function() {
    pie.array.each(this._bindings, 'setup', true);
  },

  // Iterate each binding and propagate the model value to the dom.
  initBindings: function() {
    pie.array.each(this._bindings, 'toView', true);
  },


  /* Iterate each binding and propagate the dom value to the model. */
  /* A single set of change records will be produced (`_version` will only increment by 1). */
  readBoundFields: function() {
    var opts = {skipObservers: true}, models;
    this._bindings.forEach(function(binding) { binding.readFields(opts); });
    models = pie.array.unique(pie.array.map(this._bindings, 'model'));
    pie.array.each(models, 'deliverChangeRecords', true);
  }
};
