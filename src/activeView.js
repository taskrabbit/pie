// a view class which handles some basic functionality
pie.activeView = pie.view.extend('activeView', function(options) {
  this._super(options);

  this.emitter = new pie.emitter();
  this.emitter.on('render', this._renderTemplateToDom.bind(this));
  this.emitter.once('afterRender', this._appendToDom.bind(this));
});

pie.activeView.reopen({

  _appendToDom: function() {
    if(!this.renderTarget) return;
    if(this.el.parentNode) return;
    this.renderTarget.appendChild(this.el);
  },

  _removeFromDom: function() {
    // remove our el if we still have a parent node.
    // don't use pie.dom.remove since we don't want to remove the cache.
    if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },

  _renderTemplateToDom: function() {
    var templateName = this.templateName();

    if(templateName) {
      var content = this.app.templates.render(templateName, this.renderData());
      this.el.innerHTML = content;
    }
  },


  setup: function() {
    this.emitter.once('setup', this._super.bind(this));

    this.emitter.around('setup', function(){

      this.emitter.fire('setup');

      if(this.options.autoRender && this.model) {
        var field = pie.object.isString(this.options.autoRender) ? this.options.autoRender : '_version';
        this.onChange(this.model, this.render.bind(this), field);
      }

      if(this.options.renderOnSetup) {
        this.render();
      }

    }.bind(this));

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

  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.around('render', function(){
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
