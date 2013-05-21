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
      var this_ = this, password;
      e.preventDefault();

      (function(next){
        if ((password = this_.$el.find('#form-settings-password').val()).length > 0){
          if (this_.$el.find('#form-settings-password-confirm').val() != password){
            return troller.error({ message: "Passwords must match", details: { password: null } }, this_.$el);
          }

          return troller.modals.open('update-password', {
            password: password
          , onDone:   next
          });
        }

        next();
      })(function(){
        troller.spinner.spin();

        this_.updateModelWithFormData();
        this_.$el.find('form .error').removeClass('error');

        this_.model.save(function(error){
          troller.spinner.stop();

          if (error){
            if (error.name == 'SCREENNAME_TAKEN') error.details = {
              screenName: null
            }

            return troller.error(error, this_.$el)
          }
        });
      });

      this.$el.find('.field-password').val("");
    }
  });
});