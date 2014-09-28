
// A mixin to provide two way data binding between a model and form inputs.
// This mixin should be used with a pie view.
pie.mixins.bindings = {

  // Ex: this.bind({attr: 'name', model: this.user});
  // If this.model is defined, you don't have to pass the model.
  // Ex: this.model = user; this.bind({attr: 'name'});
  // Here are all the options:
  // this.bind({
  //   model: this.user,
  //   attr: 'name',
  //   sel: 'input[name="user_name"]',
  //   trigger: 'keyup',
  //   debounce: true
  // });
  //
  // Bind currently only supports form fields. Todo: support applying to attributes, innerHTML, etc.
  bind: function(options) {
    options = options || {};

    var model = options.model || this.model,
    attr = options.attr || options.attribute || undefined,
    sel = options.sel || 'input[name="' + attr + '"]',
    triggers = (options.trigger || 'keyup change').split(' '),
    debounce = options.debounce,
    ignore = false,
    toModel = function(e) {
      var value = e.delegateTarget.value;
      ignore = true;
      model.set(attr, value);
      ignore = false;
    },
    toElement = function(change) {
      if(ignore) return;
      $(this.qsa(sel)).assign('value', change.value);
    }.bind(this);

    if(debounce) {
      if(debounce === true) debounce = 150;
      toModel = Function.debounce(toModel, debounce);
    }

    triggers.forEach(function(trigger){
      this.on(trigger, sel, toModel);
    }.bind(this));

    this.onChange(model, toElement, attr);

    this._bindings = pie.array.from(this._bindings);
    this._bindings.push({model: model, sel: sel, attr: attr});
  },

  // A way to initialize form fields with the values of a model.
  initBoundFields: function() {
    pie.array.from(this._bindings).forEach(function(binding){
      var el = this.qs(binding.sel);
      $(this.qsa(binding.sel)).assign('value', binding.model.get(binding.attr));
    }.bind(this));
  }

};
