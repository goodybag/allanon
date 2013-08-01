define(function(require) {
  var template    = require('hbt!./register-tmpl');
  var Components  = require('components');
  var utils       = require('utils');
  var user        = require('user');
  var api         = require('api');
  var config      = require('config');
  var troller     = require('troller');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span4 register-modal',

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

    onOpen: function() {
      if (user.loggedIn) utils.history.history.back();
      this.$el.find('.field-username').focus();
    },

    render: function() {
      this.$el.html(template());
    },

    completedRegistration: function(err) {
      troller.spinner.stop();
      if (err) return troller.error(err, this.$el);
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
      user.register(email, password, username, utils.bind(this.completedRegistration, this));
    },

    oauth: function(e) {
      // login with facebook
      api.session.getOauthUrl(config.oauth.redirectUrl, 'facebook', function(error, result) {
        if (error) return troller.error(error);
        if (result == null || typeof result.url !== 'string') return troller.error('no redirect url'); // TODO: better error

        utils.cookie('gb_hash', utils.history.location.hash);

        window.location.href = result.url;
      });
    }
  });
});
