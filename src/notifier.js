// notifier is a class which provides an interface for rendering page-level notifications.
pie.notifier = pie.base.extend('notifier', {

  init: function(app, options) {
    this.options = options || {};
    this.app = this.options.app || window.app;
    this.notifications = new pie.list([]);
  },

  // remove all alerts, potentially filtering by the type of alert.
  clear: function(type) {
    if(type) {
      this.notifications.forEach(function(n) {
        this.remove(n.id);
      }.bind(this));
    } else {
      while(this.notifications.length()) {
        this.remove(this.notifications.get(0).id);
      }
    }
  },

  // Show a notification or notifications.
  // Messages can be a string or an array of messages.
  // You can choose to close a notification automatically by providing `true` as the third arg.
  // You can provide a number in milliseconds as the autoClose value as well.
  notify: function(messages, type, autoRemove) {
    type = type || 'message';
    autoRemove = this.getAutoRemoveTimeout(autoRemove);

    messages = pie.array.from(messages);

    var msg = {
      id: pie.unique(),
      messages: messages,
      type: type
    };

    this.notifications.push(msg);

    if(autoRemove) {
      setTimeout(function(){
        this.remove(msg.id);
      }.bind(this), autoRemove);
    }

  },

  getAutoRemoveTimeout: function(timeout) {
    if(timeout === undefined) timeout = true;
    if(timeout && !pie.object.isNumber(timeout)) timeout = 7000;
    return timeout;
  },

  remove: function(msgId) {
    var msgIdx = pie.array.indexOf(this.notifications.get('items'), function(m) {
      return m.id === msgId;
    });

    if(~msgIdx) {
      this.notifications.remove(msgIdx);
    }
  }
});
