
// A mixin to provide two way data binding between a model and form inputs.
// This mixin should be used with a pie view.
pie.mixins.bindings = (function(){

  function setFieldValue(input, value) {
    var t = input.getAttribute('type');

    /* jslint eqeq:true */
    if(t === 'checkbox' || t === 'radio') {

      // in the checkbox case, we could have an array of values
      if(Array.isArray(value)) {
        // this input is checked if that array contains it's value
        return input.checked = !!(~value.indexOf(input.value));

      // if the field has no value, then we just determine it's checked state based on the truthyness of the model value
      } else if(!input.hasAttribute('value')) {
        return input.checked = !!value;
      // otherwise, we check the input against the value and base that as our checked state.
      } else {
        return input.checked = (input.value == value);
      }
    }

    // normal inputs just receive the value.
    return input.value = value;
  }

  function setValue(view, sel, value) {
    var i = 0, list = view.qsa(sel);
    for(;i < list.length; i++){
      setFieldValue(list[i], value);
    }
  }

  function getUpdatedValue(input, currentVal) {
    var v = input.value, t = input.getAttribute('type'), i;

    // if it's a checkbox
    if(t === 'checkbox' || t === 'radio') {

      // and we're dealing with an array.
      if(Array.isArray(currentVal)) {
        // the current index of the value
        i = currentVal.indexOf(v);

        // if we want the value to be included but it's not, push it on
        if(input.checked && !~i) {
          currentVal.push(input.value);
          return currentVal;

        // if the value should not be included but is, splice it out.
        } else if(!input.checked && ~i) {
          currentVal.splice(i,1);
          return currentVal;
        } else {
          return currentVal;
        }

      // not an array
      } else {

        // if the input has a value attribute use that, otherwise return a bool.
        if(input.hasAttribute('value')) {
          return input.checked ? input.value : null;
        } else {
          return input.checked;
        }
      }
    }

    return input.value;
  }


  return {

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
        var value = getUpdatedValue(e.delegateTarget, model.get(attr));
        ignore = true;
        model.set(attr, value);
        ignore = false;
      },
      toElement = function(changes) {
        if(ignore) return;
        setValue(this, sel, changes[changes.length-1].value);
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
        setValue(this, binding.sel, binding.model.get(binding.attr));
      }.bind(this));
    }

  };
})();
