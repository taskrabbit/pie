/* global bindings */
window.app = new pie.app({
  viewNamespace: 'bindings'
});


app.router.route({
  '/examples/binding.html' : {view: 'layout'}
});



pie.ns('bindings');


bindings.layout = pie.activeView.extend('layout', {
  init: function() {

    this._super({
      template: 'layout',
      renderOnSetup: true
    });

    this.model = new pie.model({
      val: 'theValue',
      attr: 'theAttr',
      text: 'theText',
      html: '<strong>theHtml</strong>',
      checks: [1, 2, 4],
      radio: 1
    });

    this.bind({
      attr: 'val',
      type: 'value'
    }, {
      attr: 'attr',
      type: 'attribute',
      toModel: false
    }, {
      attr: 'text',
      type: 'text',
      sel: 'p.js-text-binding',
      toModel: false
    }, {
      attr: 'html',
      type: 'html',
      sel: 'p.js-html-binding',
      toModel: false
    }, {
      attr: 'checks',
      type: 'check',
      dataType: 'integer'
    }, {
      attr: 'radio',
      type: 'radio',
      dataType: 'integer'
    });

    this.onChange(this.model, this.modelChanged.bind(this));
    this.on('click', 'button[name="update"]', this.updateModel.bind(this));
    this.emitter.once('afterSetup', this.modelChanged.bind(this));
  },

  modelChanged: function() {
    var str = JSON.stringify(this.model.data, null, '  ');
    this.qs('textarea[name="json"]').value = str;

    this.qs('input[name="attr"]').value = this.model.get('attr');
  },

  updateModel: function() {
    var str = this.qs('textarea[name="json"]').value;
    var data = JSON.parse(str);
    delete data._version;
    this.model.sets(data);
  }

}, pie.mixins.bindings);



