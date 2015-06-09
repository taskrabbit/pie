pie.binding = pie.base.extend('binding', {

  init: function(view, model, options) {
    this.view = view;
    this.model = model;
    this.options = options;
  },

  setup: function() {
    this.normalizeOptions();
    this.setupViewCallbacks();
    this.setupModelCallbacks();
  },

  normalizeOptions: function() {
    if(!this.options.attr) throw new Error("An attr must be provided for data binding. " + JSON.stringify(this.options));

    var given       = this.options || {};
    var out         = {};
    /* the model attribute to be observed / updated. */
    out.attr        = given.attr;
    /* the selector to observe */
    out.sel         = given.sel         || '[name="' + given.attr + '"]';
    /* the way in which the binding should extract the value from the dom. */
    out.type        = given.type        || 'auto';
    /* the desired type the dom value's should be cast to. */
    out.dataType    = given.dataType    || 'default';
    /* if `dataType` is "array", they type which should be applied to each. */
    out.eachType    = given.eachType    || undefined;
    /* when an input changes or has a keyup event, the model will update. */
    out.trigger     = given.trigger     || 'change keyup';
    /* just in case the dom events should be based on a different field than that provided by `sel` */
    out.triggerSel  = given.triggerSel  || out.sel;
    /* if toModel is not provided, it's presumed to be desired. */
    out.toModel     = given.toModel     || (given.toModel === undefined && out.type !== 'class');
    /* if toView is not provided, it's presumed to be desired. */
    out.toView      = given.toView      || given.toView === undefined;
    /* no debounce by default. */
    out.debounce    = given.debounce    || false;
    /* secondary options. */
    out.options     = given.options     || {};

    /* A `true` value will results in a default debounce duration of 250ms. */
    if(out.debounce === true) out.debounce = 250;

    this.options = out;
  },

  getModelValue: function() {
    return this.model.get(this.options.attr);
  },

  // The type caster based on the `dataType`.
  getTypeCaster: function(dataType) {
    dataType = dataType || this.options.dataType;
    return pie.binding.typeCasters[dataType] || pie.binding.typeCasters['default'];
  },

  // Provide a way to retrieve values out of the dom & apply values to the dom.
  getIntegration: function(el) {
    if(this.options.type === 'auto') return this.determineIntegrationForElement(el);
    return pie.binding.integrations[this.options.type] || pie.binding.integrations.value;
  },

  // If type=auto, this does it's best to determine the appropriate integration.
  determineIntegrationForElement: function(el) {
    var mod;
    if(el.hasAttribute && el.hasAttribute('data-' + this.options.attr)) mod = 'attribute';
    else if(el.nodeName === 'INPUT' && String(el.getAttribute('type')).toUpperCase() === 'CHECKBOX') mod = 'check';
    else if(el.nodeName === 'INPUT' && String(el.getAttribute('type')).toUpperCase() === 'RADIO') mod = 'radio';
    else if(el.nodeName === 'INPUT' || el.nodeName === 'SELECT' || el.nodeName === 'TEXTAREA') mod = 'value';
    else mod = 'text';

    return pie.binding.integrations[mod];
  },

  // Wiring of the view-to-model callbacks. These will observe dom events
  // and translate them to model values.
  setupViewCallbacks: function() {
    var _toModel = this.options.toModel;
    var opts = this.options;

    if(!_toModel) return;


    // If a function is provided, use that as the base implementation.
    if(!pie.object.isFunction(_toModel)) {
      // Otherwise, we provide a default implementation.
      _toModel = function(el, opts) {
        var value = this.getValueFromElement(el);
        this.applyValueToModel(value, opts);
      }.bind(this);
    }

    var toModel = function(e) {
      var el = e.delegateTarget;
      _toModel(el);
    };


    // If a debounce is requested, we apply the debounce to the wrapped function,
    // Leaving the base function untouched.
    if(opts.debounce) toModel = pie.fn.debounce(toModel, opts.debounce);

    this.toModel = _toModel;

    // Multiple events could be supplied, separated by a space.
    opts.trigger.split(' ').forEach(function(event){
      // Use the view's event management to register the callback.
      this.view.on(event, opts.triggerSel, toModel);
    }.bind(this));
  },

  setupModelCallbacks: function() {
    var toView = this.options.toView;
    var opts = this.options;

    if(!toView) return;

    if(!pie.object.isFunction(toView)) {
      toView = function(changeSet) {
        this.lastChange = changeSet && changeSet.get(opts.attr);
        this.applyValueToElements();
      }.bind(this);
    }

    this.toView = toView;
    this.view.observe(this.model, toView, opts.attr);
  },

  applyValueToElements: function() {
    if(this.ignore) return;

    var els = this.view.qsa(this.options.sel);
    for(var i = 0; i < els.length; i++) {
      this.getIntegration(els[i]).setValue(els[i], this);
    }
  },

  // Extract a value out of an element based on a binding configuration.
  getValueFromElement: function(el) {
    // Get the basic value out of the element.
    var val = this.getIntegration(el).getValue(el, this),
    // Get the type casting function it based on the configuration.
    fn = this.getTypeCaster();
    // Type cast the value.
    val = fn(val);

    // If we're configured to have an array and have defined an `eachType`
    // use it to typecast each value.
    if(this.options.dataType === 'array' && this.options.eachType) {
      var eachFn = this.getTypeCaster(this.options.eachType);
      val = val.map(eachFn);
    }

    return val;
  },


  // Apply a value to the model, ensuring the model-to-view triggers do not take place.
  applyValueToModel: function(value, opts) {
    try{
      this.ignore = true;
      this.model.set(this.options.attr, value, opts);

    // Even if we error, we should reset the ignore.
    } finally {
      this.ignore = false;
    }
  },

  readFields: function(opts) {
    if(!this.toModel) return;

    var els = this.view.qsa(this.options.sel);

    for(var i = 0; i < els.length; i++) {
      this.toModel(els[i], opts);
    }
  }

});


