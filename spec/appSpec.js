describe("pie.app", function() {

  describe("#initialization", function() {

    it("should allow subobjects to be initialized via a class & option structure", function() {
      var myi18n = pie.i18n.extend('myI18n', {
        isSpecial: true
      });

      var app = new pie.app({
        i18n: myi18n,
        i18nOptions: {specialOption: true},
      });

      expect(app.i18n.isSpecial).toEqual(true);
      expect(app.validator.i18n.isSpecial).toEqual(true);
    });

  });

  describe('#start', function() {

    beforeEach(function(){
      this.app = new pie.app({noAutoStart: true});
    });


    it('should set up a single observer for links before the app starts', function() {
      spyOn(pie.app.prototype, 'setupSinglePageLinks');

      this.app = new pie.app({noAutoStart: true});

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
      spyOn(pie.app.prototype, 'showStoredNotifications');

      this.app = new pie.app({noAutoStart: true});

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

});
