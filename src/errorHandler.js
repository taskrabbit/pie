pie.errorHandler = pie.model.extend('errorHandler', {

  init: function(app) {
    this._super({
      responseCodeHandlers: {}
    }, {
      app: app
    });
  },


  // extract the "data" object out of an xhr
  xhrData: function(xhr) {
    return xhr.data = xhr.data || (xhr.status ? JSON.parse(xhr.response) : {});
  },


  // extract an error message from a response. Try to extract the error message from
  // the xhr data diretly, or allow overriding by response code.
  errorMessagesFromRequest: function(xhr) {
    var d = this.xhrData(xhr),
    errors  = pie.array.map(d.errors || [], 'message'),
    clean;

    errors = pie.array.compact(errors, true);
    clean   = this.app.i18n.t('app.errors.' + xhr.status, {default: errors});

    this.app.debug(errors);

    return pie.array.from(clean);
  },

  getResponseCodeHandler: function(status) {
    return this.get('responseCodeHandlers.' + status);
  },

  // find a handler for the xhr via response code or the app default.
  handleXhrError: function(xhr) {

    var handler = this.getResponseCodeHandler(xhr.status.toString());

    if(handler) {
      handler.call(xhr, xhr);
    } else {
      this.notifyErrors(xhr);
    }

  },

  // build errors and send them to the notifier.
  notifyErrors: function(xhr){
    var n = this.app.notifier, errors = this.errorMessagesFromRequest(xhr);

    if(errors.length) {
      // clear all previous errors when an error occurs.
      n.clear('error');

      // delay so UI will visibly change when the same content is shown.
      setTimeout(function(){
        n.notify(errors, 'error', 10000);
      }, 100);
    }
  },


  // register a response code handler
  // registerHandler('401', myRedirectCallback);
  registerHandler: function(responseCode, handler) {
    this.set('responseCodeHandlers.' + responseCode.toString(), handler);
  },


  // provide an interface for sending errors to a bug reporting service.
  reportError: function(err, options) {
    options = options || {};

    if(options.prefix && pie.object.has(err, 'message')) {
      err.message = options.prefix + ' ' + err.message;
    }

    if(options.prefix && pie.object.has(err, 'name')) {
      err.name = options.prefix + ' ' + err.name;
    }

    this._reportError(err, options);
  },


  // hook in your own error reporting service. bugsnag, airbrake, etc.
  _reportError: function(err) {
    this.app.debug(err);
  }
});
