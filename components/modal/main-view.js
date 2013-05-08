define(function(require){
  var utils = require('../../lib/utils');

  return utils.View.extend({
    className: 'modal hide fade'

  , initialize: function(options){
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
    }

  , setContent: function(content){
      this.$el.html(content);

      return this;
    }

  , open: function(){
      this.modal.show();

      return this;
    }

  , close: function(){
      this.modal.hide();

      return this;
    }
  });
});