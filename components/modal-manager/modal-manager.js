define(function(require){
  var utils = require('utils');

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
    console.log('ModalManager.open', modal, options, this.Modals);
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
        this.$el.append(this.Modals[modal].$el);
      }

      // Now open the new modal
      this.modals[modal].open(options);
      this.openModals[modal] = this.modals[modal];

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

      return this;
    }
  });
});