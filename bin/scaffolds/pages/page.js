define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , models      = require('models')
  , Components  = require('components')

  , template    = require('hbt!./NAME-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-NAME'

  , events: {
      'click .class-name':          'onClassNameClick'
    }

  , initialize: function(){
      return this;
    }

  , render: function(){
      this.$el.html(
        template({ })
      );
      return this;
    }
  });
});