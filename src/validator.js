pie.validator = function(app) {
  this.app = app;
  this.i18n = app.i18n;
};


// small utility class to handle range options.
pie.validator.rangeOptions = function rangeOptions(app, hash) {
  this.i18n = app.i18n;
  this.rangedata = hash || {};
  // for double casting new RangeOptions(new RangeOptions({}));
  if(this.rangedata.rangedata) this.rangedata = this.rangedata.rangedata ;
};

pie.validator.rangeOptions.prototype.get = function(key) {
  return pie.func.valueFrom(this.rangedata[key]);
};

pie.validator.rangeOptions.prototype.has = function(key) {
  return !!(key in this.rangedata);
};

pie.validator.rangeOptions.prototype.t = function(key, options) {
  return this.i18n.t('app.validations.range_messages.' + key, options);
};

pie.validator.rangeOptions.prototype.message = function() {
  if(this.has('eq')) {
    return this.t('eq', {count: this.get('eq')});
  } else {
    var s = ["", ""];

    if(this.has('gt')) s[0] += " " + this.t('gt', {count: this.get('gt')});
    else if(this.has('gte')) s[0] += " " + this.t('gte', {count: this.get('gte')});

    if(this.has('lt')) s[1] += this.t('lt', {count: this.get('lt')});
    else if(this.has('lte')) s[1] += this.t('lte', {count: this.get('lte')});

    return pie.array.toSentence(pie.array.compact(s, true), this.i18n);
  }
};




pie.validator.prototype.errorMessage = function(validationType, validationOptions) {
  if(validationOptions.message) return validationOptions.message;

  var base = this.i18n.t('app.validations.' + validationType),
  rangeOptions = new pie.validator.rangeOptions(validationOptions),
  range = rangeOptions.message();

  if(!range && validationType === 'length') {
    rangeOptions = new pie.validator.rangeOptions({gt: 0});
    range = rangeOptions.message();
  }

  return (base + ' ' + range).trim();
};


pie.validator.prototype.withStandardChecks = function(value, options, f){
  if(options.allowBlank && !this.presence(value))
    return true;
  else if(options.unless && options.unless.call())
    return true;
  else if(options['if'] && !options['if'].call())
    return true;
  else
    return f.call();
};


pie.validator.prototype.compare = function(value, options) {
  var valid = true, ro = new pie.validator.rangeOptions(options);
  valid = valid && (!ro.has('gt') || value > ro.get('gt'));
  valid = valid && (!ro.has('lt') || value < ro.get('lt'));
  valid = valid && (!ro.has('gte') || value >= ro.get('gte'));
  valid = valid && (!ro.has('lte') || value <= ro.get('lte'));
  valid = valid && (!ro.has('eq') || value === ro.get('eq'));
  return valid;
};


pie.validator.prototype.cc = function(value, options){
  return this.withStandardChecks(value, options, function(){

    // don't get rid of letters because we don't want a mix of letters and numbers passing through
    var sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
    return this.number(sanitized) &&
           this.length(sanitized, {gte: 15, lte: 16});
  }.bind(this));
};


pie.validator.prototype.chosen = function(value, options){
  return this.presence(value, options);
};


pie.validator.prototype.cvv = function(value, options) {
  return this.withStandardChecks(value, options, function() {
    return this.number(value) &&
            this.length(value, {gte: 3, lte: 4});
  }.bind(this));
};


// a date should be in the ISO format yyyy-mm-dd
pie.validator.prototype.date = function(value, options) {
  options = options || {};
  return this.withStandardChecks(value, options, function() {
    var split = value.split('-'), y = split[0], m = split[1], d = split[2], iso;

    if(!y || !m || !d) return false;
    if(!this.length(y, {eq: 4}) && this.length(m, {eq: 2}) && this.length(d, {eq: 2})) return false;

    if(!options.sanitized) {
      Object.keys(options).forEach(function(k){
        iso = options[k];
        iso = iso.getFullYear() + '-' + (iso.getMonth() < 9 ? '0' : '') + (iso.getMonth() + 1) + '-' + (iso.getDate() < 10 ? '0' : '') + iso.getDate();
        options[k] = iso;
      });
      options.sanitized = true;
    }
    return this.compare(value, options);
  }.bind(this));
};


pie.validator.prototype.email = function email(value, options) {
  options = pie.object.extend({allowBlank: false}, options || {});
  return this.withStandardChecks(value, options, function(){
    return (/^.+@.+\..+$/).test(value);
  });
};


pie.validator.prototype.fn = function(value, options) {
  return this.withStandardChecks(value, options, function(){
    return options.fn.call(null, value, options);
  });
};


pie.validator.prototype.format = function(value, options) {
  options = options || {};
  return this.withStandardChecks(value, options, function() {
    var fmt = options.format;

    if(fmt === 'isoDate'){
      fmt = /^\d{4}\-\d{2}\-\d{2}$/;
    } else if(fmt === 'epochs'){
      fmt = /^\d{10}$/;
    } else if(fmt === 'epochms'){
      fmt = /^\d{13}$/;
    }

    return !!fmt.test(String(value));
  });
};


// must be an integer (2.0 is ok) (good for quantities)
pie.validator.prototype.integer = function(value, options){
  return  this.withStandardChecks(value, options, function(){
    return  this.number(value, options) &&
            parseInt(value, 10) === parseFloat(value, 10);
  }.bind(this));
};


// min/max length of the field
pie.validator.prototype.length = function length(value, options){
  options = pie.object.extend({allowBlank: false}, options || {});

  if(!('gt'  in options)  &&
     !('gte' in options)  &&
     !('lt'  in options)  &&
     !('lte' in options)  &&
     !('eq'  in options) ){
    options.gt = 0;
  }

  return this.withStandardChecks(value, options, function(){
    var length = String(value).trim().length;
    return this.number(length, options);
  }.bind(this));
};


// must be some kind of number (good for money input)
pie.validator.prototype.number = function number(value, options){
  options = options || {};

  return this.withStandardChecks(value, options, function(){

    // not using parseFloat because it accepts multiple decimals
    if(!/^([\-])?([\d]+)?\.?[\d]+$/.test(String(value))) return false;

    var valid = true,
    number = parseFloat(value);

    valid = valid && (!('gt'  in options) || number > options.gt);
    valid = valid && (!('lt'  in options) || number < options.lt);
    valid = valid && (!('gte' in options) || number >= options.gte);
    valid = valid && (!('lte' in options) || number <= options.lte);
    valid = valid && (!('eq'  in options) || number === options.eq);

    return valid;
  });
};


// clean out all things that are not numbers and + and get a minimum of 10 digits.
pie.validator.prototype.phone = function phone(value, options) {
  options = pie.object.extend({allowBlank: false}, options || {});

  return this.withStandardChecks(value, options, function(){
    var clean = String(value).replace(/[^\+\d]+/g, '');
    return this.length(clean, {gte: 10});
  }.bind(this));
};


// does the value have any non-whitespace characters
pie.validator.prototype.presence = function presence(value, options){
  return this.withStandardChecks(value, pie.object.extend({}, options, {allowBlank: false}), function(){
    return !!(value && (/[^ ]/).test(String(value)));
  });
};


pie.validator.prototype.url = function(value, options) {
  return this.withStandardChecks(value, options, function() {
    return (/^.+\..+$/).test(value);
  });
};
