describe("Array extensions", function() {

  describe('#areAll', function() {

    it('should determine if all element match the provided function', function() {
      var a = [0, 2, 4, 6, 8, 10],
      b = [0, 2, 5, 10],
      f = function(i){ return i % 2 === 0; };

      expect(pie.array.areAll(a, f)).toEqual(true);
      expect(pie.array.areAll(b, f)).toEqual(false);
    });

  });


  describe('#areAny', function() {

    it('should determine if any element matches the provided function', function() {
      var a = [0, 2, 4, 6],
      b = [0, 2, 5, 10],
      f = function(i){ return i % 2 === 1; };

      expect(pie.array.areAny(a, f)).toEqual(false);
      expect(pie.array.areAny(b, f)).toEqual(true);
    });

  });


  describe('#args', function() {

    it('should convert an Arguments object to an array', function() {
      var f = function(){ return pie.array.from(arguments); };

      expect(f('a', 'b', 'c')).toEqual(['a', 'b', 'c']);
      expect(f(['a', 'b', 'c'])).toEqual([['a', 'b', 'c']]);
    });

  });

  describe("#avg", function() {

    it("should average an array of numbers", function() {
      expect(pie.array.avg([2, 10, 15])).toEqual(9);
    });

    it('should return 0 if there are no numbers', function() {
      expect(pie.array.avg([])).toEqual(0);
    });

    it('should return NaN if theres a non-numeric', function() {
      expect(pie.array.avg([2, 4, 'foo'])).toEqual(NaN);
    });

  });

  describe("#compact", function() {

    it("should remove null and undefined values", function() {
      expect(pie.array.compact([1, null, undefined])).toEqual([1]);
    });

    it("should not remove falsy values by default", function() {
      var a = [0, '0', '', false];
      expect(pie.array.compact(a)).toEqual(a);
    });

    it('should optionally remove all falsy values', function() {
      var a = [0, '0', '', false];
      expect(pie.array.compact(a, true)).toEqual(['0']);
    });

  });

  describe('#detect', function() {

    it('should detect the first item that matches the provided function', function() {
      var a = [1, 3, 5, 6, 7],
      f = function(i){ return i % 2 === 0; };
      expect(pie.array.detect(a, f)).toEqual(6);
    });

    it('should detect the first item with a truthy attribute if a string is provided', function() {
      var a = [
        {i: 0, value: false},
        {i: 1, value: false},
        {i: 2, value: true},
        {i: 3, value: false}
      ];

      expect(pie.array.detect(a, 'value')).toEqual({i: 2, value: true});
    });

    it('should invoke the attribute if its a function', function() {
      var a = [
        {i: 0, value: function(){ return false; }},
        {i: 1, value: function(){ return false; }},
        {i: 2, value: function(){ return true; }},
        {i: 3, value: function(){ return false; }}
      ];

      expect(pie.array.detect(a, 'value').i).toEqual(2);
    });

    it('should work with other primitives', function() {
      var a = ['', 'foo'];

      expect(pie.array.detect(a, 'length')).toEqual('foo');
      expect(pie.array.detect(a, 'trim')).toEqual('foo');
    });

  });


  describe('#dup', function() {

    it('should duplicate the array', function() {
      var a = [1, 2, 3],
      b = pie.array.dup(a);

      a.push(4);
      expect(b).toEqual([1,2,3]);
    });

  });


  describe('#flatten', function() {

    it('should flatten an array of arrays', function() {
      var aa = [[0, [1]], [1, 2], [3, 4]],
      a = pie.array.flatten(aa);

      expect(a).toEqual([0, 1, 1, 2, 3, 4]);
    });

    it('should allow the depth of the flattening to be restricted', function() {
      var aa = [
        [0, [ [1] ]],
        [1, 2],
        [3, 4]
      ];

      expect(pie.array.flatten(aa, 1)).toEqual([0, [[1]], 1, 2, 3, 4]);
      expect(pie.array.flatten(aa, 2)).toEqual([0, [1], 1, 2, 3, 4]);
      expect(pie.array.flatten(aa)).toEqual([0, 1, 1, 2, 3, 4]);
    });

  });

  describe('#from', function() {

    it("should return the object if it's an array", function() {
      expect(pie.array.from([0])).toEqual([0]);
    });

    it('should return the object wrapped by an array if its not an array', function() {
      expect(pie.array.from(0)).toEqual([0]);
    });

    it('should return an empty array if a null value is provided', function() {
      expect(pie.array.from(null)).toEqual([]);
      expect(pie.array.from(undefined)).toEqual([]);
      expect(pie.array.from(false)).toEqual([false]);
    });

  });


  describe('#grep', function() {

    it('should filter the array by a regex', function() {
      var a = [
        undefined,
        null,
        "i wonder if it's undefined",
        false,
        14.7
      ],
      r = /undefined/;

      expect(pie.array.grep(a, r)).toEqual([undefined, "i wonder if it's undefined"]);
    });

  });


  describe("#groupBy", function() {

    it('should group an array by a function', function() {
      var a = [0, 1, 2, 3, 4, 5, 6, 7, 8],
      f = function(i){ return i % 2 === 0 ? 'even' : 'odd'; },
      g = pie.array.groupBy(a, f);

      expect(g).toEqual({
        'even' : [0, 2, 4, 6, 8],
        'odd' : [1, 3, 5, 7]
      });
    });

    it('should allow the second argument to be a string which can be looked up as an attribute', function() {
      var a = ["foo", "bar", "foos", undefined, "bars", "baz"],
      g = pie.array.groupBy(a, 'length');

      expect(g).toEqual({
        3 : ['foo', 'bar', 'baz'],
        4 : ['foos', 'bars']
      });
    });

    it('should allow the second argument to be a string which can reference a function on the objects', function() {
      var a = [" foo ", "foo", "bar", "  bar", "  bar  "], g;
      g = pie.array.groupBy(a, 'trim');

      expect(g).toEqual({
        'foo' : [" foo ", "foo"],
        'bar' : ["bar", "  bar", "  bar  "]
      });
    });

  });

  describe('#interest', function() {

    it('should return the intersection of two arrays', function() {
      var a = [0,2,4,6], b = [1, 2, 3, 4];

      expect(pie.array.intersect(a, b)).toEqual([2,4]);
    });

  });

  describe('#last', function() {

    it('should return the last item of the array', function() {
      expect(pie.array.last([2,4])).toEqual(4);
      expect(pie.array.last([])).toEqual(undefined);
    });

  });

  describe('#map', function() {

    it('should map values from an array using a provided function', function() {

      var a = ["foo", "bar", "bugs", "buzz"],
      f = function(i){ return i.length; };

      expect(pie.array.map(a, f)).toEqual([3, 3, 4, 4]);
    });

    it('should map values from an array using a string attribute', function() {
      var a = ["foo", "bar", "bugs", "buzz"];

      expect(pie.array.map(a, 'length')).toEqual([3, 3, 4, 4]);
    });

    it('should map functions', function() {
      var a = ["foo ", " bar", "bugs ", " buzz"],
      f = String.prototype.trim;

      expect(pie.array.map(a, 'trim')).toEqual([f, f, f, f]);
    });

    it('should allow the internal functions to be invoked', function() {
      var a = ["foo ", " bar", "bugs ", " buzz"];

      expect(pie.array.map(a, 'trim', true)).toEqual(["foo", "bar", "bugs", "buzz"]);
    });

  });


  describe("#remove", function() {

    it("should remove all occurrences of an object", function() {
      var a = [1, 2, 3, 2, 5, 3, 2];
      expect(pie.array.remove(a, 2)).toEqual([1, 3, 5, 3]);
    });

  });


  describe("#subtract", function() {

    it("should remove any elements that exist in the second array", function() {
      var a = [1, 2, 2, 3, 3, 4, 5, 6, 7, 8],
      b = [0, 2, 4, 6, 8, 10];

      expect(pie.array.subtract(a, b)).toEqual([1, 3, 3, 5, 7]);
    });

  });


  describe('#sum', function() {

    it('should sum up all the values as floats', function() {
      var a = [1, 2, 3, 4, 5];
      expect(pie.array.sum(a)).toEqual(15);
    });

    it('should return NaN if something is not a number', function() {
      var a = [1, 2, 3, false, 4, 5];
      expect(pie.array.sum(a)).toEqual(NaN);
    });

  });


  describe('#sortBy', function() {

    it("should sort based on the provided sorting function", function() {
      var a = ["foo", "bars", "bells"],
      f = function(i){ return 10 - i.length; };

      expect(pie.array.sortBy(a, f)).toEqual(['bells', 'bars', 'foo']);
    });

    it('should be able to accept an attribute', function() {
      var a = ["bells", "bars", "foo"];
      expect(pie.array.sortBy(a, 'length')).toEqual(['foo', 'bars', 'bells']);
    });

    it('should be able to accept a function property', function() {
      var a = ["Foo", "foo", "Bells", "bells"];
      expect(pie.array.sortBy(a, 'toLowerCase')).toEqual(['Bells', 'bells', 'Foo', 'foo']);
    });

  });


  describe("#toSentence", function() {

    it('should return an empty string for an empty array', function() {
      expect(pie.array.toSentence([])).toEqual('');
    });

    it('should return the stringified version of a single element', function() {
      expect(pie.array.toSentence([4])).toEqual('4');
    });

    it('should return the two elements combined by the and', function() {
      expect(pie.array.toSentence([3, 4])).toEqual('3 and 4');
    });

    it('should combine 3+ elements by the delimeter and the and', function() {
      expect(pie.array.toSentence([3, 4, 5, 6, 7])).toEqual('3, 4, 5, 6 and 7');
    });

    it('should allow for i18n translations to be provided', function() {
      var i18n = new pie.i18n();
      i18n.load({
        sentence: {
          delimeter: '; ',
          and: ', yet, '
        }
      });

      expect(pie.array.toSentence([3, 4, 5, 6], {i18n: i18n})).toEqual('3; 4; 5, yet, 6');
    });

  });

  describe("#union", function() {

    it('should return the unique combination of the provided arrays', function() {
      var a = [1, 2, 3, 4, 5, 5, 6],
      b = [0, 1, 3, 4, 8],
      c = [10, 12];

      expect(pie.array.union(a, b, c)).toEqual([1, 2, 3, 4, 5, 6, 0, 8, 10, 12]);
      // should not be destructive;
      expect(a).toEqual([1, 2, 3, 4, 5, 5, 6]);
    });

  });


  describe('#unique', function() {

    it('should remove duplicates', function() {
      var a = [0,0,1,1,2,2,3,3];
      expect(pie.array.unique(a)).toEqual([0,1,2,3]);
      expect(a).toEqual([0,0,1,1,2,2,3,3]);
    });
  });

});
