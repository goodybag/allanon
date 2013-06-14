define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./privacy-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-privacy'

  , events: {

    }

  , initialize: function(){
      this.model = user;
    }

  , render: function(){
      this.$el.html( template() );
      return this;
    }
  });
});