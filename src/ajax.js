pie.ajax = pie.base.extend('ajax', {

  init: function(app){
    this.app = app;
    this.defaultAjaxOptions = {};
  },

  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',

  // default ajax options. override this method to
  _defaultAjaxOptions: function() {
    return pie.object.merge({}, this.defaultAjaxOptions, {
      accept: 'application/json',
      verb: this.GET,
      error: this.app.errorHandler.handleXhrError.bind(this.app.errorHandler)
    });
  },


  // interface for conducting ajax requests.
  // app.ajax.post({
  //  url: '/login',
  //  data: { email: 'xxx', password: 'yyy' },
  //  progress: this.progressCallback.bind(this),
  //  success: this.
  // })
  ajax: function(options) {

    options = pie.object.compact(options);
    options = pie.object.merge({}, this._defaultAjaxOptions(), options);
    options.verb = options.verb.toUpperCase();

    if(options.extraError) {
      var oldError = options.error;
      options.error = function(xhr){ oldError(xhr); options.extraError(xhr); };
    }

    var xhr = new XMLHttpRequest(),
    url = options.url,
    that = this,
    d;

    if(options.verb === this.GET && options.data) {
      url = this.app.router.path(url, options.data);
    } else {
      url = this.app.router.path(url);
    }

    if(options.progress) {
      xhr.addEventListener('progress', options.progress, false);
    } else if(options.uploadProgress) {
      xhr.upload.addEventListener('progress', options.uploadProgress, false);
    }

    xhr.open(options.verb, url, true);

    this._applyHeaders(xhr, options);
    if(options.setup) options.setup(xhr, options);

    xhr.onload = function() {
      if(options.tracker) options.tracker(this);

      that._parseResponse(this, options);

      if(this.status >= 200 && this.status < 300 || this.status === 304) {
        if(options.dataSuccess) options.dataSuccess(this.data);
        if(options.success) options.success(this.data, this);
      } else if(options.error){
        options.error(this);
      }

      if(options.complete) options.complete(this);
    };

    if(options.verb !== this.GET) {
      d = options.data ? (pie.object.isString(options.data) ? options.data : JSON.stringify(pie.object.compact(options.data))) : undefined;
    }

    xhr.send(d);
    return xhr;
  },

  get: function(options) {
    options = pie.object.merge({verb: this.GET}, options);
    return this.ajax(options);
  },

  post: function(options) {
    options = pie.object.merge({verb: this.POST}, options);
    return this.ajax(options);
  },

  put: function(options) {
    options = pie.object.merge({verb: this.PUT}, options);
    return this.ajax(options);
  },

  del: function(options) {
    options = pie.object.merge({verb: this.DELETE}, options);
    return this.ajax(options);
  },

  _applyCsrfToken: function(xhr, options) {
    var token = pie.fn.valueFrom(options.csrfToken),
    tokenEl;

    if(!token) {
      tokenEl = document.querySelector('meta[name="csrf-token"]'),
      token = tokenEl ? tokenEl.getAttribute('content') : null;
    }

    if(token) {
      xhr.setRequestHeader('X-CSRF-Token', token);
    }
  },

  _applyHeaders: function(xhr, options) {

    this._applyCsrfToken(xhr, options);

    if(options.accept) xhr.setRequestHeader('Accept', options.accept);

    if(options.contentType) {
      xhr.setRequestHeader('Content-Type', options.contentType);
    } else if(pie.object.isString(options.data)) {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // if we aren't already sending a string, we will encode to json.
    } else {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }
  },

  _parseResponse: function(xhr, options) {
    var parser = options.accept && this.responseParsers[options.accept] || this.responseParsers.default;
    xhr.data = parser(xhr, options);
  },

  responseParsers: {

    "application/json" : function(xhr, options) {
      try{
        return xhr.responseText.trim().length ? JSON.parse(xhr.responseText) : {};
      } catch(err) {
        this.app.debug("could not parse JSON response: " + err);
        return {};
      }
    },

    "default" : function(xhr, options) {
      return xhr.responseText;
    }
  }
});
