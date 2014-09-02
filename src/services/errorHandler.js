pie.services.errorHandler = function errorHandler(app) {
  this.app = app;
  this.responseCodeHandlers = {};
};


// extract the "data" object out of an xhr
pie.services.errorHandler.prototype.data = function(xhr) {
  return xhr.data = xhr.data || (xhr.status ? JSON.parse(xhr.response) : {});
};


// extract an error message from a response. Try to extract the error message from
// the xhr data diretly, or allow overriding by response code.
pie.services.errorHandler.prototype.errorMessagesFromRequest = function(xhr) {
  var d = this.data(xhr),
  errors  = Array.map(d.errors || [], 'message'),
  clean   = this.app.i18n.t('app.errors.' + xhr.status, {default: errors});

  this.app.debug(errors);

  return clean;
};

// find a handler for the xhr via response code or the app default.
pie.services.errorHandler.prototype.handleXhrError = function(xhr) {

  var handler = this.responseCodeHandlers[xhr.status.toString()];

  if(handler) {
    handler.call(xhr, xhr);
  } else {
    this.notifyErrors(xhr);
  }

};

// build errors and send them to the notifier.
pie.services.errorHandler.prototype.notifyErrors = function(xhr){
  var n = this.app.notifier, errors = this.errorMessagesFromRequest(xhr);

  if(errors.length) {
    // clear all alerts when an error occurs.
    n.clear();

    // delay so UI will visibly change when the same content is shown.
    setTimeout(function(){
      n.clear('error');
      n.notify(errors, 'error', 10000);
    }, 100);
  }
};


// register a response code handler
// registerHandler('401', myRedirectCallback);
pie.services.errorHandler.prototype.registerHandler = function(responseCode, handler) {
  this.responseCodeHandlers[responseCode.toString()] = handler;
};


// provide an interface for sending errors to a bug reporting service.
pie.services.errorHandler.prototype.reportError = function(err, options) {
  options = options || {};

  if(options.prefix && 'message' in err) {
    err.message = options.prefix + ' ' + err.message;
  }

  if(options.prefix && 'name' in err) {
    err.name = options.prefix + ' ' + err.name;
  }

  this._reportError(err, options);
};


// hook in your own error reporting service. bugsnag, airbrake, etc.
pie.services.errorHandler.prototype._reportError = function(err) {
  this.app.debug(err);
};
