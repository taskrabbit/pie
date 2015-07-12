pie.mixins.validatable = {

  init: function() {
    this.validations = [];
    this.validationStrategy = 'dirty';

    if(this._super) this._super.apply(this, arguments);

    this.compute('isValid', 'validationErrors');
  },

  isValid: function() {
    return pie.object.isEmpty(this.data.validationErrors);
  },

  // default to a model implementation
  reportValidationError: function(key, errors) {
    errors = errors && errors.length ? errors : undefined;
    this.set('validationErrors.' + key, errors);
  },

  // validates({name: 'presence'});
  // validates({name: {presence: true}});
  // validates({name: ['presence', {format: /[a]/}]})
  validates: function(obj, validationStrategy) {
    var configs, resultConfigs;

    this.validations = this.validations || {};

    Object.keys(obj).forEach(function(k) {
      // always convert to an array
      configs = pie.array.from(obj[k]);
      resultConfigs = [];

      configs.forEach(function(conf) {

        // if it's a string or a function, throw it in directly, with no options
        if(pie.object.isString(conf)) {
          resultConfigs.push({type: conf, options: {}});
        // if it's a function, make it a type function, then provide the function as an option
        } else if(pie.object.isFunction(conf)){
          resultConfigs.push({type: 'fn', options: {fn: conf}});
        // otherwise, we have an object
        } else if(conf) {

          // iterate the keys, adding a validation for each
          Object.keys(conf).forEach(function(confKey){
            if (pie.object.isObject(conf[confKey])) {
              resultConfigs.push({type: confKey, options: conf[confKey]});

            // in this case, we convert the value to an option
            // {presence: true} -> {type: 'presence', {presence: true}}
            // {format: /.+/} -> {type: 'format', {format: /.+/}}
            } else if(conf[confKey]) {
              resultConfigs.push({
                type: confKey,
                options: pie.object.merge({}, conf)
              });
            }
          });
        }

      });


      if(resultConfigs.length) {

        // append the validations to the existing ones
        this.validations[k] = this.validations[k] || [];
        this.validations[k] = this.validations[k].concat(resultConfigs);

        this.observe(function(changes){
          var change = changes.get(k);
          return this.validationChangeObserver(change);
        }.bind(this), k);
      }

    }.bind(this));

    if(validationStrategy !== undefined) this.validationStrategy = validationStrategy;
  },

  // Invoke validateAll with a set of optional callbacks for the success case and the failure case.
  // this.validateAll(function(){ alert('Success!'); }, function(){ alert('Errors!'); });
  // validateAll will perform all registered validations, asynchronously. When all validations have completed, the callbacks
  // will be invoked.
  validateAll: function() {
    keys = Object.keys(this.validations),

    // start all the validations
    promises = keys.map(this.validate.bind(this));

    // return a promise to ensure we make our point about asynchronous validation.
    return pie.promise.all(promises);
  },


  validationChangeObserver: function(change) {
    if(this.validationStrategy === 'validate') {
      this.validate(change.name);
    } else if(this.validationStrategy === 'dirty') {
      // for speed.
      if(this.get('validationErrors.' + change.name + '.length')) {
        this.reportValidationError(change.name, undefined);
      }
    }
  },

  // validate a specific key and optionally invoke a callback.
  validate: function(k) {
    var validators = this.app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),

    // grab the validator for each validation then invoke it.
    // if true or false is returned immediately, we invoke the callback otherwise we assume
    // the validation is running asynchronously and it will invoke the callback with the result.
    promises = validations.map(function(validation) {
      return pie.promise.create(function(resolve, reject) {
        var validator = validators[validation.type];
        var result = validator.call(validators, value, validation.options);

        if(result === true) resolve();
        else if(result === false) reject(validators.errorMessage(validation.type, validation.options));
        else result.then(resolve, reject);
      });
    });

    return pie.promise.all(promises).
      then(function(){
        this.reportValidationError(k, undefined);
        return true;
      }.bind(this)).
      catch(function(messages){
        this.reportValidationError(k, messages);
        return false;
      });
  }
};
