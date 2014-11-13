describe("pie.view", function() {

  beforeEach(function() {
    this.view = new pie.view(app);
  });

  it("should correctly build an event namespace", function() {
    var uid = this.view.uid;
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

  it("should remove all events from it's el when it's removed from it's parent", function() {
    spyOn(pie.dom, 'off');
    this.view.removedFromParent(app);
    expect(pie.dom.off).toHaveBeenCalledWith(this.view.el, '*.' + this.view.eventNamespace());
  });

  it("should remove all observers when removed from it's parent", function() {
    var model = new pie.model(), f;

    this.view.onChange(model, this.view.addedToParent.bind(this.view));

    f = this.view.changeCallbacks[0][1][0];
    expect(model.observations.__all__[0]).toEqual(f);

    this.view.removedFromParent();

    expect(this.view.changeCallbacks.length).toEqual(0);
    expect(model.observations.__all__.length).toEqual(0);
  });

  it("should remove it's el from the dom, but not call pie.dom.remove on it's el", function() {
    spyOn(pie.dom, 'remove');
    this.view.removedFromParent(app);
    expect(pie.dom.remove).not.toHaveBeenCalledWith();
  });

  it("should observe events on it's el via this.on and remove the events", function() {
    var f = function(){};
    spyOn(pie.dom, 'on');
    spyOn(pie.dom, 'off');
    this.view.on('click', 'a', f);
    this.view.removedFromParent(app);
    var args = pie.dom.on.calls.argsFor(0);
    expect(args[0]).toEqual(this.view.el);
    expect(args[1]).toEqual('click.' + this.view.eventNamespace());
    expect(args[3]).toEqual('a');
    expect(pie.dom.off).toHaveBeenCalledWith(this.view.el, '*.' + this.view.eventNamespace());
  });


});
