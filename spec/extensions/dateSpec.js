describe("Date extensions", function() {

  describe('#dateFromISO', function() {

    it("should correctly parse a iso date", function() {
      var st = "2014-06-01",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should correctly parse an iso timestamp as a date", function() {
      var st = "2014-06-01T11:07:16Z",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should not care about timezone", function() {
      var st = "2014-06-01T11:07:16+09:00",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should handle an iso timestamp with a space instead of a T", function() {
      var st = "2014-06-01 11:07:16+09:00",
      d = pie.date.dateFromISO(st);

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });

    it("should not blow up on a falsy value", function() {
      var d = pie.date.dateFromISO();
      expect(d).toEqual(null);
    });

  });

  describe("#timeFromISO", function() {


    it("should not blow up on a falsy value", function() {
      var d = pie.date.timeFromISO();
      expect(d).toEqual(null);
    });


    it("should return the date value if there's no separator", function() {
      var d = pie.date.timeFromISO("2014-06-01");

      expect(d.getFullYear()).toEqual(2014);
      expect(d.getMonth()).toEqual(5);
      expect(d.getDate()).toEqual(1);

      expect(d.getHours()).toEqual(0);
      expect(d.getMinutes()).toEqual(0);
      expect(d.getSeconds()).toEqual(0);
    });
  });

});
