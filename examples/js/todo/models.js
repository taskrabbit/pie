// *** 2 ***

// We have a couple of common models which we use in our app:

pie.ns('lib.models');

// The todoItem represents a single thing to do. It ensures there is a sequential
// id and manages a concept of "completed".

lib.models.todoItem = pie.model.extend('todoItem', {

  init: function() {
    this._super.apply(this, arguments);

    // We want to make sure these values are set.
    this.getOrSet('id', pie.date.now());
    this.getOrSet('completed', false);
  }

});


// This is the list model representing our list of todos.
lib.models.todoList = pie.list.extend('todoList', {

  // Declaring debugName on objects mean they will show up in window.pieDebug.
  debugName: 'todoList',

  init: function(arr, options) {

    // we want to cast all of our item children as todoItems.
    options = pie.object.merge({
      cast: lib.models.todoItem,
    }, options);

    // in our case, we initialize the items to an empty array
    // so we can define computed properties and observers based
    // on the items.
    this._super([], options);

    // Keep track of the incomplete count.
    // This reads compute the property "incompleteCount" as defined
    // by my function "incompleteCount". This computed property is
    // dependent on the completedCount property and the length property.
    this.compute('incompleteCount', 'completedCount', 'length');

    // Whenever our items change, observe the changes.
    // items* is a special list-only key that ensures all change
    // records are delivered, since multiple children could map
    // to the same name / index.
    this.observe(this.onItemsChange.bind(this), 'items*');

    // initialize our data.
    this.sets({
      completedCount: 0,
      items: arr || []
    });

    // since we defined a computed property, incompleteCount is now set.
  },

  incompleteCount: function() {
    if(!this.length()) return;
    return this.length() - this.get('completedCount');
  },

  // This is our items* observer. This calculates our completedCount
  // and determines if our items need to be sorted.
  onItemsChange: function(changeSet) {

    // changeSet is an array with special querying abilities.
    var updates = changeSet.queryAll({type: 'item:change'});
    var removals = changeSet.queryAll({type: 'item:delete'});
    var adds = changeSet.queryAll({type: 'item:add'});

    var completedDelta = 0;
    var sortNeeded = false;
    var change;

    // iterate all of our changes and determine what updates are impacting our
    // completedCount.
    updates.forEach(function(update) {
      change = update.changes.get('completed');

      if(change) {
        sortNeeded = true;
        completedDelta += ((change.value ? 1 : 0) - (change.oldValue ? 1 : 0));
      }
    });

    removals.forEach(function(removal) {
      if(removal.oldValue.is('completed')) completedDelta -= 1;
    });

    adds.forEach(function(add) {
      if(add.value.is('completed')) completedDelta += 1;
    });

    if(sortNeeded) this.sortItems();
    if(completedDelta) this.set('completedCount', this.get('completedCount') + completedDelta);
  },

  // a special sort which puts all the completed models at the end.
  sortItems: function() {
    var ac, bc;
    this.sort(function(a,b){
      ac = a.is('completed');
      bc = b.is('completed');
      if(ac === bc) {
        return b.get('id') - a.get('id');
      } else if(ac) return 1;
      else return -1;
    });
  },


  // a custom capability of this store - it knows how to remove
  removeAllCompleted: function() {
    var resultingList = this.get('items').filter(function(m){
      return !m.is('completed');
    }.bind(this));

    this.setItems(resultingList);
  }

});

// Now move on to stores.js
