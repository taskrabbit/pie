/* global bindings */
window.app = new pie.app({
  viewNamespace: 'forms'
});


app.router.route({
  '/examples/form-views.html' : {view: 'layout'}
});



pie.ns('forms').layout = pie.formView.extend('layout', {
  init: function() {

    this._super({
      template: 'layout',
      renderOnSetup: true,
      validationStrategy: 'validate',
      fields: [
        {
          name: 'first_name'
        }, {
          name: 'last_name'
        }, {
          name: 'email',
          validation: {
            email: true
          }
        }, {
          name: 'password',
          validation: {
            length: {
              gte: 6
            }
          }
        }, {
          name: 'interests',
          binding: {
            dataType: 'array'
          },
          validation: {
            chosen: true
          }
        }, {
          name: 'tos',
          binding: {
            dataType: 'boolean'
          },
          validation: {
            chosen: true
          }
        }, {
          name: 'mailing_list',
          binding: {
            dataType: 'boolean'
          },
          validation: {
            chosen: true
          }
        }
      ]
    });

    this.onChange(this.model, this.modelChanged.bind(this), '_version');
    this.emitter.once('afterSetup', this.modelChanged.bind(this));
  },

  modelChanged: function() {
    var str = JSON.stringify(this.model.data, null, '  ');
    this.qs('textarea[name="json"]').value = str;
    this.qs('textarea[name="submission"]').value = '';
  },

  // By default, this will conduct an ajax request with the "ajax" options provided in the constructor.
  // Since we're just showing an example, we're just outputting the submission data on the page.
  onValid: function() {
    this.prepareSubmissionData(function(d) {
      var str = JSON.stringify(d, null, '  ');
      this.qs('textarea[name="submission"]').value = str;
    }.bind(this));
  }

});



