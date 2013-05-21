define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./settings-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-settings'

  , events: {
      'submit #form-settings':      'onFormSubmit'
    }

  , initialize: function(){
      this.model = user;
    }

  , render: function(){
      this.$el.html( template({ user: this.model.toJSON() }) );
      return this;
    }

  , onFormSubmit: function(e){
      troller.spinner.spin();
      var this_ = this, password;
      e.preventDefault();
      this.updateModelWithFormData();
      this.$el.find('form .error').removeClass('error');

      if ((password = this.$el.find('#form-settings-password').val()).length > 0){
        if (this.$el.find('#form-settings-password-confirm').val() != password){
          troller.spinner.stop();
          return troller.error({ message: "Passwords must match", details: { password: null } }, this.$el);
        }
      }

      this.model.save(function(error){
        troller.spinner.stop();
        if (error){
          if (error.name == 'SCREENNAME_TAKEN') error.details = {
            screenName: null
          }
          return troller.error(error, this_.$el)
        }
      });

    }
  });
});