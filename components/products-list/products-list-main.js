define(function(require){
  var
    utils     = require('utils')
  , ItemView  = require('./product-list-item')
  ;

  require('less!./products-list-style');

  return utils.View.extend({
    className: 'products-list'

  , tagName: 'ul'

  , initialize: function(options){
      this.products = [];

      this.ItemView = options.ItemView || ItemView;
    }

  , provideData: function(data){
      this.products = data;

      return this;
    }

  , render: function(){
      var fragment  = document.createDocumentFragment();

      for (var i = 0, l = this.products.length, item; i < l; ++i){
        item = new this.ItemView({
          model: this.products[i]
        }).render();

        // Should make this dynamic based on screen-width
        if (i % 5 == 0) item.$el.addClass('first');

        fragment.appendChild( item.el );
      }

      this.$el.html("");
      this.$el.html(fragment);

      return this;
    }
  });
});