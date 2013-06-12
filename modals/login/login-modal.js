define(function(require) {
  var template = require('hbt!./login-tmpl');
  var Components  = require('../../components/index');
  var user = require('user');
  var troller = require('troller');

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span4 login-modal',

    events: {},

    initialize: function(options) {
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      this.render();
      return this;
    },

    render: function() {
      this.$el.html(template());
    },

    auth: function(e) {
    },

    oauth: function(e) {
    },

    forgotPassword: function(e) {
    }
  });
});
