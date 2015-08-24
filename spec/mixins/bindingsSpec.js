describe("View Binding Integration", function() {

  beforeEach(function() {
    var v = window.lib.views.listView.create();
    this.view = v;
    this.model = this.view.model;
    this.view.addToDom(pie.qs('#main'));
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

  it("should be able to initialize form fields by invoking initBindings()", function() {
    var el = this.view.qs('input[name="foo"]');

    this.model.data.foo = 'wingdings';
    expect(el.value).toEqual('');

    this.view.initBindings();

    expect(el.value).toEqual('wingdings');
  });

  it('should be able to set attributes of elements', function() {
    var el = this.view.qs('input[name="foo"]');
    this.model.set('baz', 'jazz');
    expect(el.getAttribute('data-baz')).toEqual('jazz');
  });

});
