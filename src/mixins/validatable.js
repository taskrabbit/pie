pie.mixins.validatable = {

  // default to a model implementation
  reportValidationError: function(key, errors) {
    this.set('validationErrors.' + key, errors);
  },

  // validates({name: 'presence'});
  // validates({name: {presence: true}});
  // validates({name: ['presence', {format: /[a]/}]})

  validates: function(obj) {
    var resultValidations = {}, configs, resultConfigs, test;

    this.validations = this.validations || {};

    Object.keys(obj).forEach(function(k) {
      // always convert to an array
      configs = pie.array.from(obj[k]);
      resultConfigs = [];

      configs.forEach(function(conf) {

        // if it's a string or a function, throw it in directly, with no options
        if(typeof conf === 'string') {
          resultConfigs.push({type: conf, options: {}});
        // if it's a function, make it a type function, then provide the function as an option
        } else if(typeof conf === 'function'){
          resultConfigs.push({type: 'fn', options: {fn: conf}});
        // otherwise, we have an object
        } else {

          // iterate the keys, adding a validation for each
          Object.keys(conf).forEach(function(confKey){
            if (pie.object.isObject(conf[confKey])) {
              resultConfigs.push({type: confKey, options: conf[confKey]});

            // in this case, we convert the value to an option
            // {presence: true} -> {type: 'presence', {presence: true}}
            // {format: /.+/} -> {type: 'format', {format: /.+/}}
            } else {
              resultConfigs.push({
                type: confKey,
                options: pie.object.extend({}, conf)
              });
            }
          });
        }

      });

      // append the validations to the existing ones
      this.validations[k] = this.validations[k] || [];
      this.validations[k] = this.validations[k].concat(resultConfigs);
    }.bind(this));
  },

  validateAll: function(app, success, failure) {
    var ok = true;

    Object.keys(this.validations).forEach(function(k) {
      ok = this.validate(app, k) && ok;
    }.bind(this));

    if(ok && success) success.call();
    else if(!ok && failure) failure.call();

    return ok;
  },

  validate: function(app, k) {
    var validators = app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),
    valid = true,
    i = 0,
    messages = [],
    validation,
    validator;


    for(; i < validations.length; i++) {
      validation  = validations[i];
      validator   = validators[validation.type];
      if(!validator.call(validators, value, validation.options)) {
        valid = false;
        messages.push(validators.errorMessage(validation.type, validation.options));
      }
    }

    if(valid) {
      this.reportValidationError(k, undefined);
    } else {
      this.reportValidationError(k, messages);
    }

    return valid;
  }
};
