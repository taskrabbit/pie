/*global example */

window.app = new pie.app({
  uiTarget: '#main',
  viewNamespace: 'example.views'
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
app.router.route({
  '/example.html' : { view: 'layout' }
});


// VIEWS

// our custom namespace;
window.example = {
  views: {}
};

// the page level view.
// this view handles managing it's children, initializes page context via the pie.list.
example.views.layout = function layout() {

  pie.activeView.call(this, {

    // this is the template this view renders.
    template: 'layoutContainer',

    // since we don't need to retrieve anything from a web service, we can render immediately.
    renderOnInit: true,

    // lol, jk
    // resources: ['//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js']
  });

  // this is our page "context". It represents a list of items.
  this.list = new pie.list([]);

  pie.extend(this.list, pie.mixins.validatable);

  this.list.validates({
    nextItem: {presence: {message: "You can't submit a blank item!"}}
  });
};

pie.inherit(example.views.layout, pie.activeView, {
  render: function() {
    // since this is a simpleView and we provide the template name in the constructor,
    // we have to invoke super here.
    this._super('render', function() {

      // ensure we don't have any children (rerender)
      this.removeChildren();

      // add our form view which will handle the addition of data.
      // addChild sets up the child view and relates it to this view (the parent).
      this.addChild('form', new example.views.form(this.list));

      // we still haven't added it to the dom yet, though. So we choose where to put it.
      this.getChild('form').setRenderTarget(this.qs('.form-container'));

      // add our list view.
      this.addChild('list', new example.views.list(this.list));
      this.getChild('list').setRenderTarget(this.qs('.list-container'));

    }.bind(this));
  }
});

// this view handles taking in user input to modify the list model.
// notice the model is provided to the form explicity. This isn't necessary, but is generally a good idea.
example.views.form = function form(listModel) {

  pie.activeView.call(this, {
    template: 'formContainer',
    renderOnInit: true
  });

  // this.model is special in that the default renderData() implementation checks for this.
  this.list = this.model = listModel;
};

pie.inherit(example.views.form, pie.activeView, pie.mixins.bindings, {

  // we override init to set up events.
  init: function() {

    this._super('init', function() {
      // first, we setup our bound attributes.
      // this simple form of the bind is equivalent to:
      // this.bind({
      //   model: this.model,
      //   attr: 'nextItem',
      //   sel: 'input[name="nextItem"]',
      //   trigger: 'keyup change',
      //   debounce: false
      // })
      this.bind({attr: 'nextItem'});

      // we observe the form submission and invoke handleSubmission when it occurs.
      this.on('submit', 'form', this.handleSubmission.bind(this));

      // any time the input changes, we force validation, which we observe below.
      this.on('keyup', 'input', this.validate.bind(this));

      // observe changes to our validation
      this.onChange(this.list, this.validationChanged.bind(this), 'validationErrors.nextItem');

    }.bind(this));

  },

  // handle our form submission.
  handleSubmission: function(e) {
    // don't really submit it...
    e.preventDefault();

    this.list.validateAll(function() {
      // insert the item at the beginning.
      var newItem = new pie.model({title: this.list.get('nextItem'), completed: false});
      this.list.push(newItem);

      // remove the nextItem attribute, updating the UI.
      this.list.set('nextItem', '');
    }.bind(this));
  },

  // when the validation changes, determine the correct bg color.
  validationChanged: function(changes) {
    var change = pie.array.last(changes),
    el = this.qs('input');
    if(change.value && change.value.length) {
      el.style.backgroundColor = 'rgba(255,0,0,0.2)';
    } else {
      el.style.backgroundColor = 'inherit';
    }
  },

  // validate the nextItem of the list.
  validate: function() {
    this.list.validate('nextItem');
  }

});


// this view handles rendering the list and dealing with removals.
example.views.list = function list(listModel) {

  // this time we use autoRender to automatically render this view
  // any time the "items" attribute of the model changes.
  pie.activeView.call(this, {
    template: 'listContainer',
    renderOnInit: true
  });

  // this.model is needed for autoRender
  // if you didn't use autoRender you would have to add
  // this.onChange(this.list, this.render.bind(this), 'items') in init.
  this.list = this.model = listModel;
};


pie.inherit(example.views.list, pie.activeView, {

  // set up our events, then invoke super.
  init: function() {
    this._super('init', function() {
      this.on('click', '.js-complete-all', this.completeAll.bind(this));

      this.onChange(this.list, this.listChanged.bind(this));
    }.bind(this));
  },

  completeAll: function(e) {
    e.preventDefault();

    this.list.forEach(function(item){
      item.set('completed', true);
    });
  },

  itemAdded: function(change) {
    var sibling = change.oldValue && this.getChild('view-' + change.oldValue.pieId),
    child = new example.views.item(this.list, change.value);

    this.addChild('view-' + change.value.pieId, child);

    if(sibling) {
      sibling.el.parentNode.insertBefore(child.el, sibling.el);
    } else {
      this.qs('ul').appendChild(child.el);
    }
  },

  itemCompleted: function() {
    this.updateSummary();
  },

  itemRemoved: function(change) {
    var child = this.getChild('view-' + change.oldValue.pieId);
    this.removeChild(child);
  },

  listChanged: function(changes) {
    changes.forEach(function(change){

      if(change.name === 'length') {
        this.updateSummary();
      } else if(!isNaN(parseInt(change.name, 10))) {
        if(change.type === 'add') {
          this.itemAdded(change);
        } else if (change.type === 'delete') {
          this.itemRemoved(change);
        }
      }

    }.bind(this));
  },

  render: function() {
    this._super('render', function() {
      this.updateSummary();
    }.bind(this));
  },

  updateSummary: function() {
    var l = this.list.length(),
    total = this.app.i18n.t('list.total', {count: l}),
    completed = l && this.app.i18n.t('list.completed', {count: this.qsa('input[name="completed"]:checked').length});

    this.qs('#summary').innerHTML = pie.array.compact([total, completed], true).join(', ');
    this.qs('.js-complete-all').style.display = l ? 'block' : 'none';
  }
});

// this view handles rendering an individual item
example.views.item = function item(listModel, itemModel) {

  // this time we use autoRender to automatically render this view
  // any time the "items" attribute of the model changes.
  pie.activeView.call(this, {
    template: 'itemContainer',
    renderOnInit: true
  });

  this.list = listModel;
  this.item = this.model = itemModel;
};

pie.inherit(example.views.item, pie.activeView, pie.mixins.bindings, {

  // set up our events, then invoke super.
  init: function() {

    this._super('init', function() {
      this.bind({attr: 'completed'});

      this.onChange(this.item, this.completedChanged.bind(this), 'completed');

      // any time a js-delete link is clicked, invoke deleteItem.
      this.on('click', '.js-delete', this.deleteItem.bind(this));
    }.bind(this));

    this.initBoundFields();
  },

  completedChanged: function() {
    this.bubble('itemCompleted', this.item);
  },

  deleteItem: function(e) {
    // don't follow the link.
    e.preventDefault();

    // grab the index from the data- attribute.
    var index = this.list.indexOf(this.item);

    // remove the item from the list.
    this.list.remove(index);
  }
});
