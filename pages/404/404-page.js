define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./404-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-404'

  , title: 'Not Found'

  , events: {

    }

  , initialize: function(){
    }

  , render: function(){
      this.$el.html( template() );
      return this;
    }
  });
});
