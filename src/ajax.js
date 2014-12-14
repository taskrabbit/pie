pie.ajax = function ajax(app) {
  this.app = app;
  this.defaultAjaxOptions = {};
};

pie.ajax.prototype.GET = 'GET';
pie.ajax.prototype.POST = 'POST';
pie.ajax.prototype.PUT = 'PUT';
pie.ajax.prototype.DELETE = 'DELETE';

// default ajax options. override this method to
pie.ajax.prototype._defaultAjaxOptions = function() {
  return pie.object.merge({}, this.defaultAjaxOptions, {
    type: 'json',
    verb: this.GET,
    error: this.app.errorHandler.handleXhrError.bind(this.app.errorHandler)
  });
};


// interface for conducting ajax requests.
// app.ajax.post({
//  url: '/login',
//  data: { email: 'xxx', password: 'yyy' },
//  progress: this.progressCallback.bind(this),
//  success: this.
// })
pie.ajax.prototype.ajax = function(options) {

  options = pie.object.compact(options);
  options = pie.object.merge({}, this._defaultAjaxOptions(), options);

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
};

pie.ajax.prototype.get = function(options) {
  options = pie.object.merge({verb: this.GET}, options);
  return this.ajax(options);
};

pie.ajax.prototype.post = function(options) {
  options = pie.object.merge({verb: this.POST}, options);
  return this.ajax(options);
};

pie.ajax.prototype.put = function(options) {
  options = pie.object.merge({verb: this.PUT}, options);
  return this.ajax(options);
};

pie.ajax.prototype.del = function(options) {
  options = pie.object.merge({verb: this.DELETE}, options);
  return this.ajax(options);
};

pie.ajax.prototype._applyCsrfToken = function(xhr, options) {
  var token = pie.func.valueFrom(options.csrfToken),
  tokenEl;

  if(!token) {
    tokenEl = document.querySelector('meta[name="csrf-token"]'),
    token = tokenEl ? tokenEl.getAttribute('content') : null;
  }

  if(token) {
    xhr.setRequestHeader('X-CSRF-Token', token);
  }
};

pie.ajax.prototype._applyHeaders = function(xhr, options) {
  var meth = pie.string.modularize('_apply_' + options.type + '_headers');
  (this[meth] || this._applyDefaultHeaders)(xhr, options);

  this._applyCsrfToken(xhr, options);

  if(pie.object.isString(options.data)) {
    xhr.setRequestHeader('Content-Type', options.contentType || 'application/x-www-form-urlencoded');
  // if we aren't already sending a string, we will encode to json.
  } else {
    xhr.setRequestHeader('Content-Type', 'application/json');
  }
};

pie.ajax.prototype._applyDefaultHeaders = function(xhr, options) {};

pie.ajax.prototype._applyJsonHeaders = function(xhr, options) {
  xhr.setRequestHeader('Accept', 'application/json');
};

pie.ajax.prototype._applyHtmlHeaders = function(xhr, options) {
  xhr.setRequestHeader('Accept', 'text/html');
};

pie.ajax.prototype._applyTextHeaders = function(xhr, options) {
  xhr.setRequestHeader('Accept', 'text/plain');
};

pie.ajax.prototype._parseResponse = function(xhr, options) {
  var meth = pie.string.modularize('_parse_' + options.type + '_response');
  (this[meth] || this._parseDefaultResponse)(xhr, options);
};

pie.ajax.prototype._parseDefaultResponse = function(xhr, options) {
  xhr.data = xhr.responseText;
};

pie.ajax.prototype._parseJsonResponse = function(xhr, options) {
  try{
    xhr.data = xhr.responseText.trim().length ? JSON.parse(xhr.responseText) : {};
  } catch(err) {
    this.app.debug("could not parse JSON response: " + err);
    xhr.data = {};
  }
};
