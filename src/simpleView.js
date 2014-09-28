pie.simpleView = function simpleView(app, options) {
  pie.view.call(this, app, options);
};

pie.simpleView.prototype = Object.create(pie.view.prototype);
pie.simpleView.prototype.constructor = pie.simpleView;

pie.simpleView.prototype.addedToParent = function(parent) {
  pie.view.prototype.addedToParent.call(this, parent);

  if(this.options.autoRender && this.model) {
    var field = typeof this.options.autoRender === 'string' ? this.options.autoRender : 'updated_at';
    this.onChange(this.model, this.render.bind(this), field);
  }

  if(this.options.renderOnAddedToParent) {
    this.render();
  }

  return this;
};

pie.simpleView.prototype.renderData = function() {
  if(this.model) {
    return this.model.data;
  }

  return {};
};

pie.simpleView.prototype.render = function() {

  if(this.options.template) {
    var content = this.app.template(this.options.template, this.renderData());
    this.el.innerHTML = content;
  }

  return this;
};
