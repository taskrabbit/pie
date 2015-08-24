describe("pie.emitter", function() {

  beforeEach(function() {
    this.e = pie.emitter.create();
  });

  it("should allow a callback of an event to be registered", function() {
    var f = function(){};
    this.e.on('ping', f);
    expect(this.e.get('eventCallbacks.ping.0.fn')).toEqual(f);
    expect(this.e.get('eventCallbacks.ping.0.event')).toEqual('ping');
  });

  it("should allow an event to be cleared", function() {
    var f = function(){};
    this.e.on('ping', f);
    expect(this.e.get('eventCallbacks.ping.length')).toEqual(1);

    this.e.clear('ping');
    expect(this.e.get('eventCallbacks.ping')).toEqual(undefined);
  });

  it("should determine if an event has been called", function() {
    expect(this.e.hasEvent('ping')).toEqual(false);
    this.e.fire('ping');
    expect(this.e.hasEvent('ping')).toEqual(true);
  });

  it("should determine if an event has a callback", function() {
    expect(this.e.hasCallback('ping')).toEqual(false);
    this.e.on('ping', function(){});
    expect(this.e.hasCallback('ping')).toEqual(true);
  });

  it("should count the number of times an event is called", function() {
    this.e.fire('ping');
    this.e.fire('pong');
    this.e.fire('ping');

    expect(this.e.firedCount('ping')).toEqual(2);
    expect(this.e.firedCount('pong')).toEqual(1);
  });

  it("should allow a callback to wait until multiple events are fired via waitUntil", function(done) {
    var pingCalled = false, pongCalled = false, gnopCalled = false;

    this.e.on('ping', function() {
      pingCalled = true;
    });

    this.e.on('pong', function() {
      pongCalled = true;
    });

    this.e.on('gnop', function() {
      gnopCalled = true;
    });

    var cb = function() {
      expect(pingCalled).toEqual(true);
      expect(pongCalled).toEqual(true);
      expect(gnopCalled).toEqual(true);
      done();
    };

    this.e.fire('gnop');
    this.e.waitUntil('ping', 'pong', 'gnop', cb);

    this.e.fire('ping');
    expect(gnopCalled).toEqual(true);
    expect(pingCalled).toEqual(true);
    expect(pongCalled).toEqual(false);
    this.e.fire('pong');

  });

  it("should allow a callback to wait until another event(s) is triggered by passing a waitUntil option", function(done) {
    var pingCalled = 0, pongCalled = 0, gnopCalled = 0, cbCalled = 0;

    this.e.on('ping', function() {
      pingCalled++;
    });

    this.e.on('pong', function() {
      pongCalled++;
    });

    this.e.on('gnop', function() {
      gnopCalled++;
    });

    var cb = function() {
      expect(pingCalled).toEqual(cbCalled + 1);
      expect(pongCalled).toEqual(1);
      expect(gnopCalled).toEqual(1);


      if(cbCalled > 0) {
        done();
        return;
      } else {
        cbCalled++;
        this.e.fire('ping');
      }
    }.bind(this);

    this.e.fire('gnop');
    this.e.on('ping', cb, {waitUntil: ['pong', 'gnop']});

    this.e.fire('ping');
    expect(gnopCalled).toEqual(1);
    expect(pingCalled).toEqual(1);
    expect(pongCalled).toEqual(0);
    expect(cbCalled).toEqual(0);
    this.e.fire('pong');
  });

  it("should not allow :around events for waitUntil", function() {
    expect(function(){
      this.e.waitUntil('render:around', function(){});
    }.bind(this)).toThrowError("render:around is not supported by waitUntil.");
  });

  it("should allow a callback to be registered for all subsequent occurrences of an event via `on`", function() {
    var called = 0;
    var fn = function() {
      called++;
    };
    this.e.fire('ping');
    this.e.on('ping', fn);
    expect(called).toEqual(0);
    this.e.fire('ping');
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(2);
  });

  it("should allow a callback to be registered for all subsequent occurrences of an event as well as one for any existing events via `on` with `immediate:true`", function() {
    var called = 0,
    invocations = [];

    var fn = function() {
      called++;
      invocations.push(arguments);
    };

    this.e.fire('ping', 'foo');
    this.e.on('ping', fn, {immediate: true});
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(2);
    this.e.fire('ping');
    expect(called).toEqual(3);

    expect(invocations.length).toEqual(3);
    expect(invocations[0].length).toEqual(1);
    expect(invocations[0][0]).toEqual('foo');
    expect(invocations[1].length).toEqual(0);
  });

  it("should allow a callback to be registered for the next occurrence of an event via `once`", function() {
    var called = 0;
    var fn = function() {
      called++;
    };
    this.e.fire('ping');
    this.e.once('ping', fn);
    expect(called).toEqual(0);
    this.e.fire('ping');
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(1);
  });


  it("should allow a callback to be registered for a single occurrence of an event, including events already emmitted via `once` with `immediate:true`", function() {
    var called = 0;
    var fn = function() {
      called++;
    };
    this.e.fire('ping');
    this.e.once('ping', fn, {immediate: true});
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(1);
  });

  it("should allow an event to be fired, and if any callbacks are onceOnly it should remove them", function() {
    this.e.on('ping', function(){});
    this.e.once('ping', function(){});

    expect(this.e.get('eventCallbacks.ping.length')).toEqual(2);
    this.e.fire('ping');
    expect(this.e.get('eventCallbacks.ping.length')).toEqual(1);
  });

  it("should allow an around event to be fired, and if any callbacks are onceOnly it should remove them", function() {
    this.e.on('ping:around', function(cb){ cb(); });
    this.e.once('ping:around', function(cb){ cb(); });

    expect(this.e.get('eventCallbacks.ping:around.length')).toEqual(2);
    this.e.fireAround('ping:around');
    expect(this.e.get('eventCallbacks.ping:around.length')).toEqual(1);
  });

  it("should allow a sequence of events to be fired", function(){
    var called = {};
    this.e.on('ping:before', function(){ called.beforePing = true; });
    this.e.on('ping:around', function(cb){ called.aroundPing = true; cb(); });
    this.e.on('ping', function(){ called.ping = true; });
    this.e.on('ping:after', function(){ called.afterPing = true; });

    this.e.fireSequence('ping');

    expect(called.beforePing).toEqual(true);
    expect(called.aroundPing).toEqual(true);
    expect(called.ping).toEqual(true);
    expect(called.afterPing).toEqual(true);
  });

  it("should allow a callback to be registered, and invoked immediately via now: true", function() {
    var called = 0;
    this.e.on('ping', function(){ called++; }, {now: true});
    expect(called).toEqual(1);
  });

  it("should immediately remove a callback when onceOnly and now:true are provided", function() {
    var called = 0;
    this.e.once('ping', function(){ called++; }, {now: true, onceOnly: true});
    expect(called).toEqual(1);
    expect(this.e.get('eventCallbacks.ping.length')).toBeFalsy();
  });

});
