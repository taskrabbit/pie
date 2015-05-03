/* global bindings */
window.app = new pie.app({
  routeHandlerOptions: {
    viewNamespace: 'forms'
  }
});


app.router.map({
  '/examples/form-views.html' : {view: 'layout'}
});



pie.ns('forms').layout = pie.formView.extend('layout', {

  debugName: 'view',

  init: function() {

    this._super({
      template: 'layout',
      renderOnSetup: true,
      validationStrategy: 'validate',
      fields: [
        {
          name: 'first_name',
          binding: {
            debounce: true
          }
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
            presence: {messageKey: 'chosen'}
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

    this.model.compute('fullName', function(){
      return pie.array.compact([this.get('first_name'), this.get('last_name')]).join(" ") || 'Unknown';
    }, 'first_name', 'last_name');

  },

  setup: function() {
    this.onChange(this.model, this.modelChanged.bind(this), '_version');
    this.emitter.once('afterSetup', this.modelChanged.bind(this));

    this.bind({
      attr: 'title'
    });

    this.bind({
      attr: 'title',
      type: 'attribute',
      sel: '.title',
      toModel: false,
      options: {
        attribute: 'style'
      }
    });

    this.bind({
      attr: 'title',
      type: 'class',
      sel: '.title',
      toModel: false,
      options: {
        className: '_value_'
      }
    });

    this.bind({
      attr: 'fullName',
      type: 'text',
      sel: '.full-name',
      toModel: false
    });

    this._super();
  },

  modelChanged: function(changes) {
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



