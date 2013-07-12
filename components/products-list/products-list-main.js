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
      var fragment = document.createDocumentFragment();

      // Remove old views
      utils.invoke(this._views, 'remove');

      var self = this;
      this._views = this.products.map(function(prod) {
        var item = (new self.ItemView( {model: prod} )).render();
        fragment.appendChild(item.el);
        item.on('product-details-modal:open', self.onProductModalOpen, self);
        item.on('product-details-modal:close', self.onProductModalClose, self);
        return item;
      });

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
