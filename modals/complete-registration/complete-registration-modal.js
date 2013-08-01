define(function(require) {
  var template    = require('hbt!../register/register-tmpl');
  var Components  = require('components');
  var utils       = require('utils');
  var user        = require('user');
  var api         = require('api');
  var config      = require('config');
  var troller     = require('troller');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span4 login-modal complete-registration-modal',

    events: {
      'click .btn-fb-connect': 'oauth',
      'submit .register-form':        'register'
    },

    initialize: function(options) {
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      this.on('close', this.onClose);
      this.render();
      return this;
    },

    onOpen: function(options) {
      this.token = options.token;
      api.users.getPartialRegistration(this.token, function(err, results) {
        if (err) {
          if (err.status === 404) {
            troller.error('Bad Registration Token');
            return utils.history.navigate('/', {trigger: true});
          }
          return troller.error(err);
        }

        if (results != null && results.data != null && typeof results.data.email === 'string')
          this.$el.find('.field-email').val(results.data.email);
      });
      this.$el.find('.field-username').focus();
    },

    render: function() {
      this.$el.html(template());
    },

    onClose: function(e) {
      utils.history.navigate('/', {trigger: true});
    },

    completedRegistration: function(err) {
      troller.spinner.stop();
      if (err) return troller.error(err);
      utils.history.navigate('/explore', {trigger: true, replace: true });
    },

    register: function(e) {
      // log in
      e.preventDefault();
      var username = this.$el.find('.field-username').val();
      var email = this.$el.find('.field-email').val();
      var password = this.$el.find('.field-password').val();
      var confirmPassword = this.$el.find('.field-password-confirm').val();
      if (password === '' || password !== confirmPassword) return troller.error('Must enter matching passwords');

      troller.spinner.spin();
      user.completeRegistration(this.token, email, password, username, this.completedRegistration);
    },

    oauth: function(e) {
      // login with facebook
      api.session.getOauthUrl(config.oauth.redirectUrl, 'facebook', function(error, result) {
        if (error) return troller.error(error);
        if (result == null || typeof result.url !== 'string') return troller.error('no redirect url'); // TODO: better error
        window.location.href = result.url;
      });
    }
  });
});
