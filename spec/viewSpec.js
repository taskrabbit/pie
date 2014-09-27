describe("pie.view", function() {

  beforeEach(function() {
    this.view = new pie.view(app);
  });

  it("should correctly build an event namespaced", function() {
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
    spyOn($, 'off');
    this.view.removedFromParent(app);
    expect($.off).toHaveBeenCalledWith('*.' + this.view.eventNamespace());
  });

  it("should remove all observers when removed from it's parent", function() {
    var model = new pie.model(), f;
    this.view.onChange(model, this.view.addedToParent.bind(this.view), f);

    f = this.view.changeCallbacks[0][1];

    expect(model.observations.__all__[0]).toEqual(f);

    this.view.removedFromParent();

    expect(this.view.changeCallbacks.length).toEqual(0);
    expect(model.observations.__all__.length).toEqual(0);
  });


});
