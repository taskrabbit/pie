
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
      expect(observer).toHaveBeenCalledWith([{
        'type' : 'add',
        'name' : 'foo',
        'object' : this.model.data,
        'value' : 'bar'
      }]);
    });

    it("should not add a change record if the value is identical", function() {
      var observer = jasmine.createSpy('observer');
      this.model.observe(observer, 'foo');

      this.model.data.foo = 'bar';
      this.model.set('foo', 'bar');

      expect(observer).not.toHaveBeenCalled();
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


    it("should send an array of changes, not triggering multiple times", function() {
      var observer = jasmine.createSpy('observer');
      this.model.observe(observer, 'foo');

      this.model.set('foo', 'bar', {skipObservers: true});
      this.model.set('foo', 'baz');

      expect(observer.calls.count()).toEqual(1);
      expect(observer).toHaveBeenCalledWith([{
        type: 'add',
        name: 'foo',
        value: 'bar',
        object: this.model.data
      }, {
        type: 'update',
        name: 'foo',
        oldValue: 'bar',
        value: 'baz',
        object: this.model.data
      }]);

    });

    it("should send an array of changes which is extended with the changeSet mixin", function(done) {

      var observer = function(changes){
        expect(changes.has('foo')).toEqual(true);
        expect(changes.has('bar')).toEqual(false);

        expect(changes.hasAll('foo', 'too')).toEqual(true);
        expect(changes.hasAll('foo', 'bar')).toEqual(false);

        expect(changes.hasAny('foo', 'bar')).toEqual(true);
        expect(changes.hasAny('bar', 'baz')).toEqual(false);

        done();
      };

      this.model.observe(observer);

      this.model.set('foo', 'bar', {skipObservers: true});
      this.model.set('too', 'bar');
    });

  });

  describe("inheritance", function() {

    beforeEach(function() {
      var foo = pie.model.extend({
        newMethod: function(){ return this._super(); },
        get: function(k) {
          return 'override ' + this._super(k);
        }
      });

      this.foo = new foo();
    });

    it("should provide a _super method", function() {
      this.foo.set('foo', 'bar');
      expect(this.foo.get('foo')).toEqual('override bar');
    });

  });

  describe("computed properties", function() {
    beforeEach(function(){

      var foo = pie.model.extend(function(data){
        this._super(data);
        this.compute('full_name', this.fullName.bind(this), 'first_name', 'last_name');
      }, {
        fullName:  function() {
          return pie.array.compact([this.get('first_name'), this.get('last_name')]).join(' ');
        }
      });

      this.foo = new foo();
      this.fooClass = foo;
    });

    it("should compute initial values", function() {
      var foo2 = new this.fooClass({first_name: 'Doug', last_name: 'Wilson'});
      expect(foo2.get('full_name')).toEqual('Doug Wilson');
    });

    it("should change the value of a computed property when one of it's dependencies change", function() {
      this.foo.set('first_name', 'Bob');
      expect(this.foo.get('full_name')).toEqual('Bob');

      this.foo.set('last_name', 'Dole');
      expect(this.foo.get('full_name')).toEqual('Bob Dole');
    });

    it("should send changes to the observers", function() {
      var observer = jasmine.createSpy('observer');

      this.foo.observe(observer, 'full_name');

      // changes to both dependent properties.
      this.foo.sets({
        'first_name': 'Doug',
        'last_name' : 'Wilson'
      });

      // one invocation with one change record.
      expect(observer).toHaveBeenCalledWith([{
        type: 'update',
        name: 'full_name',
        oldValue: '',
        value: 'Doug Wilson',
        object: this.foo.data
      }]);

      this.foo.set('first_name', 'William');
      this.foo.set('last_name', 'Tell');

      expect(observer).toHaveBeenCalledWith([{
        type: 'update',
        name: 'full_name',
        oldValue: 'Doug Wilson',
        value: 'William Wilson',
        object: this.foo.data
      }]);

      expect(observer).toHaveBeenCalledWith([{
        type: 'update',
        name: 'full_name',
        oldValue: 'William Wilson',
        value: 'William Tell',
        object: this.foo.data
      }]);
    });
  });

  describe("versioning", function() {

    it("should increment the _version whenever change records are delivered", function() {
      var v = this.model.get('_version');
      expect(v).toEqual(1);

      this.model.set('foo', 'bar');
      v = this.model.get('_version');
      expect(v).toEqual(2);
    });

    it("should not increment until change records are delivered", function() {
      var v = this.model.get('_version');
      expect(v).toEqual(1);

      this.model.set('foo', 'bar', {skipObservers: true});
      v = this.model.get('_version');
      expect(v).toEqual(1);

      this.model.set('foo', 'baz');
      v = this.model.get('_version');
      expect(v).toEqual(2);
    });

  });

});
