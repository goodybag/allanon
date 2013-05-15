define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('../../components/index')
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

  , onAddCollectionSubmit: function(e){
      e.preventDefault();

      var this_ = this;

      troller.spinner.spin();
      user.addCollection(this.$el.find('#add-new-collection-name').val(), function(error){
        troller.spinner.stop();

        if (error) return troller.error(error);

        this_.$el.find('#add-new-collection-name').val("");
        this_.close();
      });
    }

  , onCancelClick: function(e){
      utils.history.navigate(
        utils.history.location.hash.replace('/add-new-collection', '')
      );

      this.close();
    }
  });
});