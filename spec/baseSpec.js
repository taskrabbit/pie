// describe("pie.base & classical inheritance", function() {

//   it("should allow a generic instance to be built", function() {
//     var a = pie.base.create();
//     expect(typeof a.init).toEqual('function');
//     expect(typeof a.foo).toEqual('undefined');
//   });

//   it("should allow the class to be extended without impacting the parent class", function() {
//     var A = pie.base.extend();
//     var B = pie.base.extend({
//       foo: 'bar'
//     });

//     var o = pie.base.create();
//     var a = new A();
//     var b = new B();

//     expect(o.foo).toEqual(undefined);
//     expect(a.foo).toEqual(undefined);
//     expect(b.foo).toEqual('bar');
//   });

//   it("should set up the prototypal inheritance properly", function() {
//     var A = pie.base.extend();
//     var B = A.extend();
//     var C = pie.base.extend();

//     var a = new A();
//     var b = new B();
//     var c = new C();

//     expect(a instanceof pie.base).toEqual(true);
//     expect(b instanceof pie.base).toEqual(true);
//     expect(c instanceof pie.base).toEqual(true);

//     expect(a instanceof A).toEqual(true);
//     expect(b instanceof A).toEqual(true);
//     expect(c instanceof A).toEqual(false);

//     expect(a instanceof B).toEqual(false);
//     expect(b instanceof B).toEqual(true);
//     expect(c instanceof B).toEqual(false);

//     expect(a instanceof C).toEqual(false);
//     expect(b instanceof C).toEqual(false);
//     expect(c instanceof C).toEqual(true);
//   });

//   it("should invoke init on construction", function(done) {
//     var A = pie.base.extend({
//       init: function() {
//         expect(this instanceof A).toEqual(true);
//         done();
//       }
//     });

//     new A();
//   });

//   it("should create a _super method for functions which call it", function() {

//     var A = pie.base.extend({
//       init: function(){
//         this.aInit = true;
//       }
//     });
//     var B = A.extend({
//       init: function() {
//         this.bInit = true;
//         this._super();
//       }
//     });

//     var a = new A();
//     var b = new B();

//     expect(a.bInit).toEqual(undefined);
//     expect(a.aInit).toEqual(true);

//     expect(b.bInit).toEqual(true);
//     expect(b.aInit).toEqual(true);
//   });

//   it("should not create a _super method for functions which are not previously defined", function() {
//     var A = pie.base.extend({
//       foo: function() {
//         expect(this._super).toEqual(undefined);
//       }
//     });

//     var a = new A();
//     a.foo();
//   });

//   it("should not create a _super method for functions which are not previously defined as a function", function() {
//     var A = pie.base.extend({
//       foo: 'bar'
//     });

//     var B = A.extend({
//       foo: function() {
//         expect(this._super).toEqual(undefined);
//       }
//     });

//     var b = new B();
//     b.foo();
//   });

//   it("should not create a _super method for functions which do not explicity use it", function() {
//     var meth = "_super";

//     var A = pie.base.extend({
//       foo: function(){ return 'bar'; },
//       bar: function(){ return 'baz'; }
//     });
//     var B = A.extend({
//       foo: function() {
//         expect(this[meth]).toEqual(undefined);
//       },
//       bar: function() {
//         expect(typeof this._super).toEqual('function');
//       }
//     });


//     var b = new B();
//     b.foo();
//     b.bar();
//   });

// });
