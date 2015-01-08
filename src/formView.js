pie.formView = pie.activeView.extend('formView', {

  init: function(options) {
    this.model = this.model || new pie.model({});
    if(!this.model.validates) this.model.reopen(pie.mixins.validatable);

    options = this.normalizeFormOptions(options);
    this._super(options);
  },

  setup: function() {
    this.emitter.once('setup', this.setupFormBindings.bind(this));
    this._super();
  },

  // the process of applying form data to the model.
  applyFieldsToModel: function() {
    this.readBoundFields();
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
    options.fields = options.fields.map(function(field) {
      field = pie.object.isString(field) ? {name: field} : field || {};
      if(!field.name) throw new Error("A `name` property must be provided for all fields.");
      field.binding = field.binding || {};
      field.binding.attr = field.binding.attr || field.name;
      return field;
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
        this.model.validates(validation, this.options.validationStrategy);
      }
    }.bind(this));
  },

  // the data to be sent from the server.
  // by default these are the defined fields extracted out of the model.
  submissionData: function() {
    var fieldNames = pie.array.map(this.options.fields, 'name');
    return this.model.gets(fieldNames);
  },

  submitForm: function(form) {
    var data = this.submissionData();

    app.ajax.ajax(pie.object.merge({
      url: form.getAttribute('action'),
      verb: form.getAttribute('method') || 'post',
      data: data,
    }, this.options.ajax));
  },

  validateAndSubmitForm: function(e) {
    e.preventDefault();

    this.applyFieldsToModel();

    this.model.validateAll(function(bool) {
      if(bool) {
        this.submitForm(e.delegateTarget);
      } else {
        this.handleErrors();
      }
    }.bind(this));
  }

}, pie.mixins.bindings);
