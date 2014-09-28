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
    summary: {
      zero: "No ${keywords.item.plural} have been added",
      one: "1 ${keywords.item.singular}",
      other: "%{count} ${keywords.item.plural}"
    }
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
// this view handles managing it's children, initializes page context via the pie.model.
example.views.layout = function layout(app) {

  pie.simpleView.call(this, app, {

    // this is the template this view renders.
    template: 'layoutContainer',

    // since we don't need to retrieve anything from a web service, we can render immediately.
    renderOnAddedToParent: true
  });

  // this is our page "context". It represents a list which has items and a name.
  this.list = new pie.list([], {
    timestamps: true
  });
};

// setup our prototype and override some of the default functionality.
example.views.layout.prototype = pie.util.extend(Object.create(pie.simpleView.prototype), {
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

example.views.form.prototype = pie.util.extend(Object.create(pie.simpleView.prototype), {

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

    // do this last, since we are rendering in it (renderOnAddedToParent is used in the constructor).
    this._super('addedToParent');
  },

  // handle our form submission.
  handleSubmission: function(e) {
    // don't really submit it...
    e.preventDefault();

    // insert the item at the beginning.
    this.list.unshift(this.model.get('nextItem'));

    // remove the nextItem attribute, updating the UI.
    this.list.set('nextItem', '');
  }
});


// this view handles rendering the list and dealing with removals.
example.views.list = function list(app, listModel) {

  // this time we use autoRender to automatically render this view
  // any time the "items" attribute of the model changes.
  pie.simpleView.call(this, app, {
    template: 'listContainer',
    renderOnAddedToParent: true,
    autoRender: true
  });

  // this.model is needed for autoRender
  // if you didn't use autoRender you would have to add
  // this.onChange(this.list, this.render.bind(this), 'items') in addedToParent.
  this.list = this.model = listModel;
};



example.views.list.prototype = pie.util.extend(Object.create(pie.simpleView.prototype), {

  // set up our events, then invoke super.
  addedToParent: function() {

    // any time a js-delete link is clicked, invoke deleteItem.
    this.on('click', '.js-delete', this.deleteItem.bind(this));

    // do this last, since we are rendering in it.
    this._super('addedToParent');
  },


  deleteItem: function(e) {
    // don't follow the link.
    e.preventDefault();

    // grab the index from the data- attribute.
    var index = e.delegateTarget.getAttribute('data-idx');

    // remove the item from the list.
    this.list.remove(index);
  }
});

























