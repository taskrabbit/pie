describe("String extensions", function() {

  describe("#deserialize", function() {

    it("should handle simple query strings", function() {
      var query = pie.string.deserialize("test=foo&foo=bar");
      expect(query).toEqual({
        test: 'foo',
        foo: 'bar'
      });
    });

    it("should automatically determine it's starting point", function(){
      var query = pie.string.deserialize('example.com?foo=bar&biz=baz');
      expect(query).toEqual({
        foo: 'bar',
        biz: 'baz'
      });
    });

    it("should NOT parse &amp's as separators", function() {
      var query = pie.string.deserialize("test=foo&amp;foo=bar");
      expect(query).toEqual({
        test: 'foo',
        'amp;foo' : 'bar'
      });
    });

    it('should deal with missing keys', function() {
      var query = pie.string.deserialize('=foo');
      expect(query).toEqual({
        '' : 'foo'
      });
    });

    it('should deal with missing values', function() {
      var query = pie.string.deserialize('foo=');
      expect(query).toEqual({
        'foo' : ''
      });
    });

    it('should deal with missing keys after existing values', function() {
      var query = pie.string.deserialize('foo=bar&=baz');
      expect(query).toEqual({
        'foo' : 'bar',
        '' : 'baz'
      });
    });

    it('should deal with missing values with existing values after', function() {
      var query = pie.string.deserialize('foo=&biz=baz');
      expect(query).toEqual({
        'foo' : '',
        'biz' : 'baz'
      });
    });

    it('should parse [] params into arrays', function() {
      var query = pie.string.deserialize('foo%5B%5D=first&foo%5B%5D=second');
      expect(query).toEqual({
        'foo' : ['first', 'second']
      });
    });

    it('should not handle double arrays, because... really?', function() {
      // foo[0][]=first&foo[1][]=second
      var query = pie.string.deserialize('foo%5B0%5D%5B%5D=first&foo%5B1%5D%5B%5D=second');
      expect(query).toEqual({
        'foo[0]' : ['first'],
        'foo[1]' : ['second']
      });
    });

    it('should parse values if asked to', function() {
      var query = pie.string.deserialize('a=A&b=undefined&c=null&d=false&e=true&f=5.5&g=10.0&h=5', true);
      expect(query).toEqual({
        a: 'A',
        b: undefined,
        c: null,
        d: false,
        e: true,
        f: 5.5,
        g: 10.0,
        h: 5
      });
    });

  });
});
