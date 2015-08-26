//*** 4 ***

// lib.views is the default namespace app.routeHandler will search for when looking
// for views.
pie.ns('lib.views');

// The top level view. basically it's the thing that controls the initialization
// of our models and the bootstrapping of the data.
// This is a common pattern we use in the TR codebase.
lib.views.layout = pie.activeView.extend('layout', {

  init: function() {
    this._super({
      template: 'layout',

      // Refs are references to single elements in the view's dom.
      // After each render, the reference is cleared and requeried on demand.
      // This is accomplished by using Object.defineProperty rather than
      // a set of attributes.
      refs: {
        incompleteCountEl: '.js-incomplete-count'
      }
    });

    // Initialize our model
    this.list = lib.models.todoList.create();

    // Initialize our store.
    this.store = lib.stores.todoStore.create(this.list);
  },

  // Setup is called by our parent which, in this case, is the routeHandler.
  setup: function() {

    // hasChild is a shortcut for dealing with children in the standard lifecycle
    // of a view. It will handle creating a child initially, attaching it to the dom,
    // and even moving it after rerender. It's the job of the factory to return the
    // existing child if it exists.
    this.hasChild({
      name: 'input',
      sel: '.js-input-container',
      factory: function(){
        return this.getChild('input') || lib.views.input.create(this.list);
      }.bind(this),
    });

    this.hasChild({
      name: 'tasks',
      sel: '.js-list-container',
      factory: function(){
        return this.getChild('tasks') || lib.views.tasks.create(this.list)
      }.bind(this)
    });

    // view.eon is short this.emitter.on.
    // the second argument, if a string, represents this[arguments[1]].bind(this)
    this.eon('setup:around', 'bootstrapList');


    // `this.on` is a shortcut for adding observers to this component's element.
    // The second argument is the delegate selector which will be used to filter
    // triggered events.
    // The third argument is the function to be invoked when the event occurs.
    this.on('click', '.js-remove-completed', 'removeAllCompleted');
    this.on('click', '.js-complete-all', 'completeAll');

    // Binding declarations setup one or two directional bindings. For example,
    // this binding will add or remove the class "is-visible" to any ".js-remove-container"
    // elements within this component's dom. It will do this based on the truthy result
    // of the models completedCount. So if we alter completedCount in the model, our dom
    // will reflect the new state.
    this.bind({
      attr: 'completedCount',
      type: 'class',
      model: this.list,
      sel: '.js-remove-container',
      options: {
        className: 'is-visible'
      }
    });

    // This is a more generic binding, one that invokes a functoin with an element,
    // the current value, and the binding configuration. See below.
    this.bind({
      attr: 'incompleteCount',
      type: 'fn',
      model: this.list,
      sel: '.js-incomplete-count',
      toModel: false,
      options: {
        fn: this.applyIncompleteCount.bind(this)
      }
    });

    this.bind({
      attr: 'incompleteCount',
      type: 'class',
      model: this.list,
      sel: '.js-complete-all-container',
      options: {
        className: 'is-visible'
      }
    });

    this._super();
  },

  // Our initial load has to do some work to get our data.
  bootstrapList: function(cb) {
    this.store.bootstrap().then(cb);
  },

  // This is how we create a new task in the todo app.
  // We'll see that children have access to this functionality
  // via bubbling.
  createTask: function(data) {
    this.list.unshift(data);
  },

  // Our click callback.
  removeAllCompleted: function(e) {
    // consumeEvent is a convenience method for stopping events.
    // consumeEvent(e, true) will stop it immediately.
    this.consumeEvent(e);

    // Modify our model.
    this.list.removeAllCompleted();
  },

  // This is our generic binding callback.
  applyIncompleteCount: function(el, value, binding) {
    el.innerHTML = value == null ? '' : this.app.i18n.t('incompleted', {count: value});
  },

  completeAll: function(e) {
    this.consumeEvent(e);
    var items = pie.array.dup(this.list.get('items'));
    items.forEach(function(m) {
      m.set('completed', true);
    });
  }


// to use bindings, you have to add the mixin.
}, pie.mixins.bindings);







// The view which represents our text input.
// This is a formView. Form views handle the heavy lifting of managing a model,
// validating, rendering loading states, and even submitting to the server.
// See TR examples in /account for simple use cases.
// pie.formView inherits from pie.activeView.
lib.views.input = pie.formView.extend('input', {

  init: function(list) {
    this.list = list;

    this._super({
      template: 'input',

      // Fields are defined in the options hash.
      // Alternatively, you can define a fields() method.
      fields: [{
        name: 'title',
        validation: { presence: true }
      }]
    });
  },

  // Each stage in the lifecycle of a formview expects a promise to be returned.
  performSubmit: function(data) {

    // this is how we report our new task.
    this.bubble('createTask', data);

    // this removes the data from the model. since formviews use bindings,
    // the UI is automatically reset.
    this.model.reset();

    // since we just report to our parent(s) we resolve immediately.
    return pie.promise.resolve();
  }

});









// This is our task list. It is a pie.listView.
// pie.listView classes know how to generate child views, empty states,
// and keep the DOM reflecting its list model.
lib.views.tasks = pie.listView.extend('tasks', {

  init: function(list) {

    // this.list is the list model listViews look for.
    // if this.model is not defined, it will be defined as the value of this.list.
    this.list = list;

    this._super({

      el: {
        tagName: 'ul'
      },

      // A configuration hash for each item child view.
      itemOptions: {
        // If a factory is not provided, an activeView will be instantiated with the
        // options provided in this hash.
        // In our case, since we want to override to a custom class, we define
        // a factory function.
        factory: function(opts, taskModel){
          return lib.views.task.create({
            model: taskModel,
            el: {
              tagName: 'li',
              class: 'task'
            }
          });
        }
      },

      // Identical to itemOptions, this subconfig is used to generate the "empty" view.
      emptyOptions: {
        template: 'empty',
        el: {
          class: 'empty'
        }
      }
    });
  }

});








// This is a simple activeView that represents an item in our list.
lib.views.task = pie.activeView.extend('task', {

  // If you don't want to create an init function, you can override the templateName
  // property direction.
  templateName: 'task',

  setup: function() {

    // Bindings allow for dom-to-model casting via the dataType option.
    this.bind({
      attr: 'completed',
      dataType: 'boolean'
    });

    // options.sel can be an actual element if desired. In this case we add
    // the is-completed class to our el if our model is completed.
    this.bind({
      attr: 'completed',
      type: 'class',
      sel: this.el,
      toModel: false,
      options: {
        className: 'is-completed'
      },
    });

    // If you pass null as the selector, this.el is the click target.
    // So any click on our el is going to toggle the completed property of
    // our model.
    this.on('click', null, 'toggleCompleted');

    this._super();
  },

  // do the toggle.
  toggleCompleted: function(e) {
    this.consumeEvent(e);
    this.model.set('completed', !this.model.is('completed'));
  }

}, pie.mixins.bindings);
