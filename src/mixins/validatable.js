pie.mixins.validatable = {

  // default to a model implementation
  reportValidationError: function(key, errors) {
    this.set('validationErrors.' + key, errors);
  },

  // validates({name: 'presence'});
  // validates({name: {presence: true}});
  // validates({name: ['presence', {format: /[a]/}]})
  validates: function(obj, observeChanges) {
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
                options: pie.object.merge({}, conf)
              });
            }
          });
        }

      });

      // append the validations to the existing ones
      this.validations[k] = this.validations[k] || [];
      this.validations[k] = this.validations[k].concat(resultConfigs);

      if(observeChanges) {
        this.observe(function(){ this.validate(k); }.bind(this), k);
      }
    }.bind(this));
  },

  // Invoke validateAll with a set of optional callbacks for the success case and the failure case.
  // this.validateAll(function(){ alert('Success!'); }, function(){ alert('Errors!'); });
  // validateAll will perform all registered validations, asynchronously. When all validations have completed, the callbacks
  // will be invoked.
  validateAll: function(cb) {
    var ok = true,
    keys = Object.keys(this.validations),
    fns,
    callback,
    whenComplete = function() {
      if(cb) cb(ok);
      return void(0);
    },
    counterObserver = function(bool) {
      ok = !!(ok && bool);
    };

    if(!keys.length) {
      return whenComplete();
    } else {

      fns = keys.map(function(k){
        return function(cb) {
          return this.validate(k, cb);
        }.bind(this);
      }.bind(this));

      // start all the validations
      pie.func.async(fns, whenComplete, counterObserver);

      return void(0); // return undefined to ensure we make our point about asynchronous validation.
    }
  },


  // validate a specific key and optionally invoke a callback.
  validate: function(k, cb) {
    var validators = this.app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),
    valid = true,
    fns,
    messages = [],

    // The callback invoked after each individual validation is run.
    // It updates our validity boolean
    counterObserver = function(validation, bool) {
      valid = !!(valid && bool);
      if(!bool) messages.push(validators.errorMessage(validation.type, validation.options));
    },

    // When all validations for the key have run, we report any errors and let the callback know
    // of the result;
    whenComplete = function() {
      this.reportValidationError(k, messages);
      if(cb) cb(valid);
      return void(0);
    }.bind(this);

    if(!validations.length) {
      return whenComplete();
    } else {

      // grab the validator for each validation then invoke it.
      // if true or false is returned immediately, we invoke the callback otherwise we assume
      // the validation is running asynchronously and it will invoke the callback with the result.
      fns = validations.map(function(validation) {

        return function(callback) {
          var validator = validators[validation.type],
          innerCB = function(result) { callback(validation, result); },
          result = validator.call(validators, value, validation.options, innerCB);

          if(result === true || result === false) {
            callback(validation, result);
          } // if anything else, then the validation assumes responsibility for invoking the callback.
        };
      });

      pie.func.async(fns, whenComplete, counterObserver);

      return void(0);
    }
  }
};
