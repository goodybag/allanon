define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('components')

  , template    = require('hbt!./support-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-support'

  , title: 'Goodybag Support'

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
