describe("pie.base & object inheritance", function() {

  it("should allow a generic instance to be built", function() {
    var a = pie.base.create();
    expect(typeof a.init).toEqual('function');
    expect(typeof a.foo).toEqual('undefined');
  });

  it("should allow the class to be extended without impacting the parent class", function() {
    var A = pie.base.extend();
    var B = pie.base.extend({
      foo: 'bar'
    });

    var o = pie.base.create();
    var a = A.create();
    var b = B.create();

    expect(o.foo).toEqual(undefined);
    expect(a.foo).toEqual(undefined);
    expect(b.foo).toEqual('bar');
  });

  it("should set up inheritance chains properly", function() {
    var A = pie.base.extend({a: true});
    var B = A.extend({b: true});
    var C = pie.base.extend({c: true});

    var a = A.create();
    var b = B.create();
    var c = C.create();

    expect(a.a).toEqual(true);
    expect(b.a).toEqual(true);
    expect(c.a).toEqual(undefined);

    expect(a.b).toEqual(undefined);
    expect(b.b).toEqual(true);
    expect(c.b).toEqual(undefined);

    expect(a.c).toEqual(undefined);
    expect(b.c).toEqual(undefined);
    expect(c.c).toEqual(true);
  });

  it("should invoke init on construction", function(done) {
    var A = pie.base.extend({
      init: function() {
        expect(this.a).toEqual(true);
        done();
      },
      a: true
    });

    A.create();
  });

  it("should create a _super method for functions which call it", function() {

    var A = pie.base.extend({
      init: function(){
        this.aInit = true;
      }
    });
    var B = A.extend({
      init: function() {
        this.bInit = true;
        this._super();
      }
    });

    var a = A.create();
    var b = B.create();

    expect(a.bInit).toEqual(undefined);
    expect(a.aInit).toEqual(true);

    expect(b.bInit).toEqual(true);
    expect(b.aInit).toEqual(true);
  });

  it("should not create a _super method for functions which are not previously defined", function() {
    var A = pie.base.extend({
      foo: function() {
        expect(this._super).toEqual(undefined);
      }
    });

    var a = A.create();
    a.foo();
  });

  it("should not create a _super method for functions which are not previously defined as a function", function() {
    var A = pie.base.extend({
      foo: 'bar'
    });

    var B = A.extend({
      foo: function() {
        expect(this._super).toEqual(undefined);
      }
    });

    var b = B.create();
    b.foo();
  });

  it("should not create a _super method for functions which do not explicity use it", function() {
    var meth = "_super";

    var A = pie.base.extend({
      foo: function(){ return 'bar'; },
      bar: function(){ return 'baz'; }
    });
    var B = A.extend({
      foo: function() {
        expect(this[meth]).toEqual(undefined);
      },
      bar: function() {
        expect(typeof this._super).toEqual('function');
      }
    });


    var b = B.create();
    b.foo();
    b.bar();
  });

  it("should allow an object to 'inherit' from two parents", function() {
    var A = pie.base.extend({ a: true });
    var B = pie.base.extend({ b: true });
    var C = pie.base.extend(A, B, {c: true});

    var a = A.create();
    var b = B.create();
    var c = C.create();

    expect(a.a).toEqual(true);
    expect(b.a).toEqual(undefined);
    expect(c.a).toEqual(true);

    expect(a.b).toEqual(undefined);
    expect(b.b).toEqual(true);
    expect(c.b).toEqual(true);

    expect(a.c).toEqual(undefined);
    expect(b.c).toEqual(undefined);
    expect(c.c).toEqual(true);
  });

  it("should allow an object to 'inherit' from two parents, even if one of the parents is 'extended'", function() {
    var A = pie.base.extend({ a: true });
    var B = pie.base.extend({ b: true });
    var C = A.extend(B, {c: true});

    var a = A.create();
    var b = B.create();
    var c = C.create();

    expect(a.a).toEqual(true);
    expect(b.a).toEqual(undefined);
    expect(c.a).toEqual(true);

    expect(a.b).toEqual(undefined);
    expect(b.b).toEqual(true);
    expect(c.b).toEqual(true);

    expect(a.c).toEqual(undefined);
    expect(b.c).toEqual(undefined);
    expect(c.c).toEqual(true);
  });

  it("child classes should reflect changes in the parent classes", function() {
    var A = pie.base.extend({ a: true });
    var B = A.extend({ b: true });

    var olda = A.create();
    var oldb = B.create();

    A.reopen({ a: false });

    var newa = A.create();
    var newb = B.create();

    expect(olda.a).toEqual(true);
    expect(oldb.a).toEqual(true);

    expect(newa.a).toEqual(false);
    expect(newb.a).toEqual(false);
  });

});