// A set of methods to cast raw values into a specific type.
pie.binding.typeCasters = {
  array: function(raw) {
    return pie.array.from(raw);
  },

  boolean: (function(){

    // Match different strings representing truthy values.
    var reg = /^(1|true|yes|ok|on)$/;

    return function(raw) {
      if(raw == null) return raw;
      return !!(raw && reg.test(String(raw)));
    };

  })(),

  // Attempt to parse as a float, if `NaN` return `null`.
  number: function(raw) {
    var val = parseFloat(raw, 10);
    if(isNaN(val)) return null;
    return val;
  },

  // Attempt to parse as an integer, if `NaN` return `null`.
  integer: function(raw) {
    var val = parseInt(raw, 10);
    if(isNaN(val)) return null;
    return val;
  },

  // `null` or `undefined` are passed through, otherwise cast as a String.
  string: function(raw) {
    return raw == null ? raw : String(raw);
  },

  "default" : function(raw) {
    return raw;
  }

};

// Bind to an element's attribute.
pie.ns('pie.binding.integrations').attribute = (function(){

  // extract the attribute name from the binding configuration.
  var attributeName = function(binding){
    return binding.options.options.attribute || ('data-' + binding.options.attr);
  };

  return {

    getValue: function(el, binding) {
      return el.getAttribute(attributeName(binding));
    },

    setValue: function(el, binding) {
      var value = binding.getModelValue();
      return el.setAttribute(attributeName(binding), value);
    }

  };
})();

