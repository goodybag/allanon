define(function(require){
  var
    utils       = require('utils')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')
  , Modal       = Components.Modal.Main

  , template    = require('hbt!./product-details-tmpl')

  , Pages = {
      'details':            require('./pages/details/index')
    , 'add-to-collections': require('./pages/add-to-collections/index')
    }
  ;

  return Modal.extend({
    className: 'modal hide fade modal-span7 product-details-modal'

  , children: {
      pages: new Components.Pages.Main()
    }

  , regions: {
      // use append syntax because backbone is doing some funky
      // stuff with setElement
      'pages>': '.page-wrapper'
    }

  , initialize: function(options){
      var this_ = this;

      Modal.prototype.initialize.apply(this, options);

      this.productId = options.productId;
      this.product = options.product || {};

      this.children.pages.providePages(Pages);

      this.on('open',   this.onOpen);
      this.on('close',  this.onClose);

      return this;
    }

  , changePage: function(page, options){
      this.children.pages.changePage(page, options);
      return this;
    }

  , render: function(){
      var this_ = this;

      this.$el.html( template({ product: this.product }) );

      this.applyRegions();

      // Show default page
      this.children.pages.changePage('details', function(error, page){
        if (error) return troller.error(error);
        page.provideModel(this_.product);
        page.render();
        page.delegateEvents();
      });

      return this;
    }

  , onOpen: function(options){
      if (!this.productId || (!options && options.productId)) return this;

      var this_ = this;

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

      return this.fetchProduct(function(error, product){
        troller.spinner.stop();

        if (error) return troller.error(error);

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