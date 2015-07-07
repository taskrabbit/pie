// # Bindings Mixin
// A mixin to provide two way data binding between a model and dom elements.
// This mixin should be used with a pie view.
pie.mixins.bindings = {

  // The registration & configuration of bindings is kept in this._bindings.
  init: function() {
    this._bindings = [];
    if(this._super) this._super.apply(this, arguments);
    this.options.bindingAttribute = this.options.bindingAttribute || 'data-bind';
  },

  // If we have an emitter, tap into the afterRender event and initialize the dom
  // with our model values.
  setup: function() {
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
      if(!opts.model) opts.model = this.model;
      if(pie.object.isString(opts.model)) opts.model = this[opts.model];
      if(pie.object.isString(opts.decorator)) opts.decorator = this[opts.decorator] || this.app.helpers.fetch(opts.decorator);
      this._bindings.push(pie.binding.create(this, opts.model, opts));
    }
  },

  setupDomBindings: function() {
    if(!this.options.bindingAttribute) return;

    this.removeUnattachedBindings();

    var nodes = this.qsa('[' + this.options.bindingAttribute + ']'), stringOpts, node, opts;

    var binder = function(str) {
      if(str.indexOf('=') === -1) opts = {attr: str};
      else opts = this.parseStringBinding(str);
      opts.sel = node;
      this.bind(opts);
    }.bind(this);

    for(var i = 0; i < nodes.length; i++) {
      node = nodes[i];
      stringOpts = node.getAttribute(this.options.bindingAttribute);
      stringOpts.split(';').forEach(binder);
    }
  },

  removeUnattachedBindings: function() {
    var compactNeeded = false, b;
    for(var i = 0; i < this._bindings.length; i++) {
      b = this._bindings[i];
      if(pie.object.isNode(b.sel) && !document.contains(b.sel)) {
        this._bindings[i] = undefined;
        b.teardown();
        compactNeeded = true;
      }
    }

    if(compactNeeded) this._bindings = pie.array.compact(this._bindings);
  },

  parseStringBinding: function(inputString) {
    var opts = pie.object.expand(pie.string.deserialize(inputString));
    return opts;
  },

  initBindings: function() {
    // look for dom-defined bindings and add them to our _bindings list.
    this.setupDomBindings();

    // Iterate each binding and propagate the model value to the dom.
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
