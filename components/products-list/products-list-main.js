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

      this.products = options.products || new ProductsCollection();

      this.collectionEvents = {
        'coll-add': this.onCollectionAdd
        , 'reset': this.onReset
      };

      this.listenTo(this.products, this.collectionEvents);

      this._views = [];

      this.ItemView = options.ItemView || ItemView;
    }

  , provideData: function(data) {
      if (data instanceof utils.Collection) {
        this.stopListening(this.products);
        this.products = data;
        this.listenTo(this.products, this.collectionEvents);
      } else
        this.products.reset(data);
      return this;
    }

  , prepareViews: function(products) {
      var self = this;
      return { fragment: fragment, views: views };
    }

  , render: function(models, options) {
      options = options || {};

      var reset = options.reset || models == null;
      var products = models || this.products.models;

      // Remove old views
      if (reset) utils.invoke(this._views, 'remove');

      var self = this;

      var fragment = document.createDocumentFragment();
      var views = utils.map(products, function(prod) {
        var item = (new self.ItemView( {model: prod} )).render();
        fragment.appendChild(item.el);
        item.on('product-details-modal:open', self.onProductModalOpen, self);
        item.on('product-details-modal:close', self.onProductModalClose, self);
        return item;
      });

      this._views = reset ? views : this._views.concat(views);
      var method = reset ? 'html' : 'append';
      this.$el[method](fragment);

      if (!options.silent) this.trigger('render', products, this, options);

      return this;
    }

  , show: function() {
      if (this.$el.is(':hidden')) this.trigger('show', this);
      this.$el.show();
    }

  , hide: function() {
      if (this.$el.is(':visible')) this.trigger('hide', this);
      this.$el.hide();
    }

  , onCollectionAdd: function(added, coll, options) {
      this.render(added);
    }

  , onReset: function() {
      this.render(null, {reset: true});
    }

  , onProductModalOpen: function(model){
      this.trigger('product-details-modal:open', model);
    }

  , onProductModalClose: function(){
      this.trigger('product-details-modal:close');
    }
  });
});
