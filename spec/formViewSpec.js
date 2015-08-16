describe("pie.formView", function() {

  beforeEach(function() {
    app.templates.registerTemplate('formViewTest', "[%= data.foo %] - [%= data.bar %]");
  });


  describe('#init', function() {

    it("should work with setup true for a new model", function() {
      var example = pie.formView.extend('example', {
        init: function(data) {
          this.model = pie.model.create({});

          this._super(pie.object.merge({
            template: 'formViewTest',
            fields: [{
              name: 'field',
              binding: {toView: false},
              validation: {presence: true}
            }]
          }, data));
        }
      });

      this.view = example.create({ setup: true });
      expect(this.view.__pieRole).toEqual('view');
      expect(this.view.emitter.hasEvent('setup:after')).toEqual(true);
    });
  });

});
