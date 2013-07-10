define(function(require){
  var
    utils     = require('utils')
  , models    = require('models')
  , ItemView  = require('./products-list-item')
  ;

  require('less!./products-list-style');

  var ProductsCollection = utils.Collection.extend({
    model: models.Product
  , url: '/products'
  });

  return utils.View.extend({
    className: 'products-list'

  , tagName: 'ul'

  , initialize: function(options) {
      options = options || {};



      this.products = new ProductsCollection();;
      this._views = [];

      this.ItemView = options.ItemView || ItemView;
    }

  , provideData: function(data) {
      this.products.reset(data);

      return this;
    }

  , render: function() {
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
          model: this.products.at(i)
        }).render() );

        // Should make this dynamic based on screen-width
        if (i % 5 === 0) item.$el.addClass('first');

        fragment.appendChild( item.el );

        item.on('product-details-modal:open', utils.bind(this.onProductModalOpen, this));
        item.on('product-details-modal:close', utils.bind(this.onProductModalClose, this));
      }

      this.$el.html(fragment);

      return this;
    }

  , onProductModalOpen: function(model){
      this.trigger('product-details-modal:open', model);
    }

  , onProductModalClose: function(){
      this.trigger('product-details-modal:close');
    }
  });
});
