describe("String extensions", function() {

  describe("#deserialize", function() {

    it("should handle simple query strings", function() {
      var query = pie.string.deserialize("test=foo&foo=bar");
      expect(query).toEqual({
        test: 'foo',
        foo: 'bar'
      });
    });

    it("should automatically determine it's starting point", function(){
      var query = pie.string.deserialize('example.com?foo=bar&biz=baz');
      expect(query).toEqual({
        foo: 'bar',
        biz: 'baz'
      });
    });

    it("should NOT parse &amp's as separators", function() {
      var query = pie.string.deserialize("test=foo&amp;foo=bar");
      expect(query).toEqual({
        test: 'foo',
        'amp;foo' : 'bar'
      });
    });

    it('should deal with missing keys', function() {
      var query = pie.string.deserialize('=foo');
      expect(query).toEqual({
        '' : 'foo'
      });
    });

    it('should deal with missing values', function() {
      var query = pie.string.deserialize('foo=');
      expect(query).toEqual({
        'foo' : ''
      });
    });

    it('should deal with missing keys after existing values', function() {
      var query = pie.string.deserialize('foo=bar&=baz');
      expect(query).toEqual({
        'foo' : 'bar',
        '' : 'baz'
      });
    });

    it('should deal with missing values with existing values after', function() {
      var query = pie.string.deserialize('foo=&biz=baz');
      expect(query).toEqual({
        'foo' : '',
        'biz' : 'baz'
      });
    });

    it('should parse [] params into arrays', function() {
      // foo[]=first&foo[]=second
      var query = pie.string.deserialize('foo%5B%5D=first&foo%5B%5D=second');
      expect(query).toEqual({
        'foo' : ['first', 'second']
      });
    });

    it('should not blow up on nested arrays. that said, it\'s likely not doing what\'s desired.', function() {
      // foo[][]=first&foo[][]=second
      var query = pie.string.deserialize('foo%5B%5D%5B%5D=first&foo%5B%5D%5B%5D=second');
      expect(query).toEqual({
        'foo' : [['first'], ['second']]
      });
    });

    it('should parse objects into subobjects', function() {
      // foo[alpha]=Adam&foo[beta]=Billy
      var query = pie.string.deserialize('foo%5Balpha%5D=Adam&foo%5Bbeta%5D=Billy');
      expect(query).toEqual({
        'foo' : {
          'alpha' : 'Adam',
          'beta' : 'Billy'
        }
      });
    });

    it('should parse nested objects just fine', function() {
      // foo[alpha][fname]=Adam&foo[alpha][lname]=Miller
      var query = pie.string.deserialize('foo%5Balpha%5D%5Bfname%5D=Adam&foo%5Balpha%5D%5Blname%5D=Miller');
      expect(query).toEqual({
        'foo' : {
          'alpha' : {
            'fname' : 'Adam',
            'lname' : 'Miller'
          }
        }
      });
    });

    it('should parse values if asked to', function() {
      var query = pie.string.deserialize('a=A&b=undefined&c=null&d=false&e=true&f=-5.5&g=10.0&h=5&i=2014-12-12', true);
      expect(query).toEqual({
        a: 'A',
        b: undefined,
        c: null,
        d: false,
        e: true,
        f: -5.5,
        g: 10.0,
        h: 5,
        i: '2014-12-12'
      });
    });

  });

  describe("#normalizeUrl", function() {

    it('should normalize a path properly', function() {
      var p;

      p = pie.string.normalizeUrl('test/path/#');
      expect(p).toEqual('/test/path');

      p = pie.string.normalizeUrl('/test/path#');
      expect(p).toEqual('/test/path');

      p = pie.string.normalizeUrl('/test/path/');
      expect(p).toEqual('/test/path');

      p = pie.string.normalizeUrl('test/things/?q=1&z=2');
      expect(p).toEqual('/test/things?q=1&z=2');

    });
  });


  describe("#template", function() {

    var simpleTemplate = "[% var foo = data.foo; %]Hi, [%- data.first_name %]. Welcome to [%= foo.name %].";
    var quoteTemplate = "Do you know 'Doug' from [%- data['a'] %] company or \"John\" from [%= data[\"b\"] %] company?";
    var loopTemplate = "[% var i = 0; j = 0; %][% while(i < 4){ %][% for(j = 0; j < i; j++){ %][%= i %] - [%= j %] | [% } %][% i++ %][% } %]";

    var resetSettings = function() {
      pie.string.setTemplateSettings("[%", "%]", "-", "=", "");
    };

    beforeEach(function() {
      resetSettings();

      this.simple = pie.string.template(simpleTemplate);
      this.quote = pie.string.template(quoteTemplate);
      this.loop = pie.string.template(loopTemplate);
    });

    afterEach(resetSettings);

    it("should create a function which accepts a single argument, data", function() {
      expect(typeof this.simple).toEqual('function');
      expect(this.simple.length).toEqual(1); // arity check.
    });

    it("should be able to evaluate sections without appending any content", function() {
      var output = this.simple({foo: {}});
      expect(output.match(/^Hi/)).toBeTruthy();
    });

    it("should be able to evaluate sections without escaping", function() {
      var output = this.simple({foo: {name: '<h1>Site</h1>'}});
      expect(output.match(/h1>\.$/)).toBeTruthy();
    });

    it("should be able to escape html content", function() {
      var output = this.simple({first_name: '<h1>Doug</h1>', foo: {}});
      expect(output.match(/&lt;/)).toBeTruthy();
    });

    it("should not leak variables", function() {
      var foo;
      this.simple({foo: {name: 'bar'}, first_name: 'Doug'});
      expect(window.foo).toEqual(undefined);
      expect(foo).toEqual(undefined);
    });

    it("should know how to interpolate things", function() {
      var output = this.simple({foo: {name: '<strong>Site</strong>'}, first_name: '<strong>Doug</strong>'});
      expect(output).toEqual("Hi, &lt;strong&gt;Doug&lt;/strong&gt;. Welcome to <strong>Site</strong>.");
    });

    it("should properly handle quotes inside and outside of interpolations", function() {
      var output = this.quote({a: "foo's", b: "bar's"});
      expect(output).toEqual("Do you know 'Doug' from foo&#39;s company or \"John\" from bar's company?");
    });

    it("should be fine with loops", function() {
      var output = this.loop();
      expect(output).toEqual("1 - 0 | 2 - 0 | 2 - 1 | 3 - 0 | 3 - 1 | 3 - 2 | ");
    });

    it("should allow other variable declarations to be made", function() {
      var tmpl = pie.string.template("Hi, [%= doug %]", "var doug = 'Doug'");
      var output = tmpl();
      expect(output).toEqual("Hi, Doug");
    });

    it("should allow a different syntax", function() {
      pie.string.setTemplateSettings("<#", "#>", "~", "+", "!");

      var tmpl = pie.string.template("<#! var foo = 2; #>Hi, <#~ data.bar #>. You have <#+ foo #> messages.");
      var output = tmpl({bar: '<i>Doug</i>'});
      expect(output).toEqual("Hi, &lt;i&gt;Doug&lt;/i&gt;. You have 2 messages.");
    });

  });
});
