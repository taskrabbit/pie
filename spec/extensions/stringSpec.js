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
      // foo[]=first&foo[]=second
      var query = pie.string.deserialize('foo%5B%5D=first&foo%5B%5D=second');
      expect(query).toEqual({
        'foo' : ['first', 'second']
      });
    });

    it('should not blow up on nested arrays. that said, it\'s likely not doing what\'s desired.', function() {
      // foo[][]=first&foo[][]=second
      var query = pie.string.deserialize('foo%5B%5D%5B%5D=first&foo%5B%5D%5B%5D=second');
      expect(query).toEqual({
        'foo' : [['first'], ['second']]
      });
    });

    it('should parse objects into subobjects', function() {
      // foo[alpha]=Adam&foo[beta]=Billy
      var query = pie.string.deserialize('foo%5Balpha%5D=Adam&foo%5Bbeta%5D=Billy');
      expect(query).toEqual({
        'foo' : {
          'alpha' : 'Adam',
          'beta' : 'Billy'
        }
      });
    });

    it('should parse nested objects just fine', function() {
      // foo[alpha][fname]=Adam&foo[alpha][lname]=Miller
      var query = pie.string.deserialize('foo%5Balpha%5D%5Bfname%5D=Adam&foo%5Balpha%5D%5Blname%5D=Miller');
      expect(query).toEqual({
        'foo' : {
          'alpha' : {
            'fname' : 'Adam',
            'lname' : 'Miller'
          }
        }
      });
    });

    it('should parse values if asked to', function() {
      var query = pie.string.deserialize('a=A&b=undefined&c=null&d=false&e=true&f=-5.5&g=10.0&h=5&i=2014-12-12', true);
      expect(query).toEqual({
        a: 'A',
        b: undefined,
        c: null,
        d: false,
        e: true,
        f: -5.5,
        g: 10.0,
        h: 5,
        i: '2014-12-12'
      });
    });

  });

  describe("#normalizeUrl", function() {

    it('should normalize a path properly', function() {
      var p;

      p = pie.string.normalizeUrl('test/path/#');
      expect(p).toEqual('/test/path');

      p = pie.string.normalizeUrl('/test/path#');
      expect(p).toEqual('/test/path');

      p = pie.string.normalizeUrl('/test/path/');
      expect(p).toEqual('/test/path');

      p = pie.string.normalizeUrl('test/things/?q=1&z=2');
      expect(p).toEqual('/test/things?q=1&z=2');

    });
  });
});
