describe("pie.util", function() {

  describe("#deserialize", function() {

    it("should handle simple query strings", function() {
      var query = pie.util.deserialize("test=foo&foo=bar");
      expect(query).toEqual({
        test: 'foo',
        foo: 'bar'
      });
    });

    it("should automatically determine it's starting point", function(){
      var query = pie.util.deserialize('example.com?foo=bar&biz=baz');
      expect(query).toEqual({
        foo: 'bar',
        biz: 'baz'
      });
    });

    it("should NOT parse &amp's as separators", function() {
      var query = pie.util.deserialize("test=foo&amp;foo=bar");
      expect(query).toEqual({
        test: 'foo',
        'amp;foo' : 'bar'
      });
    });

    it('should deal with missing keys', function() {
      var query = pie.util.deserialize('=foo');
      expect(query).toEqual({
        '' : 'foo'
      });
    });

    it('should deal with missing values', function() {
      var query = pie.util.deserialize('foo=');
      expect(query).toEqual({
        'foo' : ''
      });
    });

    it('should deal with missing keys after existing values', function() {
      var query = pie.util.deserialize('foo=bar&=baz');
      expect(query).toEqual({
        'foo' : 'bar',
        '' : 'baz'
      });
    });

    it('should deal with missing values with existing values after', function() {
      var query = pie.util.deserialize('foo=&biz=baz');
      expect(query).toEqual({
        'foo' : '',
        'biz' : 'baz'
      });
    });

    it('should parse [] params into arrays', function() {
      var query = pie.util.deserialize('foo%5B%5D=first&foo%5B%5D=second');
      expect(query).toEqual({
        'foo' : ['first', 'second']
      });
    });

    it('should not handle double arrays, because... really?', function() {
      // foo[0][]=first&foo[1][]=second
      var query = pie.util.deserialize('foo%5B0%5D%5B%5D=first&foo%5B1%5D%5B%5D=second');
      expect(query).toEqual({
        'foo[0]' : ['first'],
        'foo[1]' : ['second']
      });
    });

  });

  describe('#extend', function() {

    it('should modify the first argument', function() {
      var a = {'foo' : 'bar'},
      b = {'biz' : 'baz'};

      pie.util.extend(a, b);

      expect(a.biz).toEqual('baz');
    });

    it('should not stop if a falsy value is present', function() {
      var a = {'foo' : 'bar'},
      b = {'biz' : 'baz'};

      pie.util.extend(a, null, undefined, false, b);

      expect(a.biz).toEqual('baz');
    });

    it('should blow up if the first value is falsy', function() {
      var a = null, b = {'biz' : 'baz'};

      expect(function(){
        pie.util.extend(a, b);
      }).toThrowError();

    });

    it('should blow up if a non-object is provided', function() {
      var a = {'foo' : 'bar'},
      b = "thing";

      expect(function(){
        pie.util.extend(a, b);
      }).toThrowError();
    });

  });

  describe('#serialize', function() {

    // note, the serialize method sorts the keys before creating the string.

    it('should turn a basic object into a query string', function() {
      var query = pie.util.serialize({'foo' : 'bar'});
      expect(query).toEqual('foo=bar');
    });

    it('should deal with different data types', function() {
      var query = pie.util.serialize({'a' : 'A', 'b' : null, 'c' : undefined, 'd' : false, 'e' : true, 'f' : 10, 'g' : 15.5});
      expect(query).toEqual('a=A&b=null&c=undefined&d=false&e=true&f=10&g=15.5');
    });

    it('should remove empty values IF told to', function() {
      var query = pie.util.serialize({'a' : 'A', 'b' : null, 'c' : undefined, 'd' : false, 'e' : true, 'f' : 10, 'g' : 15.5, 'h' : 0}, true);
      expect(query).toEqual('a=A&d=false&e=true&f=10&g=15.5&h=0');
    });

    it('should turn multiple keys and values into a query string', function() {
      var query = pie.util.serialize({'foo' : 'bar', 'biz' : 'baz'});
      expect(query).toEqual('biz=baz&foo=bar');
    });

    it('should be able to assign missing keys', function() {
      var query = pie.util.serialize({'' : 'bar'});
      expect(query).toEqual('=bar');
    });

    it('should be able to assign missing values', function() {
      var query = pie.util.serialize({'foo' : ''});
      expect(query).toEqual('foo=');
    });

    it('should be able to serialize arrays', function() {
      var query = pie.util.serialize({'foo' : ['first', 'second']});
      expect(query).toEqual('foo%5B%5D=first&foo%5B%5D=second');
    });

    it('should not exclude falsy values when serializing an array', function() {
      var query = pie.util.serialize({'foo' : ['first', '', false]});
      expect(query).toEqual('foo%5B%5D=first&foo%5B%5D=&foo%5B%5D=false');
    });

  });

});
