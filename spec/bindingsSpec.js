describe("View Integration", function() {

  beforeEach(function() {
    var v = new window.lib.views.listView(app);
    app.addChild('integrationTest', v);
    v.render();

    document.body.appendChild(v.el);

    this.view = v;
    this.model = this.view.model;
  });

  afterEach(function() {
    app.removeChild('integrationTest');
  });

  it("should allow binding of model attributes to form fields", function() {
    var el = this.view.qs('input[name="foo"]');

    expect(el).not.toBeFalsy();
    expect(el.value).toEqual('');

    this.model.set('foo', 'bar');
    expect(el.value).toEqual('bar');

    el.value = 'barstool';
    expect(this.model.get('foo')).toEqual('bar');
    $(el).trigger('change');

    expect(this.model.get('foo')).toEqual('barstool');
  });

  it("should be able to initialize form fields by invokding initBoundFields()", function() {
    var el = this.view.qs('input[name="foo"]');

    this.model.data.foo = 'wingdings';
    expect(el.value).toEqual('');

    this.view.initBoundFields();

    expect(el.value).toEqual('wingdings');
  });

});
