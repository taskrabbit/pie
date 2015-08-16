describe("pie.activeView", function() {

  beforeEach(function() {
    app.templates.registerTemplate('activeViewTest', "[%= data.foo %] - [%= data.bar %]");
  });

  describe("#setup", function() {

    beforeEach(function() {

      this.view = pie.activeView.create({
        template: 'activeViewTest',
        autoRender: true,
        renderOnSetup: true
      });

    });

    it("should render when setup is invoked if renderOnSetup is true", function() {
      spyOn(this.view, 'render');
      this.view.setup();
      expect(this.view.render).toHaveBeenCalled();
    });

    it("should not render on setup if the renderOnSetup options is not true", function() {
      spyOn(this.view, 'render');
      this.view.options.renderOnSetup = 0;
      this.view.setup();
      expect(this.view.render).not.toHaveBeenCalled();
    });

    it("should setup a default render implementation", function() {
      spyOn(this.view, '_renderTemplateToEl');
      this.view.setup();
      expect(this.view._renderTemplateToEl).toHaveBeenCalled();
    });

    it("should use this.model's data as the render data if it's present", function() {
      expect(this.view.renderData()).toEqual({});
      var m = this.view.model = pie.model.create({foo: 'bar', bar: 'baz'});
      expect(this.view.renderData()).toEqual(m.data);
    });

    it("should generate content and apply to this.el based on a template name defined by this.options.template", function() {
      var m = this.view.model = pie.model.create({foo: 'bar', bar: 'baz'});
      this.view.setup();
      expect(this.view.el.innerHTML).toEqual('bar - baz');
    });

    it("should not attempt to render anything if a template name is not provided", function() {
      delete this.view.options.template;
      this.view.setup();
      expect(this.view.el.innerHTML).toEqual('');
    });

    it("should allow rendering to be blocked", function(done) {
      spyOn(this.view, '_renderTemplateToEl');

      this.view.emitter.on('render:around', function(cb) {
        expect(this.view._renderTemplateToEl).not.toHaveBeenCalled();
        cb();
        expect(this.view._renderTemplateToEl).toHaveBeenCalled();
        done();
      }.bind(this));

      this.view.setup();
    });

  });

});
