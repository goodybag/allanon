define(function(require){
  var
    utils = require('../../lib/utils')
  , config = require('../../config')
  ;

  return utils.View.extend({
    className: 'page'

  , setPageManager: function(manager){
      this.pageManager = manager;
      return this;
    }

  , render: function(){
      this.$el.html(this.template());
      return this;
    }

  , show: function(options){
      this.$el.css('display', 'block');
      if (this.onShow) this.onShow(options);
      return this;
    }

  , hide: function(options){
      this.$el.css('display', 'none');
      if (this.onHide) this.onHide(options);
      return this;
    }

  , provideData: function(data){
      this.data = data;
      return this;
    }

  , doSuccessThing: function($el, newText){
      newText = newText || config.changeMessages[
        parseInt(Math.random() * config.changeMessages.length)
      ];

      if ($el.hasClass('btn')){
        var oldText = $el.text();
        $el.text(newText).addClass('btn-success');
        setTimeout(function(){
          $el.text(oldText).removeClass('btn-success');
        }, 3000);
      }
    }

  , clearErrors: function(){
      this.$el.find('.error').removeClass('error');
    }
  });
});