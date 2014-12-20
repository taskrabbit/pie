// a view class which handles some basic functionality
pie.activeView = pie.view.extend('activeView', function(options) {
  this._super(options);

  this.emitter = new pie.emitter();
  this.emitter.once('afterRender', this._appendToDom.bind(this));
});

pie.activeView.reopen(pie.mixins.externalResources);
pie.activeView.reopen({

  _appendToDom: function() {
    if(!this.renderTarget) return;
    if(this.el.parentNode) return;
    this.renderTarget.appendChild(this.el);
  },


  // this.el receives a loading class, specific buttons are disabled and provided with the btn-loading class.
  _loadingStyle: function(bool) {
    this.el.classList[bool ? 'add' : 'remove']('loading');

    var buttons = this.qsa('.submit-container button.btn-primary, .btn-loading, .btn-loadable');

    pie.dom.all(buttons, bool ? 'classList.add' : 'classList.remove', 'btn-loading');
    pie.dom.all(buttons, bool ? 'setAttribute' : 'removeAttribute', 'disabled', 'disabled');
  },

  _removeFromDom: function() {
    // remove our el if we still have a parent node.
    // don't use pie.dom.remove since we don't want to remove the cache.
    if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },


  setup: function(setupFunc) {
    var sup = this._super.bind(this);

    this.emitter.around('setup', function(){

      sup(function() {

        this.loadExternalResources(this.options.resources, function() {

          if(setupFunc) setupFunc();

          if(this.options.autoRender && this.model) {
            var field = pie.object.isString(this.options.autoRender) ? this.options.autoRender : '_version';
            this.onChange(this.model, this.render.bind(this), field);
          }

          if(this.options.renderOnSetup) {
            this.render();
          }

        }.bind(this));

      }.bind(this));

    }.bind(this));

  },

  // add or remove the default loading style.
  loadingStyle: function(bool) {
    if(bool === undefined) bool = true;
    this._loadingStyle(bool);
  },

  // If the first option passed is a node, it will use that as the query scope.
  // Return an object representing the values of fields within this.el.
  parseFields: function() {
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
  },

  removedFromParent: function(parent) {
    pie.view.prototype.removedFromParent.call(this, parent);
    this._removeFromDom();
  },


  // convenience method which is useful for ajax callbacks.
  removeLoadingStyle: function(){
    this._loadingStyle(false);
  },


  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.around('render', function(){

      var templateName = this.templateName();

      if(templateName) {
        var content = this.app.template(templateName, this.renderData());
        this.el.innerHTML = content;
      }

      this.emitter.fire('render');
    }.bind(this));
  },


  setRenderTarget: function(target) {
    this.renderTarget = target;
    if(this.emitter.has('afterRender')) this._appendToDom();
  },

  templateName: function() {
    return this.options.template;
  }

});
