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

});
