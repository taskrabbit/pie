pie.validator = pie.base.extend('validator', (function(){

  // http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript
  var luhnCheck = function(a,b,c,d,e) {
    for(d = +a[b = a.length-1], e=0; b--;)
      c = +a[b], d += ++e % 2 ? 2 * c % 10 + (c > 4) : c;
    return !(d%10);
  };

  return {

    init: function(app) {
      this.app = app || pie.appInstance;
      this.i18n = app.i18n;
    },


    errorMessage: function(validationType, validationOptions) {
      if(validationOptions.message) return this.app.i18n.attempt(validationOptions.message);
      var key = validationOptions.messageKey || validationType,
      base = this.i18n.t('app.validations.' + key),
      rangeOptions = new pie.validator.rangeOptions(this.app, validationOptions),
      range = rangeOptions.message();

      if(!range && key === 'length') {
        rangeOptions = new pie.validator.rangeOptions(this.app, {gt: 0});
        range = rangeOptions.message();
      }

      return (base + ' ' + range).trim();
    },


    withStandardChecks: function(value, options, f){
      options = options || {};

      if(options.allowBlank && !this.presence(value))
        return true;
      else if(options.unless && options.unless.call())
        return true;
      else if(options['if'] && !options['if'].call())
        return true;
      else
        return f.call();
    },


    ccNumber: function(value, options){
      return this.withStandardChecks(value, options, function(){

        // don't get rid of letters because we don't want a mix of letters and numbers passing through
        var sanitized = String(value).replace(/[^a-zA-Z0-9]/g, '');
        return this.number(sanitized) &&
               this.length(sanitized, {gte: 10, lte: 16}) &&
               luhnCheck(sanitized);
      }.bind(this));
    },


    ccExpirationMonth: function(value, options) {
      return this.withStandardChecks(value, options, function() {
        return this.integer(value, {gte: 1, lte: 12});
      }.bind(this));
    },


    ccExpirationYear: function(value, options) {
      return this.withStandardChecks(value, options, function() {
        var now = new Date();
        return this.integer(value, {gte: now.getFullYear(), lte: now.getFullYear() + 20});
      }.bind(this));
    },


    ccSecurity: function(value, options) {
      return this.withStandardChecks(value, options, function() {
        return this.number(value) &&
                this.length(value, {gte: 3, lte: 4});
      }.bind(this));
    },


    chosen: function(value /* , options */){
      if(Array.isArray(value)) {
        return !!value.length;
      }
      return value != null;
    },


    // a date should be in the ISO format yyyy-mm-dd
    date: function(value, options) {
      options = options || {};
      return this.withStandardChecks(value, options, function() {
        var split = value.split('-'), y = split[0], m = split[1], d = split[2], iso;

        if(!y || !m || !d) return false;
        if(!this.length(y, {eq: 4}) && this.length(m, {eq: 2}) && this.length(d, {eq: 2})) return false;

        if(!options.sanitized) {
          Object.keys(options).forEach(function(k){
            iso = options[k];
            iso = this.app.i18n.l(iso, 'isoDate');
            options[k] = iso;
          });
          options.sanitized = true;
        }

        var ro = new pie.validator.rangeOptions(this.app, options);
        return ro.matches(value);

      }.bind(this));
    },


    email: function(value, options) {
      options = pie.object.merge({allowBlank: false}, options || {});
      return this.withStandardChecks(value, options, function(){
        return (/^.+@.+\..+$/).test(value);
      });
    },


    fn: function(value, options, cb) {
      return this.withStandardChecks(value, options, function(){
        return options.fn.call(null, value, options, cb);
      });
    },


    format: function(value, options) {
      options = options || {};
      return this.withStandardChecks(value, options, function() {
        var fmt = options.format || options['with'];

        if(fmt === 'isoDate'){
          fmt = /^\d{4}\-\d{2}\-\d{2}$/;
        } else if(fmt === 'epochs'){
          fmt = /^\d{10}$/;
        } else if(fmt === 'epochms'){
          fmt = /^\d{13}$/;
        }

        return !!fmt.test(String(value));
      });
    },

    inclusion: function(value, options) {
      options = options || {};
      return this.withStandardChecks(value, options, function() {
        var inVal = pie.fn.valueFrom(options['in']);
        if(Array.isArray(inVal)) return !inVal.length || !!~inVal.indexOf(value);
        return inVal == null || inVal === value;
      });
    },


    // must be an integer (2.0 is ok) (good for quantities)
    integer: function(value, options){
      return  this.withStandardChecks(value, options, function(){
        return  this.number(value, options) &&
                parseInt(value, 10) === parseFloat(value, 10);
      }.bind(this));
    },


    // min/max length of the field
    length: function(value, options){
      options = pie.object.merge({allowBlank: false}, options);

      if(!pie.object.has(options, 'gt')  &&
         !pie.object.has(options, 'gte')  &&
         !pie.object.has(options, 'lt')  &&
         !pie.object.has(options, 'lte')  &&
         !pie.object.has(options, 'eq') ){
        options.gt = 0;
      }

      return this.withStandardChecks(value, options, function(){
        var length = String(value).trim().length;
        return this.number(length, options);
      }.bind(this));
    },


    // must be some kind of number (good for money input)
    number: function(value, options){
      options = options || {};

      return this.withStandardChecks(value, options, function(){

        // not using parseFloat because it accepts multiple decimals
        if(!/^([\-])?([\d]+)?\.?[\d]+$/.test(String(value))) return false;

        var number = parseFloat(value),
        ro = new pie.validator.rangeOptions(this.app, options);

        return ro.matches(number);
      });
    },


    // clean out all things that are not numbers and + and get a minimum of 10 digits.
    phone: function(value, options) {
      options = pie.object.merge({allowBlank: false}, options || {});

      return this.withStandardChecks(value, options, function(){
        var clean = String(value).replace(/[^\+\d]+/g, '');
        return this.length(clean, {gte: 10});
      }.bind(this));
    },


    // does the value have any non-whitespace characters
    presence: function(value, options){
      return this.withStandardChecks(value, pie.object.merge({}, options, {allowBlank: false}), function(){
        return !!(value && (/[^ ]/).test(String(value)));
      });
    },


    url: function(value, options) {
      return this.withStandardChecks(value, options, function() {
        return (/^.+\..+$/).test(value);
      });
    }
  };
})());



