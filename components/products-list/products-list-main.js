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

  , prepareViews: function(products) {
      var self = this;
      var fragment = document.createDocumentFragment();
      var views = utils.map(products, function(prod) {
        var item = (new self.ItemView( {model: prod} )).render();
        fragment.appendChild(item.el);
        item.on('product-details-modal:open', self.onProductModalOpen, self);
        item.on('product-details-modal:close', self.onProductModalClose, self);
        return item;
      });
      return { fragment: fragment, views: views };
    }

  , render: function() {
      // Remove old views
      utils.invoke(this._views, 'remove');

      var res = this.prepareViews(this.products.models);
      this._views = res.views;
      this.$el.html(res.fragment);

      return this;
    }

  , appendRender: function(data) {
      var self = this;
      this.products.add(data);
      var addedProds = data instanceof utils.Collection ? data.models : utils.map(data, function(p) {
        return self.products.get(p.id);
      });

      var res = this.prepareViews(addedProds);
      this._views = this._views.concat(res.views);
      this.$el.append(res.fragment);

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
