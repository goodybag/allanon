define(function(require){
  var
    utils       = require('utils')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')
  , Modal       = Components.Modal.Main

  , template    = require('hbt!./product-details-tmpl')
  ;

  return Modal.extend({
    className: 'modal hide fade modal-span7 product-details-modal'

  , children: {
      wlt:              new Components.WLT.Main()
    , addToCollections: new Componenets.AddToCollections.Main()
    }

  , regions: {
      wlt:              '.wlt'
    , addToCollections: '.add-to-collections'
    }

  , initialize: function(options){
      Modal.prototype.initialize.apply(this, options);

      this.productId = options.productId;
      this.product = options.product || {};

      if (this.product && this.product.id) this.children.wlt.provideModel(this.product);

      this.on('open',   this.onOpen);
      this.on('close',  this.onClose);

      this.children.wlt.on('wlt:change', utils.bind(this.onWltChange, this));

      this.currentPage = options.currentPage || 'details';

      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          product: this.product
        })
      );

      this.applyRegions();

      return this;
    }

    // Whatever - we should generalize view switching
    // we've got the page manager, but the abstraction seemd overkill for this
  , showPage: function(page){
      if (this.currentPage == page) return this;

      this.$el.find('.' + this.currentPage + '-page').fade(0);
      this.$el.find('.' + (this.currentPage = page) + '-page').fade(1);

      return this;
    }

  , onOpen: function(options){
      if (!this.productId || (!options && options.productId)) return this;

      // If they provided a product already, no need to fetch
      if (options.product){
        this.product = options.product;
        this.productId = this.product.id;
        this.children.wlt.provideModel(this.product);
        return this.render();
      }

      // Same thing as before, and we've likely already rendered
      if (options.productId == this.productId && this.productId == this.product.id)
        return this;

      if (options.productId) this.productId = options.productId;

      troller.spinner.spin();

      var this_ = this;

      return this.fetchProduct(function(error, product){
        troller.spinner.stop();

        if (error) return troller.error(error);

        if (this_.product) this_.children.wlt.provideModel(this_.product);

        this_.render();
      });
    }

  , onClose: function(){
      // The modal was closed by navigating away
      if (utils.history.location.hash.indexOf('/products/') == -1) return;

      // Navigate to page underneath
      utils.history.navigate(
        utils.history.location.hash.replace('/products/' + this.productId, '').substring(1)
      );
    }

  , onWltChange: function(change, model){
      // Update like count if necessary
      if (change == 'like')
        this.$el.find('.product-stat-likes > .product-stat-value').text(model.likes);
    }

  , fetchProduct: function(callback){
      var this_ = this;

      api.products.get(this.productId, function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.product = result;

        if (callback) callback(null, result);
      });

      return this;
    }
  });
});