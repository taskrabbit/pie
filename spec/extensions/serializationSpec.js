describe('Object to query string serialization and vice versa', function() {

  function testObj(obj) {
    var s = pie.object.serialize(obj);
    var o2 = pie.string.deserialize(s, true);
    expect(o2).toEqual(obj);
  }

  function testString(s) {
    var o = pie.string.deserialize(s, true);
    var s2 = pie.object.serialize(o);
    expect(s2).toEqual(s);
  }


  describe("object to string to object", function() {

    it('should function for basic objects', function() {
      testObj({a: 'b', c: 'd'});
    });

    it('should function for coerced types', function() {
      testObj({a: true, b: false, c: 1, d: 2.5, e: null, f: undefined});
    });

    it('should function for single levels arrays', function() {
      testObj({foo: ['a', 'b', 'c', '', false]});
    });

    it('should function for nested objects', function() {
      testObj({foo: {bar: 'biz', baz: {thing: false}}});
    });

    it('should function for insanely crazy stuff', function() {
      testObj({foo: 'bar', biz: [{a: 'b'}, false, null, undefined], qux: {things: ['blurbs']}});
    });

  });

  describe("string to object to string", function() {

    it('should function for basic objects', function() {
      testString("a=b&c=d");
    });

    it('should function for coerced types', function() {
      testString("a=true&b=false&c=1&d=2.5&e=null&f=undefined");
    });

    it('should function for single levels arrays', function() {
      testString("foo%5B%5D=a&foo%5B%5D=b&foo%5B%5D=c&foo%5B%5D=&foo%5B%5D=false");
    });

    it('should function for nested objects', function() {
      testString("foo%5Bbar%5D=biz&foo%5Bbaz%5D%5Bthing%5D=false");
    });

    it('should function for insanely crazy stuff', function() {
      testString("biz%5B%5D%5Ba%5D=b&biz%5B%5D=false&biz%5B%5D=false&biz%5B%5D=null&biz%5B%5D=undefined&foo=bar&qux%5Bthings%5D%5B%5D=blurbs");
    });

  });
});
