pie.formView = pie.activeView.extend('formView', {

  init: function(options) {
    options = this.normalizeFormOptions(options);
    this._super(options);

    this.model = this.model || new pie.model({});

    if(!this.model.validates) this.model.reopen(pie.mixins.validatable);

    this.emitter.once('setup', this.setupFormBindings.bind(this));
  },

  // the process of applying form data to the model.
  applyFieldsToModel: function(form) {
    var data = this.formData(form);
    this.model.sets(data);
  },

  // the data coming from the UI that should be applied to the model before validation
  formData: function(form) {
    var args = pie.array.map(this.options.fields, 'name');

    args.push(form);

    return this.parseFields.apply(this, args);
  },

  handleErrors: function() {},

  normalizeFormOptions: function(options) {
    options = options || {};
    options.fields = options.fields || [];
    options.fields.forEach(function(field) {
      field = pie.object.isString(field) ? {name: field} : field || {};
      if(!field.name) throw new Error("A `name` property must be provided for all fields.");
      field.binding = field.binding || {};
      field.binding.attr = field.binding.attr || field.name;
    });
    return options;
  },

  setupFormBindings: function() {
    var validation;
    this.on('submit', this.options.formSel || 'form', this.validateAndSubmitForm.bind(this));
    this.options.fields.forEach(function(field) {
      this.bind(field.binding);
      validation = field.validation;
      if(validation) {
        validation = {};
        validation[field.name] = field.validation;
        this.model.validates(validation);
      }
    }.bind(this));
  },

  // the data to be sent from the server.
  // by default these are the defined fields extracted out of the model.
  submissionData: function(form) {
    var fieldNames = pie.array.map(this.options.fields, 'name');
    return this.model.gets(fieldNames);
  },

  submitForm: function(form) {
    var data = this.submissionData(form);

    app.ajax.ajax(pie.object.merge({
      url: form.getAttribute('action'),
      verb: form.getAttribute('method') || 'post',
      data: data,
    }, this.options.ajax));
  },

  validateAndSubmitForm: function(e) {
    e.preventDefault();

    this.applyFieldsToModel(e.delegateTarget);

    this.model.validateAll(function(bool) {
      if(bool) {
        this.submitForm(e.delegateTarget);
      } else {
        this.handleErrors();
      }
    }.bind(this), this.options.validateImmediately);
  }

}, pie.mixins.bindings);