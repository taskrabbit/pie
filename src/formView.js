pie.formView = pie.activeView.extend('formView', {


  init: function() {
    this._super.apply(this, arguments);

    this.model = this.model || this.options.model || new pie.model({});
    if(!this.model.validates) this.model.reopen(pie.mixins.validatable);

    this._normalizeFormOptions();
  },

  setup: function() {
    this._setupFormBindings();

    this.on('submit', this.options.formSel, this.validateAndSubmitForm.bind(this));

    this._super.apply(this, arguments);
  },


  _normalizeFormOptions: function() {
    this.options.formSel  = this.options.formSel || 'form';
    this.options.fields   = this.options.fields || [];
    this.options.fields   = this.options.fields.map(function(field) {

      if(!field || !field.name) throw new Error("A `name` property must be provided for all fields.");

      field.binding = field.binding || {};
      field.binding.attr = field.binding.attr || field.name;

      return field;
    });
  },

  _onInvalid: function() {
    this.emitter.fire('onInvalid');
    this.onInvalid.apply(this, arguments);
  },

  _onFailure: function() {
    this.emitter.fire('onFailure');
    this.onFailure.apply(this, arguments);
  },

  _onSuccess: function() {
    this.emitter.fire('onSuccess');
    this.onSuccess.apply(this, arguments);
  },

  _onValid: function() {
    this.emitter.fire('onValid');
    this.onValid.apply(this, arguments);
  },

  _setupFormBindings: function() {
    var validation;

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


  // the process of applying form data to the model.
  applyFieldsToModel: function(form) {
    this.readBoundFields();
  },

  // for the inheriting class to override.
  onInvalid: function(form) {},


  // what happens when validations pass.
  onValid: function(form) {
    this.prepareSubmissionData(function(data) {

      app.ajax.ajax(pie.object.merge({
        url: form.getAttribute('action'),
        verb: form.getAttribute('method') || 'post',
        data: data,
        extraError: this._onFailure.bind(this),
        success: this._onSuccess.bind(this)
      }, this.options.ajax));

    }.bind(this));

  },

  // for the inheriting class to override.
  onFailure: function(resonse, xhr) {},

  // for the inheriting class to override.
  onSuccess: function(response, xhr) {},

  // the data to be sent from the server.
  // by default these are the defined fields extracted out of the model.
  prepareSubmissionData: function(cb) {
    var fieldNames = pie.array.map(this.options.fields, 'name'),
    data = this.model.gets(fieldNames);

    if(cb) cb(data);
    return data;
  },

  validateModel: function(cb) {
    this.model.validateAll(cb);
  },

  // start the process.
  validateAndSubmitForm: function(e) {
    e.preventDefault();

    var form = e.delegateTarget;

    this.applyFieldsToModel(form);

    this.emitter.fire('submit');

    this.validateModel(function(bool) {
      if(bool) {
        this._onValid(form);
      } else {
        this._onInvalid(form);
      }
    }.bind(this));
  }

}, pie.mixins.bindings);
