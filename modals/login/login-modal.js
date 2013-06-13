define(function(require) {
  var template    = require('hbt!./login-tmpl');
  var Components  = require('../../components/index');
  var utils       = require('utils');
  var user        = require('user');
  var api         = require('api');
  var config      = require('config');
  var troller     = require('troller');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span4 login-modal',

    events: {
      'click .facebook-login-button': 'oauth',
      'submit .login-form':           'auth',
      'click .forgot-password':       'forgotPassword'
    },

    initialize: function(options) {
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      this.on('close', this.onClose);
      this.render();
      return this;
    },

    onOpen: function() {
      if (user.get('loggedIn')) utils.history.history.back();
      this.$el.find('.field-email').focus();
    },

    render: function() {
      this.$el.html(template());
    },

    onClose: function(e) {
      if (!user.get('loggedIn')) utils.history.history.back();
    },

    completedLogin: function(err) {
      if (err) return troller.error(err);
      utils.history.navigate('/explore', {trigger: true, replace: true });
    },

    auth: function(e) {
      // log in
      e.preventDefault();
      var email = this.$el.find('.field-email').val();
      var password = this.$el.find('.field-password').val();
      var remember = this.$el.find('.remember-checkbox').is('checked');
      // validation goes here
      user.auth(email, password, remember, this.completedLogin);
    },

    oauth: function(e) {
      // login with facebook
      api.session.getOauthUrl(config.oauth.redirectUrl, 'facebook', function(error, result) {
        if (error) return troller.error(error);
        if (result == null || typeof result.url !== 'string') return troller.error('no redirect url'); // TODO: better error
        window.location.href = result.url;
      });
    },

    forgotPassword: function(e) {
      // Dismiss this modal and call up the forgot password modal
      this.close();
    }
  });
});
