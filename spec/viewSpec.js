describe("pie.view", function() {

  beforeEach(function() {
    this.view = pie.view.create();
  });

  it("should correctly build an event namespace", function() {
    var uid = this.view.__pieId;
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
      var model = pie.model.create(), f;

      this.view.observe(model, 'setup');

      f = this.view.changeCallbacks[0].args[0];
      expect(model.observations[f.__pieId]).toBeTruthy();

      this.view.teardown();

      expect(this.view.changeCallbacks.length).toEqual(0);
      expect(model.observations[f.__pieId]).toBeFalsy();
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
