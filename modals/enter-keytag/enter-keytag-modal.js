define(function(require) {
  var template   = require('hbt!./enter-keytag-tmpl');
  var Components = require('components');
  var user       = require('user');
  var utils      = require('utils');
  var troller    = require('troller');


  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 enter-keytag-modal'

  , events: {
    'click #view-locations-btn'   : 'showLocations',
    'submit #add-keytag-form' : 'updateKeytag'
    }

  , initialize: function(options) {
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      // Not much going on in this modal, so render right away
      this.render();
      return this;
    }

  , render: function() {
      this.$el.html(template());
    }

  , updateKeytag: function(e) {
      e.preventDefault();

      var this_ = this;

      //TODO: validate form
      troller.spinner.spin();
      user.save({cardId: this.$el.find('#keytag').val()}, {
        error: function(err) { troller.error(err); }
      , success: function(data) {
          this_.$el.find('#keytag').val('');
          this_.close();
        }
      , complete: function(err, data) {
          troller.spinner.stop();
        }
      , patch: true
      });
    }

  , showLocations: function(e) {
     utils.history.navigate('/locations', {trigger: true});
    }
  });
});
