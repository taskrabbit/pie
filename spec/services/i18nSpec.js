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
          },
          "nesting" : {
            "number" : "Nested translation with number: ${test.number}.",
            "interpolate" : "Nested translation with interpolation: ${test.interpolate}"
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

    it("should allow nesting of translations via ${", function() {
      var response = this.i18n.t('test.nesting.number', {count: 1});
      expect(response).toEqual("Nested translation with number: One translation.");
    });

    it("should allow nesting of translations via ${ and pass along interpolations", function() {
      var response = this.i18n.t('test.nesting.interpolate', {interp: "foo", reason: "bar"});
      expect(response).toEqual("Nested translation with interpolation: Things to foo, even foo again for bar.");
    });
  });

  describe("date and time functionality", function() {

    beforeEach(function() {
      var offsetStandardTime = new Date(2014,7,1).getTimezoneOffset(),
      offsetDaylightTime = new Date(2014,1,1).getTimezoneOffset();
      if(offsetStandardTime !== 240 || offsetDaylightTime !== 300) {
        pending("Time tests are assumed to occur within a EST timezone. Pending since that's not the case.");
      }
    });

    describe("#_normalizedDate", function() {

      it("should turn second-based epoch timestamps into date objects", function() {
        var stamps = ["1410210005", 1410210005], d;

        stamps.forEach(function(stamp) {
          d = this.i18n._normalizedDate(stamp);

          expect(d.getUTCFullYear()).toEqual(2014);
          expect(d.getUTCMonth() + 1).toEqual(9);
          expect(d.getUTCDate()).toEqual(8);
          expect(d.getUTCDay()).toEqual(1);

          expect(d.getUTCHours()).toEqual(21);
          expect(d.getUTCMinutes()).toEqual(0);
          expect(d.getUTCSeconds()).toEqual(5);
        }.bind(this));

      });

      it("should turn millisecode-based epoch timestamps into date objects", function() {
        var stamps = ["1410210005000", 1410210005000], d;

        stamps.forEach(function(stamp) {
          d = this.i18n._normalizedDate(stamp);

          expect(d.getUTCFullYear()).toEqual(2014);
          expect(d.getUTCMonth() + 1).toEqual(9);
          expect(d.getUTCDate()).toEqual(8);
          expect(d.getUTCDay()).toEqual(1);

          expect(d.getUTCHours()).toEqual(21);
          expect(d.getUTCMinutes()).toEqual(0);
          expect(d.getUTCSeconds()).toEqual(5);
        }.bind(this));

      });

      it("should leave dates alone", function() {
        var d1 = new Date(), d2;

        d2 = this.i18n._normalizedDate(d1);
        expect(Math.floor(d1.getTime() / 1000)).toEqual(Math.floor(d2.getTime() / 1000));
      });

      it("should parse iso times", function() {
        var iso = "2014-09-08T21:00:05.854Z", d;

        d = this.i18n._normalizedDate(iso);

        expect(d.getUTCFullYear()).toEqual(2014);
        expect(d.getUTCMonth() + 1).toEqual(9);
        expect(d.getUTCDate()).toEqual(8);
        expect(d.getUTCDay()).toEqual(1);

        expect(d.getUTCHours()).toEqual(21);
        expect(d.getUTCMinutes()).toEqual(0);
        expect(d.getUTCSeconds()).toEqual(5);
      });

      it("should parse everything else", function() {
        var stamp = "testing", d;

        d = this.i18n._normalizedDate(stamp);
        expect(typeof d).toEqual('object');
        expect(d.getUTCFullYear()).toEqual(NaN);
      });

    });

    describe("#timeago", function() {

      beforeEach(function() {
        app.i18n.load({
          "timeagotest" : {
            "timeago" : {
              "now" : {
                "zero" : "Just now",
                "other" : "%{count} seconds ago"
              },
              "minutes" : "%{count} minutes ago",
              "hours" : "%{count} hours ago",
              "days" : "%{count} days ago",
              "weeks" : "%{count} weeks ago",
              "months" : "%{count} months ago",
              "years" : "%{count} years ago"
            }
          }
        });

        this.now = new Date();
        this.then = new Date(this.now);
      });

      afterEach(function() {
        delete app.i18n.timeagotest;
      });

      it("should return now results", function() {
        this.then.setSeconds(this.then.getSeconds() - 30);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('30 seconds ago');
      });

      it("should return minute results", function() {
        this.then.setMinutes(this.then.getMinutes() - 30);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('30 minutes ago');
      });

      it("should return hours results", function() {
        this.then.setHours(this.then.getHours() - 12);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('12 hours ago');
      });

      it("should return days results", function() {
        this.then.setDate(this.then.getDate() - 2);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('2 days ago');
      });

      it("should return week results", function() {
        this.then.setDate(this.then.getDate() - 22);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('3 weeks ago');
      });

      it("should return month results", function() {
        this.then.setMonth(this.then.getMonth() - 8);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('8 months ago');
      });

      it("should return year results", function() {
        this.then.setFullYear(this.then.getFullYear() - 4);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('4 years ago');
      });

    });

    describe("#strftime", function() {

      beforeEach(function() {
        this.i18n.load({
          'app' : {
            'time' : {
              'formats' : {
                'strftimetest' : '%Y-%-m-%-d'
              }
            }
          }
        });

        this.d = this.i18n._normalizedDate("2014-09-08T09:00:05.054-04:00");
      });

      afterEach(function() {
        delete this.i18n.translations.app.time.formats.strftimetest;
      });

      var expectations = {
        'strftimetest' : '2014-9-8',
        'isoTime' : "2014-09-08T09:00:05.054-04:00",
        'isoDate' : "2014-09-08",
        'shortDate' : "09/08/2014",
        'longDate' : "September 8th, 2014"
      };

      Object.keys(expectations).forEach(function(k) {
        var expectation = expectations[k];

        it("should correctly transform the named format: " + k, function() {
          var response = this.i18n.l(this.d, k);
          expect(response).toEqual(expectation);
        });

      });

      expectations = {
        '%a' : 'Mon',
        '%A' : 'Monday',
        '%B' : 'September',
        '%b' : 'Sept',
        '%d' : '08',
        '%e' : ' 8',
        '%-do' : '8th',
        '%-d' : '8',
        '%H' : '09',
        '%k' : ' 9',
        '%-H' : '9',
        '%-k' : '9',
        '%I' : '09',
        '%l' : '9',
        '%m' : '09',
        '%-m' : '9',
        '%M' : '00',
        '%p' : 'AM',
        '%P' : 'am',
        '%S' : '05',
        '%-S' : '5',
        '%L' : '054',
        '%-L' : '54',
        '%w' : '1',
        '%y' : '14',
        '%Y' : '2014',
        '%z' : '-0400',
        '%:z' : '-04:00',
        '%Z' : 'EDT'
      };

      Object.keys(expectations).forEach(function(k) {
        var expectation = expectations[k];

        it("should replace " + k + " properly", function() {
          var response = this.i18n.l(this.d, k);
          expect(response).toEqual(expectation);
        });

      });

    });

  });

});
