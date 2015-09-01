pie.activeView = pie.view.extend('activeView', {

  init: function(options) {
    if(pie.object.isString(options)) options = {template: options};
    this._super(options);
    if(!this.model && this.options.model) this.model = this.options.model;
    this.refs = {};
  },

  setup: function() {

    if(this.options.autoRender && this.model) {
      var args = pie.object.isBoolean(this.options.autoRender) ? ['~'] : pie.array.from(this.options.autoRender);
      args.unshift('render');
      args.unshift(this.model);
      this.observe.apply(this, args);
    }

    if(this.options.renderOnSetup || this.options.renderOnSetup === undefined) {
      this.eonce('setup', 'render');
    }

    if(this.options.refs) {
      this.setupRefs();
      this.eprepend('render:after', 'clearRefCache');
    }

    this.eon('render', '_renderTemplateToEl');

    this._super();
  },

  hasChild: function(options) {
    var f = function boundRenderChild(){ return this._renderChild(options); }.bind(this);

    var events = options.events;
    if(events === undefined) events = ['render:after'];

    pie.array.from(events).forEach(function(e){
      this.eon(e, f);
    }.bind(this));
    return f;
  },

  _renderChild: function(options) {

    if(!this.isInApp()) return;

    var factory = options.factory,
    transitionClass = options.viewTransitionClass || pie.simpleViewTransition,
    childName = options.name,
    current = this.getChild(childName),
    instance = current,
    target = options.sel,
    filter = pie.object.isString(options.filter) ? this[options.filter].bind(this) : options.filter,
    blocker = pie.object.isString(options.blocker) ? this[options.blocker].bind(this) : options.blocker,
    info = {
      childName: childName,
      current: this.getChild(childName),
    },
    trans;

    if(pie.object.isString(target)) target = this.qs(target);

    info.target = target;

    // if we have no place to put our view or we've been filtered, remove the current child
    if(!target || (filter && filter() === false)) {

      // if there is a current view, make sure we tear this dude down.
      if(current) {
        this.removeChild(current);
        current.teardown();
      }

      this.emitter.fire(childName + ':teardown', info);
      return;
    }

    this.emitter.fire(childName + ':manage:before', info);

    var aroundTrigger = function(){
      this.emitter.fireAround(childName + ':manage:around', function activeViewRenderChild() {

        instance = factory(current);

        if(!current && !instance) return;

        info.instance = instance;

        // if we are dealing with the same instance, make sure we don't remove it, only add it.
        if(current === instance) {
          // if we're still attached to the previous render, move us to the new one.
          if(!target.contains(current.el)) current.addToDom(target);
          this.emitter.fire(childName + ':manage', info);
          this.emitter.fire(childName + ':manage:after', info);
          return;
        }

        // there's a child and a target.
        trans = transitionClass.create(this, pie.object.merge(options.viewTransitionOptions, {
          targetEl: target,
          childName: childName,
          oldChild: current,
          newChild: instance
        }));


        info.transition = trans;
        this.emitter.fire(childName + ':manage', info);

        trans.transition(function(){
          this.emitter.fire(childName + ':manage:after', info);
        }.bind(this));

      }.bind(this));
    }.bind(this);

    if(blocker) blocker(aroundTrigger);
    else aroundTrigger();
  },

  _renderTemplateToEl: function() {
    var templateName = pie.fn.valueFrom(this.templateName, this);

    if(templateName) {
      this.app.templates.renderAsync(templateName, this.renderData(), function activeViewOnTemplateReady(content){
        this.el.innerHTML = content;
        this.emitter.fire('render:after');
      }.bind(this));
    } else {
      this.emitter.fire('render:after');
    }
  },

  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.fire('render:before');
    this.emitter.fireAround('render:around', function activeViewRender(){
      // render:after should be fired by the render implementation.
      // There's the possibility that a template needs to be fetched from a remote source.
      this.emitter.fire('render');
    }.bind(this));
  },

  templateName: function() {
    return this.options.template;
  },

  setupRefs: function() {
    var refs = {};
    var self = this;

    Object.defineProperty(refs, '_cache', {
      iteratable: false,
      writable: true
    });

    refs.fetch = function(name){
      delete refs._cache[name];
      return refs[name];
    };

    refs._cache = {};

    pie.object.forEach(self.options.refs, function(k,v) {

      Object.defineProperty(refs, k, {
        iteratable: false,
        get: function() {
          if(pie.object.has(refs._cache, k)) return refs._cache[k];
          return refs._cache[k] = self.qs(v);
        }
      });

    });

    self[self.options.refsName || 'dom'] = refs;
  },

  clearRefCache: function() {
    this[this.options.refsName || 'dom']._cache = {};
  }

});
