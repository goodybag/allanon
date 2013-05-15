define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('../../components/index')
  , template    = require('hbt!./add-new-collection-tmpl')
  ;

  return Modal.extend({
    className: 'modal hide fade modal-span5 add-new-collection-modal'

  , events: {

    }

  , initialize: function(options){
      return this;
    }

  , render: function(){
      this.$el.html( template() );
    }
  });
});