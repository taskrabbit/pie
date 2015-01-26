describe("Object extension", function() {

  describe('#extend', function() {

    it('should modify the first argument', function() {
      var a = {'foo' : 'bar'},
      b = {'biz' : 'baz'};

      pie.object.merge(a, b);

      expect(a.biz).toEqual('baz');
    });

    it('should not stop if a falsy value is present', function() {
      var a = {'foo' : 'bar'},
      b = {'biz' : 'baz'};

      pie.object.merge(a, null, undefined, false, b);

      expect(a.biz).toEqual('baz');
    });

    it('should blow up if the first value is falsy', function() {
      var a = null, b = {'biz' : 'baz'};

      expect(function(){
        pie.object.merge(a, b);
      }).toThrowError();

    });

  });

  describe('#serialize', function() {

    // note, the serialize method sorts the keys before creating the string.

    it('should turn a basic object into a query string', function() {
      var query = pie.object.serialize({'foo' : 'bar'});
      expect(query).toEqual('foo=bar');
    });

    it('should deal with different data types', function() {
      var query = pie.object.serialize({'a' : 'A', 'b' : null, 'c' : undefined, 'd' : false, 'e' : true, 'f' : 10, 'g' : 15.5});
      expect(query).toEqual('a=A&b=null&c=undefined&d=false&e=true&f=10&g=15.5');
    });

    it('should remove empty values IF told to', function() {
      var query = pie.object.serialize({'a' : 'A', 'b' : null, 'c' : undefined, 'd' : false, 'e' : true, 'f' : 10, 'g' : 15.5, 'h' : 0}, true);
      expect(query).toEqual('a=A&d=false&e=true&f=10&g=15.5&h=0');
    });

    it('should turn multiple keys and values into a query string', function() {
      var query = pie.object.serialize({'foo' : 'bar', 'biz' : 'baz'});
      expect(query).toEqual('biz=baz&foo=bar');
    });

    it('should be able to assign missing keys', function() {
      var query = pie.object.serialize({'' : 'bar'});
      expect(query).toEqual('=bar');
    });

    it('should be able to assign missing values', function() {
      var query = pie.object.serialize({'foo' : ''});
      expect(query).toEqual('foo=');
    });

    it('should be able to serialize arrays', function() {
      var query = pie.object.serialize({'foo' : ['first', 'second']});
      expect(query).toEqual('foo%5B%5D=first&foo%5B%5D=second');
    });

    it('should remove empty arrays', function() {
      var query = pie.object.serialize({'foo' : [], 'bar' : 'baz'});
      expect(query).toEqual('bar=baz');
    });

    it('should not exclude falsy values when serializing an array', function() {
      var query = pie.object.serialize({'foo' : ['first', '', false]});
      expect(query).toEqual('foo%5B%5D=first&foo%5B%5D=&foo%5B%5D=false');
    });

  });


  describe("#except", function() {

    it("should return the object, less the supplied keys", function() {
      var a = {foo: 'f', bar: 'b', baz: 'z', qux: 'q'}, b;
      b = pie.object.except(a, 'foo', 'baz');

      expect(b).toEqual({bar: 'b', qux: 'q'});
      expect(a).not.toEqual(b);
    });

    it("should not define keys that are not initially present", function() {
      var a = {a: 'a'}, b;
      b = pie.object.except(a, 'b', 'c');
      expect(b).toEqual(a);
    });

  });

  describe("#slice", function() {

    it("should return an object with the matching keys", function() {
      var a = {foo: 'f', bar: 'b', baz: 'z', qux: 'q'}, b;
      b = pie.object.slice(a, 'foo', 'baz');

      expect(b).toEqual({foo: 'f', baz: 'z'});
      expect(a).not.toEqual(b);
    });

    it("should not define keys, or have an issue with extras", function() {
      var a = {a: 'a'}, b;
      b = pie.object.slice(a, 'b', 'c');
      expect(b).toEqual({});
    });

  });

  describe("#deletePath", function() {

    it("should delete attributes from simple objects", function() {
      var o = {foo: 'bar', baz: 'qux'};
      pie.object.deletePath(o, 'foo', true);
      expect(Object.keys(o)).toEqual(['baz']);
    });

    it("should delete nestd attributes", function() {
      var o = {foo: 'bar', baz: {qux: 'dux', car: 'bar'}};
      pie.object.deletePath(o, 'baz.car', true);
      expect(o.foo).toEqual('bar');
      expect(o.baz.qux).toEqual('dux');
      expect(Object.keys(o.baz)).toEqual(['qux']);
    });

    it("should delete empty objects", function() {
      var o = {baz: {qux: {foo: 'too'}}};
      pie.object.deletePath(o, 'foo.bar.baz', true);
      expect(o.baz.qux.foo).toEqual('too');
      pie.object.deletePath(o, 'baz.qux.foo', true);
      expect(Object.keys(o)).toEqual([]);
    });

    it("should delete empty objects", function() {
      var o = {baz: {qux: {foo: 'too'}}};
      pie.object.deletePath(o, 'foo.bar.baz', true);
      expect(o.baz.qux.foo).toEqual('too');
      pie.object.deletePath(o, 'baz.qux.foo', true);
      expect(Object.keys(o)).toEqual([]);
    });

    it("should not propagate unless told to", function() {
      var o = {baz: {qux: {foo: 'too'}}};
      pie.object.deletePath(o, 'baz.qux.foo');
      expect(Object.keys(o.baz.qux)).toEqual([]);
    });

  });

});
