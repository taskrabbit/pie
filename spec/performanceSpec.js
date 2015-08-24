/* global Benchmark, kendo, _, EJS, doT */

describe("pie performance", function() {

  describe("templating", function() {

    var originalTimeout;

    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    var expand = function(str) {
      for(var i = 0; i < 10; i++) {
        str += str;
      }
      return str;
    };

    var resig = function (str) {
      var strFunc =
      "var p=[];" +
      "p.push('" +

      str.replace(/[\r\t\n]/g, " ")
         .replace(/'(?=[^%]*%\])/g, "\t")
         .split("'").join("\\'")
         .split("\t").join("'")
         .replace(/\[%=(.+?)%\]/g, "',$1,'")
         .replace(/\[%-(.+?)%\]/g, "',pie.string.escapeHtml($1),'")
         .split("[%").join("');")
         .split("%]").join("p.push('") + "');return p.join('');";

      return new Function("data", strFunc);
    };

    // pie / resig:: escape: [%- %], interpolate: [%= %], evaluate: [% %]
    var source = "[%- '<h1>Hi</h1>' %][% for(var i = 0; i < 2; i++) { %]<span>[%= data.foo + i %]</span>[% } %]";

    // kendo:: escape: #: #, interpolate: #= #, evaluate: # #
    var kendoSource = "#: '<h1>Hi</h1>' ## for(var i = 0; i < 2; i++) { #<span>#= data.foo + i #</span># } #";

    // underscore:: escape: <%- %>, interpolate: <%= %>, evaluate: <% %>
    var _Source = "<%- '<h1>Hi</h1>' %><% for(var i = 0; i < 2; i++) { %><span><%= obj.foo + i %></span><% } %>";

    // ejs:: escape: :(, interpolate: <%= %>, evaluate: <% %>
    var ejsSource = "<%= pie.string.escapeHtml('<h1>Hi</h1>') %><% for(var i = 0; i < 2; i++) { %><span><%= foo + i %></span><% } %>";

    var dotSource = "{{! '<h1>Hi</h1>' }}{{ for(var i = 0; i < 2; i++) { }}<span>{{= it.foo + i }}</span>{{ } }}";

    it("it should perform better than EVERYONE", function(done) {

      if(window.location.search.indexOf('bm=1') < 0) {
        pending();
        return done();
      }

      app.resources.load( 'benchmark', 'jquery', 'kendo', 'underscore', 'ejs', 'dot', function(){

        var ejsTmpl = new EJS({text: expand(ejsSource), escape: 'html'});

        var d = {foo: 4};

        var cases = {
          resig: resig(expand(source)),
          pie: pie.string.template(expand(source)),
          underscore: _.template(expand(_Source)),
          kendo: kendo.template(expand(kendoSource)),
          ejs: ejsTmpl.render.bind(ejsTmpl),
          dot: doT.template(expand(dotSource))
        };

        var expectedOutput = expand('&lt;h1&gt;Hi&lt;/h1&gt;<span>4</span><span>5</span>');

        var suite = new Benchmark.Suite();
        pie.object.forEach(cases, function(k,v) {
          expect(k + ': ' + v(d)).toEqual(k + ': ' + expectedOutput);
          suite.add(k, function(){
            v(d);
          });
        });

        var output = pie.dom.createElement('<div><h4>Templating Benchmark</h4><ul></ul></div>');
        pie.dom.prependChild(document.body, output);
        output = output.querySelector('ul');

        suite.on('cycle', function(event, bench) {
          output.appendChild(pie.dom.createElement('<li>' + String(event.target) + '</li>'));
          output.getBoundingClientRect();
        });

        suite.on('complete', function() {
          var winner = this.filter('fastest').pluck('name');
          expect(~winner.indexOf('pie')).toBeTruthy();
          output.appendChild(pie.dom.createElement('<li><strong>Winner: ' + winner + '</strong></li>'));
          done();
        });

        suite.run();
      });

    });

  });

});
