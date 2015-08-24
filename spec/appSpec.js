describe("pie.app", function() {

  beforeEach(function() {
    app.state.reset();
  });

  describe("#initialization", function() {

    it("should allow subobjects to be initialized via a class & option structure", function() {
      var myi18n = pie.i18n.extend('myI18n', {
        isSpecial: true
      });

      var app = pie.app.create({
        i18n: myi18n,
        i18nOptions: {specialOption: true},
        navigator: false
      });

      expect(app.i18n.isSpecial).toEqual(true);
      expect(app.validator.i18n.isSpecial).toEqual(true);
    });

    it("should allow subobjects to be passed as instances", function() {
      var i = pie.i18n.create();
      i.superSpecial = true;

      var app = pie.app.create({ i18n: i, navigator: false });

      expect(app.i18n.superSpecial).toEqual(true);
      expect(app.validator.i18n.superSpecial).toEqual(true);
      expect(i.app).toEqual(app);
    });

  });

  describe('#path', function() {

    it("should construct a path with just a pathname", function() {
      var path = app.path('/foo/bar');
      expect(path).toEqual('/foo/bar');
    });

    it("should construct a path with a pathname and query object", function() {
      var path = app.path('/foo/bar/:baz', {baz: 'foobar'});
      expect(path).toEqual('/foo/bar/foobar');
    });

    it("should construct a path with just a query", function() {
      var path = app.path({foo: 'bar'});
      expect(path).toEqual('/?foo=bar');
    });

    it("should construct a path with just a query when there is an existing route", function() {
      app.state.data.__route = pie.route.create('/foo/bar/baz');
      var path = app.path({qux: 'bux'});
      expect(path).toEqual('/foo/bar/baz?qux=bux');
    });

    it("should construct a path with the given pathname even if there is an existing route", function() {
      app.state.data.__route = pie.route.create('/foo/bar/baz');
      var path = app.path('/users/4', {qux: 'bux'});
      expect(path).toEqual('/users/4?qux=bux');
    });

    it("should parse a query string off of the path and merge the new values over it", function() {
      var path = app.path('/users/4?foo=bar', {foo: 'baz', qux: 'bux'});
      expect(path).toEqual('/users/4?foo=baz&qux=bux');
    });

    it("should generate a route by name", function() {
      var path = app.path('show', {id: 5, qux: 'foo'});
      expect(path).toEqual('/pie/5/show?qux=foo');
    });

    it("should enable an interpolation to be constructed if a router is present", function() {
      expect(function(){
        app.path('/foo/:too/bar');
      }).toThrowError("[PIE] missing route interpolation: :too");

      var path = app.path('/foo/:too/bar', {too: 'far'});
      expect(path).toEqual('/foo/far/bar');
    });

  });

  describe("#go", function() {

    it("should set the state with the identifier built by app#path", function() {
      app.go('/foo/bar');
      expect(app.state.get('__id')).toEqual('/foo/bar');
      expect(app.state.get('__fullId')).toEqual('/foo/bar');
      expect(app.state.get('__history')).toEqual(true);
    });

    it("should set the state with the identifier and query built by app#path", function() {
      app.go('/foo/bar', {biz: 'baz'});
      expect(app.state.get('__id')).toEqual('/foo/bar');
      expect(app.state.get('__fullId')).toEqual('/foo/bar?biz=baz');
      expect(app.state.get('biz')).toEqual('baz');
      expect(app.state.get('__history')).toEqual(true);
    });

    it("should set the state with __history=false if the optional skipHistory argument is a true boolean", function() {
      app.go('/foo/bar', true);
      expect(app.state.get('__id')).toEqual('/foo/bar');
      expect(app.state.get('__fullId')).toEqual('/foo/bar');
      expect(app.state.get('__history')).toEqual(false);

      app.state.reset();

      app.go('/foo/bar', {too: 'foo'}, true);
      expect(app.state.get('__id')).toEqual('/foo/bar');
      expect(app.state.get('__fullId')).toEqual('/foo/bar?too=foo');
      expect(app.state.get('__history')).toEqual(false);
    });

  });

});
