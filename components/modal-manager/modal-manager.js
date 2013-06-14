define(function(require){
  var
    utils   = require('utils')
  , troller = require('troller')
  ;

  return utils.View.extend({
    className: 'pages'

  , initialize: function(options){
      options = options || {};

      // Non-instantiated views
      this.Modals = options.Modals || {};

      // Instantiated views
      this.modals = {};

      // Currently open modals
      this.openModals = {};

      // Useful to know when deciding on whether to hide backdrop or not
      this.numOpen = 0;

      return this;
    }

  , provide: function(Modals){
      this.Modals = Modals;
      return this;
    }

  , renderCurrent: function(){
      if (this.current){
        this.modals[this.current].render();
        this.modals[this.current].delegateEvents();
      }
      return this;
    }

  , open: function(modal, options, callback){
      if (typeof options == 'function'){
        callback = options;
        options = null;
      }

      if (!this.Modals[modal]){
        // TODO: don't do this
        var error = {
          message: "Cannot find modal: " + modal
        , type: 'UNKNOWN_MODAL_REQUEST'
        , modal: modal
        };

        if (callback) callback(error);
        else troller.error(error);

        return this;
      }

      if (!this.modals[modal]){
        this.modals[modal] = new this.Modals[modal](options);
        this.modals[modal].on('close', utils.bind(this.onModalClose, this));
        this.modals[modal].on('open', utils.bind(this.onModalOpen, this));
        this.$el.append(this.modals[modal].$el);
      }

      // Only show backdrop if we have 0 open
      this.modals[modal].modal.options.backdrop = this.numOpen == 0;

      // Now open the new modal
      this.modals[modal].open(options);
      this.openModals[modal] = this.modals[modal];

      var self = this;
      // if it's the first modal open, add an event to close all modals on backdrop click
      if (this.numOpen === 1) utils.dom('.modal-backdrop').click(function(e){
        self.close();
      });

      utils.dom(document.body).css( 'min-height', this.modals[modal].$el.height() );

      if (callback) callback(null, this.modals[modal]);

      return this;
    }

  , close: function(modal){
      if (modal){
        this.modals[modal].close();
        delete this.openModals[modal];
      } else {
        for (var key in this.openModals){
          this.modals[key].close();
          delete this.openModals[key];
        }
      }

      utils.dom(document.body).css('min-height', null);

      return this;
    }

  , onModalOpen: function(modal){
      this.numOpen++;
    }

  , onModalClose: function(modal){
      this.numOpen--;
    }
  });
});
