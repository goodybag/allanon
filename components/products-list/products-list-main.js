define(function(require){
  var
    utils     = require('utils')
  , ItemView  = require('./products-list-item')
  ;

  require('less!./products-list-style');

  return utils.View.extend({
    className: 'products-list'

  , tagName: 'ul'

  , initialize: function(options){
      options = options || {};

      this.products = [];
      this._views = [];

      this.ItemView = options.ItemView || ItemView;
    }

  , provideData: function(data){
      this.products = data;

      return this;
    }

  , render: function(){
      var fragment  = document.createDocumentFragment();

      // Remove old views
      if (this._views.length > 0){
        for (var i = 0, l = this._views.length; i < l; ++i){
          this._views[i].remove();
        }
      }

      this._views = [];

      for (var i = 0, l = this.products.length, item; i < l; ++i){
        this._views.push( item = new this.ItemView({
          model: this.products[i]
        }).render() );

        // Should make this dynamic based on screen-width
        if (i % 5 == 0) item.$el.addClass('first');

        fragment.appendChild( item.el );

        item.on('feelings:change', utils.bind(this.onProductFeelingChange, this));
      }

      this.$el.html("<h1>hello</h1>");
      this.$el.html(fragment);

      return this;
    }

  , onProductFeelingChange: function(feeling, direction, model){
      this.trigger('feelings:change', feeling, direction, model);
    }
  });
});
