// a view class which handles some basic functionality
pie.activeView = function activeView(options) {
  pie.view.call(this, options);

  this.emitter = new pie.emitter();
  this.emitter.on('afterRender', this._appendToDom.bind(this), {onceOnly: true});
};

pie.inherit(pie.activeView, pie.view, pie.mixins.externalResources, pie.mixins.validatable);

pie.activeView.prototype._appendToDom = function() {
  if(!this.renderTarget) return;
  if(this.el.parentNode) return;
  this.renderTarget.appendChild(this.el);
};


// this.el receives a loading class, specific buttons are disabled and provided with the btn-loading class.
pie.activeView.prototype._loadingStyle = function(bool) {
  this.el.classList[bool ? 'add' : 'remove']('loading');

  var buttons = this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable');

  pie.dom.all(buttons, bool ? 'classList.add' : 'classList.remove', 'btn-loading');
  pie.dom.all(buttons, bool ? 'setAttribute' : 'removeAttribute', 'disabled', 'disabled');
};


pie.activeView.prototype.init = function(setupFunc) {
  this.emitter.around('init', function(){

    pie.view.prototype.init.call(this, function() {

      this.loadExternalResources(this.options.resources, function() {

        if(setupFunc) setupFunc();

        if(this.options.autoRender && this.model) {
          var field = pie.object.isString(this.options.autoRender) ? this.options.autoRender : '_version';
          this.onChange(this.model, this.render.bind(this), field);
        }

        if(this.options.renderOnInit) {
          this.render();
        }

      }.bind(this));

    }.bind(this));

  }.bind(this));

};

// add or remove the default loading style.
pie.activeView.prototype.loadingStyle = function(bool) {
  if(bool === undefined) bool = true;
  this._loadingStyle(bool);
};

// If the first option passed is a node, it will use that as the query scope.
// Return an object representing the values of fields within this.el.
pie.activeView.prototype.parseFields = function() {
  var o = {}, e = arguments[0], i = 0, n, el;

  if(pie.object.isString(e)) {
    e = this.el;
  } else {
    i++;
  }

  for(;i<arguments.length;i++) {
    n = arguments[i];
    el = e.querySelector('[name="' + n + '"]:not([disabled])');
    if(el) pie.object.setPath(o, n, el.value);
  }
  return o;
};

pie.activeView.prototype.removedFromParent = function(parent) {
  pie.view.prototype.removedFromParent.call(this, parent);

  // remove our el if we still have a parent node.
  // don't use pie.dom.remove since we don't want to remove the cache.
  if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
};


// convenience method which is useful for ajax callbacks.
pie.activeView.prototype.removeLoadingStyle = function(){
  this._loadingStyle(false);
};


pie.activeView.prototype.renderData = function() {
  if(this.model) {
    return this.model.data;
  }

  return {};
};

pie.activeView.prototype.render = function(renderFn) {
  this.emitter.around('render', function(){
    if(this.options.template) {
      var content = this.app.template(this.options.template, this.renderData());
      this.el.innerHTML = content;
    }

    if(renderFn) renderFn();
  }.bind(this));
};


pie.activeView.prototype.setRenderTarget = function(target) {
  this.renderTarget = target;
  if(this.emitter.has('afterRender')) this._appendToDom();
};

