define(function(require) {
  var template = require('hbt!./enter-keytag-tmpl');
  var Components  = require('../../components/index');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 enter-keytag-modal'

  , events: {
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
  });
});
