/*global example */

window.app = pie.app.create({
  routeHandlerOptions: {
    uiTarget: '#main',
    viewNamespace: 'example.views'
  }
});

// Translations

app.i18n.load({
  keywords: {
    item: {
      singular: "item",
      plural: "items"
    }
  },
  list: {
    total: {
      zero: "No ${keywords.item.plural} have been added",
      one: "1 ${keywords.item.singular}",
      other: "%{count} ${keywords.item.plural}"
    },
    completed: "%{count} completed."
  }
});

// Routes
app.router.map({
  '/*path' : { view: 'layout' }
});


// MODELS

todoList = pie.list.extend({
  init: function() {
    this._super([], {cast: true});

    this.sets({
      totalCount: 0,
      completedCount: 0
    });

    this.boundObserver = this.childChanged.bind(this);
    this.observe(this.onListChange.bind(this));
  },

  onListChange: function(changeSet) {
    var lengthChange = changeSet.get('length');
    if(lengthChange) this.set('totalItems', lengthChange.value);

    var addChanges = changeSet.queryAll({type: 'add'});
    for(var i = 0; i < addChanges.length; i++) {
      if(addChanges[i].name.test(/^\d+$/)) {
        addChanges[i].value.observe(this.boundObserver, 'completed');
      }
    }

    var removeChanges = changeSet.queryAll({type: 'delete'});
    for(var i = 0; i < removeChanges.length; i++) {
      if(removeChanges[i].name.test(/^\d+$/)) {
        removeChanges[i].value.unobserve(this.boundObserver);
      }
    }
  },

  childChanged: function(changeSet) {
    var change = changeSet.get('completed');
    var delta = (change.value ? 1 : 0) - (change.oldValue ? 1 : 0);
    this.set('completedCount', this.get('completedCount') + delta);
  }
});


// VIEWS

// the page level view.
// this view handles managing it's children, initializes page context via the pie.list.
pie.ns('example.views').layout = pie.activeView.extend('layout', {

  init: function() {

    // this is our page "context". It represents a list of items.
    this.list = todoList.create();

    this._super({

      // this is the template this view renders.
      template: 'layoutContainer',

      // since we don't need to retrieve anything from a web service, we can render immediately.
      renderOnSetup: true
    });
  },

  setup: function() {

    this.setupChild({
      childName: 'form',
      factory: function(){ return example.views.form.create(this.list); }.bind(this),
      target: '.form-container'
    });

    this.setupChild({
      childName: 'list',
      factory: function(){ return example.views.list.create(this.list); }.bind(this),
      target: '.list-container'
    });

    this._super();
  }

});

// this view handles taking in user input to modify the list model.
// notice the model is provided to the form explicity. This isn't necessary, but is generally a good idea.
example.views.form = pie.formView.extend({
  init: function(listModel) {

    // this.model is special in that the default renderData() implementation checks for this.
    this.list = listModel;

    this._super({
      template: 'formContainer',
      fields: [{
        name: 'nextItem',
        validation: {
          presence: {message: "You can't submit a blank item!"}
        }
      }],
      refs: {
        nextItem: 'input[name="nextItem"]'
      },
      validationStrategy: 'validate'
    });
  },

  // we override init to set up events.
  setup: function() {
    // observe changes to our validation
    this.observe(this.list, 'validationChanged', 'validationErrors.nextItem');
    this._super();
  },

  // handle our form submission.
  performSubmit: function(data) {
    this.list.push({
      title: data.nextItem,
      completed: false
    });

    this.model.reset();
    return pie.promise.resolve();
  },

  // when the validation changes, determine the correct bg color.
  validationChanged: function(changes) {
    if(this.model.is('validationErrors.nextItem.length')) {
      this.refs.nextItem.style.backgroundColor = 'rgba(255,0,0,0.2)';
    } else {
      this.refs.nextItem.style.backgroundColor = 'inherit';
    }
  }

});


// this view handles rendering the list and dealing with removals.
example.views.list = pie.listView.extend({

  init: function(listModel) {

    // this.model is needed for autoRender
    // if you didn't use autoRender you would have to add
    // this.observe(this.list, 'render', 'items') in init.
    this.list = this.model = listModel;

    // this time we use autoRender to automatically render this view
    // any time the "items" attribute of the model changes.
    this._super({
      template: 'listContainer',
      itemOptions: {
        viewFactory: function(opts, data, i) { return example.views.item.create(this.list, data); }.bind(this)
      }
    });
  },

  // set up our events, then invoke super.
  setup: function() {
    this.on('click', '.js-complete-all', 'completeAll');
    this.observe(this.list, 'updateSummary', 'completedCount', 'totalCount');
    this.eon('afterRender', 'updateSummary');
    this._super();
  },

  completeAll: function(e) {
    this.consumeEvent(e);

    this.list.forEach(function(item){
      item.set('completed', 1);
    });
  },

  updateSummary: function() {
    var l = this.list.get('totalCount'),
    c = this.list.get('completedCount'),
    total = this.app.i18n.t('list.total', {count: l}),
    completed = this.app.i18n.t('list.completed', {count: c});

    this.qs('#summary').innerHTML = pie.array.compact([total, completed], true).join(', ');
    this.qs('.js-complete-all').style.display = l ? 'block' : 'none';
  }
});

// this view handles rendering an individual item
example.views.item = pie.activeView.extend('item', {

  init: function(listModel, itemModel) {
    this.list = listModel;
    this.item = this.model = itemModel;

    this._super('itemContainer');
  },

  // set up our events, then invoke super.
  setup: function() {
    this.bind({attr: 'completed'});

    // any time a js-delete link is clicked, invoke deleteItem.
    this.on('click', '.js-delete', this.deleteItem.bind(this));

    this._super();
  },

  deleteItem: function(e) {
    // don't follow the link.
    this.consumeEvent(e);

    // grab the index from the data- attribute.
    var index = this.list.indexOf(this.item);

    // remove the item from the list.
    this.list.remove(index);
  }
}, pie.mixins.bindings);
