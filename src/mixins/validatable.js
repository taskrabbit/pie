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

  // asyncronous validation processing.
  validateAll: function(app, success, failure) {
    var ok = true,
    keys = Object.keys(this.validations),
    completeCount = keys.length,
    completed = 0,

    callback = function(bool) {
      ok = ok && bool;
      completed++;

      if(completeCount === completed) {
        if(ok && success) success.call();
        else if (!ok && failure) failure.call();
      }
    };

    keys.forEach(function(k) {
      this.validate(app, k, callback);
    }.bind(this));
  },


  validate: function(app, k, cb) {
    var validators = app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),
    valid = true,
    messages = [],
    completeCount = validations.length,
    completed = 0,
    validator,
    result,

    callback = function(validation, bool) {
      valid = valid && bool;
      completed++;

      if(!bool) messages.push(validators.errorMessage(validation.type, validation.options));

      if(completed === completeCount) {
        this.reportValidationError(k, messages);
        if(cb) cb.call(null, valid);
      }
    };

    validations.forEach(function(validation){
      validator = validators[validation.type];
      result = validator.call(validators, value, validation.options, callback);
      if(result === true || result === false) {
        callback.call()
      } // else if undefined, the validator is assumed to call the callback.
    });
  }
};
