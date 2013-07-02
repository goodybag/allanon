define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    className: 'modal hide fade'

  , events: {}

  , initialize: function(options){
      var this_ = this;

      options = options || {};

      this.$el.attr('role', 'dialog');

      this.modal = new utils.Modal(
        this.el
      , utils.extend({
          backdrop: true
        , show:     true
        }, options)
      );

      // Stupid modal does stupid stuff with events, so lets manually dig in
      this.modal.hideModal = function(){
        utils.Modal.prototype.hideModal.apply(this_.modal, arguments);
        this_.trigger('close', this_);
      };

      // Setup events outside of prototype hash to make extensibility easier
      if (!options.noAutoEvents){
        this.events['click .modal-close'] = 'close';
      }
    }

  , setContent: function(content){
      this.$el.html(content);
      return this;
    }

  , open: function(options){
      this.modal.show();
      this.trigger('open', options, this);
      if (this.onOpen) this.onOpen(options);
      return this;
    }

  , close: function(options){
      options = options || {};
      this.modal.hide();
      if (typeof this.onClose === 'function' && !options.silent) this.onClose();
      return this;
    }
  });
});
