describe("pie.promise", function(){

  var jsonData = {
    foo: 'bar',
    baz: 'qux'
  };

  function fetchJSON(succeed) {
    return pie.promise.create(function(resolve, reject){
      setTimeout(function(){
        if(succeed) {
          resolve(JSON.stringify(jsonData));
        } else {
          reject(new Error("failed json fetch"));
        }
      }, 100);
    });
  }

  function fetchSubJSON(json) {
    return pie.promise.create(function(resolve, reject){
      setTimeout(function(){
        var d = JSON.parse(json);
        d.bar = 'bad';
        resolve(JSON.stringify(d));
      }, 200);
    });
  }

  function parseJSON(json) {
    return JSON.parse(json);
  }

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it("a promise should not require a function to be passed and should not resolve immediately.", function() {
    var p = pie.promise.create();
    expect(p.state).toEqual('UNFULFILLED');
    jasmine.clock().tick();
    expect(p.state).toEqual('UNFULFILLED');
  });

  it("rejects when an error is thrown as part of the resolving function", function() {
    var p = pie.promise.create(function(){ throw new Error("foo"); });
    expect(p.state).toEqual('UNFULFILLED');
    jasmine.clock().tick();
    expect(p.state).toEqual('FAILED');
    expect(p.result.message).toEqual('foo');
  });

  it("does not require the function to resolve or reject immediately", function() {
    var resolver = function(resolve, reject){
      setTimeout(resolve,10);
    };

    var p = pie.promise.create(resolver);
    expect(p.state).toEqual('UNFULFILLED');
    jasmine.clock().tick();
    expect(p.state).toEqual('UNFULFILLED');
    jasmine.clock().tick(10);
    expect(p.state).toEqual('FULFILLED');
  });

  it("should enable chaining via a `then` function", function(done) {
    var p = fetchJSON(true);
    p.then(function(json) {
      var obj = parseJSON(json);
      expect(obj).toEqual(jsonData);
      expect(p.state).toEqual('FULFILLED');
      done();
    });

    expect(p.state).toEqual('UNFULFILLED');
    jasmine.clock().tick(100);
  });

  it("should provide a promise to chain thens", function() {
    var p = fetchJSON(true);
    var p2 = p.then(parseJSON);
    expect(p.state).toEqual('UNFULFILLED');
    expect(p2.state).toEqual('UNFULFILLED');
    jasmine.clock().tick(100);
    expect(p.state).toEqual('FULFILLED');
    expect(p2.state).toEqual('FULFILLED');
  });

  it("should provide a promise to chain thens (2)", function(done) {
    var p = fetchJSON(true);
    var p2 = p.then(fetchSubJSON);
    var p3 = p2.then(parseJSON);
    var p4 = p3.then(function(json) {
      expect(json).toEqual(pie.object.merge({bar: 'bad'}, jsonData));
      done();
    });

    expect(p.state).toEqual('UNFULFILLED');
    expect(p2.state).toEqual('UNFULFILLED');
    expect(p3.state).toEqual('UNFULFILLED');
    jasmine.clock().tick();
    expect(p.state).toEqual('UNFULFILLED');
    expect(p2.state).toEqual('UNFULFILLED');
    expect(p3.state).toEqual('UNFULFILLED');
    jasmine.clock().tick(100);
    expect(p.state).toEqual('FULFILLED');
    expect(p2.state).toEqual('UNFULFILLED');
    expect(p3.state).toEqual('UNFULFILLED');
    jasmine.clock().tick(200);
    expect(p.state).toEqual('FULFILLED');
    expect(p2.state).toEqual('FULFILLED');
    expect(p3.state).toEqual('FULFILLED');
  });

  it("should correctly report errors", function(done) {
    var p = fetchJSON(false);
    p.then(null, function(e) {
      expect(e.message).toEqual("failed json fetch");
      done();
    });
  });

  it("should propagate errors to the child promises", function(done) {
    fetchJSON(false).
      then(fetchSubJSON).
      then(parseJSON).catch(function(e){
        expect(e.message).toEqual("failed json fetch");
        done();
      });

    jasmine.clock().tick(100);
  });

});
