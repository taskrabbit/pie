pie.mixins.validatable = {

  // default to a model implementation
  reportValidationError: function(key, errors) {
    this.set('validationErrors.' + key, errors);
  },

  // validates({name: 'presence'});
  // validates({name: {presence: true}});
  // validates({name: ['presence', {format: /[a]/}]})
  validates: function(obj) {
    var configs, resultConfigs;

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

  // Invoke validateAll with a set of optional callbacks for the success case and the failure case.
  // this.validateAll(function(){ alert('Success!'); }, function(){ alert('Errors!'); });
  // validateAll will perform all registered validations, asynchronously. When all validations have completed, the callbacks
  // will be invoked.
  validateAll: function(app, success, failure) {
    var ok = true,
    keys = Object.keys(this.validations),
    completeCount = keys.length,
    completed = 0,
    callback;

    if(!keys.length) {
      if(success) success(true);
      return void(0);
    } else {


      // The callback which is invoked after each individual validation.
      // This keeps track of our progress, and when we are completed, invokes our provided callbacks.
      callback = function(bool) {
        ok = !!(ok && bool);
        completed++;

        if(completeCount === completed) {
          if(ok && success) success(true);
          else if (!ok && failure) failure(false);
        }
      };

      // start all the validations
      keys.forEach(function(k) {
        this.validate(app, k, callback, callback);
      }.bind(this));

      return void(0); // return undefined to ensure we make our point about asynchronous validation.
    }
  },


  // validate a specific key and optionally invoke a callback.
  validate: function(app, k, success, failure) {
    var validators = app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),
    valid = true,
    messages = [],
    completeCount = validations.length,
    completed = 0,
    validator,
    result,
    callback;

    if(!validations.length) {
      if(success) success(true);
      return void(0);
    } else {

      // The callback invoked after each individual validation is run.
      // Keeps track of progress through our stack and updates the error keys.
      // Once completed, our provided callback is invoked with the result.
      callback = function(validation, bool) {
        valid = !!(valid && bool);
        completed++;

        if(!bool) messages.push(validators.errorMessage(validation.type, validation.options));

        if(completed === completeCount) {
          this.reportValidationError(k, messages);
          if(valid && success) success(valid);
          else if(!valid && failure) failure(valid);
        }
      };

      // grab the validator for each validation then invoke it.
      // if true or false is returned immediately, we invoke the callback otherwise we assume
      // the validation is running asynchronously and it will invoke the callback with the result.
      validations.forEach(function(validation){
        validator = validators[validation.type];
        result = validator(value, validation.options, callback);
        if(result === true || result === false) {
          callback(result);
        } // if undefined, then the validation assumes responsibility for invoking the callback.
      });

      return void(0);
    }
  }
};