// small utility class to handle range options.
pie.validator.rangeOptions = pie.base.extend('rangeOptions', {

  init: function(app, hash) {
    this.i18n = app.i18n;
    this.rangedata = hash || {};
    // for double casting new RangeOptions(new RangeOptions({}));
    if(this.rangedata.rangedata) this.rangedata = this.rangedata.rangedata ;
  },

  get: function(key) {
    return pie.fn.valueFrom(this.rangedata[key]);
  },

  has: function(key) {
    return !!(key in this.rangedata);
  },

  t: function(key, options) {
    return this.i18n.t('app.validations.range_messages.' + key, options);
  },

  matches: function(value) {
    var valid = true;
    valid = valid && (!this.has('gt') || value > this.get('gt'));
    valid = valid && (!this.has('lt') || value < this.get('lt'));
    valid = valid && (!this.has('gte') || value >= this.get('gte'));
    valid = valid && (!this.has('lte') || value <= this.get('lte'));
    valid = valid && (!this.has('eq') || value === this.get('eq'));
    return valid;
  },

  message: function() {
    if(this.has('eq')) {
      return this.t('eq', {count: this.get('eq')});
    } else {
      var s = ['',''];

      if(this.has('gt')) s[0] += this.t('gt', {count: this.get('gt')});
      else if(this.has('gte')) s[0] += this.t('gte', {count: this.get('gte')});

      if(this.has('lt')) s[1] += this.t('lt', {count: this.get('lt')});
      else if(this.has('lte')) s[1] += this.t('lte', {count: this.get('lte')});

      return pie.array.toSentence(pie.array.compact(s, true), this.i18n).trim();
    }
  },
});
