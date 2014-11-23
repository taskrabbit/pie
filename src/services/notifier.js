// notifier is a class which provides an interface for rendering page-level notifications.
pie.services.notifier = function notifier(app, options) {
  this.options = options || {};
  this.app = this.options.app || window.app;
  this.notifications = new pie.list([]);
};

// remove all alerts, potentially filtering by the type of alert.
pie.services.notifier.prototype.clear = function(type) {
  if(type) {
    this.notifications.forEach(function(n) {
      this.remove(n.id);
    }.bind(this));
  } else {
    while(this.notifications.length()) {
      this.remove(this.notifications.get(0).id);
    }
  }
};

// Show a notification or notifications.
// Messages can be a string or an array of messages.
// Multiple messages will be shown in the same notification, but on separate lines.
// You can choose to close a notification automatically by providing `true` as the third arg.
// You can provide a number in milliseconds as the autoClose value as well.
pie.services.notifier.prototype.notify = function(messages, type, autoRemove) {
  type = type || 'message';
  autoRemove = this.getAutoRemoveTimeout(autoRemove);

  messages = pie.array.from(messages);

  messages = messages.map(function(msg) {
    msg = {
      id: pie.unique(),
      message: msg,
      type: type
    };

    this.notifications.push(msg);

    return msg;
  }.bind(this));

  if(autoRemove) {
    setTimeout(function(){
      messages.forEach(function(msg){
        this.remove(msg.id);
      }.bind(this));
    }.bind(this), autoRemove);
  }

};

pie.services.notifier.prototype.getAutoRemoveTimeout = function(timeout) {
  if(timeout === undefined) timeout = true;
  if(timeout && !pie.object.isNumber(timeout)) timeout = 7000;
  return timeout;
};

pie.services.notifier.prototype.remove = function(msgId) {
  var msgIdx = pie.array.indexOf(this.notifications.get('items'), function(m) {
    return m.id === msgId;
  });

  if(~msgIdx) {
    this.notifications.remove(msgIdx);
  }
};
