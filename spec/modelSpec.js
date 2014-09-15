describe("pie.model", function() {

  beforeEach(function() {
    this.model = new pie.model();
  });

  it("should allow instantiation with an object", function() {
    var model = new pie.model({foo: 'bar'});
    expect(model.data.foo).toEqual('bar');
  });

  describe("setting", function() {

    it("should allow setting of a value", function() {
      expect(this.model.data.foo).toEqual(undefined);

      var response = this.model.set('foo', 'bar');
      expect(response).toEqual(this.model);

      expect(this.model.data.foo).toEqual('bar');
    });

    it("should allow setting of multiple values", function() {
      var response = this.model.sets({foo: 'bar', biz: 'baz'});
      expect(response).toEqual(this.model);

      expect(this.model.data.foo).toEqual('bar');
      expect(this.model.data.biz).toEqual('baz');

    });

  });

  describe("getting", function() {

    it("should allow the retrieval of a value", function() {
      this.model.data.foo = 'bar';
      expect(this.model.get('foo')).toEqual('bar');
    });

    it("should allow getting multiple values", function() {
      expect(this.model.gets('foo', 'biz')).toEqual({});
      this.model.data.foo = 'bar';
      this.model.data.biz = 'baz';
      expect(this.model.gets('foo', 'biz')).toEqual({'foo' : 'bar', 'biz' : 'baz'});
      expect(this.model.gets(['foo', 'biz'])).toEqual({'foo' : 'bar', 'biz' : 'baz'});
    });

  });


  describe("observation", function() {

    it("should allow observation of specific keys", function() {
      var observer = jasmine.createSpy('observer'),
      response = this.model.observe(observer, 'foo');

      expect(response).toEqual(this.model);

      this.model.set('biz', 'baz');
      this.model.set('foo', 'bar');

      expect(observer.calls.count()).toEqual(1);
      expect(observer).toHaveBeenCalledWith({
        'type' : 'add',
        'name' : 'foo',
        'object' : this.model.data
      });
    });

    it("should allow observation of all keys", function() {
      var observer = jasmine.createSpy('observer');
      this.model.observe(observer);

      this.model.set('biz', 'baz');
      this.model.set('foo', 'bar');

      expect(observer.calls.count()).toEqual(2);
    });

    it("should unobserve", function() {
      var observer = jasmine.createSpy('observer'), response;
      this.model.observe(observer, 'foo');
      this.model.set('foo', 'bar');

      response = this.model.unobserve(observer, 'foo');
      expect(response).toEqual(this.model);

      this.model.set('foo', 'baz');

      expect(observer.calls.count()).toEqual(1);
    });


  });

});
