define(function(require){
  var utils       = require('utils');
  var config      = require('config');
  var user        = require('user');
  var api         = require('api');
  var troller     = require('troller');
  var Components  = require('../../components/index');

  var template    = require('hbt!./card-update-tmpl');

  return Components.Pages.Page.extend({
    className: 'page page-card-update',

    title: 'Update Your Card ID',

    events: {
      'click cancel-card-update':  'cancel',
      'click confirm-card-update': 'submit'
    },

    onShow: function(options) {
      this.token = options.token;

      var self = this;
      troller.spinner.spin();
      api.users.getCardUpdate(this.token, function(err, results) {
        troller.spinner.stop();
        //TODO: handle 404
        if (err) {
          troller.error(err.status === 404 ? 'bad token' : err);
          return utils.history.navigate('/', {trigger: true});
        }

        if (results != null && results.data != null && typeof results.data.newCardId === 'string')
          self.$newCardId.html(results.data.newCardId);
      });
    },

    initialize: function(){
      this.model = user;
      this.render();

      this.$newCardId = this.$el.find('.new-card-id');
    },

    render: function(){
      this.$el.html( template({oldCardId: this.model.get('cardId') || "NONE"} ) )
      return this;
    },

    cancel: function(e) {
      api.users.cancelCardUpdate(this.token, function(err) {
        // ignore errors
        utils.history.navigate('/', {trigger: true});
      });
    },

    submit: function(e) {
      api.users.updateCard(this.token, function(err) {
        if (err) troller.error('Oops! Could not update card id.');
        utils.history.navigate('/', {trigger: true});
      });
    }
  });
});
