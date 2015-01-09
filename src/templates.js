pie.templates = pie.model.extend('templates', {

  init: function(app) {
    this._super({}, {
      app: app
    });
  },

  _node: function(name) {
    return document.querySelector(this.app.options.templateSelector + '[id="' + name + '"]');
  },

  registerTemplate: function(name, content) {
    this.app.debug('Compiling and storing template: ' + name);
    var vars = "var h = pie.apps[" + this.app.pieId + "].helpers.provide();";
    vars += "var get = function(p){ return pie.object.getPath(data, p); };";
    Object.keys(this.app.helpers.provide()).forEach(function(k){
      vars += "var " + k + " = h." + k + ";";
    });
    this.set(name, pie.string.template(content, vars));
  },

  load: function(name, cb) {
    var node = this._node(name),
    src = node && node.getAttribute('data-src') || name;

    this.app.resources.load({
      type: 'ajax',
      accept: 'text/html',
      src: src,
      dataSuccess: function(content) {
        this.registerTemplate(name, content);
      }.bind(this),
      error: function() {
        throw new Error("[PIE] Template fetch error: " + name);
      }
    }, cb);

  },

  render: function(name, data) {
    if(!this.get(name)) {

      var node = this._node(name);

      if(node) {
        this.registerTemplate(name, node.content || node.textContent);
      } else {
        throw new Error("[PIE] Unknown template error: " + name);
      }
    }

    return this.get(name)(data || {});
  },

  renderAsync: function(name, data, cb) {
    if(this.get(name)) {
      var content = this.render(name, data);
      cb(content);
      return;
    }

    this.load(name, function(){
      this.renderAsync(name, data, cb);
    }.bind(this));
  },
});
