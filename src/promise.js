pie.promise = pie.base.extend({

  __pieRole: 'promise',

  UNFULFILLED: 'UNFULFILLED',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',

  init: function(resolver) {
    this.resolver = resolver;

    this.fulfills = [];
    this.rejects = [];

    this.fulfillArgs  = undefined;
    this.rejectArgs   = undefined;

    this.state = this.UNFULFILLED;

    try {
      this.resolver(this.fulfillProxy.bind(this), this.rejectProxy.bind(this));
    } catch(ex) {
      this.rejectProxyProxy(ex);
    }
  },

  then: function(fulfill, reject) {

    if(fulfill) this.fulfills.push(fulfill);
    if(reject) this.rejects.push(reject);

    if(this.state === this.REJECTED) {
      this.rejectProxy.apply(this, this.rejectArgs);
    }
    else if(this.state === this.FULFILLED) {
      this.fulfillProxy.apply(this, this.fulfillArgs);
    }

    return this.__class.create(pie.fn.noop);
  },

  catch: function(reject) {
    this.then(undefined, reject);
  },

  rejectProxy: function() {
    var args = this.rejectArgs = arguments;
    // if(this.reject) this.reject.apply(null, arguments);
  },

  fulfillProxy: function() {
    // if(this.fulfill) this.fulfill.apply(null, arguments);
  }

});
