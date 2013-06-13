define(function(require) {
  var template = require('hbt!./login-tmpl');
  var Components  = require('../../components/index');
  var user = require('user');
  var troller = require('troller');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span4 login-modal',

    events: {
      'click .facebook-login-button': 'oauth',
      'submit .login-form':           'auth',
      'click .forgot-password':       'forgotPassword'
    },

    initialize: function(options) {
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      this.render();
      return this;
    },

    render: function() {
      this.$el.html(template());
    },

    completedLogin: function(err) {
      if (err) return troller.error(err);
      this.close();
      // TODO: redirect to logged in state
      window.location.reload();
    },

    auth: function(e) {
      // log in
      var email = this.$el.find('.field-email').val();
      var password = this.$el.find('.field-password').val();
      var remember = this.$el.find('.remember-checkbox').is('checked');
      // validation goes here
      user.auth(email, password, remember, this.completedLogin);
    },

    oauth: function(e) {
      // login with facebook
    },

    forgotPassword: function(e) {
      // Dismiss this modal and call up the forgot password modal
      this.close();
    }
  });
});
