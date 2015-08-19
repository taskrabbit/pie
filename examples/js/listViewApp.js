/* global bindings */
window.app = pie.app.create({
  routeHandlerOptions: {
    uiTarget: '#main'
  }
});

app.router.map({
  '/*path' : {view: 'layout'}
});

pie.ns('lib.views')

lib.views.layout = pie.listView.extend('layout', {
  init: function() {
    this.list = pie.list.create(this.listItems, {cast: true});

    this._super({
      itemOptions: {
        template: 'item',
      }
    });
  },

  setup: function() {
    this.eon('render', 'addElements');
    this.on('click', '.js-shuffle', 'shuffleItems');

    this._super();
  },

  // we don't have a template, we're just adding the button.
  addElements: function() {
    this.el.insertAdjacentHTML('beforeEnd', '<ul></ul><button class="js-shuffle">Shuffle Items</button>');
  },

  shuffleItems: function() {
    this.list.sort(function() {
      return .5 - Math.random();
    });
  },


  listItems: [{
    title: 'Item 1',
  }, {
    title: 'Item 2',
  }, {
    title: 'Item 3',
  }, {
    title: 'Item 4',
  }, {
    title: 'Item 5',
  }, {
    title: 'Item 6',
  }]

});
