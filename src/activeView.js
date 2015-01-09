// a view class which handles some basic functionality
pie.activeView = pie.view.extend('activeView', {

  setup: function() {

    if(this.options.autoRender && this.model) {
      var field = pie.object.isString(this.options.autoRender) ? this.options.autoRender : '_version';
      this.onChange(this.model, this.render.bind(this), field);
    }

    if(this.options.renderOnSetup) {
      this.emitter.once('setup', this.render.bind(this));
    }

    this.emitter.on('render', this._renderTemplateToEl.bind(this));

    this._super();
  },

  _renderTemplateToEl: function() {
    var templateName = this.templateName();

    if(templateName) {
      var content = this.app.templates.render(templateName, this.renderData());
      this.el.innerHTML = content;
    }
  },

  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.fireSequence('render');
  },

  templateName: function() {
    return this.options.template;
  }

});
