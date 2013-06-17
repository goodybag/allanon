define(function(require) {
  var template = require('hbt!./reset-password-tmpl');
  var Components  = require('../../components/index');
  var user = require('user');
  var utils = require('utils');
  var troller = require('troller');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span4 reset-password-modal',

    events: {
      'submit .reset-password-form': 'submitPasswordReset'
    },

    initialize: function(options) {
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      this.render();

      this.$pass1 = this.$el.find('.field-password');
      this.$pass2 = this.$el.find('.field-password-confirm');

      return this;
    },

    onOpen: function(options) {
      this.token = options.token;
      this.$pass1.focus();
    },

    onClose: function() {
      utils.history.navigate('/', {trigger: true});
    },

    render: function() {
      this.$el.html(template());
    },

    submitPasswordReset: function(e) {
      e.preventDefault();

      var pass = this.$pass1.val();
      if (pass == null || pass === '' || pass !== this.$pass2.val()) return troller.error('Must supply matching passwords.');

      var self = this;
      // TODO: client side validation
      troller.spinner.spin();
      user.resetPassword(self.token, pass, function(err) {
        troller.spinner.stop();
        if (err) return troller.error(err);
        self.close();
      });
    }
  });
});
