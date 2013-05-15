define(function(require){
  var utils = require('../../lib/utils');

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
        , keyboard: true
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
      return this;
    }

  , close: function(){
      this.modal.hide();
      return this;
    }
  });
});