pie.binding.integrations['class'] = (function(){

  /* will handle strings and arrays of strings */
  var getClassNames = function(string) {
    if(!string) return [];
    string = String(string);
    return pie.array.compact(pie.array.map(string.split(/[\,\s]/), 'trim', true), true);
  };

  return {
    getValue: function(/* el, binding */) {
      throw new Error("class bindings can only be from the model to the view. Please declare toModel: false");
    },

    setValue: function(el, binding) {
      var className = binding.options.options.className;

      if(className === '_value_') {
        var change = binding.lastChange;
        if(change) {
          if(change.oldValue) {
            getClassNames(change.oldValue).forEach(function(c) {
              el.classList.remove(c);
            });
          }

          if(change.value) {
            getClassNames(change.value).forEach(function(c) {
              el.classList.add(c);
            });
            return change.value;
          }
        }
      } else {
        var value = binding.getModelValue();
        className = className || binding.options.attr;

        getClassNames(className).forEach(function(c){
          el.classList[!!value ? 'add' : 'remove'](c);
        });

        return className;
      }
    }
  };
})();

pie.binding.integrations.value = {

  // Simple value extraction
  getValue: function(el /*, binding */) {
    return el.value;
  },

  // Apply the model's value to the element's value.
  setValue: function(el, binding) {
    var value = binding.getModelValue();
    /* jslint eqnull:true */
    if(value == null) value = '';
    return el.value = value;
  }

};

pie.binding.integrations.check = (function(){

  // String based index.
  var index = function(arr, value) {
    if(!arr) return -1;
    value = String(value);
    return pie.array.indexOf(arr, function(e){ return String(e) === value; });
  };

  return {

    getValue: function(el, binding) {

      // If we have an array, manage the values.
      if(binding.options.dataType === 'array') {

        var existing = pie.array.from(binding.getModelValue()), i;

        i = index(existing, el.value);

        // If we are checked and we don't already have it, add it.
        if(el.checked && i < 0) {
          existing = pie.array.dup(existing);
          existing.push(el.value);
        // If we are not checked but we do have it, then we add it.
        } else if(!el.checked && i >= 0) {
          existing = pie.array.dup(existing);
          existing.splice(i, 1);
        }

        return existing;
      } else if(binding.options.dataType === 'boolean'){
        return !!el.checked;
      } else {
        // Otherwise, we return the el's value if it's checked.
        return el.checked ? el.value : null;
      }
    },

    // If the model's value contains the checkbox, check it.
    setValue: function(el, binding) {
      var value = binding.getModelValue(),
      elValue = el.value;

      // In the case of an array, we check for inclusion.
      if(binding.options.dataType === 'array') {
        var i = index(value, elValue);
        return el.checked = !!~i;
      } else {
        var caster = binding.getTypeCaster(binding.options.dataType);

        // Otherwise we check for equality
        return el.checked = caster(elValue) === caster(value);
      }
    }
  };

})();


pie.binding.integrations.radio = {

  // If a radio input is checked, return it's value.
  // Otherwise, return the existing value.
  getValue: function(el, binding) {
    var existing = binding.getModelValue();
    if(el.checked) return el.value;
    return existing;
  },

  // Check a radio button if the value matches.
  setValue: function(el, binding) {
    var value = binding.getModelValue(),
    elValue = el.value,
    caster = binding.getTypeCaster();

    /* jslint eqeq:true */
    return el.checked = caster(elValue) === caster(value);
  }

};

// Set the innerTEXT of an element based on the model's value.
pie.binding.integrations.text = {

  getValue: function(el /*, binding */) {
    return el.textContent;
  },

  setValue: function(el, binding) {
    var value = binding.getModelValue();

    /* jslint eqnull:true */
    if(value == null) value = '';
    return el.textContent = value;
  }

};

// Set the innerHTML of an element based on the model's value.
pie.binding.integrations.html = {

  getValue: function(el /*, binding */) {
    return el.innerHTML;
  },

  setValue: function(el, binding) {
    var value = binding.getModelValue();
    /* jslint eqnull:true */
    if(value == null) value = '';
    return el.innerHTML = value;
  }

};


