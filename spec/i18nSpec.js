describe("pie.i18n", function() {

  beforeEach(function() {
    this.i18n = app.i18n;
  });

  it("loads translations deeply by default", function() {
    this.i18n.load({ "a" : { "foo" : "bar", "biz" : "baz" }});
    this.i18n.load({ "a" : { "foo" : "buz" }});

    expect(this.i18n.data.a).toEqual({ "foo" : "buz", "biz" : "baz" });

    this.i18n.load({ "a" : { "biz" : "baz" }}, true);
    expect(this.i18n.data.a).toEqual({ "biz" : "baz" });

    delete this.i18n.data.a;
  });

  describe("with test translations loaded", function() {

    beforeEach(function() {
      this.i18n.load({
        "test" : {
          "direct" : "Direct translation",
          "interpolate" : "Things to %{interp}, even %{interp} again for %{reason}.",

          "changed" : "content that is_changed %{foo}",
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
      delete this.i18n.data.test;
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

    it("should not render strings which do not have the correct interpolations provided", function() {
      var spy = spyOn(this.i18n.app.errorHandler, 'handleI18nError');
      var response = this.i18n.t("test.interpolate");
      expect(response).toEqual("");
      expect(spy).toHaveBeenCalled();
    });

    it("should allow nesting of translations via ${", function() {
      var response = this.i18n.t('test.nesting.number', {count: 1});
      expect(response).toEqual("Nested translation with number: One translation.");
    });

    it("should allow nesting of translations via ${ and pass along interpolations", function() {
      var response = this.i18n.t('test.nesting.interpolate', {interp: "foo", reason: "bar"});
      expect(response).toEqual("Nested translation with interpolation: Things to foo, even foo again for bar.");
    });

    it("should allow the changing of of the result by passing string alterations", function() {
      var response = this.i18n.t('test.changed', {foo: 'test'}, 'modularize', 'titleize');
      expect(response).toEqual("Content That IsChanged Test");
    });

    it("should report misses and return an empty string", function() {
      var spy = spyOn(this.i18n.app.errorHandler, 'handleI18nError');
      var response = this.i18n.t('djaslkfjalsdkfjlasf');
      expect(response).toEqual('');
      expect(spy).toHaveBeenCalled();
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
        expect(pie.object.isDate(d)).toEqual(true);
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

      // offset, diff, end of month diff
      [
        [2, 2, 2],
        [3, 3, 3],
        [4, 4, 3],
        [5, 5, 5],
        [6, 6, 5],
        [7, 7, 7],
        [8, 8, 8],
        [9, 9, 8],
        [10, 10, 10],
        [11, 11, 10]
      ].forEach(function(arr){
        var i = arr[0],
        diff = arr[1],
        endDiff = arr[2];

        it("should return month results for " + i + " months back", function() {
          var now = new Date(2015, 2, 11); // 2015-03-11
          var then = new Date(now.getTime());
          then.setMonth(then.getMonth() - i);

          var response = this.i18n.timeago(then, now, 'timeagotest');
          expect(response).toEqual(diff + ' months ago');

          now.setDate(now.getDate() + 20);

          then = new Date(now.getTime());
          then.setMonth(then.getMonth() - i);

          response = this.i18n.timeago(then, now, 'timeagotest');
          expect(response).toEqual(endDiff + ' months ago');
        });
      });

      it("should return year results", function() {
        this.then.setFullYear(this.then.getFullYear() - 3);

        var response = this.i18n.timeago(this.then, this.now, 'timeagotest');
        expect(response).toEqual('3 years ago');
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
        delete this.i18n.data.app.time.formats.strftimetest;
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
        '%-a' : 'Mon',
        '%A' : 'Monday',
        '%-A' : 'Monday',
        '%B' : 'September',
        '%b' : 'Sep',
        '%d' : '08',
        '%e' : ' 8',
        '%+d' : '8th',
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

      it("should replace %-a|A with proximal dates properly", function() {
        var d = new Date();

        var response = this.i18n.l(d, '%-A');
        expect(response).toEqual('Today');

        response = this.i18n.l(d, '%-a');
        expect(response).toEqual('Today');

        d.setDate(d.getDate() + 1);

        response = this.i18n.l(d, '%-A');
        expect(response).toEqual('Tomorrow');

        response = this.i18n.l(d, '%-a');
        expect(response).not.toEqual('Tomorrow');
      });

    });

  });

});
