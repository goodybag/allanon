define(function(require){
  var utils       = require('utils');
  var config      = require('config');
  var user        = require('user');
  var troller     = require('troller');
  var Components  = require('../../components/index');

  var template    = require('hbt!./card-update-tmpl');

  return Components.Pages.Page.extend({
    className: 'page page-card-update',

    events: {
      'click cancel-card-update':  'cancel',
      'click confirm-card-update': 'submit'
    },

    onOpen: function(options) {
      this.token = options.token;
    },

    initialize: function(){
      this.model = user;
    },

    render: function(){
      this.$el.html( template({oldCardId: this.model.get('cardId')}, ) )
      return this;
    }
  });
});
