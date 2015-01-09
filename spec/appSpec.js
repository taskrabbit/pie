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

});
