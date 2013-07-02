define(function(require){
  var
    utils       = require('utils')
  , api         = require('api')
  , user        = require('user')
  , troller     = require('troller')
  , config      = require('config')
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
      'pages>': '.details-page-wrapper'
    }

  , spinner: new utils.Spinner(config.spinner)

  , initialize: function(options){
      var this_ = this;

      Modal.prototype.initialize.apply(this, options);

      this.productId = options.productId;
      this.product = options.product || {};

      this.children.pages.providePages(Pages);

      this.dataOptions = {
        include: ['collections']
      };

      // Re-fetch on auth/deauth
      user.on('auth', function(){
        var pid = this_.productId;
        this_.product = null;
        this_.productId = null;
        this_.onOpen({ productId: pid });
      });

      user.on('deauth', function(){
        var pid = this_.productId;
        this_.product = null;
        this_.productId = null;
        this_.onOpen({ productId: pid });
      });

      return this;
    }

  , goToAddToCollections: function(){
      this.children.pages.changePage('add-to-collections', { product: this.product });
      return this;
    }

  , changePage: function(page, options){
      this.children.pages.changePage(page, options);
      return this;
    }

  , render: function(){
      var this_ = this;

      this.children.pages.remove();
      this.$el.html( template({ product: this.product }) );

      var $productPhoto     = this.$el.find('.product-photo-hidden')
        , $productSpinner   = this.$el.find('.product-photo-spinner');

      // Plug spinner into viewer
      this.spinner.spin();
      $productSpinner.html(this.spinner.el);

      // Replace when the image loads
      $productPhoto.load(function() {
        this_.spinner.stop();
        $productPhoto.fadeIn();
      });

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
      troller.analytics.track('Product Details Opened', options);

      if (options && !options.productId && !options.product) return this;

      var this_ = this;

      // If they provided a product already, no need to fetch
      if (options.product){
        this.product = options.product;

        // If they're not logged in, the product won't have userWLTs
        this.product.userLikes = this.product.userLikes || false;
        this.product.userWants = this.product.userWants || false;
        this.product.userTried = this.product.userTried || false;

        this.productId = this.product.id;

        troller.app.setTitle(this.product.name);

        return this.render();
      }

      // Same thing as before, and we've likely already rendered
      if (options.productId == this.productId && this.productId == this.product.id && this.productId != null)
        return this;

      if (options.productId) this.productId = options.productId;

      troller.spinner.spin();

      return this.fetchProduct(function(error, product){
        troller.spinner.stop();

        if (error) return troller.error(error);

        troller.app.setTitle(product.name);

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

      api.products.get(this.productId, this.dataOptions, function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.product = result;

        // If they're not logged in, the product won't have userWLTs
        this_.product.userLikes = this_.product.userLikes || false;
        this_.product.userWants = this_.product.userWants || false;
        this_.product.userTried = this_.product.userTried || false;

        if (callback) callback(null, result);
      });

      return this;
    }
  });
});