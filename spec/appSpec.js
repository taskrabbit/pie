describe("pie.app", function() {

  describe("#initialization", function() {

    it("should allow subobjects to be initialized via a class & option structure", function() {
      var myi18n = pie.i18n.extend('myI18n', {
        isSpecial: true
      });

      var app = pie.app.create({
        i18n: myi18n,
        i18nOptions: {specialOption: true},
      });

      expect(app.i18n.isSpecial).toEqual(true);
      expect(app.validator.i18n.isSpecial).toEqual(true);
    });

    it("should allow subobjects to be passed as instances", function() {
      var i = pie.i18n.create();
      i.superSpecial = true;

      var app = pie.app.create({
        i18n: i
      });

      expect(app.i18n.superSpecial).toEqual(true);
      expect(app.validator.i18n.superSpecial).toEqual(true);
      expect(i.app).toEqual(app);
    });

  });

  describe('#start', function() {

    beforeEach(function(){
      this.app = pie.app.create({noAutoStart: true});
    });


    it('should set up a single observer for links before the app starts', function() {

      this.app = pie.app.create({noAutoStart: true});
      spyOn(this.app, 'setupSinglePageLinks');

      expect(this.app.emitter.firedCount('beforeStart')).toEqual(0);
      this.app.emitter.fire('beforeStart');
      this.app.emitter.fire('beforeStart');

      expect(this.app.setupSinglePageLinks.calls.count()).toEqual(1);
    });

    it("should start the navigator as part of the startup process", function() {
      var nav = this.app.navigator;
      spyOn(nav, 'start');
      this.app.start();
      expect(nav.start).toHaveBeenCalled();
    });

    it("should show any store notifications after the app is started", function() {

      this.app = pie.app.create({noAutoStart: true});
      spyOn(this.app, 'showStoredNotifications');

      expect(this.app.emitter.firedCount('beforeStart')).toEqual(0);
      this.app.emitter.fire('afterStart');
      this.app.emitter.fire('afterStart');

      expect(this.app.showStoredNotifications.calls.count()).toEqual(1);
    });

    it("should allow the start to be blocked by an around filter", function(done) {
      var nav = this.app.navigator;
      spyOn(nav, 'start');

      this.app.emitter.on('aroundStart', function(cb){
        expect(nav.start).not.toHaveBeenCalled();
        cb();
        expect(nav.start).toHaveBeenCalled();
        done();
      });

      this.app.start();
    });

  });


  describe("#go", function() {

    beforeEach(function() {
      this.goSpy = spyOn(app.navigator, 'go');
      this.hardGoSpy = spyOn(app, 'hardGo');
      this.notifierSpy = spyOn(app.notifier, 'notify');
      this.storeSpy = spyOn(app.storage, 'set');
    });

    it("should construct a path based on the first argument", function() {
      app.go('list');

      var theCall = this.goSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('/pie/a');

      app.go('show', {id: 'foo'});
      theCall = this.goSpy.calls.argsFor(1);

      expect(theCall[0]).toEqual('/pie/foo/show');

      app.go(['show', {id: 'foo'}]);
      theCall = this.goSpy.calls.argsFor(2);

      expect(theCall[0]).toEqual('/pie/foo/show');
    });

    it("should properly determine replaceState", function() {
      var theCall;

      app.go('list');
      theCall = this.goSpy.calls.argsFor(0);
      expect(theCall[2]).toEqual(false);

      app.go('list', true);
      theCall = this.goSpy.calls.argsFor(1);
      expect(theCall[2]).toEqual(true);

      app.go('show', {id: 'foo'});
      theCall = this.goSpy.calls.argsFor(2);
      expect(theCall[2]).toEqual(false);

      app.go('show', {id: 'foo'}, true);
      theCall = this.goSpy.calls.argsFor(3);
      expect(theCall[2]).toEqual(true);

      app.go(['show', {id: 'foo'}]);
      theCall = this.goSpy.calls.argsFor(4);
      expect(theCall[2]).toEqual(false);

      app.go(['show', {id: 'foo'}], true);
      theCall = this.goSpy.calls.argsFor(5);
      expect(theCall[2]).toEqual(true);
    });

    it("should send all the other arguments to the notifier if the route is recognized, ensuring that the message is evaluated with the current i18n context", function() {
      var theCall;

      app.go('list', 'foo');
      theCall = this.notifierSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('foo');
      expect(theCall.length).toEqual(1);

      app.go('list', '.app.errors.401');
      theCall = this.notifierSpy.calls.argsFor(1);
      expect(theCall[0]).toEqual(app.i18n.t('app.errors.401'));
      expect(theCall.length).toEqual(1);

      app.go('list', 'foo', 'message');
      theCall = this.notifierSpy.calls.argsFor(2);
      expect(theCall[0]).toEqual('foo');
      expect(theCall[1]).toEqual('message');
      expect(theCall.length).toEqual(2);

      app.go('list', {foo: 'bar'}, 'foo', 'message', true);
      theCall = this.notifierSpy.calls.argsFor(3);
      expect(theCall[0]).toEqual('foo');
      expect(theCall[1]).toEqual('message');
      expect(theCall[2]).toEqual(true);
      expect(theCall.length).toEqual(3);
    });

    it("if the route is not recognized it should store the notification args in storage for the next request", function() {
      var theCall;

      app.go('/missing-thing', 'foo');
      theCall = this.storeSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual('foo');
      expect(theCall[1].length).toEqual(1);

      theCall = this.hardGoSpy.calls.argsFor(0);
      expect(theCall[0]).toEqual('/missing-thing');

      app.go('/missing-thing', '.app.errors.401');
      theCall = this.storeSpy.calls.argsFor(1);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual(app.i18n.t('app.errors.401'));
      expect(theCall[1].length).toEqual(1);

      app.go('/missing-thing', 'foo', 'message');
      theCall = this.storeSpy.calls.argsFor(2);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual('foo');
      expect(theCall[1][1]).toEqual('message');
      expect(theCall[1].length).toEqual(2);

      app.go('/missing-thing', {foo: 'bar'}, 'foo', 'message', true);
      theCall = this.storeSpy.calls.argsFor(3);
      expect(theCall[0]).toEqual('js-alerts');
      expect(theCall[1][0]).toEqual('foo');
      expect(theCall[1][1]).toEqual('message');
      expect(theCall[1][2]).toEqual(true);
      expect(theCall[1].length).toEqual(3);

      theCall = this.hardGoSpy.calls.argsFor(3);
      expect(theCall[0]).toEqual('/missing-thing?foo=bar');
    });

  });

});
