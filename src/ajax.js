pie.ajax = pie.base.extend('ajax', {

  init: function(app){
    this.app = app;
    this._super();
  },

  defaultAjaxOptions: {
    verb: 'GET',
    accept: 'application/json',
    headers: {}
  },

  _normalizeOptions: function(options) {
    if(pie.object.isString(options)) options = {url: options};
    return options;
  },

  // Interface for conducting ajax requests.
  // Returns a pie.ajaxRequest object
  ajax: function(options, skipSend) {
    options = pie.object.deepMerge({}, this.defaultAjaxOptions, this._normalizeOptions(options));

    var request = pie.ajaxRequest.create({}, { app: this.app });
    request.build(options, skipSend);

    /* add a default error handler if the user hasn't provided one. */
    if(!request.emitter.hasCallback('error')) {
      request.error(this.app.errorHandler.handleXhrError.bind(this.app.errorHandler));
    }

    return request;
  },


  del: function(options, skipSend) {
    options = pie.object.merge({verb: 'DELETE'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  get: function(options, skipSend) {
    options = pie.object.merge({verb: 'GET'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  patch: function(options, skipSend) {
    options = pie.object.merge({verb: 'PATCH'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  post: function(options, skipSend) {
    options = pie.object.merge({verb: 'POST'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  put: function(options, skipSend) {
    options = pie.object.merge({verb: 'PUT'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  }

});
