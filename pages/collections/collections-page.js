define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , Components  = require('../../components/index')

  , template    = require('hbt!./collections-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-collections'

  , events: {

    }

  , initialize: function(){
      console.log('colelctions');
    }

  , render: function(){
    console.log(template());
      this.$el.html( template() );
      return this;
    }
  });
});