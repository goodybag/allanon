define(function(require) {
  require('backbone');

  // add regions to backbone views
  return Backbone.View.extend({
    applyRegions: function(){
      var append;
      for (var key in this.regions){
        if (key[key.length - 1] == '>'){
          append = true;
          key = key.substring(0, key.length - 1);
        } else append = false;

        if (!(key in this.children)) continue;

        this.children[key].$el.remove();
        this.children[key].undelegateEvents();
        if (append){
          this.$el.find(this.regions[key + '>']).append(
            this.children[key].$el
          );
        } else {
          this.children[key].setElement(
            this.$el.find(this.regions[key]).eq(0)
          );
        }

        this.children[key].render();
        this.children[key].delegateEvents();

        if (this.children[key].constructor.prototype.className)
          this.children[key].$el.addClass(this.children[key].constructor.prototype.className);
      }
      return this;
    }

  , formDefaults: {}

  // I'm still not sure I like this method
  , getFormDataForModel: function(){
      var $el;
      var obj = {};
      for (var key in this.model.attributes){
        if (($el = this.$el.find('.field-' + key)).length > 0){
          obj[key] = _.contains(['radio', 'checkbox'], $el.attr('type')) ? $el.is(':checked') : $el.val();
          if (key === 'price') obj[key] = parseInt(obj[key] * 100);
        }
      }
      return _.defaults(obj, this.formDefaults);
    }
  });
});
