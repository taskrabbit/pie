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
example.views.layout = function layout(app) {

  pie.simpleView.call(this, app, {

    // this is the template this view renders.
    template: 'layoutContainer',

    // since we don't need to retrieve anything from a web service, we can render immediately.
    renderOnAddedToParent: true
  });

  // this is our page "context". It represents a list of items.
  this.list = new pie.list([], {
    timestamps: true
  });

  pie.object.merge(this.list, pie.mixins.validatable);

  this.list.validates({
    nextItem: {presence: {message: "You can't submit a blank item!"}}
  });
};

// setup our prototype and override some of the default functionality.
example.views.layout.prototype = pie.object.merge(Object.create(pie.simpleView.prototype), {
  render: function() {
    // since this is a simpleView and we provide the template name in the constructor,
    // we have to invoke super here.
    this._super('render');

    // ensure we don't have any children (rerender)
    this.removeChildren();

    // add our form view which will handle the addition of data.
    // addChild sets up the child view and relates it to this view (the parent).
    this.addChild('form', new example.views.form(this.app, this.list));

    // we still haven't added it to the dom yet, though. So we choose where to put it.
    this.qs('.form-container').appendChild(this.getChild('form').el);

    // add our list view.
    this.addChild('list', new example.views.list(this.app, this.list));
    this.qs('.list-container').appendChild(this.getChild('list').el);
  }
});

// this view handles taking in user input to modify the list model.
// notice the model is provided to the form explicity. This isn't necessary, but is generally a good idea.
example.views.form = function form(app, listModel) {

  pie.simpleView.call(this, app, {
    template: 'formContainer',
    renderOnAddedToParent: true
  });

  // this.model is special in that the default renderData() implementation checks for this.
  this.list = this.model = listModel;
};

example.views.form.prototype = pie.object.merge(Object.create(pie.simpleView.prototype), {

  // we override addedToParent to set up events.
  addedToParent: function() {

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

    // do this last, since we are rendering in it (renderOnAddedToParent is used in the constructor).
    this._super('addedToParent');
  },

  // handle our form submission.
  handleSubmission: function(e) {
    // don't really submit it...
    e.preventDefault();

    this.list.validateAll(this.app, function() {
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
    if(change.value) {
      el.style.backgroundColor = 'rgba(255,0,0,0.2)';
    } else {
      el.style.backgroundColor = 'inherit';
    }
  },

  // validate the nextItem of the list.
  validate: function() {
    this.list.validate(this.app, 'nextItem');
  }

});


// this view handles rendering the list and dealing with removals.
example.views.list = function list(app, listModel) {

  // this time we use autoRender to automatically render this view
  // any time the "items" attribute of the model changes.
  pie.simpleView.call(this, app, {
    template: 'listContainer',
    renderOnAddedToParent: true
  });

  // this.model is needed for autoRender
  // if you didn't use autoRender you would have to add
  // this.onChange(this.list, this.render.bind(this), 'items') in addedToParent.
  this.list = this.model = listModel;
};



example.views.list.prototype = pie.object.merge(Object.create(pie.simpleView.prototype), {

  // set up our events, then invoke super.
  addedToParent: function() {

    this.on('click', '.js-complete-all', this.completeAll.bind(this));

    this.onChange(this.list, this.listChanged.bind(this));

    // do this last, since we are rendering in it.
    this._super('addedToParent');
  },

  completeAll: function(e) {
    e.preventDefault();

    this.list.forEach(function(item){
      item.set('completed', true);
    });
  },

  itemAdded: function(change) {
    var sibling = change.oldValue && this.getChild('view-' + change.oldValue.uid),
    child = new example.views.item(this.app, this.list, change.value);

    this.addChild('view-' + change.value.uid, child);

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
    var child = this.getChild('view-' + change.oldValue.uid);
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
    this._super('render');
    this.updateSummary();
  },

  updateSummary: function() {
    var l = this.list.length(),
    total = this.app.i18n.t('list.total', {count: l}),
    completed = l && this.app.i18n.t('list.completed', {count: this.qsa('input[name="completed"]:checked').length});

    this.qs('#summary').innerHTML = pie.array.compact([total, completed], true).join(', ');
  }
});

// this view handles rendering an individual item
example.views.item = function item(app, listModel, itemModel) {

  // this time we use autoRender to automatically render this view
  // any time the "items" attribute of the model changes.
  pie.simpleView.call(this, app, {
    template: 'itemContainer',
    renderOnAddedToParent: true
  });

  this.list = listModel;
  this.item = this.model = itemModel;
};



example.views.item.prototype = pie.object.merge(Object.create(pie.simpleView.prototype), {

  // set up our events, then invoke super.
  addedToParent: function() {

    this.bind({attr: 'completed'});

    this.onChange(this.item, this.completedChanged.bind(this), 'completed');

    // any time a js-delete link is clicked, invoke deleteItem.
    this.on('click', '.js-delete', this.deleteItem.bind(this));

    // do this last, since we are rendering in it.
    this._super('addedToParent');

    this.initBoundFields();
  },

  completedChanged: function() {
    this.send('itemCompleted', this.item);
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
