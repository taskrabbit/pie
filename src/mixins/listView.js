// # Pie ListView
//
// A view mixin for easily managing a series of items. It assumes the activeView mixin has already been applied to your view.
// ```
// UserList = pie.view.extend(pie.mixins.activeView, pie.mixins.listView);
// list = new UserList({
//   template: 'userList',
//   itemOptions: {
//     template: 'userItem'
//   }
// });
// ```
//
// Available options:
// * listOptions
//   * **containerSel -** the selector within this view's template to append items to. Defaults to "ul, ol, .js-items-container". If no match is found the view's `el` is used.
//   * **loadingClass -** the loading class to be added to the list container while items are being removed, setup, and added. Defaults to "is-loading".
//   * **modelAttribute -** the attribute to extract list data from. Defaults to `items` to work with pie.list.
//   * **minLoadingTime -** if a loading class is added, the minimum time it should be shown. Defaults to 0.
// * itemOptions
//   * **viewFactory -** a function used to generate the item view(s). If none is supplied, an activeView will be constructed with the item data & the parent's renderData as the renderData.
//   * **template -** assuming a substitute viewFactory is not provided, this is the template (name) to apply to the default activeView.
//   * **any option -** any set of option you'd like to pass to your view.
// * emptyOptions
//   * **any option -** these options are identical to the itemOptions.
//
pie.mixins.listView = (function(){

  var _listItemClass;

  // this ensures the class isn't created unless absolutely necessary.
  var listItemClass = function(){
    return _listItemClass = _listItemClass || pie.view.extend('defaultListItemView', pie.mixins.activeView, {

      init: function(options, itemData) {
        this.model = pie.model.create(itemData);
        this._super(pie.object.merge({
          renderOnSetup: true,
        }, options));
      },

      renderData: function() {
        return pie.object.deepMerge({}, this.bubble('renderData'), this._super());
      }

    });
  };

  var viewFactory = function(options, itemData){
    var klass = listItemClass();
    return klass.create(options, itemData);
  };

  return {

    init: function() {

      this._super.apply(this, arguments);

      this.options = pie.object.deepMerge({
        listOptions: {
          containerSel: 'ul, ol, .js-items-container',
          loadingClass: 'is-loading',
          modelAttribute: 'items',
          minLoadingTime: null
        },
        itemOptions: {
          viewFactory: viewFactory
        },
        emptyOptions: {
          viewFactory: viewFactory
        }
      }, this.options);

      if(!this.options.itemOptions.viewFactory) {
        throw new Error("No viewFactory provided");
      }

      this.list = this.list || pie.list.create([]);
    },

    setup: function() {
      this.onChange(this.list, this.renderItems.bind(this), this.options.listOptions.modelAttribute);
      this.emitter.on('afterRender', this.renderItems.bind(this));

      this._super.apply(this, arguments);
    },

    addItems: function() {
      if(this.listData().length) {
        this._addListItems();
      } else {
        this._addEmptyItem();
      }
    },

    _addListItems: function() {

      var container = this.listContainer(),
        opts = pie.object.dup(this.options.itemOptions),
        factory = opts.viewFactory,
        afterRenders = [],
        whenComplete = function() {
          this.setListLoadingStyle(false);
          this.emitter.fire('afterRenderItems');
        }.bind(this),
        child;

      delete opts.viewFactory;

      this.listData().forEach(function(data, i) {
        child = factory(opts, data, i);

        /* we subscribe to each child's after render to understand when our "loading" style can be removed. */
        afterRenders.push(function(cb) {
          child.emitter.once('afterRender', cb, {immediate: true});
        });

        this.addChild('list-item-' + i, child);

        /* we append to the dom before setup to preserve ordering. */
        child.addToDom(container);
        child.setup();

      }.bind(this));

      pie.fn.async(afterRenders, pie.fn.delay(whenComplete, this.options.listOptions.minLoadingTime));
    },

    _addEmptyItem: function() {
      var opts = pie.object.dup(this.options.emptyOptions),
      factory = opts.viewFactory,
      whenComplete = function(){
        this.setListLoadingStyle(false);
        this.emitter.fire('afterRenderItems');
      }.bind(this);

      delete opts.viewFactory;

      if(!factory) {
        this.emitter.fire('afterRenderItems');
        return;
      }

      var child = factory(opts, {});

      this.addChild('list-item-empty', child);

      child.emitter.once('afterRender', whenComplete, {immediate: true});

      child.addToDom(this.listContainer());
      child.setup();
    },

    removeItems: function() {
      var regex = /^list\-item\-/, child;

      pie.array.grep(Object.keys(this.childNames), regex).forEach(function(name) {
        child = this.getChild(name);
        this.removeChild(child);
        child.teardown();
      }.bind(this));
    },

    renderItems: function() {
      this.emitter.fire('beforeRenderItems');
      this.emitter.fireAround('aroundRenderItems', function() {
        this.emitter.fire('renderItems');
        this.setListLoadingStyle(true);
        this.removeItems();
        this.addItems();
      }.bind(this));
    },

    setListLoadingStyle: function(bool) {
      var className = this.options.listOptions.loadingClass;
      if(!className) return;

      this.listContainer().classList[bool ? 'add' : 'remove'](className);
    },

    listData: function() {
      return this.list.get(this.options.listOptions.modelAttribute) || [];
    },

    listContainer: function() {
      var option = this.options.listOptions.containerSel;
      return option && this.qs(option) || this.el;
    }

  };
})();
