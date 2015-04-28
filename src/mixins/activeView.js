pie.mixins.activeView = {

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

  setupChild: function(options, cb) {
    var f = function(){
      this._renderChild(options, cb);
    }.bind(this);

    this.emitter.on('afterRender', f);
    return f;
  },

  _renderChild: function(options, cb) {
    var factory = options.factory,
    transitionClass = options.viewTransitionClass || pie.simpleViewTransition,
    childName = options.childName,
    current = this.getChild(childName),
    instance = current,
    target = options.target || options.targetEl,
    trans;

    if(current && !options.force) return;

    if(pie.object.isString(target)) target = this.qs(target);

    // if we have no place to put our view, or if there is no view to place
    if(!target || !(instance = factory())) {

      // if there is a current view, make sure we tear this dude down.
      if(current) {
        this.removeChild(current);
        current.teardown();
      }

      return;
    }

    // there's a new child and a target.
    trans = new transitionClass(this, {
      targetEl: target,
      childName: childName,
      oldChild: current,
      newChild: instance
    });

    trans.transition();

    if(cb) cb(trans);
  },

  _renderTemplateToEl: function() {
    var templateName = this.templateName();

    if(templateName) {
      this.app.templates.renderAsync(templateName, this.renderData(), function(content){
        this.el.innerHTML = content;
        this.emitter.fire('afterRender');
      }.bind(this));
    } else {
      this.emitter.fire('afterRender');
    }
  },

  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.fire('beforeRender');
    this.emitter.fireAround('aroundRender', function(){
      // afterRender should be fired by the render implementation.
      // There's the possibility that a template needs to be fetched from a remote source.
      this.emitter.fire('render');
    }.bind(this));
  },

  templateName: function() {
    return this.options.template;
  }

};
