describe("pie.services.i18n", function() {

  beforeEach(function() {
    this.i18n = app.i18n;
  });

  it("loads translations deeply by default", function() {
    this.i18n.load({ "a" : { "foo" : "bar", "biz" : "baz" }});
    this.i18n.load({ "a" : { "foo" : "buz" }});

    expect(this.i18n.translations.a).toEqual({ "foo" : "buz", "biz" : "baz" });

    this.i18n.load({ "a" : { "biz" : "baz" }}, true);
    expect(this.i18n.translations.a).toEqual({ "biz" : "baz" });

    delete this.i18n.translations.a;
  });

  describe("with test translations loaded", function() {

    beforeEach(function() {
      this.i18n.load({
        "test" : {
          "direct" : "Direct translation",
          "interpolate" : "Things to %{interp}, even %{interp} again for %{reason}.",
          "number" : {
            "one" : "One translation",
            "negone" : "Negative one translation",
            "zero" : "Zero translation",
            "other" : "Other translation",
            "negother" : "Negative other translation"
          },
          "number2" : {
            "other" : "Number translation"
          }
        }
      });
    });

    afterEach(function() {
      delete this.i18n.translations.test;
    });

    it("should return the default if it's provided and the key is missing", function() {
      var response = this.i18n.t("test.missing", { "default" : "foo" });
      expect(response).toEqual("foo");
    });

    it("should return an empty response for a missing key with no default", function() {
      var response = this.i18n.t("test.missing");
      expect(response).toEqual("");
    });

    it("should look up direct translations", function() {
      var response = this.i18n.t("test.direct");
      expect(response).toEqual("Direct translation");
    });

    it("should interpolate count translations without a count option as a direct lookup", function() {
      var response = this.i18n.t("test.number");
      response = Object.keys(response).sort();
      expect(response).toEqual(["negone", "negother", "one", "other", "zero"]);
    });

    it("should interpolate count translations with a 1 correctly", function() {
      var response = this.i18n.t("test.number", { "count" : 1 });
      expect(response).toEqual("One translation");

      response = this.i18n.t("test.number", { "count" : "1" });
      expect(response).toEqual("One translation");

      response = this.i18n.t("test.number2", { "count" : 1 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with a 0 correctly", function() {
      var response = this.i18n.t("test.number", { "count" : 0 });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : "0" });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : "" });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : null });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number", { "count" : undefined });
      expect(response).toEqual("Zero translation");

      response = this.i18n.t("test.number2", { "count" : 0 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with a -1 correctly", function() {
      var response = this.i18n.t("test.number", { "count" : -1 });
      expect(response).toEqual("Negative one translation");

      response = this.i18n.t("test.number", { "count" : '-1' });
      expect(response).toEqual("Negative one translation");

      response = this.i18n.t("test.number2", { "count" : -1 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with other negative values correctly", function() {
      var response = this.i18n.t("test.number", { "count" : -2 });
      expect(response).toEqual("Negative other translation");

      response = this.i18n.t("test.number", { "count" : '-2' });
      expect(response).toEqual("Negative other translation");

      response = this.i18n.t("test.number2", { "count" : -2 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate count translations with other values correctly", function() {
      var response = this.i18n.t("test.number", { "count" : 2 });
      expect(response).toEqual("Other translation");

      response = this.i18n.t("test.number", { "count" : '2' });
      expect(response).toEqual("Other translation");

      response = this.i18n.t("test.number2", { "count" : 2 });
      expect(response).toEqual("Number translation");
    });

    it("should interpolate values", function() {
      var response = this.i18n.t("test.interpolate", { "interp" : "foo", "reason" : "bar"});
      expect(response).toEqual("Things to foo, even foo again for bar.");
    });

    it("should render non-interpolated values", function() {
      var response = this.i18n.t("test.interpolate");
      expect(response).toEqual("Things to undefined, even undefined again for undefined.");
    });

  });

});
