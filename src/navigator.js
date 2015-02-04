// # Pie Navigator
// The navigator is in charge of observing browser navigation and updating it's data.
// It's also the place to conduct push/replaceState history changes.
// The navigator is simply a model, enabling observation, computed values, etc.
pie.navigator = pie.model.extend('navigator', {

  init: function(app) {
    this.app = app;
    this._super({});
  },

  // ** pie.navigator.go **
  //
  // Go to `path`, appending `params`.
  // If `replace` is true replaceState will be used in favor of pushState.
  // If no changes are made, nothing will happen.
  // ```
  // navigator.go('/foo/bar', {page: 2});
  // //=> pushState: '/foo/bar?page=2'
  // ```
  go: function(path, params, replace) {
    var url = path, state;

    params = params || {};

    if(this.get('path') === path && this.get('query') === params) {
      return this;
    }

    if(Object.keys(params).length) {
      url = pie.string.urlConcat(url, pie.object.serialize(params));
    }

    state = this.stateObject(path, params, replace);
    window.history[replace ? 'replaceState' : 'pushState'](state, document.title, url);
    window.historyObserver();
  },

  // ** pie.navigator.setDataFromLocation **
  //
  // Look at `window.location` and transform it into stuff we care about.
  // Set the data on this navigator object.
  setDataFromLocation: function() {
    var stringQuery = window.location.search.slice(1),
    query = pie.string.deserialize(stringQuery);

    this.sets({
      url: window.location.href,
      path: window.location.pathname,
      fullPath: pie.array.compact([window.location.pathname, stringQuery], true).join('?'),
      query: query
    });
  },

  // ** pie.navigator.start **
  //
  // Setup the navigator and initialize the data.
  start: function() {
    /* we can only have one per browser. Multiple apps should observe pieHistoryChang on the body */
    if(!window.historyObserver) {
      window.historyObserver = function() {
        pie.dom.trigger(document.body, 'pieHistoryChange');
      };
    }
    /* observe popstate and invoke our single history observer */
    pie.dom.on(window, 'popstate', function() {
      window.historyObserver();
    });

    /* subscribe this navigator to the global history event */
    pie.dom.on(document.body, 'pieHistoryChange.nav-' + this.pieId, this.setDataFromLocation.bind(this));

    return this.setDataFromLocation();
  },

  stateObject: function(newPath, newQuery, replace) {
    var state = {
      navigator: {
        path: newPath,
        query: newQuery
      }
    };

    if(replace) {
      pie.object.deepMerge(state, window.history.state);
    } else {
      state.navigator.referringPath = this.get('path');
      state.navigator.referringQuery = this.get('query');
    }

    return state;
  }
});
