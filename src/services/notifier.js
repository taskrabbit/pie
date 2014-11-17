// notifier is a class which provides an interface for rendering page-level notifications.
pie.services.notifier = function notifier(app, options) {
  pie.view.prototype.constructor.call(this, pie.object.merge({app: app}, options));
  this.notifications = {};
};

pie.inherit(pie.services.notifier, pie.view);


pie.services.notifier.prototype.init = function() {
  this.on('click', '.page-alert', this.handleAlertClick.bind(this));
};


// remove all alerts, potentially filtering by the type of alert.
pie.services.notifier.prototype.clear = function(type) {
  if(type) {
    var nodes = this.notifications[type] || [];
    while(nodes.length) {
      this.remove(nodes[nodes.length-1]);
    }
  } else {
    while(this.el.childNodes.length) {
      this.remove(this.el.childNodes[0]);
    }
  }
};

// Show a notification or notifications.
// Messages can be a string or an array of messages.
// Multiple messages will be shown in the same notification, but on separate lines.
// You can choose to close a notification automatically by providing `true` as the third arg.
// You can provide a number in milliseconds as the autoClose value as well.
pie.services.notifier.prototype.notify = function(messages, type, autoClose) {
  type = type || 'message';
  autoClose = this.getAutoCloseTimeout(autoClose);

  messages = pie.array.from(messages);

  var content = this.app.template('alert', {"type" : type, "messages": messages});
  content = pie.dom.createElement(content);

  this.notifications[type] = this.notifications[type] || [];
  this.notifications[type].push(content);

  content._pieNotificationType = type;
  this.el.insertBefore(content, this.el.firstElementChild);

  if(autoClose) {
    setTimeout(function(){
      this.remove(content);
    }.bind(this), autoClose);
  }

};

pie.services.notifier.prototype.getAutoCloseTimeout = function(autoClose) {
  if(autoClose === undefined) autoClose = true;
  if(autoClose && typeof autoClose !== 'number') autoClose = 7000;
  return autoClose;
};

pie.services.notifier.prototype.remove = function(el) {
  var type = el._pieNotificationType;
  if(type) {
    pie.array.remove(this.notifications[type] || [], el);
  }
  pie.dom.remove(el);
};

// remove the alert that was clicked.
pie.services.notifier.prototype.handleAlertClick = function(e) {
  this.remove(e.delegateTarget);
  e.preventDefault();
};
