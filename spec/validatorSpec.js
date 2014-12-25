describe("pie.validator", function() {

  beforeEach(function() {
    this.validator = window.app.validator;
  });

  describe("class rangeOptions", function() {

    [
      [{gte: 3, lte: 5},          [3, 4, 5],                        [2.999999, 5.0000001, 6, 0, -5]],
      [{gt: 3, lt: 5},            [3.0000001, 4, 4.999999],         [3, 5, 6, 0, -3, -4, -5]],
      [{eq: 8},                   [8, 8.0],                         [7, 9, 8.000001, 7.999999, -8]],
      [{gte: 5, lte: 5},          [5],                              [4,6]],
      [{gte: 6, lte: 5},          [],                               [4,5,6]],
      [{gt: 5, lt: 6},            [],                               [4,5,6]],
      [{gt: "s", lt: "z"},        ["t", "u", "v", "w", "x", "y"],   ["m", "s", "z", ";", "~"]],
      [{eq: "s"},                 ["s"],                            ["S"]],
      [{gt: "2014-10-10"},        ["2014-10-11", "2015-01-01"],     ["2010-12-30", "2014-10-10"]]
    ].forEach(function(setup) {

      var options = setup[0],
      trues = setup[1],
      falses = setup[2];

      trues.forEach(function(trueInput){
        it("should properly determine that " + JSON.stringify(options) + " returns true for an input of " + String(trueInput), function() {
          var ro = new pie.validator.rangeOptions(this.validator.app, options);
          expect(ro.matches(trueInput)).toEqual(true);
        });
      });

      falses.forEach(function(falseInput){
        it("should properly determine that " + JSON.stringify(options) + " returns false for an input of " + String(falseInput), function() {
          var ro = new pie.validator.rangeOptions(this.validator.app, options);
          expect(ro.matches(falseInput)).toEqual(false);
        });
      });

    });

    it("should properly generate an 'eq' message", function() {
      var ro = new pie.validator.rangeOptions(this.validator.app, {eq: 35});
      expect(ro.message()).toEqual("equal to 35");
    });

    it("should properly generate a 'lte' message", function() {
      var ro = new pie.validator.rangeOptions(this.validator.app, {lte: 35});
      expect(ro.message()).toEqual("less than or equal to 35");
    });

    it("should properly generate a 'gte & lte' message", function() {
      var ro = new pie.validator.rangeOptions(this.validator.app, {gte: 1, lte: 100});
      expect(ro.message()).toEqual("greater than or equal to 1 and less than or equal to 100");
    });

  });

  describe("#ccNumber", function() {

    //           16 digit numbers
    var valids = ['0000 0000 0000 0000', '4111-1111-1111-1111', '4111111111111111', '49927398716'],
    invalids = ['49927398717', '1234567812345678', '0000 0000 0000 000a', 'a000 0000 0000 0000', '0000a0000a0000a0000'];

    valids.forEach(function(valid) {
      it("should determine that " + valid + " is valid", function() {
        expect(this.validator.ccNumber(valid)).toEqual(true);
      });
    });

    invalids.forEach(function(invalid) {
      it("should determine that " + invalid + " is not valid", function() {
        expect(this.validator.ccNumber(invalid)).toEqual(false);
      });
    });

  });
});
