//*** 3 ***

// This is an object which is in charge of retrieving and saving data to a persistent
// source. Currently this is hooked up to sessionStorage.

pie.ns('lib.stores').todoStore = pie.base.extend({

  storageKey: 'todos',

  init: function(todoList) {
    this.list = todoList;
    this.boundObserver = this.onItemChange.bind(this);
  },

  // how do we get the data the first time?
  bootstrap: function() {
    var raw = this.storedTodos();
    var items = pie.object.values(raw);

    items = pie.array.compact(items);

    this.list.setItems(items);
    this.list.sortItems();

    // only after bootstrapping our list do we start listening for changes.
    this.list.observe(this.boundObserver, 'items*');

    return pie.promise.resolve();
  },

  // make sure to clean up after yourself.
  // views handle this automatically, but if you have a separate class like
  // this it's up to you to do the cleanup.
  teardown: function() {
    this.list.unobserve(this.boundObserver, 'items*');
  },

  // access the todos from the backend store.
  storedTodos: function() {
    return app.storage.get(this.storageKey, {clear: false}) || {};
  },

  // watch for individual items changing.
  onItemChange: function(changeSet) {
    var todos = this.storedTodos();
    var removals = changeSet.queryAll({type: 'item:delete'});
    var updates = changeSet.queryAll({type: 'item:add'});
    var updates = updates.concat(changeSet.queryAll({type: 'item:change'}));

    var model;
    var sortNeeded = false;

    updates.forEach(function(update) {
      model = update.value;
      todos[model.get('id')] = model.data;
    });

    removals.forEach(function(removal) {
      model = removal.oldValue;
      delete todos[model.get('id')];
    });

    if(updates.length || removals.length) {
      app.storage.set(this.storageKey, todos);
    }
  }

});


// Move on to views.js
