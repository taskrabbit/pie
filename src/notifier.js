// # Pie Notifier
// A class which provides an interface for rendering page-level notifications.
// This does only structures and manages the data to be used by a view. This does not impelement
// UI notifications.
pie.notifier = pie.base.extend('notifier', {

  init: function(app, options) {
    this.options = options || {};
    this.app = app || this.options.app || pie.appInstance;
    this.notifications = pie.list.create([], {cast: true});

    this._super();
  },

  // remove all alerts, potentially filtering by the type of alert.
  clear: function(type) {
    var filter = type ? function(m){ return m.test('type', type); } : undefined;
    this.notifications.removeAll(filter);
  },

  // ** pie.notifier.notify **
  //
  // Show a notification or notifications.
  // Messages can be a string or an array of messages.
  // You can choose to close a notification automatically by providing `true` as the third arg.
  // You can provide a number in milliseconds as the autoClose value as well.
  notify: function(messages, type, autoRemove) {
    type = type || 'message';
    autoRemove = this.getAutoRemoveTimeout(autoRemove);

    messages = pie.array.from(messages);
    messages = messages.map(function notifyI18nAttempter(m){ return this.app.i18n.attempt(m); }.bind(this));

    var msg = {
      messages: messages,
      type: type
    };

    msg.id = pie.uid(msg);
    this.notifications.push(msg);

    if(autoRemove) {
      setTimeout(function autoRemoveCallback(){ this.remove(msg.id); }.bind(this), autoRemove);
    }

  },

  getAutoRemoveTimeout: function(timeout) {
    if(timeout === undefined) timeout = true;
    if(timeout && !pie.object.isNumber(timeout)) timeout = 7000;
    return timeout;
  },

  remove: function(msgId) {
    var idx = pie.array.indexOf(this.notifications.get('items'), function(n){ return n.get('id') == msgId; });
    if(~idx) this.notifications.remove(idx);
  }
});
