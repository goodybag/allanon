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

  , initialize: function(options){
      Modal.prototype.initialize.apply(this, options);

      this.productId = options.productId;
      this.product = options.product || {}

      this.on('open',   this.onOpen);
      console.log('register ProductDetails.close');
      this.on('close',  this.onClose);

      return this;
    }

  , render: function(){
      this.$el.html(
        template({ product: this.product })
      );

      return this;
    }

  , onOpen: function(options){
      if (!this.productId || (!options && options.productId)) return this;

      // If they provided a product already, no need to fetch
      if (options.product){
        this.product = options.product;
        this.productId = this.product.id;
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

        this_.render();
      });
    }

  , onClose: function(){
    console.log('ProductDetailsModal.onClose');
      // The modal was closed by navigating away
      if (utils.history.location.hash.indexOf('/products/') == -1) return;

      // Navigate to page underneath
      utils.history.navigate(
        utils.history.location.hash.replace('/products/' + this.productId, '').substring(1)
      );
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