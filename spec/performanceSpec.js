/* global Benchmark, kendo, _, EJS */

describe("pie performance", function() {

  describe("templating", function() {

    var resig = function (str) {
      var strFunc =
      "var p=[];" +
      "p.push('" +

      str.replace(/[\r\t\n]/g, " ")
         .replace(/'(?=[^%]*%\])/g, "\t")
         .split("'").join("\\'")
         .split("\t").join("'")
         .replace(/\[%=(.+?)%\]/g, "',$1,'")
         .split("[%").join("');")
         .split("%]").join("p.push('") + "');return p.join('');";

      return new Function("data", strFunc);
    };

    var source = "[% for(var i = 0; i < 2; i++) { %]<span>[%= data.foo + i %]</span>[% } %]";
    var kendoSource = "<# for(var i = 0; i < 2; i++) { #><span><#= data.foo + i #></span><# } #>";
    var _Source = "<% for(var i = 0; i < 2; i++) { %><span><%= obj.foo + i %></span><% } %>";
    var ejsSource = "<% for(var i = 0; i < 2; i++) { %><span><%= foo + i %></span><% } %>";

    it("should perform better than EVERYONE", function(done) {
      app.resources.load(
        'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js',
        'http://cdn.kendostatic.com/2011.2.804/js/kendo.all.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js',
        '/vendor/ejs.js', function(){

        var suite = new Benchmark.Suite();
        var resigTmpl = resig(source);
        var pieTmpl = pie.string.template(source);
        var kendoTmpl = kendo.template(kendoSource);
        var _Tmpl = _.template(_Source);
        var ejsTmpl = new EJS({text: ejsSource});
        ejsTmpl = ejsTmpl.render.bind(ejsTmpl);
        var d = {foo: 4};

        var cases = {
          resig: function() { return resigTmpl(d); },
          pie: function() { return pieTmpl(d); },
          underscore: function() { return _Tmpl(d); },
          kendo: function() { return kendoTmpl(d); },
          ejs: function() { return ejsTmpl(d); }
        };

        pie.object.forEach(cases, function(k,v) {
          expect(v()).toEqual('<span>4</span><span>5</span>');
          suite.add(k, v);
        });

        suite.on('cycle', function(event, bench) {
          console.log(String(event.target));
        });

        suite.on('complete', function() {
          var winner = this.filter('fastest').pluck('name');
          expect(~winner.indexOf('pie')).toBeTruthy();
          console.log('Fastest is ' + winner);
          done();
        });

        suite.run({minSamples: 200});
      });

    });

  });

});
