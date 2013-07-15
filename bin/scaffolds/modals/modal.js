define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('components')
  , template    = require('hbt!./NAME-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span8 NAME-modal'

  , tagName: 'section'

  , events: {

    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      return this;
    }

  , render: function(){
      this.$el.html( template({ }) );

      return this;
    }
  });
});