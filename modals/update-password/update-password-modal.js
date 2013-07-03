define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('components')
  , template    = require('hbt!./update-password-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 edit-collection-modal'

  , tagName: 'section'

  , events: {
      'submit #update-password-form':         'onUpdatePasswordSubmit'
    , 'click .btn-cancel':                    'onCancelClick'
    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      // Not much going on in this modal, so render right away
      this.render();
      return this;
    }

  , onOpen: function(options){
      // Will be deleted once password is saved
      this.password = options.password;
      this.onDone = options.onDone || utils.noop;
      this.$el.find('.field-password').focus();
    }

  , render: function(){
      this.$el.html( template() );
      return this;
    }

  , onUpdatePasswordSubmit: function(e){
      e.preventDefault();

      var this_ = this;

      troller.spinner.spin();
      user.updatePassword(this.$el.find('.field-password').val(), this.password, function(error){
        troller.spinner.stop();

        if (error) return troller.error(error, this.$el);

        this_.close();
        this_.onDone();
      });

      delete this.password;
      this.$el.find('.field-password').val("");
    }

  , onCancelClick: function(e){
      e.preventDefault();
      this.close();
    }
  });
});