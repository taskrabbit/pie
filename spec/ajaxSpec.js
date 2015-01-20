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

  });


});
