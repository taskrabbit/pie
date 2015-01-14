
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

  describe("#reset", function() {

    it('should set all existing values to undefined, removing them from data', function() {
      this.model.sets({foo: 'bar', baz: 'bash', qux: 'lux'});
      var k = Object.keys(this.model.data).sort();
      expect(k).toEqual(['_version', 'baz', 'foo', 'qux']);

      this.model.reset();
      k = Object.keys(this.model.data).sort();
      expect(k).toEqual(['_version']);
    });

    it("should trigger an observer for the reset", function(done) {
      this.model.sets({foo: 'bar', baz: 'bash'});

      this.model.observe(function(changes){
        expect(changes.length).toEqual(3);
        expect(changes.hasAll('foo', 'baz', '_version')).toEqual(true);
        done();
      });

      this.model.reset();
    });

  });


  describe("observation", function() {

    it("should allow observation of specific keys", function(done) {
      var observer = jasmine.createSpy('observer'),
      response = this.model.observe(observer, 'foo');

      observer.and.callFake(function(changes) {
        expect(changes.get('foo')).toEqual({
          'type' : 'add',
          'name' : 'foo',
          'object' : this.model.data,
          'value' : 'bar'
        });


        expect(observer.calls.count()).toEqual(1);

        done();
      }.bind(this));

      expect(response).toEqual(this.model);

      this.model.set('biz', 'baz');
      this.model.set('foo', 'bar');
    });

    it("should not add a change record if the value is identical", function() {
      var observer = jasmine.createSpy('observer');
      this.model.observe(observer, 'foo');

      this.model.data.foo = 'bar';
      this.model.set('foo', 'bar');

      expect(observer).not.toHaveBeenCalled();
    });

    it("should add a change record even if the value is identical IF the force option is provided", function(done) {
      var observer = jasmine.createSpy('observer');

      observer.and.callFake(function(changes) {
        expect(changes.get('foo')).toEqual({
          'type' : 'update',
          'name' : 'foo',
          'object' : this.model.data,
          'oldValue' : 'bar',
          'value' : 'bar'
        });

        done();
      }.bind(this));

      this.model.observe(observer, 'foo');

      this.model.data.foo = 'bar';
      this.model.set('foo', 'bar', {force: true});
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


    it("should send an array of changes, not triggering multiple times", function(done) {
      var observer = jasmine.createSpy('observer');

      observer.and.callFake(function(changes){
        var change = changes.get('foo');

        expect(change).toEqual({
          type: 'update',
          name: 'foo',
          oldValue: 'bar',
          value: 'baz',
          object: this.model.data
        });

        expect(observer.calls.count()).toEqual(1);

        done();

      }.bind(this));

      this.model.observe(observer, 'foo');

      this.model.set('foo', 'bar', {skipObservers: true});
      this.model.set('foo', 'baz');

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

    it("should allow for path observation", function() {
      var observer = jasmine.createSpy('observer');
      this.model.observe(observer, 'foo.bar');

      this.model.set('foo', {});
      expect(observer).not.toHaveBeenCalled();

      this.model.set('foo.baz', 1);
      expect(observer).not.toHaveBeenCalled();

      this.model.set('foo.bar', 1);
      expect(observer).toHaveBeenCalled();
    });

    it("should allow trigger changes on subpaths as well", function(done) {

      var observer1 = function(changes) {
        var change = changes.get('foo.bar');
        expect(change.type).toEqual('add');
        expect(change.name).toEqual('foo.bar');
        expect(change.oldValue).toEqual(undefined);
        expect(change.value).toEqual(1);
      };

      var observer2 = function(changes){
        var change = changes.get('foo');
        expect(change.type).toEqual('add');
        expect(change.name).toEqual('foo');
        expect(change.oldValue).toEqual(undefined);
        expect(change.value).toEqual(['bar']);
        done();
      };


      this.model.observe(observer1, 'foo.bar');
      this.model.observe(observer2, 'foo');

      this.model.set('foo.bar', 1);
    });

    it("should include changes to the computed properties for observers registered before the properties", function(done) {
      var observer = jasmine.createSpy('observer'), i = 0;

      this.model.observe(observer, 'first_name');

      this.model.compute('full_name', function(){
        return this.get('first_name') + (++i);
      }, 'first_name');

      observer.and.callFake(function(changes) {
        expect(changes.hasAll('first_name', 'full_name')).toEqual(true);
        done();
      });

      this.model.set('first_name', 'Foo');

    });

    it("should deliver records in the correct order", function(done) {
      var m = this.model, setProcessed = false;

      var o1 = function(){
        m.set('last_name', 'bar');
        setProcessed = true;
      };

      var o2 = function() {
        expect(setProcessed).toEqual(true);
        done();
      };

      m.observe(o1, 'first_name');
      m.observe(o2, 'last_name');

      m.set('first_name', 'foo');

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

    it("should send changes to the observers", function(done) {
      var observer = jasmine.createSpy('observer'),
      portion = 1;

      observer.and.callFake(function(changes) {

        var full = changes.get('full_name'),
        first = changes.get('first_name');

        if(portion === 1) {

          expect(full).toEqual({
            type: 'update',
            name: 'full_name',
            oldValue: '',
            value: 'Doug Wilson',
            object: this.foo.data
          });

          expect(first).toEqual({
            type: 'add',
            name: 'first_name',
            value: 'Doug',
            object: this.foo.data
          });

        } else if(portion === 2) {
          expect(full).toEqual({
            type: 'update',
            name: 'full_name',
            oldValue: 'Doug Wilson',
            value: 'William Wilson',
            object: this.foo.data
          });
        } else {
          expect(full).toEqual({
            type: 'update',
            name: 'full_name',
            oldValue: 'William Wilson',
            value: 'William Tell',
            object: this.foo.data
          });

          done();
        }

      }.bind(this));

      this.foo.observe(observer, 'full_name');

      // changes to both dependent properties.
      this.foo.sets({
        'first_name': 'Doug',
        'last_name' : 'Wilson'
      });

      portion = 2;
      this.foo.set('first_name', 'William');

      portion = 3;
      this.foo.set('last_name', 'Tell');
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
