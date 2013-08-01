define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('components')
  , models      = require('models')
  , template    = require('hbt!./add-new-collection-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 add-new-collection-modal'

  , tagName: 'section'

  , events: {
      'submit #add-new-collection-form':      'onAddCollectionSubmit'
    , 'click .btn-cancel':                    'onCancelClick'
    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      // Not much going on in this modal, so render right away
      this.render();
      return this;
    }

  , render: function(){
      this.$el.html( template() );
      return this;
    }

  , onClose: function() {
      utils.history.navigate(
        utils.history.location.hash.replace('/add-new-collection', '')
      );
    }

  , onAddCollectionSubmit: function(e){
      e.preventDefault();
      var this_ = this;

      troller.spinner.spin();
      user.collections.create(
        {name: this.$el.find('#add-new-collection-name').val()}
      , {
          error: function(err) {
            troller.error(err);
          }
        , success: function(data) {
            this_.$el.find('#add-new-collection-name').val("");
            this_.close();
          }
        , complete: function(err, data) {
            troller.spinner.stop();
          }
        }
      );
    }

  , onCancelClick: function(e){
      e.preventDefault();
      this.close();
    }
  });
});
