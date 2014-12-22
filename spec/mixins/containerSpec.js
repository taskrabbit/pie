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

});
