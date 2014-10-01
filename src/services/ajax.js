pie.services.ajax = function ajax(app) {
  this.app = app;
  this.defaultAjaxOptions = {};
};


// default ajax options. override this method to
pie.services.ajax.prototype._defaultAjaxOptions = function() {
  return pie.object.extend({}, this.defaultAjaxOptions, {
    dataType: 'json',
    type: 'GET',
    error: this.app.errorHandler.handleXhrError
  });
};


// interface for conducting ajax requests.
// app.ajax.post({
//  url: '/login',
//  data: { email: 'xxx', password: 'yyy' },
//  progress: this.progressCallback.bind(this),
//  success: this.
// })
pie.services.ajax.prototype.ajax = function(options) {

  options = pie.object.compact(options);
  options = pie.object.extend({}, this._defaultAjaxOptions(), options);

  if(options.extraError) {
    var oldError = options.error;
    options.error = function(xhr){ oldError(xhr); options.extraError(xhr); };
  }

  var app = this.app, xhr = new XMLHttpRequest(), url = options.url, d;

  if(options.type === 'GET' && options.data) {
    url = app.router.path(url, options.data);
  } else {
    url = app.router.path(url);
  }

  if(options.progress) {
    xhr.addEventListener('progress', options.progress, false);
  } else if(options.uploadProgress) {
    xhr.upload.addEventListener('progress', options.uploadProgress, false);
  }

  xhr.open(options.type, url, true);

  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');

  this._applyCsrfToken(xhr);

  xhr.onload = function() {
    if(options.tracker) options.tracker(this);

    try{
      this.data = this.responseText.trim().length ? JSON.parse(this.responseText) : {};
    } catch(err) {
      app.debug("could not parse JSON response: " + err);
      this.data = {};
    }

    if(this.status >= 200 && this.status < 300 || this.status === 304) {
      if(options.dataSuccess) options.dataSuccess(this.data);
      if(options.success) options.success(this.data, this);
    } else if(options.error){
      options.error(this);
    }

    if(options.complete) options.complete(this);
  };

  if(options.type !== 'GET') {
    d = options.data ? (typeof options.data === 'string' ? options.data : JSON.stringify(pie.object.compact(options.data))) : undefined;
  }

  xhr.send(d);
  return xhr;
};

pie.services.ajax.prototype.get = function(options) {
  options = pie.object.extend({type: 'GET'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype.post = function(options) {
  options = pie.object.extend({type: 'POST'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype.put = function(options) {
  options = pie.object.extend({type: 'PUT'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype.del = function(options) {
  options = pie.object.extend({type: 'DELETE'}, options);
  return this.ajax(options);
};

pie.services.ajax.prototype._applyCsrfToken = function(xhr) {
  var tokenEl = document.querySelector('meta[name="csrf-token"]'),
  token = tokenEl ? tokenEl.getAttribute('content') : null;
  if(token) {
    xhr.setRequestHeader('X-CSRF-Token', token);
  }
};
