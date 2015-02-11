describe("Pie Function Extensions", function() {

  describe("#valueFrom", function() {
    it('should return a value if that value is not a function', function() {
      var a = 'a', b = {call: function(){}};

      expect(pie.fn.valueFrom(a)).toEqual(a);
      expect(pie.fn.valueFrom(b)).toEqual(b);
    });

    it('should invoke the function and return the value if the provided object is a function', function() {
      var a = function(){ return 4; };
      expect(pie.fn.valueFrom(a)).toEqual(4);
    });
  });

  describe("#once", function() {

    it("should only ever invoke the provided function once", function() {
      var count = 0,
      fn = function(){ return ++count; };

      fn = pie.fn.once(fn);

      fn();
      fn();
      var r = fn();

      expect(count).toEqual(1);
      expect(r).toEqual(1);

    });

  });

  describe('#debounce', function() {

    beforeEach(function() {
      pending(); // weird issue in chrome where things just randomly blow up.
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().tick(1000);
      jasmine.clock().uninstall();
    });

    it("should wait for a function to stopped bing invoked for X milliseconds", function() {
      var called = 0;
      var fn = pie.fn.debounce(function(){ called++; }, 250);

      fn();
      fn();
      expect(called).toEqual(0);

      jasmine.clock().tick(249);
      fn();
      fn();
      expect(called).toEqual(0);

      jasmine.clock().tick(250);

      // fire
      expect(called).toEqual(1);

      fn();
      fn();
      fn();
      fn();

      expect(called).toEqual(1);

      jasmine.clock().tick(250);
      // fire
      expect(called).toEqual(2);

      jasmine.clock().tick(250);

      expect(called).toEqual(2);

      fn();
      jasmine.clock().tick(250);
      // fire
      expect(called).toEqual(3);
    });

    it("should invoke on the leading edge of the wait time but not more often than every X milliseconds if immediate=true is provided", function() {
      var called = 0;
      var fn = pie.fn.debounce(function(){ called++; }, 250, true);

      fn();
      // fire
      expect(called).toEqual(1);

      fn();
      expect(called).toEqual(1);

      jasmine.clock().tick(249);
      expect(called).toEqual(1);

      fn();
      fn();

      expect(called).toEqual(1);

      jasmine.clock().tick(250);
      // fire

      expect(called).toEqual(1);

      fn();
      fn();
      fn();
      fn();

      expect(called).toEqual(2);

      jasmine.clock().tick(250);
      expect(called).toEqual(2);

      jasmine.clock().tick(250);

      expect(called).toEqual(2);

      fn();
      jasmine.clock().tick(250);
      expect(called).toEqual(3);
    });

  });

  describe("#async", function() {

    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it("should work with no functions provided", function(done) {
      pie.fn.async([], function() {
        expect(1).toEqual(1);
        done();
      });
    });

    it("should work with no callback", function() {
      var called = false;
      pie.fn.async([function(cb){ called = true; cb(); }]);
      expect(called).toEqual(true);
    });

    it("should wait for all functions to complete before invoking the callback", function(done) {
      var aCalled = false, bCalled = false, cCalled = false;

      var a = function(cb){ setTimeout(function(){ aCalled = true; cb(); }, 100); };
      var b = function(cb){ bCalled = true; cb(); };
      var c = function(cb){ cCalled = true; cb(); };

      pie.fn.async([a,b,c], function() {
        expect(aCalled).toEqual(true);
        expect(bCalled).toEqual(true);
        expect(cCalled).toEqual(true);

        done();
      });

      expect(aCalled).toEqual(false);
      expect(bCalled).toEqual(true);
      expect(cCalled).toEqual(true);

      jasmine.clock().tick(100);

    });

    it("should allow a count observer to be provided", function(done) {
      var observes = 0;

      pie.fn.async([function(cb){ cb(); }, function(cb){ cb(); }], function(){
        expect(observes).toEqual(2);
        done();
      }, function() {
        observes++;
      });
    });

  });

});
