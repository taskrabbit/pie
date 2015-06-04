pie.activeView = pie.view.extend('activeView', {

  init: function(options) {
    if(pie.object.isString(options)) options = {template: options};
    this._super(options);
  },

  setup: function() {

    if(this.options.autoRender && this.model) {
      var field = pie.object.isString(this.options.autoRender) ? this.options.autoRender : '_version';
      this.observe(this.model, this.render.bind(this), field);
    }

    if(this.options.renderOnSetup || this.options.renderOnSetup === undefined) {
      this.eonce('setup', this.render.bind(this));
    }

    this.eon('render', this._renderTemplateToEl.bind(this));

    this._super();
  },

  setupChild: function(options, cb) {
    var f = function(){
      this._renderChild(options, cb);
    }.bind(this);

    var events = options.events;
    if(events === undefined) events = ['afterRender'];

    pie.array.from(events).forEach(function(e){
      this.eon(e, f);
    }.bind(this));
    return f;
  },

  _renderChild: function(options, cb) {
    var factory = options.factory,
    transitionClass = options.viewTransitionClass || pie.simpleViewTransition,
    childName = options.childName,
    current = this.getChild(childName),
    instance = current,
    target = options.target || options.targetEl,
    filter = pie.object.isString(options.filter) ? this[options.filter].bind(this) : options.filter,
    trans;

    if(pie.object.isString(target)) target = this.qs(target);

    // if we have no place to put our view or we've been filtered, remove the current child
    if(!target || (filter && filter() === false)) {

      // if there is a current view, make sure we tear this dude down.
      if(current) {
        this.removeChild(current);
        current.teardown();
      }

      return;
    }

    instance = factory();

    // if we are dealing with the same instance, make sure we don't remove it, only add it.
    if(current === instance) current = null;

    // there's a child and a target.
    trans = transitionClass.create(this, pie.object.merge(options.viewTransitionOptions, {
      targetEl: target,
      childName: childName,
      oldChild: current,
      newChild: instance
    }));

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

});
