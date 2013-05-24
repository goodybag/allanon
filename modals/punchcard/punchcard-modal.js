define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('../../components/index')
  , template    = require('hbt!./punchcard-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span8 punchcard-modal'

  , tagName: 'section'

  , events: {

    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      return this;
    }

  , onOpen: function(options){
      this.punchcard = options.punchcard;
      this.render();
    }

  , render: function(){
      this.$el.html( template({ punchcard: this.punchcard }) );
      return this;
    }
  });
});