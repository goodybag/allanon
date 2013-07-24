define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('components')
  , template    = require('hbt!./edit-collection-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 edit-collection-modal'

  , tagName: 'section'

  , events: {
      'submit #edit-collection-form':         'onEditCollectionSubmit'
    , 'click .btn-delete':                    'onDeleteClick'
    , 'click .btn-cancel':                    'onCancelClick'
    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      // Not much going on in this modal, so render right away
      this.render();
      return this;
    }

  , onOpen: function(options){
      this.collection = options.collection;
      this.render();
    }

  , render: function(){
      this.$el.html( template({ collection: this.collection.toJSON() }) );
      return this;
    }

  , onEditCollectionSubmit: function(e){
      e.preventDefault();

      var this_ = this;
      troller.spinner.spin();
      this.collection.save('name', this.$el.find('#edit-collection-name').val(), {
        error: function(err) { troller.error(error); }
      , success: function(data) {
          this_.$el.find('#edit-collection-name').val("");
          this_.close();
        }
      , complete: function(err, data) { troller.spinner.stop(); }
      });
    }

  , onCancelClick: function(e){
      e.preventDefault();
      this.close();
    }

  , onDeleteClick: function(e){
      e.preventDefault();

      if (!troller.confirm("Are you sure you want to delete this collection? You will not be able to undo this action.")) return;

      troller.spinner.spin();
      this.close();

      this.collection.destroy({
        error: function(err) { troller.error(error); }
      , success: function(data) { utils.history.navigate('/collections', { trigger: true }); }
      , complete: function(err, data) { troller.spinner.stop(); }
      });
    }
  });
});
