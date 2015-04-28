jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

beforeEach(function() {});
describe("Array extensions", function() {

  describe('#areAll', function() {

    it('should determine if all element match the provided function', function() {
      var a = [0, 2, 4, 6, 8, 10],
      b = [0, 2, 5, 10],
      f = function(i){ return i % 2 === 0; };

      expect(pie.array.areAll(a, f)).toEqual(true);
      expect(pie.array.areAll(b, f)).toEqual(false);
    });

  });


  describe('#areAny', function() {

    it('should determine if any element matches the provided function', function() {
      var a = [0, 2, 4, 6],
      b = [0, 2, 5, 10],
      f = function(i){ return i % 2 === 1; };

      expect(pie.array.areAny(a, f)).toEqual(false);
      expect(pie.array.areAny(b, f)).toEqual(true);
    });

  });


  describe('#args', function() {

    it('should convert an Arguments object to an array', function() {
      var f = function(){ return pie.array.from(arguments); };

      expect(f('a', 'b', 'c')).toEqual(['a', 'b', 'c']);
      expect(f(['a', 'b', 'c'])).toEqual([['a', 'b', 'c']]);
    });

  });

  describe("#avg", function() {

    it("should average an array of numbers", function() {
      expect(pie.array.avg([2, 10, 15])).toEqual(9);
    });

    it('should return 0 if there are no numbers', function() {
      expect(pie.array.avg([])).toEqual(0);
    });

    it('should return NaN if theres a non-numeric', function() {
      expect(pie.array.avg([2, 4, 'foo'])).toEqual(NaN);
    });

  });

  describe("#compact", function() {

    it("should remove null and undefined values", function() {
      expect(pie.array.compact([1, null, undefined])).toEqual([1]);
    });

    it("should not remove falsy values by default", function() {
      var a = [0, '0', '', false];
      expect(pie.array.compact(a)).toEqual(a);
    });

    it('should optionally remove all falsy values', function() {
      var a = [0, '0', '', false];
      expect(pie.array.compact(a, true)).toEqual(['0']);
    });

  });

  describe('#detect', function() {

    it('should detect the first item that matches the provided function', function() {
      var a = [1, 3, 5, 6, 7],
      f = function(i){ return i % 2 === 0; };
      expect(pie.array.detect(a, f)).toEqual(6);
    });

    it('should detect the first item with a truthy attribute if a string is provided', function() {
      var a = [
        {i: 0, value: false},
        {i: 1, value: false},
        {i: 2, value: true},
        {i: 3, value: false}
      ];

      expect(pie.array.detect(a, 'value')).toEqual({i: 2, value: true});
    });

    it('should invoke the attribute if its a function', function() {
      var a = [
        {i: 0, value: function(){ return false; }},
        {i: 1, value: function(){ return false; }},
        {i: 2, value: function(){ return true; }},
        {i: 3, value: function(){ return false; }}
      ];

      expect(pie.array.detect(a, 'value').i).toEqual(2);
    });

    it('should work with other primitives', function() {
      var a = ['', 'foo'];

      expect(pie.array.detect(a, 'length')).toEqual('foo');
      expect(pie.array.detect(a, 'trim')).toEqual('foo');
    });

  });


  describe('#dup', function() {

    it('should duplicate the array', function() {
      var a = [1, 2, 3],
      b = pie.array.dup(a);

      a.push(4);
      expect(b).toEqual([1,2,3]);
    });

  });


  describe('#flatten', function() {

    it('should flatten an array of arrays', function() {
      var aa = [[0, [1]], [1, 2], [3, 4]],
      a = pie.array.flatten(aa);

      expect(a).toEqual([0, 1, 1, 2, 3, 4]);
    });

    it('should allow the depth of the flattening to be restricted', function() {
      var aa = [
        [0, [ [1] ]],
        [1, 2],
        [3, 4]
      ];

      expect(pie.array.flatten(aa, 1)).toEqual([0, [[1]], 1, 2, 3, 4]);
      expect(pie.array.flatten(aa, 2)).toEqual([0, [1], 1, 2, 3, 4]);
      expect(pie.array.flatten(aa)).toEqual([0, 1, 1, 2, 3, 4]);
    });

  });

  describe('#from', function() {

    it("should return the object if it's an array", function() {
      expect(pie.array.from([0])).toEqual([0]);
    });

    it('should return the object wrapped by an array if its not an array', function() {
      expect(pie.array.from(0)).toEqual([0]);
    });

    it('should return an empty array if a null value is provided', function() {
      expect(pie.array.from(null)).toEqual([]);
      expect(pie.array.from(undefined)).toEqual([]);
      expect(pie.array.from(false)).toEqual([false]);
    });

  });

  describe("#get", function() {

    beforeEach(function() {
      this.arr = ['a', 'b', 'c', 'd', 'e'];
    });

    it("allows an array to be accessed by positive and negative indexes", function() {
      expect(pie.array.get(this.arr, 0)).toEqual('a');
      expect(pie.array.get(this.arr, 1)).toEqual('b');
      expect(pie.array.get(this.arr, 10)).toEqual(undefined);

      expect(pie.array.get(this.arr, -1)).toEqual('e');
      expect(pie.array.get(this.arr, -2)).toEqual('d');
      expect(pie.array.get(this.arr, -10)).toEqual(undefined);
    });

  });


  describe('#grep', function() {

    it('should filter the array by a regex', function() {
      var a = [
        undefined,
        null,
        "i wonder if it's undefined",
        false,
        14.7
      ],
      r = /undefined/;

      expect(pie.array.grep(a, r)).toEqual([undefined, "i wonder if it's undefined"]);
    });

  });


  describe("#groupBy", function() {

    it('should group an array by a function', function() {
      var a = [0, 1, 2, 3, 4, 5, 6, 7, 8],
      f = function(i){ return i % 2 === 0 ? 'even' : 'odd'; },
      g = pie.array.groupBy(a, f);

      expect(g).toEqual({
        'even' : [0, 2, 4, 6, 8],
        'odd' : [1, 3, 5, 7]
      });
    });

    it('should allow the second argument to be a string which can be looked up as an attribute', function() {
      var a = ["foo", "bar", "foos", undefined, "bars", "baz"],
      g = pie.array.groupBy(a, 'length');

      expect(g).toEqual({
        3 : ['foo', 'bar', 'baz'],
        4 : ['foos', 'bars']
      });
    });

    it('should allow the second argument to be a string which can reference a function on the objects', function() {
      var a = [" foo ", "foo", "bar", "  bar", "  bar  "], g;
      g = pie.array.groupBy(a, 'trim');

      expect(g).toEqual({
        'foo' : [" foo ", "foo"],
        'bar' : ["bar", "  bar", "  bar  "]
      });
    });

  });

  describe('#interest', function() {

    it('should return the intersection of two arrays', function() {
      var a = [0,2,4,6], b = [1, 2, 3, 4];

      expect(pie.array.intersect(a, b)).toEqual([2,4]);
    });

  });

  describe('#last', function() {

    it('should return the last item of the array', function() {
      expect(pie.array.last([2,4])).toEqual(4);
      expect(pie.array.last([])).toEqual(undefined);
    });

  });

  describe('#map', function() {

    it('should map values from an array using a provided function', function() {

      var a = ["foo", "bar", "bugs", "buzz"],
      f = function(i){ return i.length; };

      expect(pie.array.map(a, f)).toEqual([3, 3, 4, 4]);
    });

    it('should map values from an array using a string attribute', function() {
      var a = ["foo", "bar", "bugs", "buzz"];

      expect(pie.array.map(a, 'length')).toEqual([3, 3, 4, 4]);
    });

    it('should map functions', function() {
      var a = ["foo ", " bar", "bugs ", " buzz"],
      f = String.prototype.trim;

      expect(pie.array.map(a, 'trim')).toEqual([f, f, f, f]);
    });

    it('should allow the internal functions to be invoked', function() {
      var a = ["foo ", " bar", "bugs ", " buzz"];

      expect(pie.array.map(a, 'trim', true)).toEqual(["foo", "bar", "bugs", "buzz"]);
    });

  });


  describe("#remove", function() {

    it("should remove all occurrences of an object", function() {
      var a = [1, 2, 3, 2, 5, 3, 2];
      expect(pie.array.remove(a, 2)).toEqual([1, 3, 5, 3]);
    });

  });


  describe("#subtract", function() {

    it("should remove any elements that exist in the second array", function() {
      var a = [1, 2, 2, 3, 3, 4, 5, 6, 7, 8],
      b = [0, 2, 4, 6, 8, 10];

      expect(pie.array.subtract(a, b)).toEqual([1, 3, 3, 5, 7]);
    });

  });


  describe('#sum', function() {

    it('should sum up all the values as floats', function() {
      var a = [1, 2, 3, 4, 5];
      expect(pie.array.sum(a)).toEqual(15);
    });

    it('should return NaN if something is not a number', function() {
      var a = [1, 2, 3, false, 4, 5];
      expect(pie.array.sum(a)).toEqual(NaN);
    });

  });


  describe('#sortBy', function() {

    it("should sort based on the provided sorting function", function() {
      var a = ["foo", "bars", "bells"],
      f = function(i){ return 10 - i.length; };

      expect(pie.array.sortBy(a, f)).toEqual(['bells', 'bars', 'foo']);
    });

    it('should be able to accept an attribute', function() {
      var a = ["bells", "bars", "foo"];
      expect(pie.array.sortBy(a, 'length')).toEqual(['foo', 'bars', 'bells']);
    });

    it('should be able to accept a function property', function() {
      var a = ["Foo", "foo", "Bells", "bells"];
      expect(pie.array.sortBy(a, 'toLowerCase')).toEqual(['Bells', 'bells', 'Foo', 'foo']);
    });

  });


  describe("#toSentence", function() {

    it('should return an empty string for an empty array', function() {
      expect(pie.array.toSentence([])).toEqual('');
    });

    it('should return the stringified version of a single element', function() {
      expect(pie.array.toSentence([4])).toEqual('4');
    });

    it('should return the two elements combined by the and', function() {
      expect(pie.array.toSentence([3, 4])).toEqual('3 and 4');
    });

    it('should combine 3+ elements by the delimeter and the and', function() {
      expect(pie.array.toSentence([3, 4, 5, 6, 7])).toEqual('3, 4, 5, 6 and 7');
    });

    it('should allow for i18n translations to be provided', function() {
      var a = new pie.app();
      var i18n = a.i18n;
      i18n.load({
        app: {
          sentence: {
            delimeter: '; ',
            conjunction: ', yet, '
          }
        }
      });

      expect(pie.array.toSentence([3, 4, 5, 6], {i18n: i18n})).toEqual('3; 4; 5, yet, 6');
    });

  });

  describe("#union", function() {

    it('should return the unique combination of the provided arrays', function() {
      var a = [1, 2, 3, 4, 5, 5, 6],
      b = [0, 1, 3, 4, 8],
      c = [10, 12];

      expect(pie.array.union(a, b, c)).toEqual([1, 2, 3, 4, 5, 6, 0, 8, 10, 12]);
      // should not be destructive;
      expect(a).toEqual([1, 2, 3, 4, 5, 5, 6]);
    });

  });


  describe('#unique', function() {

    it('should remove duplicates', function() {
      var a = [0,0,1,1,2,2,3,3];
      expect(pie.array.unique(a)).toEqual([0,1,2,3]);
      expect(a).toEqual([0,0,1,1,2,2,3,3]);
    });
  });

});
describe("Date extensions", function() {

  describe('#dateFromISO', function() {

    it("should correctly parse a iso date", function() {
      var st = "2014-06-01",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should correctly parse an iso timestamp as a date", function() {
      var st = "2014-06-01T11:07:16Z",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should not care about timezone", function() {
      var st = "2014-06-01T11:07:16+09:00",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should handle an iso timestamp with a space instead of a T", function() {
      var st = "2014-06-01 11:07:16+09:00",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should not blow up on a falsy value", function() {
      var d = pie.date.dateFromISO();
      expect(d).toEqual(null);
    });

  });

  describe("#timeFromISO", function() {


    it("should not blow up on a falsy value", function() {
      var d = pie.date.timeFromISO();
      expect(d).toEqual(NaN);
    });


    it("should return the date value if there's no separator", function() {
      var d = pie.date.timeFromISO("2014-06-01");

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });
  });

});
describe("Pie Dom Extension", function() {
  describe('#createElement', function() {

    it('should create an element which is not attached to the dom', function() {
      var start = document.getElementsByTagName('*').length, finish, dom;

      dom = pie.dom.createElement('<ul><li>First</li><li>Second</li></ul>');

      expect(dom.parentNode).toBeFalsy();
      expect(dom.innerHTML).toEqual('<li>First</li><li>Second</li>');
      expect(dom.tagName).toEqual('UL');

      finish = document.getElementsByTagName('*').length;
      expect(start).toEqual(finish);
    });

  });

  describe("#all / #getAll", function() {

    beforeEach(function() {
      this.els = [
        document.createElement('input'),
        document.createElement('input'),
        document.createElement('input')
      ];

      this.els.forEach(function(e) {
        e.type = 'text';
        e.value = 'foo';
        e.foo = jasmine.createSpy();
      });
    });

    it("should allow an action to be taken on all nodes", function() {

      pie.dom.all(this.els, 'foo');

      this.els.forEach(function(e) {
        expect(e.foo).toHaveBeenCalled();
      });

    });

    it("should allow a function to be invoked on all nodes", function() {
      pie.dom.all(this.els, 'setAttribute', 'disabled', 'disabled');

      this.els.forEach(function(e) {
        expect(e.getAttribute('disabled')).toEqual('disabled');
      });

    });

    it("should allow an assignment to take place on all nodes", function() {

      pie.dom.all(this.els, 'value=', 'bar');

      this.els.forEach(function(e) {
        expect(e.value).toEqual('bar');
      });

    });

    it("should allow invocation of nested methods", function() {
      pie.dom.all(this.els, 'classList.add', 'foo');

      this.els.forEach(function(e) {
        expect(e.classList.contains('foo')).toEqual(true);
      });

    });

    it("should allow retrieval of properties", function() {
      this.els[1].value = 'bar';
      this.els[2].value = 'baz';
      var result = pie.dom.getAll(this.els, 'value');
      expect(result).toEqual(['foo', 'bar', 'baz']);
    });

  });

  describe("#matches", function() {

    beforeEach(function() {
      this.form = document.createElement('form');
      this.form.classList.add('foo-bar-baz');
    });

    it("should determine whether a loose element matches a selector", function() {
      expect(pie.dom.matches(this.form, '.foo-bar-baz')).toEqual(true);
      expect(pie.dom.matches(this.form, 'form')).toEqual(true);
      expect(pie.dom.matches(this.form, 'form.foo-bar-baz')).toEqual(true);
      expect(pie.dom.matches(this.form, 'input.foo-bar-baz')).toEqual(false);
      expect(pie.dom.matches(this.form, 'input')).toEqual(false);
    });

  });

  describe("#on", function() {

    beforeEach(function() {
      this.node = pie.dom.createElement('<div class="foo"><h3>Title</h3><ul><li><span>First</span></li><li class="active"><span>Second</span></li><li><span>Third</span></li></ul></div>');
      this.li1 = this.node.querySelector('li:first-child');
      this.li2 = this.node.querySelector('li:first-child + li');
      this.li3 = this.node.querySelector('li:first-child + li + li');

      document.body.appendChild(this.node);
    });

    afterEach(function() {
      if(this.node.parentNode) this.node.parentNode.removeChild(this.node);
    });

    it("should add an observer directly to the node", function(done) {

      pie.dom.on(this.node, 'foo', function(e) {
        expect(e.namespace).toEqual(undefined);
        expect(e.delegateTarget).toEqual(undefined);
        done();
      });

      pie.dom.trigger(this.node, 'foo');
    });

    it("if a selector is not provided, it should trigger due to bubbling", function(done) {

      pie.dom.on(this.node, 'foo', function(e) {
        expect(e.namespace).toEqual(undefined);
        expect(e.delegateTarget).toEqual(undefined);
        done();
      });

      pie.dom.trigger(this.li1, 'foo');
    });

    it("if a selector is provided and it doesn't match, it should not trigger", function() {
      var spy = jasmine.createSpy();
      pie.dom.on(this.node, 'foo', spy, 'li.active');
      pie.dom.trigger(this.li1, 'foo');
      expect(spy).not.toHaveBeenCalled();
    });

    it("if a selector is provided and it is a direct match, it should trigger", function(done) {
      var targ = this.node.querySelector('li.active');

      pie.dom.on(this.node, 'foo', function(e){
        expect(e.delegateTarget).toEqual(targ);
        expect(e.target).toEqual(targ);
        done();
      }, 'li.active');

      pie.dom.trigger(this.node.querySelector('li.active'), 'foo');
    });

    it("if a selector is provided and it is a parent of the target, it should trigger", function(done) {
      var targ = this.node.querySelector('li.active');

      pie.dom.on(this.node, 'foo', function(e){
        expect(e.delegateTarget).toEqual(targ);
        expect(e.target).toEqual(targ.querySelector('span'));
        done();
      }, 'li.active');

      pie.dom.trigger(this.node.querySelector('li.active span'), 'foo');
    });

    it("if a selector is provided and it is a child of the target, it should not trigger", function() {
      var spy = jasmine.createSpy();
      pie.dom.on(this.node, 'foo', spy, 'li.active span');
      pie.dom.trigger(this.node.querySelector('li.active'), 'foo');
      expect(spy).not.toHaveBeenCalled();
    });

    it("if a selector is provided that matches the el itself, it should be invoked", function(done) {
      var targ = this.node;

      pie.dom.on(this.node, 'foo', function(e){
        expect(e.delegateTarget).toEqual(targ);
        expect(e.target).toEqual(targ.querySelector('span'));
        done();
      }, '.foo');

      pie.dom.trigger(this.node.querySelector('span'), 'foo');
    });

    it("if a selector is a sibling of the trigger, it should not be invoked", function() {
      var spy = jasmine.createSpy();
      pie.dom.on(this.node, 'foo', spy, 'h3');
      pie.dom.trigger(this.node.querySelector('ul'), 'foo');
      expect(spy).not.toHaveBeenCalled();
    });


  });
});
describe("Pie Function Extensions", function() {

  describe("#valueFrom", function() {
    it('should return a value if that value is not a function', function() {
      var a = 'a', b = {call: function(){}};

      expect(pie.fn.valueFrom(a)).toEqual(a);
      expect(pie.fn.valueFrom(b)).toEqual(b);
    });

    it('should invoke the function and return the value if the provided object is a function', function() {
      var a = function(){ return 4; };
      expect(pie.fn.valueFrom(a)).toEqual(4);
    });
  });

  describe("#once", function() {

    it("should only ever invoke the provided function once", function() {
      var count = 0,
      fn = function(){ return ++count; };

      fn = pie.fn.once(fn);

      fn();
      fn();
      var r = fn();

      expect(count).toEqual(1);
      expect(r).toEqual(1);

    });

  });

  describe('#debounce', function() {

    beforeEach(function() {
      pending(); // weird issue in chrome where things just randomly blow up.
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().tick(1000);
      jasmine.clock().uninstall();
    });

    it("should wait for a function to stopped bing invoked for X milliseconds", function() {
      var called = 0;
      var fn = pie.fn.debounce(function(){ called++; }, 250);

      fn();
      fn();
      expect(called).toEqual(0);

      jasmine.clock().tick(249);
      fn();
      fn();
      expect(called).toEqual(0);

      jasmine.clock().tick(250);

      // fire
      expect(called).toEqual(1);

      fn();
      fn();
      fn();
      fn();

      expect(called).toEqual(1);

      jasmine.clock().tick(250);
      // fire
      expect(called).toEqual(2);

      jasmine.clock().tick(250);

      expect(called).toEqual(2);

      fn();
      jasmine.clock().tick(250);
      // fire
      expect(called).toEqual(3);
    });

    it("should invoke on the leading edge of the wait time but not more often than every X milliseconds if immediate=true is provided", function() {
      var called = 0;
      var fn = pie.fn.debounce(function(){ called++; }, 250, true);

      fn();
      // fire
      expect(called).toEqual(1);

      fn();
      expect(called).toEqual(1);

      jasmine.clock().tick(249);
      expect(called).toEqual(1);

      fn();
      fn();

      expect(called).toEqual(1);

      jasmine.clock().tick(250);
      // fire

      expect(called).toEqual(1);

      fn();
      fn();
      fn();
      fn();

      expect(called).toEqual(2);

      jasmine.clock().tick(250);
      expect(called).toEqual(2);

      jasmine.clock().tick(250);

      expect(called).toEqual(2);

      fn();
      jasmine.clock().tick(250);
      expect(called).toEqual(3);
    });

  });

  describe("#async", function() {

    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it("should work with no functions provided", function(done) {
      pie.fn.async([], function() {
        expect(1).toEqual(1);
        done();
      });
    });

    it("should work with no callback", function() {
      var called = false;
      pie.fn.async([function(cb){ called = true; cb(); }]);
      expect(called).toEqual(true);
    });

    it("should wait for all functions to complete before invoking the callback", function(done) {
      var aCalled = false, bCalled = false, cCalled = false;

      var a = function(cb){ setTimeout(function(){ aCalled = true; cb(); }, 100); };
      var b = function(cb){ bCalled = true; cb(); };
      var c = function(cb){ cCalled = true; cb(); };

      pie.fn.async([a,b,c], function() {
        expect(aCalled).toEqual(true);
        expect(bCalled).toEqual(true);
        expect(cCalled).toEqual(true);

        done();
      });

      expect(aCalled).toEqual(false);
      expect(bCalled).toEqual(true);
      expect(cCalled).toEqual(true);

      jasmine.clock().tick(100);

    });

    it("should allow a count observer to be provided", function(done) {
      var observes = 0;

      pie.fn.async([function(cb){ cb(); }, function(cb){ cb(); }], function(){
        expect(observes).toEqual(2);
        done();
      }, function() {
        observes++;
      });
    });

  });

});
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

    it('should not blow up if the first value is falsy', function() {
      var a = null, b = {'biz' : 'baz'}, out;
      out = pie.object.merge(a, b);
      expect(out).toEqual({'biz' : 'baz'});
      b.foo = 'bar';
      expect(out.foo).toEqual(undefined);
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

  describe('#expand', function() {

    it("by default should not throw an error when an interpolation is missing", function() {
      var result = pie.string.expand('%{foo} bar');
      expect(result).toEqual('undefined bar');
    });

    it("should raise an error on a missing interpolation if asked to", function() {
      expect(function(){
        pie.string.expand('%{foo} bar', {}, true);
      }).toThrowError("Missing interpolation argument `foo` for '%{foo} bar'");
    });

    it("should properly interpolate the values", function() {
      var result = pie.string.expand("%{foo} bar biz %{baz} -- %{foo}", {foo: 'FOO', baz: 'BAZ', bar: 'BAR'});
      expect(result).toEqual("FOO bar biz BAZ -- FOO");
    });

  });

  describe("#template", function() {

    var simpleTemplate = "[% var foo = data.foo; %]Hi, [%- data.first_name %]. Welcome to [%= foo.name %].";
    var quoteTemplate = "Do you know 'Doug' from [%- data['a'] %] company or \"John\" from [%= data[\"b\"] %] company?";
    var loopTemplate = "[% var i = 0; j = 0; %][% while(i < 4){ %][% for(j = 0; j < i; j++){ %][%= i %] - [%= j %] | [% } %][% i++ %][% } %]";
    var modTemplate = "[%- data.count % 2 === 0 ? 'even' : 'odd' %] but not [%= data.count % 2 === 1 ? 'even' : 'odd' %]";

    var simple = pie.string.template(simpleTemplate);
    var quote = pie.string.template(quoteTemplate);
    var loop = pie.string.template(loopTemplate);
    var mod = pie.string.template(modTemplate);

    var resetSettings = function() {
      pie.string.setTemplateSettings("[%", "%]", "-", "=", "");
    };

    beforeEach(function() {
      resetSettings();
    });

    afterEach(resetSettings);

    it("should create a function which accepts a single argument, data", function() {
      expect(typeof simple).toEqual('function');
      expect(simple.length).toEqual(1); // arity check.
    });

    it("should be able to evaluate sections without appending any content", function() {
      var output = simple({foo: {}});
      expect(output.match(/^Hi/)).toBeTruthy();
    });

    it("should be able to evaluate sections without escaping", function() {
      var output = simple({foo: {name: '<h1>Site</h1>'}});
      expect(output.match(/h1>\.$/)).toBeTruthy();
    });

    it("should be able to escape html content", function() {
      var output = simple({first_name: '<h1>Doug</h1>', foo: {}});
      expect(output.match(/&lt;/)).toBeTruthy();
    });

    it("should not leak variables", function() {
      var foo;
      simple({foo: {name: 'bar'}, first_name: 'Doug'});
      expect(window.foo).toEqual(undefined);
      expect(foo).toEqual(undefined);
    });

    it("should know how to interpolate things", function() {
      var output = simple({foo: {name: '<strong>Site</strong>'}, first_name: '<strong>Doug</strong>'});
      expect(output).toEqual("Hi, &lt;strong&gt;Doug&lt;/strong&gt;. Welcome to <strong>Site</strong>.");
    });

    it("should properly handle quotes inside and outside of interpolations", function() {
      var output = quote({a: "foo's", b: "bar's"});
      expect(output).toEqual("Do you know 'Doug' from foo&#39;s company or \"John\" from bar's company?");
    });

    it("should be fine with loops", function() {
      var output = loop();
      expect(output).toEqual("1 - 0 | 2 - 0 | 2 - 1 | 3 - 0 | 3 - 1 | 3 - 2 | ");
    });

    it("should allow modulus in the evaluations", function() {
      var output = mod({count: 5});
      expect(output).toEqual('odd but not even');
    });

    it("should allow other variable declarations to be made", function() {
      var tmpl = pie.string.template("Hi, [%= doug %]", "var doug = 'Doug'");
      var output = tmpl();
      expect(output).toEqual("Hi, Doug");
    });

    it("should allow a different syntax", function() {
      pie.string.setTemplateSettings("<#", "#>", "~", "+", "!");

      var tmpl = pie.string.template("<#! var foo = 2; #>Hi, <#~ data.bar #>. You have <#+ foo #> messages.");
      var output = tmpl({bar: '<i>Doug</i>'});
      expect(output).toEqual("Hi, &lt;i&gt;Doug&lt;/i&gt;. You have 2 messages.");
    });

  });
});
describe("View Binding Integration", function() {

  beforeEach(function() {
    var v = new lib.views.listView();
    this.view = v;
    this.model = this.view.model;
  });

  afterEach(function() {
    this.view.removeFromDom();
  });

  it("should allow binding of model attributes to form fields", function() {
    var el = this.view.qs('input[name="foo"]');

    expect(el).not.toBeFalsy();
    expect(el.value).toEqual('');

    this.model.set('foo', 'bar');
    expect(el.value).toEqual('bar');

    el.value = 'barstool';
    expect(this.model.get('foo')).toEqual('bar');
    pie.dom.trigger(el, 'change');

    expect(this.model.get('foo')).toEqual('barstool');
  });

  it("should be able to initialize form fields by invoking initBoundFields()", function() {
    var el = this.view.qs('input[name="foo"]');

    this.model.data.foo = 'wingdings';
    expect(el.value).toEqual('');

    this.view.initBoundFields();

    expect(el.value).toEqual('wingdings');
  });

  it('should be able to set attributes of elements', function() {
    var el = this.view.qs('input[name="foo"]');
    this.model.set('baz', 'jazz');
    expect(el.getAttribute('data-baz')).toEqual('jazz');
  });

});
describe("pie.mixins.changeSet", function() {

  beforeEach(function() {
    this.changes = [{
      name: 'foo',
      type: 'add',
      oldValue: undefined,
      value: 2
    }, {
      name: 'bar',
      type: 'add',
      oldValue: undefined,
      value: 4
    }, {
      name: 'foo',
      type: 'update',
      oldValue: 2,
      value: 4
    }, {
      name: 'qux',
      type: 'add'
    }, {
      name: 'bar',
      type: 'update',
      oldValue: 4,
      value: 8
    }, {
      name: 'foo',
      type: 'update',
      oldValue: 4,
      value: 6
    }];

    pie.object.merge(this.changes, pie.mixins.changeSet);
  });


  it("should determine if the changeset has a certain key", function() {
    expect(this.changes.has('foo')).toEqual(true);
    expect(this.changes.has('fooz')).toEqual(false);
  });

  it("should determine if the changeset has any of the provided keys", function() {
    expect(this.changes.hasAny('foo', 'bar')).toEqual(true);
    expect(this.changes.hasAny('foo', 'baz')).toEqual(true);
    expect(this.changes.hasAny('baz', 'too')).toEqual(false);
  });

  it("should allow a specific change to be retrieved", function() {
    expect(this.changes.get('bar').value).toEqual(8);
  });

  it("should allow the changeSet to be queried for a specific name and/or type", function() {
    expect(this.changes.query({name: 'foo', type: 'add'}).value).toEqual(2);
    expect(this.changes.query({name: 'foo', type: 'update'}).value).toEqual(6);
  });

  it("should allow the changeSet to be queried for all types and/or names", function() {
    expect(this.changes.queryAll({name: 'foo'}).length).toEqual(3);
    expect(this.changes.queryAll({type: 'update'}).length).toEqual(3);
    expect(this.changes.queryAll({type: 'update', name: 'foo'}).length).toEqual(2);
  });

});
describe("pie.mixins.container", function() {

  beforeEach(function() {
    this.container = pie.object.merge({}, pie.mixins.container);
  });

  describe("#init", function() {

    it("should provide an init function which invokes _super", function() {
      this.container._super = jasmine.createSpy('_super');

      this.container.init('foo', 'bar');

      expect(this.container._super).toHaveBeenCalledWith('foo', 'bar');
    });

    it("should not care if _super is not defined", function() {
      expect(function(){
        this.container.init('foo', 'bar');
      }.bind(this)).not.toThrow();
    });

    it("should setup a children array and a childNames hash", function() {
      this.container.init();

      expect(this.container.children).toEqual([]);
      expect(this.container.childNames).toEqual({});
    });

  });

  describe("#addChild", function() {

    beforeEach(function() {
      this.container.init();
    });

    it("should add a child to the children array & setup the appropriate references", function() {
      var child = {};
      this.container.addChild('foo', child);

      expect(this.container.children).toEqual([child]);
      expect(this.container.childNames).toEqual({foo: 0});

      expect(child.parent).toEqual(this.container);
      expect(child._indexWithinParent).toEqual(0);
      expect(child._nameWithinParent).toEqual('foo');
    });

    it("should invoke addedToParent on the child if it exists", function() {
      var child = {
        addedToParent: jasmine.createSpy('addedToParent')
      };

      this.container.addChild('foo', child);
      expect(child.addedToParent).toHaveBeenCalled();
    });

  });

  describe("#removeChild", function() {

    beforeEach(function() {
      this.container.init();

      this.child1 = {};
      this.child2 = {};
      this.container.addChild('child1', this.child1);
      this.container.addChild('child2', this.child2);
    });

    it("should remove a child from it's parent by it's name", function() {
      expect(this.container.children.length).toEqual(2);
      this.container.removeChild('child1');
      expect(this.container.children).toEqual([this.child2]);
    });

    it("should remove a child from it's parent by it's index", function() {
      expect(this.container.children.length).toEqual(2);
      this.container.removeChild(0);
      expect(this.container.children).toEqual([this.child2]);
    });

    it("should remove a child from it's parent by itself", function() {
      expect(this.container.children.length).toEqual(2);
      this.container.removeChild(this.child1);
      expect(this.container.children).toEqual([this.child2]);
    });

    it("should not blow up if there is no matching child", function() {
      expect(this.container.children.length).toEqual(2);
      this.container.removeChild('other');
      expect(this.container.children).toEqual([this.child1, this.child2]);
    });

    it("should invoke removedFromParent on the child", function() {
      this.child1.removedFromParent = jasmine.createSpy('removedFromParent');
      this.container.removeChild('child1');
      expect(this.child1.removedFromParent).toHaveBeenCalled();
    });

  });

  describe('#bubble', function() {

    beforeEach(function() {
      this.container.foo = jasmine.createSpy('containerFoo');
      this.container.bar = jasmine.createSpy('containerBar');
      this.container.init();

      this.child = pie.object.merge({}, pie.mixins.container);
      this.child.foo = jasmine.createSpy('childFoo');
      this.child.init();

      this.grandchild = pie.object.merge({}, pie.mixins.container);
      this.grandchild.init();

      this.container.addChild('child', this.child);
      this.child.addChild('child', this.grandchild);
    });

    it("should find the nearest instance with a matching function", function(){
      this.grandchild.bubble('foo', 'biz', 'baz');
      expect(this.child.foo).toHaveBeenCalledWith('biz', 'baz');
      expect(this.container.foo).not.toHaveBeenCalled();
    });

    it("should travel multiple levels if necessary", function(){
      this.grandchild.bubble('bar', 'biz', 'baz');
      expect(this.container.bar).toHaveBeenCalledWith('biz', 'baz');
    });

  });

});
describe("pie.activeView", function() {

  beforeEach(function() {
    app.templates.registerTemplate('activeViewTest', "[%= data.foo %] - [%= data.bar %]");
  });

  describe("#setup", function() {

    beforeEach(function() {

      this.view = new pie.activeView({
        template: 'activeViewTest',
        autoRender: true,
        renderOnSetup: true
      });

    });

    it("should render when setup is invoked if renderOnSetup is true", function() {
      spyOn(this.view, 'render');
      this.view.setup();
      expect(this.view.render).toHaveBeenCalled();
    });

    it("should not render on setup if the renderOnSetup options is not true", function() {
      spyOn(this.view, 'render');
      this.view.options.renderOnSetup = 0;
      this.view.setup();
      expect(this.view.render).not.toHaveBeenCalled();
    });

    it("should setup a default render implementation", function() {
      spyOn(this.view, '_renderTemplateToEl');
      this.view.setup();
      expect(this.view._renderTemplateToEl).toHaveBeenCalled();
    });

    it("should use this.model's data as the render data if it's present", function() {
      expect(this.view.renderData()).toEqual({});
      var m = this.view.model = new pie.model({foo: 'bar', bar: 'baz'});
      expect(this.view.renderData()).toEqual(m.data);
    });

    it("should generate content and apply to this.el based on a template name defined by this.options.template", function() {
      var m = this.view.model = new pie.model({foo: 'bar', bar: 'baz'});
      this.view.setup();
      expect(this.view.el.innerHTML).toEqual('bar - baz');
    });

    it("should not attempt to render anything if a template name is not provided", function() {
      delete this.view.options.template;
      this.view.setup();
      expect(this.view.el.innerHTML).toEqual('');
    });

    it("should allow rendering to be blocked", function(done) {
      spyOn(this.view, '_renderTemplateToEl');

      this.view.emitter.on('aroundRender', function(cb) {
        expect(this.view._renderTemplateToEl).not.toHaveBeenCalled();
        cb();
        expect(this.view._renderTemplateToEl).toHaveBeenCalled();
        done();
      }.bind(this));

      this.view.setup();
    });

  });

});
describe("pie.ajax", function() {

  beforeEach(function() {
    this.ajax = app.ajax;
  });

  it("get() should invoke ajax() with a GET", function() {
    spyOn(this.ajax, 'ajax');

    this.ajax.get({"data" : "test"});
    expect(this.ajax.ajax).toHaveBeenCalledWith({"verb" : "GET", "data" : "test"}, undefined);
  });

  it("post() should invoke ajax() with a POST", function() {
    spyOn(this.ajax, 'ajax');

    this.ajax.post({"data" : "test"});
    expect(this.ajax.ajax).toHaveBeenCalledWith({"verb" : "POST", "data" : "test"}, undefined);
  });

  it("put() should invoke ajax() with a PUT", function() {
    spyOn(this.ajax, 'ajax');

    this.ajax.put({"data" : "test"});
    expect(this.ajax.ajax).toHaveBeenCalledWith({"verb" : "PUT", "data" : "test"}, undefined);
  });

  it("del() should invoke ajax() with a DELETE", function() {
    spyOn(this.ajax, 'ajax');

    this.ajax.del({"data" : "test"});
    expect(this.ajax.ajax).toHaveBeenCalledWith({"verb" : "DELETE", "data" : "test"}, undefined);
  });

  describe("with mock-ajax running", function() {

    beforeEach(function() {
      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest('/get-path').andReturn({
        responseText: '{"get" : "response"}',
        status: 200,
        contentType: 'application/json'
      });

      jasmine.Ajax.stubRequest('/post-path').andReturn({
        responseText: '{"post" : "response"}',
        status: 200,
        contentType: 'application/json'
      });

      jasmine.Ajax.stubRequest('/post-path-html').andReturn({
        responseText: '<span>foo</span>',
        status: 200,
        contentType: 'text/html'
      });

      jasmine.Ajax.stubRequest('/put-path').andReturn({
        responseText: '{"put" : "response"}',
        status: 200,
        contentType: 'application/json'
      });

      jasmine.Ajax.stubRequest('/delete-path').andReturn({
        responseText: '{"delete" : "response"}',
        status: 200,
        contentType: 'application/json'
      });

      jasmine.Ajax.stubRequest('/head-path').andReturn({
        responseText: ' ',
        status: 200,
        contentType: 'application/json'
      });

      jasmine.Ajax.stubRequest('/error-path').andReturn({
        responseText: '{"errors" : [{"message" : "error response"]}',
        status: 422,
        contentType: 'application/json'
      });

      jasmine.Ajax.stubRequest('/disconnected-path').andReturn({
        responseText: ' ',
        status: undefined,
        contentType: 'application/json'
      });

    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
    });

    it("should not blow up if there is no csrf token in the dom", function() {
      var meta = document.querySelector('meta[name="csrf-token"]');
      if(meta) meta.parentNode.removeChild(meta);

      var doneFn = jasmine.createSpy('success');

      this.ajax.get({
        url: '/get-path',
        dataSuccess: doneFn
      });

      expect(doneFn).toHaveBeenCalledWith({'get' : 'response'});
    });

    it("should use the csrf token in the dom if it is present", function() {
      this.ajax.app.cache.del('csrfToken');
      var meta = pie.dom.createElement('<meta name="csrf-token" content="abcdefg" />'), request;
      document.querySelector('head').appendChild(meta);

      this.ajax.get({ url: '/get-path' });

      request = jasmine.Ajax.requests.mostRecent();
      expect(request.requestHeaders['X-CSRF-Token']).toEqual('abcdefg');
    });

    it("should set default options on the request", function() {
      this.ajax.get({ url: '/get-path' });

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.requestHeaders['Accept']).toEqual('application/json');
      expect(request.requestHeaders['Content-Type']).toEqual('application/json');
      expect(request.method).toEqual('GET');
    });

    it("should allow alternate formats to be sent", function() {
      this.ajax.post({
        url: '/post-path-html',
        accept: 'text/html',
        data: "foo=bar&baz=qux",
        csrfToken: 'xyz',
        verb: 'POST'
      });

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.requestHeaders['Accept']).toEqual('text/html');
      expect(request.requestHeaders['Content-Type']).toEqual('application/x-www-form-urlencoded');
      expect(request.method).toEqual('POST');
      expect(request.params).toEqual('foo=bar&baz=qux');
      expect(request.data).toEqual('<span>foo</span>');
    });

    it("should allow a promise-style request to be conducted", function() {
      var response, xhr, request = this.ajax.get('/get-path');

      request.dataSuccess(function(d) {
        response = d;
      });

      request.success(function(d, x) {
        xhr = x;
      });

      expect(response).toEqual({get: 'response'});
      expect(xhr).toEqual(request.xhr);
    });

  });


});
describe("pie.app", function() {

  describe("#initialization", function() {

    it("should allow subobjects to be initialized via a class & option structure", function() {
      var myi18n = pie.i18n.extend('myI18n', {
        isSpecial: true
      });

      var app = new pie.app({
        i18n: myi18n,
        i18nOptions: {specialOption: true},
      });

      expect(app.i18n.isSpecial).toEqual(true);
      expect(app.validator.i18n.isSpecial).toEqual(true);
    });

    it("should allow subobjects to be passed as instances", function() {
      var i = new pie.i18n();
      i.superSpecial = true;

      var app = new pie.app({
        i18n: i
      });

      expect(app.i18n.superSpecial).toEqual(true);
      expect(app.validator.i18n.superSpecial).toEqual(true);
      expect(i.app).toEqual(app);
    });

  });

  describe('#start', function() {

    beforeEach(function(){
      this.app = new pie.app({noAutoStart: true});
    });


    it('should set up a single observer for links before the app starts', function() {
      spyOn(pie.app.prototype, 'setupSinglePageLinks');

      this.app = new pie.app({noAutoStart: true});

      this.app.emitter.fire('beforeStart');
      this.app.emitter.fire('beforeStart');

      expect(this.app.setupSinglePageLinks.calls.count()).toEqual(1);
    });

    it("should start the navigator as part of the startup process", function() {
      var nav = this.app.navigator;
      spyOn(nav, 'start');
      this.app.start();
      expect(nav.start).toHaveBeenCalled();
    });

    it("should show any store notifications after the app is started", function() {
      spyOn(pie.app.prototype, 'showStoredNotifications');

      this.app = new pie.app({noAutoStart: true});

      this.app.emitter.fire('afterStart');
      this.app.emitter.fire('afterStart');

      expect(this.app.showStoredNotifications.calls.count()).toEqual(1);
    });

    it("should allow the start to be blocked by an around filter", function(done) {
      var nav = this.app.navigator;
      spyOn(nav, 'start');

      this.app.emitter.on('aroundStart', function(cb){
        expect(nav.start).not.toHaveBeenCalled();
        cb();
        expect(nav.start).toHaveBeenCalled();
        done();
      });

      this.app.start();
    });

  });


  describe("#go", function() {

    beforeEach(function() {
      this.goSpy = spyOn(app.navigator, 'go');
      this.hardGoSpy = spyOn(app, 'hardGo');
      this.notifierSpy = spyOn(app.notifier, 'notify');
      this.storeSpy = spyOn(app.storage, 'set');
    });

    it("should construct a path based on the first argument", function() {
      app.go('list');

      var theCall = this.goSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('/pie/a');

      app.go('show', {id: 'foo'});
      theCall = this.goSpy.calls.argsFor(1);

      expect(theCall[0]).toEqual('/pie/foo/show');

      app.go(['show', {id: 'foo'}]);
      theCall = this.goSpy.calls.argsFor(2);

      expect(theCall[0]).toEqual('/pie/foo/show');
    });

    it("should properly determine replaceState", function() {
      var theCall;

      app.go('list');
      theCall = this.goSpy.calls.argsFor(0);
      expect(theCall[2]).toEqual(false);

      app.go('list', true);
      theCall = this.goSpy.calls.argsFor(1);
      expect(theCall[2]).toEqual(true);

      app.go('show', {id: 'foo'});
      theCall = this.goSpy.calls.argsFor(2);
      expect(theCall[2]).toEqual(false);

      app.go('show', {id: 'foo'}, true);
      theCall = this.goSpy.calls.argsFor(3);
      expect(theCall[2]).toEqual(true);

      app.go(['show', {id: 'foo'}]);
      theCall = this.goSpy.calls.argsFor(4);
      expect(theCall[2]).toEqual(false);

      app.go(['show', {id: 'foo'}], true);
      theCall = this.goSpy.calls.argsFor(5);
      expect(theCall[2]).toEqual(true);
    });

    it("should send all the other arguments to the notifier if the route is recognized, ensuring that the message is evaluated with the current i18n context", function() {
      var theCall;

      app.go('list', 'foo');
      theCall = this.notifierSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('foo');
      expect(theCall.length).toEqual(1);

      app.go('list', '.app.errors.401');
      theCall = this.notifierSpy.calls.argsFor(1);
      expect(theCall[0]).toEqual(app.i18n.t('app.errors.401'));
      expect(theCall.length).toEqual(1);

      app.go('list', 'foo', 'message');
      theCall = this.notifierSpy.calls.argsFor(2);
      expect(theCall[0]).toEqual('foo');
      expect(theCall[1]).toEqual('message');
      expect(theCall.length).toEqual(2);

      app.go('list', {foo: 'bar'}, 'foo', 'message', true);
      theCall = this.notifierSpy.calls.argsFor(3);
      expect(theCall[0]).toEqual('foo');
      expect(theCall[1]).toEqual('message');
      expect(theCall[2]).toEqual(true);
      expect(theCall.length).toEqual(3);
    });

    it("if the route is not recognized it should store the notification args in storage for the next request", function() {
      var theCall;

      app.go('/missing-thing', 'foo');
      theCall = this.storeSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual('foo');
      expect(theCall[1].length).toEqual(1);

      theCall = this.hardGoSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('/missing-thing');

      app.go('/missing-thing', '.app.errors.401');
      theCall = this.storeSpy.calls.argsFor(1);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual(app.i18n.t('app.errors.401'));
      expect(theCall[1].length).toEqual(1);

      app.go('/missing-thing', 'foo', 'message');
      theCall = this.storeSpy.calls.argsFor(2);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual('foo');
      expect(theCall[1][1]).toEqual('message');
      expect(theCall[1].length).toEqual(2);

      app.go('/missing-thing', {foo: 'bar'}, 'foo', 'message', true);
      theCall = this.storeSpy.calls.argsFor(3);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual('foo');
      expect(theCall[1][1]).toEqual('message');
      expect(theCall[1][2]).toEqual(true);
      expect(theCall[1].length).toEqual(3);

      theCall = this.hardGoSpy.calls.argsFor(3);
      expect(theCall[0]).toEqual('/missing-thing?foo=bar');
    });

  });

});
describe("pie.base & classical inheritance", function() {

  it("should allow a generic instance to be built", function() {
    var a = new pie.base();
    expect(typeof a.init).toEqual('function');
    expect(typeof a.foo).toEqual('undefined');
  });

  it("should allow the class to be extended without impacting the parent class", function() {
    var A = pie.base.extend();
    var B = pie.base.extend({
      foo: 'bar'
    });

    var o = new pie.base();
    var a = new A();
    var b = new B();

    expect(o.foo).toEqual(undefined);
    expect(a.foo).toEqual(undefined);
    expect(b.foo).toEqual('bar');
  });

  it("should set up the prototypal inheritance properly", function() {
    var A = pie.base.extend();
    var B = A.extend();
    var C = pie.base.extend();

    var a = new A();
    var b = new B();
    var c = new C();

    expect(a instanceof pie.base).toEqual(true);
    expect(b instanceof pie.base).toEqual(true);
    expect(c instanceof pie.base).toEqual(true);

    expect(a instanceof A).toEqual(true);
    expect(b instanceof A).toEqual(true);
    expect(c instanceof A).toEqual(false);

    expect(a instanceof B).toEqual(false);
    expect(b instanceof B).toEqual(true);
    expect(c instanceof B).toEqual(false);

    expect(a instanceof C).toEqual(false);
    expect(b instanceof C).toEqual(false);
    expect(c instanceof C).toEqual(true);
  });

  it("should invoke init on construction", function(done) {
    var A = pie.base.extend({
      init: function() {
        expect(this instanceof A).toEqual(true);
        done();
      }
    });

    new A();
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

    var a = new A();
    var b = new B();

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

    var a = new A();
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

    var b = new B();
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


    var b = new B();
    b.foo();
    b.bar();
  });

});
describe("pie.cache", function() {

  beforeEach(function() {
    this.cache = new pie.cache();
    this.now = this.cache.currentTime();
    spyOn(this.cache, 'currentTime').and.callFake(function(){
      return this.now;
    }.bind(this));
  });

  it("should set and get values like a normal model", function() {
    this.cache.set('foo', 'bar');
    expect(this.cache.get('foo')).toEqual('bar');
  });

  describe("expiration formats", function() {

    it("should allow an expiration to be set for a key", function() {
      this.cache.set('foo', 'bar', {ttl: 1000});
      var wrap = this.cache.data.foo;
      expect(wrap.data).toEqual('bar');
      expect(wrap.expiresAt).toEqual(this.now + 1000);
    });

    it("should allow a timestamp to be used as the expiration", function() {
      var nowPlus = this.now + 5000, wrap;
      this.cache.set('foo', 'bar', {expiresAt: nowPlus});
      wrap = this.cache.data.foo;
      expect(wrap.expiresAt).toEqual(nowPlus);
    });

    it("should allow an iso timestamp as the expiration", function() {
      var iso = "2020-10-10",
        timestamp = pie.date.dateFromISO(iso).getTime(),
        wrap;

      this.cache.set('foo', 'bar', {expiresAt: iso});
      wrap = this.cache.data.foo;
      expect(wrap.expiresAt).toEqual(timestamp);
    });

    it("should allow a numeric string as a timestamp", function() {
      var nowPlus = String(this.now + 5000), wrap;
      this.cache.set('foo', 'bar', {expiresAt: nowPlus});
      wrap = this.cache.data.foo;
      expect(wrap.expiresAt).toEqual(parseInt(nowPlus, 10));
    });

  });

  describe("key expiration", function() {

    it('should not return back an expired key', function() {
      this.cache.set('foo', 'bar', {expiresAt: this.now + 1000});
      expect(this.cache.get('foo')).toEqual('bar');
      this.now += 1000;
      expect(this.cache.get('foo')).toEqual(undefined);
    });

    it('should clear the key when it is read and the key is expired', function() {
      this.cache.set('foo', 'bar', {expiresAt: this.now + 1000});
      this.now += 1000;
      this.cache.get('foo');
      expect(this.cache.data.foo).toEqual(undefined);
    });

  });

});
describe("pie.emitter", function() {

  beforeEach(function() {
    this.e = new pie.emitter();
  });

  it("should allow a callback of an event to be registered", function() {
    var f = function(){};
    this.e.on('ping', f);
    expect(this.e.get('eventCallbacks.ping')).toEqual([{fn: f}]);
  });

  it("should allow an event to be cleared", function() {
    var f = function(){};
    this.e.on('ping', f);
    expect(this.e.get('eventCallbacks.ping.length')).toEqual(1);

    this.e.clear('ping');
    expect(this.e.get('eventCallbacks.ping')).toEqual(undefined);
  });

  it("should determine if an event has been called", function() {
    expect(this.e.hasEvent('ping')).toEqual(false);
    this.e.fire('ping');
    expect(this.e.hasEvent('ping')).toEqual(true);
  });

  it("should determine if an event has a callback", function() {
    expect(this.e.hasCallback('ping')).toEqual(false);
    this.e.on('ping', function(){});
    expect(this.e.hasCallback('ping')).toEqual(true);
  });

  it("should count the number of times an event is called", function() {
    this.e.fire('ping');
    this.e.fire('pong');
    this.e.fire('ping');

    expect(this.e.firedCount('ping')).toEqual(2);
    expect(this.e.firedCount('pong')).toEqual(1);
  });

  it("should allow a callback to wait until multiple events are fired", function(done) {
    var pingCalled = false, pongCalled = false, gnopCalled = false;

    this.e.on('ping', function() {
      pingCalled = true;
    });

    this.e.on('pong', function() {
      pongCalled = true;
    });

    this.e.on('gnop', function() {
      gnopCalled = true;
    });

    var cb = function() {
      expect(pingCalled).toEqual(true);
      expect(pongCalled).toEqual(true);
      expect(gnopCalled).toEqual(true);
      done();
    };

    this.e.fire('gnop');
    this.e.waitUntil('ping', 'pong', 'gnop', cb);

    this.e.fire('ping');
    expect(gnopCalled).toEqual(true);
    expect(pingCalled).toEqual(true);
    expect(pongCalled).toEqual(false);
    this.e.fire('pong');

  });

  it("should not allow around* events for waitUntil", function() {
    expect(function(){
      this.e.waitUntil('aroundRender', function(){});
    }.bind(this)).toThrowError("aroundRender is not supported by waitUntil.");
  });

  it("should allow a callback to be registered for all subsequent occurrences of an event via `on`", function() {
    var called = 0;
    var fn = function() {
      called++;
    };
    this.e.fire('ping');
    this.e.on('ping', fn);
    expect(called).toEqual(0);
    this.e.fire('ping');
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(2);
  });

  it("should allow a callback to be registered for all subsequent occurrences of an event as well as one for any existing events via `on` with `immediate:true`", function() {
    var called = 0,
    invocations = [];

    var fn = function() {
      called++;
      invocations.push(arguments);
    };

    this.e.fire('ping', 'foo');
    this.e.on('ping', fn, {immediate: true});
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(2);
    this.e.fire('ping');
    expect(called).toEqual(3);

    expect(invocations.length).toEqual(3);
    expect(invocations[0].length).toEqual(1);
    expect(invocations[0][0]).toEqual('foo');
    expect(invocations[1].length).toEqual(0);
  });

  it("should allow a callback to be registered for the next occurrence of an event via `once`", function() {
    var called = 0;
    var fn = function() {
      called++;
    };
    this.e.fire('ping');
    this.e.once('ping', fn);
    expect(called).toEqual(0);
    this.e.fire('ping');
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(1);
  });


  it("should allow a callback to be registered for a single occurrence of an event, including events already emmitted via `once` with `immediate:true`", function() {
    var called = 0;
    var fn = function() {
      called++;
    };
    this.e.fire('ping');
    this.e.once('ping', fn, {immediate: true});
    expect(called).toEqual(1);
    this.e.fire('ping');
    expect(called).toEqual(1);
  });

  it("should allow an event to be fired, and if any callbacks are onceOnly it should remove them", function() {
    this.e.on('ping', function(){});
    this.e.once('ping', function(){});

    expect(this.e.get('eventCallbacks.ping.length')).toEqual(2);
    this.e.fire('ping');
    expect(this.e.get('eventCallbacks.ping.length')).toEqual(1);
  });

  it("should allow an around event to be fired, and if any callbacks are onceOnly it should remove them", function() {
    this.e.on('aroundPing', function(cb){ cb(); });
    this.e.once('aroundPing', function(cb){ cb(); });

    expect(this.e.get('eventCallbacks.aroundPing.length')).toEqual(2);
    this.e.fireAround('aroundPing');
    expect(this.e.get('eventCallbacks.aroundPing.length')).toEqual(1);
  });

  it("should allow a sequence of events to be fired", function(){
    var called = {};
    this.e.on('beforePing', function(){ called.beforePing = true; });
    this.e.on('aroundPing', function(cb){ called.aroundPing = true; cb(); });
    this.e.on('ping', function(){ called.ping = true; });
    this.e.on('afterPing', function(){ called.afterPing = true; });

    this.e.fireSequence('ping');

    expect(called.beforePing).toEqual(true);
    expect(called.aroundPing).toEqual(true);
    expect(called.ping).toEqual(true);
    expect(called.afterPing).toEqual(true);
  });

  it("should allow a callback to be registered, and invoked immediately via now: true", function() {
    var called = 0;
    this.e.on('ping', function(){ called++; }, {now: true});
    expect(called).toEqual(1);
  });

  it("should immediately remove a callback when onceOnly and now:true are provided", function() {
    var called = 0;
    this.e.once('ping', function(){ called++; }, {now: true, onceOnly: true});
    expect(called).toEqual(1);
    expect(this.e.get('eventCallbacks.ping.length')).toBeFalsy();
  });

});
describe('pie.errorHandler', function() {

  beforeEach(function(){
    this.handler = app.errorHandler;
  });

  describe('#data', function() {

    it('should cache the data on the xhr', function() {
      var xhr = {status: '200', response: JSON.stringify({'foo' : 'bar'})}, d;

      d = this.handler.xhrData(xhr);
      expect(d).toEqual({'foo' : 'bar'});
      expect(xhr.data).toEqual(d);
    });

    it('should return an empty object if there is no response code', function() {
      var xhr = {}, d;

      d = this.handler.xhrData(xhr);
      expect(d).toEqual({});
      expect(xhr.data).toEqual(d);
    });

    it('should return cached content', function() {
      var xhr = {data: {'foo' : 'bar'}}, d;

      d = this.handler.xhrData(xhr);
      expect(d).toEqual(xhr.data);
    });

  });


  describe("#errorMessagesFromRequest", function() {

    it("should allow an override based on the status", function() {
      var xhr = {"status" : "401", "data" : {}}, messages;

      messages = this.handler.errorMessagesFromRequest(xhr);
      expect(messages).toEqual(["Sorry, you aren't authorized to view this page."]);
    });

    it("should extract messages from the errors within the response", function() {
      var messages, xhr = {
        "status" : "422",
        "data" : {
          "errors" : [
            { "message" : "Something wrong." },
            { "foo" : "bar" },
            { "message" : "Incorrect stuff." }
          ]
        }
      };

      messages = this.handler.errorMessagesFromRequest(xhr);
      expect(messages).toEqual(["Something wrong.", "Incorrect stuff."]);
    });

  });

  describe("#handleXhrError", function() {

    var f = function(){ this.handler.set('responseCodeHandlers', {}); };

    beforeEach(f);
    afterEach(f);

    it('should allow handlers to be registered for specific response codes', function(){
      var handles = 0, xhr = {};

      this.handler.registerHandler(401, function(arg1){
        expect(arg1).toEqual(xhr);
        expect(this).toEqual(xhr);

        handles++;
      });

      this.handler.registerHandler(422, function(){ });

      xhr.status = 401;
      this.handler.handleXhrError(xhr);

      xhr.status = '401';
      this.handler.handleXhrError(xhr);

      xhr.status = '422';
      this.handler.handleXhrError(xhr);

      expect(handles).toEqual(2);
    });

    it('should invoke notifyErrors if the response code is not recognized', function() {
      spyOn(this.handler, 'notifyErrors');

      var xhr = {
        "status" : "412",
        "data" : {
          "errors" : [
            { "message" : "One" },
            { "message" : "Two" }
          ]
        }
      };

      this.handler.handleXhrError(xhr);
      expect(this.handler.notifyErrors).toHaveBeenCalledWith(xhr);
    });

  });


  describe("#notifyErrors", function() {

    beforeEach(function() {
      spyOn(app.notifier, 'notify');
      spyOn(app.notifier, 'clear');
    });

    it("should do nothing if there are no errors", function() {
      var xhr = {
        "status" : "422",
        "data" : {}
      };

      this.handler.notifyErrors(xhr);

      expect(app.notifier.clear).not.toHaveBeenCalled();
      expect(app.notifier.notify).not.toHaveBeenCalled();
    });

    it("should invoke the app notifier after a timeout if errors are present", function() {

      jasmine.clock().install();


      var xhr = {
        "status" : "422",
        "data" : {
          "errors" : [
            { "message" : "One" },
            { "message" : "Two" }
          ]
        }
      };

      this.handler.notifyErrors(xhr);

      jasmine.clock().tick(99);

      expect(app.notifier.clear).toHaveBeenCalledWith('error');
      expect(app.notifier.notify).not.toHaveBeenCalled();

      jasmine.clock().tick(1);

      expect(app.notifier.notify).toHaveBeenCalledWith(["One", "Two"], "error", 10000);

      jasmine.clock().uninstall();

    });

  });

  describe("#reportError", function() {

    it("should prefix the error message if a prefix is present", function() {
      spyOn(this.handler, '_reportError');

      var e1 = {"message" : "New Error", "name" : "Error Name"}, e2 = {"message" : "Some Error"};

      this.handler.reportError(e1, {"info" : "[caught]"});
      this.handler.reportError(e2);

      expect(this.handler._reportError).toHaveBeenCalledWith({"message" : "New Error", "name" : "Error Name"}, {"info" : "[caught]"});
      expect(this.handler._reportError).toHaveBeenCalledWith({"message" : "Some Error"}, {});
    });
  });

});
describe("pie.formView", function() {

  beforeEach(function() {
    app.templates.registerTemplate('formViewTest', "[%= data.foo %] - [%= data.bar %]");
  });


  describe('#init', function() {

    it("should work with setup true for a new model", function() {
      var example = pie.formView.extend('example', {
        init: function(data) {
          this.model = new pie.model({});

          this._super(pie.object.merge({
            template: 'formViewTest',
            fields: [{
              name: 'field',
              binding: {toView: false},
              validation: {presence: true}
            }]
          }, data));
        }
      });

      this.view = new example({ setup: true });
      expect(this.view instanceof example).toEqual(true);
      expect(this.view.emitter.hasEvent('afterSetup')).toEqual(true);
    });
  });

});
describe("pie.i18n", function() {

  beforeEach(function() {
    this.i18n = app.i18n;
  });

  it("loads translations deeply by default", function() {
    this.i18n.load({ "a" : { "foo" : "bar", "biz" : "baz" }});
    this.i18n.load({ "a" : { "foo" : "buz" }});

    expect(this.i18n.data.a).toEqual({ "foo" : "buz", "biz" : "baz" });

    this.i18n.load({ "a" : { "biz" : "baz" }}, true);
    expect(this.i18n.data.a).toEqual({ "biz" : "baz" });

    delete this.i18n.data.a;
  });

  describe("with test translations loaded", function() {

    beforeEach(function() {
      this.i18n.load({
        "test" : {
          "direct" : "Direct translation",
          "interpolate" : "Things to %{interp}, even %{interp} again for %{reason}.",

          "changed" : "content that is_changed %{foo}",
          "number" : {
            "one" : "One translation",
            "negone" : "Negative one translation",
            "zero" : "Zero translation",
            "other" : "Other translation",
            "negother" : "Negative other translation"
          },
          "number2" : {
            "other" : "Number translation"
          },
          "nesting" : {
            "number" : "Nested translation with number: ${test.number}.",
            "interpolate" : "Nested translation with interpolation: ${test.interpolate}"
          }
        }
      });
    });

    afterEach(function() {
      delete this.i18n.data.test;
    });

    it("should return the default if it's provided and the key is missing", function() {
      var response = this.i18n.t("test.missing", { "default" : "foo" });
      expect(response).toEqual("foo");
    });

    it("should return an empty response for a missing key with no default", function() {
      var response = this.i18n.t("test.missing");
      expect(response).toEqual("");
    });

    it("should look up direct translations", function() {
      var response = this.i18n.t("test.direct");
      expect(response).toEqual("Direct translation");
    });

    it("should interpolate count translations without a count option as a direct lookup", function() {
      var response = this.i18n.t("test.number");
      response = Object.keys(response).sort();
      expect(response).toEqual(["negone", "negother", "one", "other", "zero"]);
    });

    it("should interpolate count translations with a 1 correctly", function() {
      var response = this.i18n.t("test.number", { "count" : 1 });
      expect(response).toEqual("One translation");

      response = this.i18n.t("test.number", { "count" : "1" });
      expect(response).toEqual("One translation");

      response = this.i18n.t("test.number2", { "count" : 1 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with a 0 correctly", function() {
      var response = this.i18n.t("test.number", { "count" : 0 });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : "0" });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : "" });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : null });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : undefined });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number2", { "count" : 0 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with a -1 correctly", function() {
      var response = this.i18n.t("test.number", { "count" : -1 });
      expect(response).toEqual("Negative one translation");

      response = this.i18n.t("test.number", { "count" : '-1' });
      expect(response).toEqual("Negative one translation");

      response = this.i18n.t("test.number2", { "count" : -1 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with other negative values correctly", function() {
      var response = this.i18n.t("test.number", { "count" : -2 });
      expect(response).toEqual("Negative other translation");

      response = this.i18n.t("test.number", { "count" : '-2' });
      expect(response).toEqual("Negative other translation");

      response = this.i18n.t("test.number2", { "count" : -2 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with other values correctly", function() {
      var response = this.i18n.t("test.number", { "count" : 2 });
      expect(response).toEqual("Other translation");

      response = this.i18n.t("test.number", { "count" : '2' });
      expect(response).toEqual("Other translation");

      response = this.i18n.t("test.number2", { "count" : 2 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate values", function() {
      var response = this.i18n.t("test.interpolate", { "interp" : "foo", "reason" : "bar"});
      expect(response).toEqual("Things to foo, even foo again for bar.");
    });

    it("should not render strings which do not have the correct interpolations provided", function() {
      var spy = spyOn(this.i18n.app.errorHandler, 'handleI18nError');
      var response = this.i18n.t("test.interpolate");
      expect(response).toEqual("");
      expect(spy).toHaveBeenCalled();
    });

    it("should allow nesting of translations via ${", function() {
      var response = this.i18n.t('test.nesting.number', {count: 1});
      expect(response).toEqual("Nested translation with number: One translation.");
    });

    it("should allow nesting of translations via ${ and pass along interpolations", function() {
      var response = this.i18n.t('test.nesting.interpolate', {interp: "foo", reason: "bar"});
      expect(response).toEqual("Nested translation with interpolation: Things to foo, even foo again for bar.");
    });

    it("should allow the changing of of the result by passing string alterations", function() {
      var response = this.i18n.t('test.changed', {foo: 'test'}, 'modularize', 'titleize');
      expect(response).toEqual("Content That IsChanged Test");
    });

    it("should report misses and return an empty string", function() {
      var spy = spyOn(this.i18n.app.errorHandler, 'handleI18nError');
      var response = this.i18n.t('djaslkfjalsdkfjlasf');
      expect(response).toEqual('');
      expect(spy).toHaveBeenCalled();
    });

  });

  describe("date and time functionality", function() {

    beforeEach(function() {
      var offsetStandardTime = new Date(2014,7,1).getTimezoneOffset(),
      offsetDaylightTime = new Date(2014,1,1).getTimezoneOffset();
      if(offsetStandardTime !== 240 || offsetDaylightTime !== 300) {
        pending("Time tests are assumed to occur within a EST timezone. Pending since that's not the case.");
      }
    });

    describe("#_normalizedDate", function() {

      it("should turn second-based epoch timestamps into date objects", function() {
        var stamps = ["1410210005", 1410210005], d;

        stamps.forEach(function(stamp) {
          d = this.i18n._normalizedDate(stamp);

          expect(d.getUTCFullYear()).toEqual(2014);
          expect(d.getUTCMonth() + 1).toEqual(9);
          expect(d.getUTCDate()).toEqual(8);
          expect(d.getUTCDay()).toEqual(1);

          expect(d.getUTCHours()).toEqual(21);
          expect(d.getUTCMinutes()).toEqual(0);
          expect(d.getUTCSeconds()).toEqual(5);
        }.bind(this));

      });

      it("should turn millisecode-based epoch timestamps into date objects", function() {
        var stamps = ["1410210005000", 1410210005000], d;

        stamps.forEach(function(stamp) {
          d = this.i18n._normalizedDate(stamp);

          expect(d.getUTCFullYear()).toEqual(2014);
          expect(d.getUTCMonth() + 1).toEqual(9);
          expect(d.getUTCDate()).toEqual(8);
          expect(d.getUTCDay()).toEqual(1);

          expect(d.getUTCHours()).toEqual(21);
          expect(d.getUTCMinutes()).toEqual(0);
          expect(d.getUTCSeconds()).toEqual(5);
        }.bind(this));

      });

      it("should leave dates alone", function() {
        var d1 = new Date(), d2;

        d2 = this.i18n._normalizedDate(d1);
        expect(Math.floor(d1.getTime() / 1000)).toEqual(Math.floor(d2.getTime() / 1000));
      });

      it("should parse iso times", function() {
        var iso = "2014-09-08T21:00:05.854Z", d;

        d = this.i18n._normalizedDate(iso);

        expect(d.getUTCFullYear()).toEqual(2014);
        expect(d.getUTCMonth() + 1).toEqual(9);
        expect(d.getUTCDate()).toEqual(8);
        expect(d.getUTCDay()).toEqual(1);

        expect(d.getUTCHours()).toEqual(21);
        expect(d.getUTCMinutes()).toEqual(0);
        expect(d.getUTCSeconds()).toEqual(5);
      });

      it("should parse everything else", function() {
        var stamp = "testing", d;

        d = this.i18n._normalizedDate(stamp);
        expect(pie.object.isDate(d)).toEqual(true);
        expect(d.getUTCFullYear()).toEqual(NaN);
      });

    });

    describe("#timeago", function() {

      beforeEach(function() {
        app.i18n.load({
          "timeagotest" : {
            "timeago" : {
              "now" : {
                "zero" : "Just now",
                "other" : "%{count} seconds ago"
              },
              "minutes" : "%{count} minutes ago",
              "hours" : "%{count} hours ago",
              "days" : "%{count} days ago",
              "weeks" : "%{count} weeks ago",
              "months" : "%{count} months ago",
              "years" : "%{count} years ago"
            }
          }
        });

        this.now = new Date();
        this.then = new Date(this.now);
      });

      afterEach(function() {
        delete app.i18n.timeagotest;
      });

      it("should return now results", function() {
        this.then.setSeconds(this.then.getSeconds() - 30);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('30 seconds ago');
      });

      it("should return minute results", function() {
        this.then.setMinutes(this.then.getMinutes() - 30);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('30 minutes ago');
      });

      it("should return hours results", function() {
        this.then.setHours(this.then.getHours() - 12);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('12 hours ago');
      });

      it("should return days results", function() {
        this.then.setDate(this.then.getDate() - 2);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('2 days ago');
      });

      it("should return week results", function() {
        this.then.setDate(this.then.getDate() - 22);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('3 weeks ago');
      });

      // offset, diff, end of month diff
      [
        [2, 2, 2],
        [3, 3, 3],
        [4, 4, 3],
        [5, 5, 5],
        [6, 6, 5],
        [7, 7, 7],
        [8, 8, 8],
        [9, 9, 8],
        [10, 10, 10],
        [11, 11, 10]
      ].forEach(function(arr){
        var i = arr[0],
        diff = arr[1],
        endDiff = arr[2];

        it("should return month results for " + i + " months back", function() {
          var now = new Date(2015, 2, 11); // 2015-03-11
          var then = new Date(now.getTime());
          then.setMonth(then.getMonth() - i);

          var response = this.i18n.timeago(then, now, 'timeagotest');
          expect(response).toEqual(diff + ' months ago');

          now.setDate(now.getDate() + 20);

          then = new Date(now.getTime());
          then.setMonth(then.getMonth() - i);

          response = this.i18n.timeago(then, now, 'timeagotest');
          expect(response).toEqual(endDiff + ' months ago');
        });
      });

      it("should return year results", function() {
        this.then.setFullYear(this.then.getFullYear() - 3);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('3 years ago');
      });

    });

    describe("#strftime", function() {

      beforeEach(function() {
        this.i18n.load({
          'app' : {
            'time' : {
              'formats' : {
                'strftimetest' : '%Y-%-m-%-d'
              }
            }
          }
        });

        this.d = this.i18n._normalizedDate("2014-09-08T09:00:05.054-04:00");
      });

      afterEach(function() {
        delete this.i18n.data.app.time.formats.strftimetest;
      });

      var expectations = {
        'strftimetest' : '2014-9-8',
        'isoTime' : "2014-09-08T09:00:05.054-04:00",
        'isoDate' : "2014-09-08",
        'shortDate' : "09/08/2014",
        'longDate' : "September 8th, 2014"
      };

      Object.keys(expectations).forEach(function(k) {
        var expectation = expectations[k];

        it("should correctly transform the named format: " + k, function() {
          var response = this.i18n.l(this.d, k);
          expect(response).toEqual(expectation);
        });

      });

      expectations = {
        '%a' : 'Mon',
        '%A' : 'Monday',
        '%B' : 'September',
        '%b' : 'Sept',
        '%d' : '08',
        '%e' : ' 8',
        '%-do' : '8th',
        '%-d' : '8',
        '%H' : '09',
        '%k' : ' 9',
        '%-H' : '9',
        '%-k' : '9',
        '%I' : '09',
        '%l' : '9',
        '%m' : '09',
        '%-m' : '9',
        '%M' : '00',
        '%p' : 'AM',
        '%P' : 'am',
        '%S' : '05',
        '%-S' : '5',
        '%L' : '054',
        '%-L' : '54',
        '%w' : '1',
        '%y' : '14',
        '%Y' : '2014',
        '%z' : '-0400',
        '%:z' : '-04:00',
        '%Z' : 'EDT'
      };

      Object.keys(expectations).forEach(function(k) {
        var expectation = expectations[k];

        it("should replace " + k + " properly", function() {
          var response = this.i18n.l(this.d, k);
          expect(response).toEqual(expectation);
        });

      });

    });

  });

});
describe("pie.list", function() {

  beforeEach(function() {
    this.items = new pie.list(['a', 'b', 'c', 'd']);
  });

  it("should properly determine length", function() {
    expect(this.items.length()).toEqual(4);
    this.items.data.items.push(0);
    expect(this.items.length()).toEqual(5);
  });

  it("should allow an element to be retrieved from positive indexes", function() {
    expect(this.items.get(0)).toEqual('a');
    expect(this.items.get(3)).toEqual('d');
    expect(this.items.get(4)).toEqual(undefined);
  });

  it("should allow an element to be retrieved from negative indexes", function() {
    expect(this.items.get(-1)).toEqual('d');
    expect(this.items.get(-4)).toEqual('a');
    expect(this.items.get(-5)).toEqual(undefined);
  });

  it("should allow other attributes to be set and retrieved", function() {
    this.items.set('foo', 'bar');
    expect(this.items.length()).toEqual(4);
    expect(this.items.get('foo')).toEqual('bar');
  });

  it("should allow values to be cast into the desired casting class", function() {
    var items = new pie.list([{foo: 'bar'}, {baz: 'bar'}], {cast: true});
    var m = items.get(0);

    expect(m.className).toEqual('model');
    expect(m.get('foo')).toEqual('bar');

    m = items.get(1);
    expect(m.className).toEqual('model');
    expect(m.get('baz')).toEqual('bar');

    items.push({tar: 'ball'});
    m = items.get(2);
    expect(m.className).toEqual('model');
    expect(m.get('tar')).toEqual('ball');
  });

  describe("data manipulation via", function() {

    beforeEach(function(){
      this.changes = [];
      this.items.observe(function(changes){
        this.changes = changes;
      }.bind(this));
    });


    describe("#insert", function() {
      it("should add a value at a specific index, increasing the length of the list", function() {
        this.items.insert(1, 'foo');
        expect(this.items.get(1)).toEqual('foo');
        expect(this.items.get(2)).toEqual('b');
        expect(this.items.length()).toEqual(5);
      });

      it("should deliver a change record for the inserted index and the length", function() {
        this.items.insert(1, 'foo');
        expect(this.changes.length).toEqual(4);

        expect(this.changes[0].type).toEqual('add');
        expect(this.changes[0].name).toEqual('1');
        expect(this.changes[0].oldValue).toEqual('b');
        expect(this.changes[0].value).toEqual('foo');

        expect(this.changes[1].type).toEqual('update');
        expect(this.changes[1].name).toEqual('length');
        expect(this.changes[1].oldValue).toEqual(4);
        expect(this.changes[1].value).toEqual(5);
      });
    });


    describe("#push", function() {
      it("should add a value at the end of the list, increasing the length of the list", function() {
        this.items.push('foo');
        expect(this.items.get(-2)).toEqual('d');
        expect(this.items.get(-1)).toEqual('foo');
        expect(this.items.length()).toEqual(5);
      });

      it("should deliver a change record for the new index and the length", function() {
        this.items.push('foo');
        expect(this.changes.length).toEqual(4);

        expect(this.changes[0].type).toEqual('add');
        expect(this.changes[0].name).toEqual('4');
        expect(this.changes[0].oldValue).toEqual(undefined);
        expect(this.changes[0].value).toEqual('foo');

        expect(this.changes[1].type).toEqual('update');
        expect(this.changes[1].name).toEqual('length');
        expect(this.changes[1].oldValue).toEqual(4);
        expect(this.changes[1].value).toEqual(5);
      });
    });


    describe("#remove", function() {
      it("should remove the value at a specific index, changing the length of the list", function() {
        this.items.remove(1);
        expect(this.items.get(0)).toEqual('a');
        expect(this.items.get(1)).toEqual('c');
        expect(this.items.length()).toEqual(3);
      });

      it("should deliver a change record for the removal and the length change", function() {
        this.items.remove(1);
        expect(this.changes.length).toEqual(4);

        expect(this.changes[0].type).toEqual('delete');
        expect(this.changes[0].name).toEqual('1');
        expect(this.changes[0].oldValue).toEqual('b');
        expect(this.changes[0].value).toEqual('c');

        expect(this.changes[1].type).toEqual('update');
        expect(this.changes[1].name).toEqual('length');
        expect(this.changes[1].oldValue).toEqual(4);
        expect(this.changes[1].value).toEqual(3);
      });
    });


    describe("#set", function() {

      it("should change the value at an existing index", function() {
        this.items.set(1, 'foo');
        expect(this.items.get(1)).toEqual('foo');
        expect(this.items.length()).toEqual(4);
      });

      it("should notify observers of a change at the index but not a change in length", function(){
        this.items.set(1, 'foo');
        expect(this.changes.length).toEqual(3);
        expect(this.changes[0].type).toEqual('update');
        expect(this.changes[0].name).toEqual('1');
      });

      it("should allow the entire list to be set", function() {
        this.items.set('items', ['e', 'f', 'g', 'h', 'i', 'j']);
        expect(this.changes.length).toEqual(9); // 6, one for each index, 1 for items, 1 for the length, and 1 for the _version;

        expect(this.changes[0].name).toEqual('0');
        expect(this.changes[0].type).toEqual('update');

        expect(this.changes[3].name).toEqual('3');
        expect(this.changes[3].type).toEqual('update');

        expect(this.changes[4].name).toEqual('4');
        expect(this.changes[4].type).toEqual('add');

        expect(this.changes[5].name).toEqual('5');
        expect(this.changes[5].type).toEqual('add');

        expect(this.changes[6].name).toEqual('length');
        expect(this.changes[6].type).toEqual('update');
        expect(this.changes[6].oldValue).toEqual(4);
        expect(this.changes[6].value).toEqual(6);

        expect(this.changes[7].name).toEqual('items');
        expect(this.changes[7].type).toEqual('update');

        expect(this.changes[8].name).toEqual('_version');
        expect(this.changes[8].type).toEqual('update');
        expect(this.changes[8].oldValue).toEqual(1);
        expect(this.changes[8].value).toEqual(2);


        this.items.set('items', ['m', 'n', 'o', 'x', 'y', 'z']);

        expect(this.changes.length).toEqual(8); // 6, one for each index, 1 for items, and 1 for the _version;

        expect(this.changes[0].name).toEqual('0');
        expect(this.changes[0].type).toEqual('update');

        expect(this.changes[5].name).toEqual('5');
        expect(this.changes[5].type).toEqual('update');

        expect(this.changes[6].name).toEqual('items');
        expect(this.changes[6].type).toEqual('update');

        expect(this.changes[7].name).toEqual('_version');
        expect(this.changes[7].type).toEqual('update');
        expect(this.changes[7].oldValue).toEqual(2);
        expect(this.changes[7].value).toEqual(3);


        this.items.set('items', ['q', 'r', 's']);

        expect(this.changes.length).toEqual(9); // 6, one for each index, 1 for items, 1 for the length, and 1 for the _version;

        expect(this.changes[0].name).toEqual('5');
        expect(this.changes[0].type).toEqual('delete');

        expect(this.changes[2].name).toEqual('3');
        expect(this.changes[2].type).toEqual('delete');

        expect(this.changes[3].name).toEqual('2');
        expect(this.changes[3].type).toEqual('update');

        expect(this.changes[5].name).toEqual('0');
        expect(this.changes[5].type).toEqual('update');

        expect(this.changes[6].name).toEqual('length');
        expect(this.changes[6].type).toEqual('update');
        expect(this.changes[6].oldValue).toEqual(6);
        expect(this.changes[6].value).toEqual(3);

        expect(this.changes[7].name).toEqual('items');
        expect(this.changes[7].type).toEqual('update');

        expect(this.changes[8].name).toEqual('_version');
        expect(this.changes[8].type).toEqual('update');
        expect(this.changes[8].oldValue).toEqual(3);
        expect(this.changes[8].value).toEqual(4);

      });



    });


    describe("#shift", function() {
      it("should remove the value at the beginning of the list, changing the length of the list", function() {
        this.items.shift();
        expect(this.items.get(0)).toEqual('b');
        expect(this.items.length()).toEqual(3);
      });

      it("should deliver a change record for the removal and the length change", function() {
        this.items.shift();
        expect(this.changes.length).toEqual(4);

        expect(this.changes[0].type).toEqual('delete');
        expect(this.changes[0].name).toEqual('0');
        expect(this.changes[0].oldValue).toEqual('a');
        expect(this.changes[0].value).toEqual('b');

        expect(this.changes[1].type).toEqual('update');
        expect(this.changes[1].name).toEqual('length');
        expect(this.changes[1].oldValue).toEqual(4);
        expect(this.changes[1].value).toEqual(3);
      });
    });


    describe("#unshift", function() {
      it("should add a value at the beginning of the list, increasing the length of the list", function() {
        this.items.unshift('foo');
        expect(this.items.get(0)).toEqual('foo');
        expect(this.items.get(1)).toEqual('a');
        expect(this.items.length()).toEqual(5);
      });

      it("should deliver a change record for the 0 index and the length", function() {
        this.items.unshift('foo');
        expect(this.changes.length).toEqual(4);

        expect(this.changes[0].type).toEqual('add');
        expect(this.changes[0].name).toEqual('0');
        expect(this.changes[0].oldValue).toEqual('a');
        expect(this.changes[0].value).toEqual('foo');

        expect(this.changes[1].type).toEqual('update');
        expect(this.changes[1].name).toEqual('length');
        expect(this.changes[1].oldValue).toEqual(4);
        expect(this.changes[1].value).toEqual(5);
      });
    });

  });

});

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

    it("should return null values from gets", function() {
      this.model.data.foo = undefined;
      this.model.data.bar = null;
      expect(this.model.gets('foo', 'bar')).toEqual({'foo' : undefined, 'bar' : null});
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

  describe('#test', function() {

    it("should return true if the value is equivalent", function() {
      this.model.set('foo', '4');
      expect(this.model.test('foo', '4')).toEqual(true);
      expect(this.model.test('foo', 4)).toEqual(false);

      this.model.set('bar', undefined);
      expect(this.model.test('bar', undefined)).toEqual(true);
      expect(this.model.test('bar', null)).toEqual(false);
      expect(this.model.test('bar', false)).toEqual(false);
    });

    it("should return true if a regex is provided and the value is not nully and matches the regex", function() {
      this.model.set('foo', 'bar');

      expect(this.model.test('foo', /ba/)).toEqual(true);
      expect(this.model.test('foo', /BA/i)).toEqual(true);
      expect(this.model.test('foo', /bad/)).toEqual(false);
      expect(this.model.test('foo', /BA/)).toEqual(false);

      this.model.set('bar', undefined);
      expect(this.model.test('bar', /undef/)).toEqual(false);
    });

  });

  describe("#hasAny", function() {
    it("should determine if the model has any of the requested attributes", function() {
      var model = new pie.model({foo: false, bar: false});
      expect(model.hasAny('foo')).toEqual(true);
      expect(model.hasAny('bar', 'baz')).toEqual(true);
      expect(model.hasAny('baz', 'foo')).toEqual(true);
      expect(model.hasAny('baz', 'qux')).toEqual(false);
      expect(model.hasAny('foo', 'bar')).toEqual(true);
    });
  });

  describe("#hasAll", function() {
    it("should determine if the model has any of the requested attributes", function() {
      var model = new pie.model({foo: false, bar: false});
      expect(model.hasAll('foo')).toEqual(true);
      expect(model.hasAll('bar', 'baz')).toEqual(false);
      expect(model.hasAll('baz', 'foo')).toEqual(false);
      expect(model.hasAll('baz', 'qux')).toEqual(false);
      expect(model.hasAll('foo', 'bar')).toEqual(true);
    });
  });

  describe("associations", function() {

    it("should allow a hasOne association to be defined", function() {
      var parent = new pie.model({});
      parent.hasOne('child');

      expect(parent.get('child')).toEqual(undefined);
      parent.set('child', {foo: 'bar'});

      expect(parent.get('child.foo')).toEqual('bar');

      var child = parent.get('childModel');
      expect(child).toBeTruthy();
      expect(child.get('foo')).toEqual('bar');
    });

    it("should allow a hasMany association to be defined", function() {
      var parent = new pie.model({});
      parent.hasMany('children');

      expect(parent.get('children')).toEqual(undefined);
      parent.set('children', [{foo: 'bar'}, {baz: 'qux'}]);

      expect(parent.get('children.0.foo')).toEqual('bar');

      var child = parent.get('childrenList');
      expect(child).toBeTruthy();
      expect(child.get(0).foo).toEqual('bar');
    });


  });

});
describe("pie.notifier", function(){

  beforeEach(function(){
    app.notifier.clear();
    this.notifier = app.notifier;
    this.model = this.notifier.notifications;
  });

  it("adds notifications to it's model", function(){
    expect(this.model.length()).toEqual(0);
    this.notifier.notify('test message');

    expect(this.model.length()).toEqual(1);

    var msg = this.model.get(0);

    expect(msg.messages).toEqual(['test message']);
    expect(msg.id).toBeTruthy();
    expect(msg.type).toEqual('message');
  });

  it("clears the notifications automatically when a delay is provided", function() {
    jasmine.clock().install();

    this.notifier.notify('test message', 'message', 10);

    expect(this.model.length()).toEqual(1);

    jasmine.clock().tick(10);

    expect(this.model.length()).toEqual(0);

    jasmine.clock().uninstall();
  });

  it("should provide the correct autoclose timeout", function() {
    expect(this.notifier.getAutoRemoveTimeout(undefined)).toEqual(7000);
    expect(this.notifier.getAutoRemoveTimeout(null)).toEqual(null);
    expect(this.notifier.getAutoRemoveTimeout(false)).toEqual(false);
    expect(this.notifier.getAutoRemoveTimeout(true)).toEqual(7000);
    expect(this.notifier.getAutoRemoveTimeout(100)).toEqual(100);
  });

  it("should clear existing notifications", function() {
    this.notifier.notify('first', 'message');
    this.notifier.notify('second', 'error');
    this.notifier.notify('third', 'warning');
    this.notifier.notify('fourth', 'warning');

    expect(this.model.length()).toEqual(4);

    this.notifier.clear('warning');

    expect(this.model.length()).toEqual(2);
    this.notifier.clear();
    expect(this.model.length()).toEqual(0);
  });

  it("should use the i18n value if it's an i18n key", function() {
    this.notifier.notify('.app.errors.401');
    expect(this.model.get(0).messages[0]).toEqual(app.i18n.t('app.errors.401'));
  });

});
/* global Benchmark, kendo, _, EJS, doT */

describe("pie performance", function() {

  describe("templating", function() {

    var originalTimeout;

    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    var expand = function(str) {
      for(var i = 0; i < 10; i++) {
        str += str;
      }
      return str;
    };

    var resig = function (str) {
      var strFunc =
      "var p=[];" +
      "p.push('" +

      str.replace(/[\r\t\n]/g, " ")
         .replace(/'(?=[^%]*%\])/g, "\t")
         .split("'").join("\\'")
         .split("\t").join("'")
         .replace(/\[%=(.+?)%\]/g, "',$1,'")
         .replace(/\[%-(.+?)%\]/g, "',pie.string.escapeHtml($1),'")
         .split("[%").join("');")
         .split("%]").join("p.push('") + "');return p.join('');";

      return new Function("data", strFunc);
    };

    // pie / resig:: escape: [%- %], interpolate: [%= %], evaluate: [% %]
    var source = "[%- '<h1>Hi</h1>' %][% for(var i = 0; i < 2; i++) { %]<span>[%= data.foo + i %]</span>[% } %]";

    // kendo:: escape: #: #, interpolate: #= #, evaluate: # #
    var kendoSource = "#: '<h1>Hi</h1>' ## for(var i = 0; i < 2; i++) { #<span>#= data.foo + i #</span># } #";

    // underscore:: escape: <%- %>, interpolate: <%= %>, evaluate: <% %>
    var _Source = "<%- '<h1>Hi</h1>' %><% for(var i = 0; i < 2; i++) { %><span><%= obj.foo + i %></span><% } %>";

    // ejs:: escape: :(, interpolate: <%= %>, evaluate: <% %>
    var ejsSource = "<%= pie.string.escapeHtml('<h1>Hi</h1>') %><% for(var i = 0; i < 2; i++) { %><span><%= foo + i %></span><% } %>";

    var dotSource = "{{! '<h1>Hi</h1>' }}{{ for(var i = 0; i < 2; i++) { }}<span>{{= it.foo + i }}</span>{{ } }}";

    it("it should perform better than EVERYONE", function(done) {

      if(!app.navigator.get('query.bm')) {
        pending();
        return done();
      }

      app.resources.load( 'benchmark', 'jquery', 'kendo', 'underscore', 'ejs', 'dot', function(){

        var ejsTmpl = new EJS({text: expand(ejsSource), escape: 'html'});

        var d = {foo: 4};

        var cases = {
          resig: resig(expand(source)),
          pie: pie.string.template(expand(source)),
          underscore: _.template(expand(_Source)),
          kendo: kendo.template(expand(kendoSource)),
          ejs: ejsTmpl.render.bind(ejsTmpl),
          dot: doT.template(expand(dotSource))
        };

        var expectedOutput = expand('&lt;h1&gt;Hi&lt;/h1&gt;<span>4</span><span>5</span>');

        var suite = new Benchmark.Suite();
        pie.object.forEach(cases, function(k,v) {
          expect(k + ': ' + v(d)).toEqual(k + ': ' + expectedOutput);
          suite.add(k, function(){
            v(d);
          });
        });

        var output = pie.dom.createElement('<div><h4>Templating Benchmark</h4><ul></ul></div>');
        pie.dom.prependChild(document.body, output);
        output = output.querySelector('ul');

        suite.on('cycle', function(event, bench) {
          output.appendChild(pie.dom.createElement('<li>' + String(event.target) + '</li>'));
          output.getBoundingClientRect();
        });

        suite.on('complete', function() {
          var winner = this.filter('fastest').pluck('name');
          expect(~winner.indexOf('pie')).toBeTruthy();
          output.appendChild(pie.dom.createElement('<li><strong>Winner: ' + winner + '</strong></li>'));
          done();
        });

        suite.run();
      });

    });

  });

});
describe("pie.router", function(){

  beforeEach(function(){
    var r = new pie.router();
    this.router = r;

    this.router.map({
      '/t/a'                : {view: 'a', name: 'aRoute'},
      '/t/:id/a'            : {view: 'a', name: 'aSpecificRoute'},
      '/t/:id/b'            : {view: 'b', name: 'bSpecificRoute'},
      '/t/unique/b'         : {view: 'b', name: 'bUniqueRoute'},
      '/t/:parent_id/b/:id' : {view: 'b', name: 'bParentRoute'},
      '/m/*path'            : {view: 'm', name: 'mRoute'},

      'api.route'          : '/api/a.json',
      'api.specificRoute'  : '/api/:id/a.json'
    }, {
      common: 'foo'
    });
  });

  it('should allow routes to be added', function(){
    var r = this.router;

    expect(r.children[0].options.common).toEqual('foo');
    expect(pie.array.last(r.children).options.common).toEqual('foo');

    expect(r.getChild('api.route').get('pathTemplate')).toEqual('/api/a.json');
    expect(r.getChild('aRoute').get('pathTemplate')).toEqual('/t/a');
    expect(r.getChild('api.specificRoute').get('pathTemplate')).toEqual('/api/:id/a.json');
    expect(r.getChild('aSpecificRoute').get('pathTemplate')).toEqual('/t/:id/a');
    expect(r.getChild('mRoute').get('pathTemplate')).toEqual('/m/*path');

    expect(r.children.length).toEqual(8);
  });

  it('should correctly build paths', function() {
    var r = this.router, p;

    p = r.path('api.route', {"p" : 0, "s" : 1});
    expect(p).toEqual('/api/a.json?p=0&s=1');

    p = r.path('api.specificRoute', {id: 4, "s" : 1});
    expect(p).toEqual('/api/4/a.json?s=1');

    expect(function(){
      r.path('api.specificRoute', {"s" : 1});
    }).toThrowError("[PIE] missing route interpolation: :id");

    p = r.path('aRoute');
    expect(p).toEqual('/t/a');

    p = r.path('aSpecificRoute', {id: 17, s: 1}, true);
    expect(p).toEqual('/t/17/a');
  });

  it('should be able to properly determine routes', function(){
    var r = this.router, o;

    o = r.parseUrl('/t/a');
    expect(o.view).toEqual('a');

    o = r.parseUrl('t/a');
    expect(o.view).toEqual('a');

    o = r.parseUrl('/t/a?q=1');
    expect(o.view).toEqual('a');
    expect(o.query.q).toEqual('1');
    expect(o.data.q).toEqual('1');
    expect(o.path).toEqual('/t/a');
    expect(o.fullPath).toEqual('/t/a?q=1');

    o = r.parseUrl('/t/30/a');
    expect(o.view).toEqual('a');
    expect(o.interpolations.id).toEqual('30');

    o = r.parseUrl('/t/unique/b');
    expect(o.view).toEqual('b');
    expect(o.name).toEqual('bUniqueRoute');

    o = r.parseUrl('/t/things/b');
    expect(o.view).toEqual('b');
    expect(o.name).toEqual('bSpecificRoute');
    expect(o.interpolations.id).toEqual('things');
    expect(o.data.id).toEqual('things');

    o = r.parseUrl('/t/things/b?q=1');
    expect(o.data.id).toEqual('things');
    expect(o.data.q).toEqual('1');

    o = r.parseUrl('/t/30/b?q=1&foo=true', true);
    expect(o.data.id).toEqual(30);
    expect(o.data.q).toEqual(1);
    expect(o.data.foo).toEqual(true);

    o = r.parseUrl('/m/thing');
    expect(o.view).toEqual('m');
    expect(o.data.path).toEqual('thing');

    o = r.parseUrl('/m/thing/foo?bar=true', true);
    expect(o.view).toEqual('m');
    expect(o.data.path).toEqual('thing/foo');
    expect(o.data.bar).toEqual(true);

    o = r.parseUrl('/unrecognized/path');
    expect(o.view).toEqual(undefined);
    expect(o.path).toEqual('/unrecognized/path');
    expect(o.fullPath).toEqual('/unrecognized/path');
  });

  it("should correctly sort the routes", function() {
    var routes = this.router.children.map(function(r){ return r.get('pathTemplate'); });
    expect(routes).toEqual([
      '/t/:parent_id/b/:id',
      '/t/unique/b',
      '/api/:id/a.json',
      '/t/:id/a',
      '/t/:id/b',
      '/api/a.json',
      '/t/a',
      '/m/*path'
    ]);
  });
});
describe("pie.validator", function() {

  beforeEach(function() {
    this.validator = window.app.validator;
  });

  describe("class rangeOptions", function() {

    [
      [{gte: 3, lte: 5},          [3, 4, 5],                        [2.999999, 5.0000001, 6, 0, -5]],
      [{gt: 3, lt: 5},            [3.0000001, 4, 4.999999],         [3, 5, 6, 0, -3, -4, -5]],
      [{eq: 8},                   [8, 8.0],                         [7, 9, 8.000001, 7.999999, -8]],
      [{gte: 5, lte: 5},          [5],                              [4,6]],
      [{gte: 6, lte: 5},          [],                               [4,5,6]],
      [{gt: 5, lt: 6},            [],                               [4,5,6]],
      [{gt: "s", lt: "z"},        ["t", "u", "v", "w", "x", "y"],   ["m", "s", "z", ";", "~"]],
      [{eq: "s"},                 ["s"],                            ["S"]],
      [{gt: "2014-10-10"},        ["2014-10-11", "2015-01-01"],     ["2010-12-30", "2014-10-10"]]
    ].forEach(function(setup) {

      var options = setup[0],
      trues = setup[1],
      falses = setup[2];

      trues.forEach(function(trueInput){
        it("should properly determine that " + JSON.stringify(options) + " returns true for an input of " + String(trueInput), function() {
          var ro = new pie.validator.rangeOptions(this.validator.app, options);
          expect(ro.matches(trueInput)).toEqual(true);
        });
      });

      falses.forEach(function(falseInput){
        it("should properly determine that " + JSON.stringify(options) + " returns false for an input of " + String(falseInput), function() {
          var ro = new pie.validator.rangeOptions(this.validator.app, options);
          expect(ro.matches(falseInput)).toEqual(false);
        });
      });

    });

    it("should properly generate an 'eq' message", function() {
      var ro = new pie.validator.rangeOptions(this.validator.app, {eq: 35});
      expect(ro.message()).toEqual("equal to 35");
    });

    it("should properly generate a 'lte' message", function() {
      var ro = new pie.validator.rangeOptions(this.validator.app, {lte: 35});
      expect(ro.message()).toEqual("less than or equal to 35");
    });

    it("should properly generate a 'gte & lte' message", function() {
      var ro = new pie.validator.rangeOptions(this.validator.app, {gte: 1, lte: 100});
      expect(ro.message()).toEqual("greater than or equal to 1 and less than or equal to 100");
    });

  });

  describe("#ccNumber", function() {

    //           16 digit numbers
    var valids = ['0000 0000 0000 0000', '4111-1111-1111-1111', '4111111111111111', '49927398716'],
    invalids = ['49927398717', '1234567812345678', '0000 0000 0000 000a', 'a000 0000 0000 0000', '0000a0000a0000a0000'];

    valids.forEach(function(valid) {
      it("should determine that " + valid + " is valid", function() {
        expect(this.validator.ccNumber(valid)).toEqual(true);
      });
    });

    invalids.forEach(function(invalid) {
      it("should determine that " + invalid + " is not valid", function() {
        expect(this.validator.ccNumber(invalid)).toEqual(false);
      });
    });

  });

  describe('#inclusion', function() {
    it("should allow an empty list", function() {
      expect(this.validator.inclusion('foo', {in: []})).toEqual(true);
      expect(this.validator.inclusion('foo')).toEqual(true);
    });

    it("should return true if the value is in the list", function() {
      expect(this.validator.inclusion('foo', {in: ['qux', 'foo', 'bar']})).toEqual(true);
    });

    it("should return false if the value is not in the list", function() {
      expect(this.validator.inclusion('foo', {in: ['qux', 'baz', 'bar']})).toEqual(false);
    });
  });

  describe("#date", function() {
    it("should allow a valid iso date to pass", function() {
      expect(this.validator.date("2015-04-01")).toEqual(true);
      expect(this.validator.date("2015-12-31")).toEqual(true);
      expect(this.validator.date("2015-01-01")).toEqual(true);
    });

    it("should not allow invalid dates", function() {
      expect(this.validator.date("2015-13-01")).toEqual(false);
      expect(this.validator.date("2015-12-00")).toEqual(false);
      expect(this.validator.date("2015-02-29")).toEqual(false);
    });

    it("should not allow invalid formats", function() {
      expect(this.validator.date("2015-12-1")).toEqual(false);
      expect(this.validator.date("2015-1-01")).toEqual(false);
      expect(this.validator.date("15-12-01")).toEqual(false);
      expect(this.validator.date("2015-to-01")).toEqual(false);
      expect(this.validator.date("2015-12-001")).toEqual(false);
      expect(this.validator.date("12/24/2015")).toEqual(false);
    });
  });
});
describe("pie.view", function() {

  beforeEach(function() {
    this.view = new pie.view();
  });

  it("should correctly build an event namespace", function() {
    var uid = this.view.pieId;
    expect(uid).not.toBeFalsy();
    expect(this.view.eventNamespace()).toEqual('view' + uid);
  });

  it("should provide shortcuts for querying it's dom", function() {
    var el = this.view.el;
    spyOn(el, 'querySelector');
    spyOn(el, 'querySelectorAll');

    this.view.qs('.test');
    expect(el.querySelector).toHaveBeenCalledWith('.test');

    this.view.qsa('.test-all');
    expect(el.querySelectorAll).toHaveBeenCalledWith('.test-all');
  });

  describe("#removeFromDom", function() {

    beforeEach(function(){
      this.spy = jasmine.createSpy('emitterCallback');
      this.view.emitter.on('detach', this.spy);
      spyOn(pie.dom, 'remove');
    });

    it("should not do anything if there is no parentNode", function() {
      expect(this.view.el.parentNode).toBeFalsy();
      this.view.removeFromDom();
      expect(this.spy).not.toHaveBeenCalled();
    });

    it("should remove it's el from the dom, but not call pie.dom.remove on it's el", function() {
      document.body.appendChild(this.view.el);

      this.view.emitter.on('beforeDetach', this.spy);
      this.view.emitter.on('afterDetach', this.spy);

      this.view.removeFromDom();

      expect(pie.dom.remove).not.toHaveBeenCalled();
      expect(this.spy.calls.count()).toEqual(3);
    });

  });

  describe("#teardown", function() {

    it("should not remove events from it's el if this.on() is never called", function() {
      spyOn(pie.dom, 'off');
      this.view.teardown();
      expect(pie.dom.off).not.toHaveBeenCalledWith();
    });

    it("should remove all observers when removed from it's parent", function() {
      var model = new pie.model(), f;

      this.view.onChange(model, this.view.setup.bind(this.view));

      f = this.view.changeCallbacks[0].args[0];
      expect(model.observations[f.pieId]).toBeTruthy();

      this.view.teardown();

      expect(this.view.changeCallbacks.length).toEqual(0);
      expect(model.observations[f.pieId]).toBeFalsy();
    });

    it("should observe events on it's el via this.on and remove the events", function() {
      var f = function(){};
      spyOn(pie.dom, 'on');
      spyOn(pie.dom, 'off');
      this.view.on('click', 'a', f);
      this.view.teardown();
      var args = pie.dom.on.calls.argsFor(0);
      expect(args[0]).toEqual(this.view.el);
      expect(args[1]).toEqual('click.' + this.view.eventNamespace());
      expect(args[3]).toEqual('a');
      expect(pie.dom.off).toHaveBeenCalledWith(this.view.el, '*.' + this.view.eventNamespace());
    });

    it("should allow other elements to be observed", function() {
      var f = function(){};
      spyOn(pie.dom, 'on');
      spyOn(pie.dom, 'off');
      this.view.on('click', 'a', f, document.body);
      this.view.teardown();
      var args = pie.dom.on.calls.argsFor(0);
      expect(args[0]).toEqual(document.body);
      expect(args[1]).toEqual('click.' + this.view.eventNamespace());
      expect(args[3]).toEqual('a');
      expect(pie.dom.off).toHaveBeenCalledWith(document.body, '*.' + this.view.eventNamespace());
    });

    it("should remove itself from the dom", function() {
      spyOn(this.view, 'removeFromDom');
      this.view.teardown();

      expect(this.view.removeFromDom).toHaveBeenCalled();
    });

    it("should teardown it's children", function() {
      var childA = { teardown: jasmine.createSpy('teardown') },
          childB = { teardown: jasmine.createSpy('teardown') };

      this.view.addChild('a', childA);
      this.view.addChild('b', childB);

      this.view.teardown();

      expect(childA.teardown).toHaveBeenCalled();
      expect(childB.teardown).toHaveBeenCalled();
    });

    it("should remove it's children, freeing any references", function() {
      var childA = {}, childB = {};

      this.view.addChild('a', childA);
      this.view.addChild('b', childB);

      expect(childA.parent).toEqual(this.view);
      expect(childB.parent).toEqual(this.view);

      this.view.teardown();

      expect(this.view.children.length).toEqual(0);

      expect(childA.parent).toEqual(undefined);
      expect(childB.parent).toEqual(undefined);
    });

  });

  it("should invoke navigationUpdated on all it's children when invoked on itself", function() {
    var a = {navigationUpdated: jasmine.createSpy('navigationUpdated')},
    b = {navigationUpdated: jasmine.createSpy('navigationUpdated')};

    this.view.addChild('a', a);
    this.view.addChild('b', b);

    expect(this.view.children.length).toEqual(2);

    this.view.navigationUpdated();

    expect(a.navigationUpdated).toHaveBeenCalled();
    expect(b.navigationUpdated).toHaveBeenCalled();
  });


});
