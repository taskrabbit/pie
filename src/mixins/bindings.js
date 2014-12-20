// this.bind(model, {
//   model: model,
//   type: 'attribute',
//   sel: 'input[name="first_name"]'
//   attr: 'first_name',
//   trigger: 'change',
//   triggerSel: attr,
//   toModel: true,
//   toView: true,
//   debounce: 150,
// })


// A mixin to provide two way data binding between a model and dom elements.
// This mixin should be used with a pie view.
pie.mixins.bindings = (function(){

  var integrations = {

    attribute: (function(){

      var attributeName = function(binding){
        return binding.options.attribute || ('data-' + binding.attr);
      };

      return {

        getValue: function(el, binding) {
          return el.getAttribute(attributeName(binding));
        },

        setValue: function(el, binding) {
          var value = binding.model.get(binding.attr);
          return el.setAttribute(attributeName(binding), value);
        }

      };
    })(),

    value: {

      getValue: function(el, binding) {
        return el.value;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr);;
        /* jslint eqnull:true */
        if(value == null) value = '';
        return el.value = value;
      }

    },

    check: {

      getValue: function(el, binding) {
        var existing = binding.model.get(binding.attr), i;

        if(Array.isArray(existing)) {
          existing = pie.array.dup(existing);
          i = existing.indexOf(el.value);
          // if we are checked and we don't already have it, add it.
          if(el.checked && i < 0) {
            existing.push(el.value);
          // if we are not checked but we do have it, then we add it.
          } else if(!el.checked && i >= 0) {
            existing.splice(i, 1);
          } else {
            return undefined;
          }

          return existing;
        } else {
          return el.checked ? el.value : undefined;
        }
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr),
        elValue = el.value;

        if(Array.isArray(value)) {
          return el.checked = !!~value.indexOf(elValue);
        } else {
          /* jslint eqeq:true */
          return el.checked = elValue == value;
        }
      }

    },

    radio: {

      getValue: function(el, binding) {
        return el.checked ? el.value : undefined;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr),
        elValue = el.value;

        /* jslint eqeq:true */
        return el.checked = elValue == value;
      }

    },

    text: {

      getValue: function(el, binding) {
        return el.innerText;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr);

        /* jslint eqnull:true */
        if(value == null) value = '';
        return el.innerText = value;
      }

    },

    html: {

      getValue: function(el, binding) {
        return el.innerHTML;
      },

      setValue: function(el, binding) {
        var value = binding.model.get(binding.attr);
        /* jslint eqnull:true */
        if(value == null) value = '';
        return el.innerHTML = value;
      }

    }

  };

  var normalizeBindingOptions = function(given) {
    if(!given.attr) throw new Error("An attr must be provided for data binding. " + JSON.stringify(given));

    var out = {};
    out.attr = given.attr;
    out.model = given.model || this.model;
    out.sel = given.sel || '[name="' + given.attr + '"]';
    out.type = given.type || 'auto';
    out.trigger = given.trigger || 'change keyup';
    out.triggerSel = given.triggerSel || out.sel;
    out.toModel = given.toModel || given.toModel === undefined;
    out.toView = given.toView || given.toView === undefined;
    out.debounce = given.debounce || false;
    out.options = given.options || {};

    if(out.debounce === true) out.debounce = 150;

    return out;
  };

  var determineIntegrationForBinding = function(el, binding) {
    var mod;
    if(el.hasAttribute && el.hasAttribute('data-' + binding.attr)) mod = 'attribute';
    else if(el.nodeName === 'INPUT' && el.getAttribute('type') === 'checkbox') mod = 'check';
    else if(el.nodeName === 'INPUT' && el.getAttribute('type') === 'radio') mod = 'radio';
    else if(el.hasOwnProperty('value')) mod = 'value';
    else mod = 'text';

    return integrations[mod];
  };

  var integrationForBinding = function(el, binding) {
    if(binding.type === 'auto') return determineIntegrationForBinding(el, binding);
    return integrations[binding.type];
  };

  var applyValueToModel = function(value, binding) {
    if(value === undefined) return;

    binding.ignore = true;
    binding.model.set(binding.attr, value);
    binding.ignore = false;
  };

  var applyValueToElement = function(el, binding) {
    integrationForBinding(el, binding).setValue(el, binding);
  };

  var applyValueToElements = function(binding) {
    if(binding.ignore) return;

    var els = pie.array.from(this.qsa(binding.sel));
    els.forEach(function(el) {
      applyValueToElement(el, binding);
    });
  };

  var getValueFromElement = function(el, binding) {
    return integrationForBinding(el, binding).getValue(el, binding);
  };

  var initCallbacks = function(binding) {

    if(binding.toModel) {
      binding.toModel = function(e) {
        var el = e.delegateTarget;
        var value = getValueFromElement(el, binding);
        applyValueToModel(value, binding);
      };

      if(binding.debounce) binding.toModel = Function.debounce(binding.toModel, binding.debounce);

      initViewCallback.call(this, binding);
    }

    if(binding.toView) {
      binding.toView = function() {
        applyValueToElements.call(this, binding);
      }.bind(this);

      initModelCallback.call(this, binding);
    }

    return binding;
  };

  var initModelCallback = function(binding) {
    this.onChange(binding.model, binding.toView, binding.attr);
  };

  var initViewCallback = function(binding) {
    var events = binding.trigger.split(' ');
    events.forEach(function(event){
      this.on(event, binding.triggerSel, binding.toModel);
    }.bind(this));
  };


  return {

    init: function() {
      this._bindings = [];
      if(this._super) this._super.apply(this, arguments);
      if(this.emitter) {
        this.emitter.on('afterRender', this.initBoundFields.bind(this));
      }
    },

    bind: function() {
      var wanted = pie.array.from(arguments);
      wanted = wanted.map(normalizeBindingOptions.bind(this));
      wanted = wanted.map(initCallbacks.bind(this));
      this._bindings = this._bindings.concat(wanted);
    },

    initBoundFields: function() {
      this._bindings.forEach(function(b){
        b.toView();
      });
    }
  };

})();
