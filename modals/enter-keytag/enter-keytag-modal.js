define(function(require) {
  var template = require('hbt!./enter-keytag-tmpl');
  var Components  = require('../../components/index');
  var user = require('user');
  var troller = require('troller');


  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 enter-keytag-modal'

  , events: {
    'click #view-locations'   : 'showLocations',
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
      user.setKeytag(this.$el.find('#keytag').val(), function(error) {
        troller.spinner.stop();

        if (error) return troller.error(error);

        this_.$el.find('#keytag').val('');
        this_.close();
      });
    }

  , showLocations: function(e) {
     window.location.href = 'http://www.goodybag.com/locations.html';
    }
  });
});
