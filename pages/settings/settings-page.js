define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('components')

  , template    = require('hbt!./settings-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-settings'

  , title: 'Settings'

  , events: {
      'submit #form-settings':      'onFormSubmit'
    , 'click .btn-change-photo':    'onChangePhotoClick'
    }

  , initialize: function(){
      this.model = user;
      this.children = {
        alert: new Components.Alert.Main()
      };

      // Bind this view to various helpers
      utils.bindAll(this, 'showSuccessAlert', 'showMismatchingPasswordsAlert', 'showScreenNameTakenAlert');
    }

  , render: function(){
      this.$el.html( template({ user: this.model.toJSON() }) );
      this.children.alert.setElement('.alert-container').render();
      this.children.alert.hide();
      return this;
    }

  , onFormSubmit: function(e){
      var this_ = this, password;
      e.preventDefault();

      (function(next){
        troller.spinner.spin();

        if ((password = this_.$el.find('#form-settings-password').val()).length > 0){
          if (this_.$el.find('#form-settings-password-confirm').val() != password){
            return troller.error({ message: "Passwords must match", details: { password: null } }, this_.$el, this_.showMismatchingPasswordsAlert);
          }

          return troller.modals.open('update-password', {
            password: password
          , onDone:   next
          });
        }

        next();
      })(function(){
        var updates = this_.getFormDataForModel();
        this_.$el.find('form .error').removeClass('error');

        this_.model.save(updates, {
          success: function(data) {
            this_.showSuccessAlert();
          }
        , error: function(error) {
            if (error.name == 'SCREENNAME_TAKEN') error.details = { screenName: null };
            return troller.error(error, this_.$el, this_.showScreenNameTakenAlert);
          }
        , complete: function(error, data) {
            troller.spinner.stop();
          }
        , patch: true
        });
      });

      this.$el.find('.field-password').val("");
    }

  , showSuccessAlert: function(msg, error) {
      this.children.alert.show({
        success: true
      , header: 'Settings Saved!'
      , randomize: true
      , render: true
      });
    }

  , showMismatchingPasswordsAlert: function(msg, error) {
      this.children.alert.show({
        success: false
      , header: 'Oh no!'
      , message: msg
      , render: true
      });
    }

  , showScreenNameTakenAlert: function(msg, error) {
      this.children.alert.show({
        success: false
      , header: 'Warning!'
      , message: msg
      , render: true
      });
    }

  , onChangePhotoClick: function(e){
      var this_ = this;
      utils.pickFile(function(error, file){
        if (error) return troller.error(error);

        this_.model.set('avatarUrl', file.url);
        this_.model.trigger('change:avatarUrl');
        this_.render();
        this_.model.save();
      });
    }

  , onHide: function() {
      utils.invoke(this.children, 'close');
    }
  });
});
