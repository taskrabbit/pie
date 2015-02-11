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
