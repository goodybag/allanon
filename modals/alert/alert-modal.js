define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('components')
  , template    = require('hbt!./alert-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span5 alert-modal'

  , tagName: 'section'

  , events: {
      'click .btn-close':  'onCloseClick'
    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      this.options = options || {};
      this.render();
      return this;
    }

  , render: function() {
      this.$el.html(
        template({
          message: this.options.message
        , error:   this.options.error
        }) 
      );
      return this;
    }

  , onCloseClick: function(e) {
      e.preventDefault();
      this.close();
    }
  });
});
