// # Pie ListView
//
// A view mixin for easily managing a series of items. It assumes the activeView mixin has already been applied to your view.
// ```
// list = new pie.listView({
//   template: 'userList',
//   itemOptions: {
//     template: 'userItem'
//   }
// });
// ```
//
// Available options:
// * listOptions
//   * **sel -** the selector within this view's template to append items to. Defaults to "ul, ol, .js-items-container". If no match is found the view's `el` is used.
//   * **loadingClass -** the loading class to be added to the list container while items are being removed, setup, and added. Defaults to "is-loading".
// * itemOptions
//   * **factory -** a function used to generate the item view(s). If none is supplied, an activeView will be constructed with the item data & the parent's renderData as the renderData.
//   * **template -** assuming a substitute factory is not provided, this is the template (name) to apply to the default activeView.
//   * **any option -** any set of option you'd like to pass to your view.
// * emptyOptions
//   * **any option -** these options are identical to the itemOptions.
//
pie.listView = pie.activeView.extend('listView', (function(){

  var viewFactory = function(options, itemData){
    options = pie.object.merge({ model: itemData }, options);
    return pie.activeView.create(options);
  };

  var listChildContainer = pie.base.extend('listChildContainer', pie.mixins.container);

  return {

    init: function() {

      this._super.apply(this, arguments);

      this.options = pie.object.deepMerge({
        listOptions: {
          loadingClass: 'is-loading'
        },
        itemOptions: {
          factory: viewFactory
        },
        emptyOptions: {
          factory: viewFactory
        }
      }, this.options);

      if(!this.options.itemOptions.factory) {
        throw new Error("No view factory provided");
      }

      this.list = this.list || pie.list.create([]);
      this.model = this.model || this.list;

      this.listItems = listChildContainer.create();

      // to ensure bubbling gets to us.
      this.addChild('listItems', this.listItems);
    },

    setup: function() {
      this.observe(this.list, 'manageListUpdates', 'items*', 'items');
      this.observe(this.list, 'manageEmptyItem', 'length');

      this.eon('render:after', 'bootstrapItems');

      this.eon('renderItems:before', function beforeRenderItems(){ this.setListLoadingStyle(true); }.bind(this));
      this.eon('renderItems:after', function afterRenderItems(){ this.setListLoadingStyle(false); }.bind(this));

      this._super.apply(this, arguments);
    },

    findChildByItem: function(item) {
      return this.listItems.getChild(this.childName(item));
    },

    childName: function(item) {
      return 'item-' + pie.uid(item);
    },

    bootstrapItems: function(containerEl) {
      this.emitter.fireSequence('renderItems', function listViewBootstrapItems() {
        var uid, child, containerEl;

        containerEl = containerEl || this.listContainer();

        this.list.forEach(function listViewBootstrapItem(item, i) {
          child = this.findChildByItem(item) || this.buildItemChild(item, i, containerEl);
          child.removeFromDom();
          child.addToDom(containerEl);
        }.bind(this));

        this.manageEmptyItem();
      }.bind(this));
    },

    addItem: function(item, idx, containerEl) {
      containerEl = containerEl || this.listContainer();

      var child = this.buildItemChild(item, idx, containerEl);
      var idx = child._indexWithinParent;
      var nextChild = this.listItems.getChild(idx + 1);

      child.addToDom(containerEl, nextChild && nextChild.el);
    },

    buildItemChild: function(item, idx, containerEl) {
      containerEl = containerEl || this.listContainer();

      var opts = pie.object.dup(this.options.itemOptions),
      factory = pie.fn.from(opts.factory, this),
      child;

      delete opts.factory;

      child = factory(opts, item);

      this.listItems.addChild(this.childName(item), child, idx);
      child.setup();

      return child;
    },

    removeItem: function(item) {
      var child = this.findChildByItem(item);
      if(child) {
        this.listItems.removeChild(child);
        child.teardown();
      }
    },

    manageListUpdates: function(changeSet) {
      this.emitter.fireSequence('renderItems', function listViewManageListUpdates() {

        var containerEl = this.listContainer();

        changeSet.forEach(function(change){
          this.manageListUpdate(change, containerEl);
        }.bind(this));

      }.bind(this));
    },

    manageListUpdate: function(change, containerEl) {
      if(change.type === 'item:add') {
        this.addItem(change.value, change.index, containerEl);
      } else if (change.type === 'item:delete') {
        this.removeItem(change.oldValue);
      } else if (change.type === 'reorder') {
        // blow away our indexes, but don't rebuild our children.
        this.listItems.sendToChildren('removeFromDom');
        // this will find our existing children and add them back into our dom
        this.bootstrapItems(containerEl);
      }
    },

    manageEmptyItem: function() {
      if(this.list.length()) {
        this.removeEmptyItem();
      } else {
        this.addEmptyItem();
      }
    },

    removeEmptyItem: function() {
      var empty = this.getChild("empty");
      if(empty) {
        this.removeChild(empty);
        empty.teardown();
      }
    },

    addEmptyItem: function() {
      var opts = pie.object.dup(this.options.emptyOptions),
      factory = pie.fn.from(opts.factory, this);

      delete opts.factory;

      if(!factory) return;

      var child = factory(opts, {});

      this.addChild('empty', child);
      child.addToDom(this.listContainer());
      child.setup();
    },

    setListLoadingStyle: function(bool) {
      var className = this.options.listOptions.loadingClass;
      if(!className) return;

      this.listContainer().classList[bool ? 'add' : 'remove'](className);
    },

    listContainer: function() {
      var option = this.options.listOptions.sel;
      if(pie.object.isString(option)) option = this.qs(option);
      if(!option) return this.el;
      return option;
    },

    teardownChildren: function() {
      this._super();
      this._super.call(this.listItems);
    }

  };
})());
