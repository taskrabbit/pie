// # Pie ListView
//
// A view mixin for easily managing a series of items. It assumes the activeView mixin has already been applied to your view.
// ```
// UserList = pie.view.extend(pie.mixins.activeView, pie.mixins.listView);
// list = new UserList({
//   template: 'userList',
//   itemOptions: {
//     templateName: 'userItem'
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
//   * **viewClass -** the view class which should be used to generate child views. If none is supplied, a pure activeView will be used.
//   * **template -** assuming a viewClass is not provided, this is the template to apply to the pure activeView.
//
pie.mixins.listView = (function(){

  var _listItemClass;
  var listItemClass = function(){
    return _listItemClass = _listItemClass || pie.view.extend('defaultListItemView', pie.mixins.activeView);
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
          viewClass: null,
          template: null
        }
      }, this.options);

      if(!this.options.itemOptions.viewClass && !this.options.itemOptions.template) {
        throw new Error("No viewClass or template provided for the itemOptions");
      }

      this.list = this.list || new pie.list([]);
    },

    setup: function() {
      this.onChange(this.list, this.renderItems.bind(this), this.options.listOptions.modelAttribute);
      this.emitter.on('afterRender', this.renderItems.bind(this));

      this._super.apply(this, arguments);
    },

    addItems: function() {
      var container = this.listContainer(),
        opts = pie.object.dup(this.options.itemOptions),
        klass = opts.viewClass || listItemClass(),
        afterRenders = [],
        child;

      delete opts.viewClass;

      this.listData().forEach(function(data, i) {
        child = new klass(opts, data);

        /* we subscribe to each child's after render to understand when our "loading" style can be removed. */
        afterRenders.push(function(cb) {
          child.emitter.once('afterRender', cb, {immediate: true});
        });

        this.addChild('list-item-' + i, child);

        /* we append to the dom before setup to preserve ordering. */
        child.appendToDom(container);
        child.setup();

      }.bind(this));

      pie.fn.async(afterRenders, pie.fn.delay(this.setListLoadingStyle.bind(this), this.options.listOptions.minLoadingTime));
    },

    removeItems: function() {
      var regex = /^list\-item\-/, child;

      pie.array.grep(Object.keys(this.childNames), regex).forEach(function(name) {
        child = this.getChild(name);
        this.removeChild(child);
        child.teardown();
      }.bind(this));
    },

    renderItems: function(templateName) {
      this.setListLoadingStyle(true);
      this.removeItems();
      this.addItems();
    },

    setListLoadingStyle: function(bool) {
      var className = this.options.listOptions.loadingClass;
      if(!className) return;

      this.listConainer().classList[bool ? 'add' : 'remove'](className);
    },

    listData: function() {
      return this.list.get(this.options.listOptions.modelAttribute) || [];
    },

    listContainer: function() {
      var option = this.options.listOptions.containerSel;
      return option && this.qs(option) || this;
    }

  };
})();
