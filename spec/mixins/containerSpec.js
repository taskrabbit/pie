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

    it("should allow a child to be added at a specific index", function() {
      var foo = {foo: true}, bar = {bar: true}, baz = {baz: true};
      this.container.addChild('foo', foo);
      this.container.addChild('bar', bar);
      this.container.addChild('baz', baz, 1);
      expect(this.container.children).toEqual([foo, baz, bar]);
      expect(this.container.childNames).toEqual({foo: 0, baz: 1, bar: 2});
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


  describe('#getChild', function() {

    beforeEach(function() {
      this.container.init();
    });

    it("should allow a retrieval by name", function() {
      var foo = {foo: true};
      var bar = {bar: true};
      this.container.addChild('foo', foo);
      this.container.addChild('bar', bar);
      expect(this.container.getChild('foo').foo).toEqual(true);
      expect(this.container.getChild('bar').bar).toEqual(true);
    });

    it("should allow a retrieval by index", function() {
      var foo = {foo: true};
      var bar = {bar: true};
      this.container.addChild('foo', foo);
      this.container.addChild('bar', bar);
      expect(this.container.getChild(0).foo).toEqual(true);
      expect(this.container.getChild(1).bar).toEqual(true);
      expect(this.container.getChild(2)).toEqual(undefined);
    });

    it("should allow a child to be named something an array responds to", function() {
      var child = {theChild: true};
      expect(this.container.getChild('sort')).toEqual(undefined);
      this.container.addChild('sort', child);
      expect(this.container.getChild('sort')).toEqual(child);
    });

    it("should allow a retrieving grandchildren", function() {
      var child = pie.object.merge({theChild: true}, pie.mixins.container);
      child.init();
      var grandchild = {theGrandchild: true};

      this.container.addChild('foo', child);
      child.addChild('bar', grandchild);

      expect(this.container.getChild('foo.bar')).toEqual(grandchild);
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
