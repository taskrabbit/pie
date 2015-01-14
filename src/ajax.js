pie.ajax = pie.base.extend('ajax', {

  init: function(app){
    this.app = app;
  },

  defaultAjaxOptions: {
    accept: 'application/json',
    verb: 'GET'
  },

  // Interface for conducting ajax requests.
  // Returns a pie.ajaxRequest object
  ajax: function(options, skipSend) {
    if(pie.object.isString(options)) options = {url: options};

    options = pie.object.merge({}, this.defaultAjaxOptions, options);

    var request = new pie.ajaxRequest({}, { app: this.app });
    request.build(options, skipSend);

    /* add a default error handler if the user hasn't provided one. */
    if(!request.emitter.hasCallback('error')) {
      request.error(this.app.errorHandler.handleXhrError.bind(this.app.errorHandler));
    }

    return request;
  },


  del: function(options, skipSend) {
    options = pie.object.merge({verb: 'DELETE'}, options);
    return this.ajax(options, skipSend);
  },

  get: function(options, skipSend) {
    options = pie.object.merge({verb: 'GET'}, options);
    return this.ajax(options, skipSend);
  },

  patch: function(options, skipSend) {
    options = pie.object.merge({verb: 'PATCH'}, options);
    return this.ajax(options, skipSend);
  },

  post: function(options, skipSend) {
    options = pie.object.merge({verb: 'POST'}, options);
    return this.ajax(options, skipSend);
  },

  put: function(options, skipSend) {
    options = pie.object.merge({verb: 'PUT'}, options);
    return this.ajax(options, skipSend);
  }

});
