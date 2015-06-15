pie.promise = pie.base.extend({

  __pieRole: 'promise',

  init: function(resolver) {

    this.resolves = [];
    this.rejects  = [];

    this.result   = undefined;
    this.state    = 'UNFULFILLED';

    if(resolver) {
      setTimeout(function(){
        try {
          resolver(this.resolve.bind(this), this.reject.bind(this));
        } catch(ex) {
          this.reject(ex);
        }
      }.bind(this), 0);
    }
  },

  then: function(onResolve, onReject) {
    var child = this.__class.create();

    this.resolves.push([onResolve, child]);
    this.rejects.push([onReject, child]);

    if(this.state !== 'UNFULFILLED') {
      setTimeout(this._flush.bind(this), 0);
    }

    return child;
  },

  catch: function(reject) {
    return this.then(undefined, reject);
  },

  reject: function(value) {
    this._transition('FAILED', value);
  },

  resolve: function(value) {
    this._transition('FULFILLED', value);
  },

  _transition: function(state, value) {
    if(this.state === 'UNFULFILLED') {
      this.state = state;
      this.result = value;
      this._flush();
    }
  },

  _flush: function() {
    var list = this.state === 'FULFILLED' ? this.resolves : this.rejects;
    var tuple, callback, promise, result;

    while(list.length) {
      tuple = list.pop();
      callback = tuple[0];
      promise = tuple[1];

      if(pie.object.isFunction(callback)) {
        try {
          result = callback(this.result);
        } catch(e) {
          promise.reject(e);
          continue;
        }

        if(result === promise) {
          promise.reject(new TypeError("The result of a promise's callback cannot be the promise. [2.3.1]"));
          continue;
        }

        if(pie.object.isPromise(result)) {
          result.then(promise.resolve.bind(promise), promise.reject.bind(promise));
        } else {
          promise.resolve(result);
        }

      } else if(this.state === 'FULFILLED') {
        promise.resolve(this.result);
      } else {
        promise.reject(this.result);
      }
    }
  }
});

pie.promise.all = function(iteratable) {
  var instance = new pie.promise(),
  promises = [],
  values = [],
  cnt = 0,
  p;

  for(var k in iteratable) {
    if(iteratable.hasOwnProperty(k)) {
      p = iteratable[k];
      if(!pie.object.isPromise(p)) p = pie.promise.resolve(p);
      promises.push(p);
    }
  }

  promises.forEach(function(p, i) {
    p.then(function(val) {
      values[i] = val;
      if(cnt === values.length) instance.resolve(values);
    }, instance.reject.bind(instance));
  });

  return instance;
};

pie.promise.resolve = function(val) {
  var p = pie.promise.create();
  p.state = 'FULFILLED';
  p.result = val;
  return p;
};

pie.promise.reject = function(val) {
  var p = pie.promise.create();
  p.state = 'FAILED';
  p.result = val;
  return p;
};
