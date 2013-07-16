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

  , updateBehaviors: {}

  , updateModelWithFormData: function(){
      var $el;
      for (var key in this.model.attributes){
        if (($el = this.$el.find('.field-' + key)).length > 0){

          // Extended behavior
          if (this.updateBehaviors[key])
            this.model.set(key, this.updateBehaviors[key]($el));

          // Checkbox or radio
          else if ($el[0].tagName === "INPUT" && ($el[0].type === "checkbox" || $el[0].type === "radio"))
            this.model.set(key, $el[0].checked == true);

          // Textarea
          else if ($el[0].tagName === "TEXTAREA")
            this.model.set(key, $el[0].value);

          // Price needs to be multiplied by 100
          else if ($el.hasClass('field-price'))
            this.model.set(key, $el.val() * 100)

          // Everything else
          else this.model.set(key, $el.val());
        }
      }
      return this;
    }
  });
});
