// notifier is a class which provides an interface for rendering page-level notifications.
pie.services.notifier = function notifier(el) {
  this.construct(el, {});
};

pie.services.notifier.prototype = pie.baseView.extend({


  addedToParent: function() {
    this.on('click', '.page-alert', this.handleAlertClick.bind(this));
  },


  // remove all alerts, potentially filtering by the type of alert.
  clear: function(type) {
    if(type) {
      var list = this.qsa('.alert-' + type);
      while(list.length) {
        $(list[0]).remove();
      }
    } else {
      this.el.innerHTML = '';
    }
  },

  // Show a notification or notifications.
  // Messages can be a string or an array of messages.
  // Multiple messages will be shown in the same notification, but on separate lines.
  // You can choose to close a notification automatically by providing `true` as the third arg.
  // You can provide a number in milliseconds as the autoClose value as well.
  notify: function(messages, type, autoClose) {
    type = type || 'message';
    if(autoClose === undefined) autoClose = true;

    messages = pie.array.from(messages);

    var content = this.app().template('alert', {"type" : type, "messages": messages});
    content = pie.h.createElement(content);

    this.el.insertBefore(content, this.el.firstElementChild);

    if(autoClose) {
      if(typeof autoClose !== 'number') autoClose = 5000;
      setTimeout(function(){
        $(content).remove();
      }.bind(this), autoClose);
    }

  },

  // remove the alert that was clicked.
  handleAlertClick: function(e) {
    $(e.delegateTarget).remove();
    e.preventDefault();
  },

});
