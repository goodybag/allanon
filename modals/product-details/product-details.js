define(function(require){
  var
    utils       = require('utils')
  , api         = require('api')
  , user        = require('user')
  , troller     = require('troller')
  , config      = require('config')
  , Components  = require('components')
  , models      = require('models')
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

      Modal.prototype.initialize.apply(this, arguments);

      this.product = options.product || new models.Product();

      this.children.pages.providePages(Pages);

      // Re-fetch on auth/deauth
      user.on('auth', function(){
        this_.product.fetch();
      });

      user.on('deauth', function(){
        this_.product.fetch();
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
      this.$el.html( template({ product: this.product.toJSON() }) );

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
      this.children.pages.changePage('details', { transition: 'none' }, function(error, page){
        if (error) return troller.error(error);
        page.provideModel(this_.product);
        page.render();
        page.delegateEvents();
      });

      return this;
    }

  , onOpen: function(options){
      var trackingData = utils.clone(options);
      trackingData.product = options.product ? options.product.toJSON() : options.product;
      troller.analytics.track('Product Details Opened', trackingData);

      options = options || {};

      // if there's no model
      if (options.productId == null && options.product == null) return this;

      var this_ = this;

      // If they provided a product already, no need to fetch
      if (options.product){
        this.product = options.product;
        return this.render();
      }

      // Same thing as before, and we've likely already rendered
      if (options.productId === this.product.id)
        return this;

      this.product.clear();
      this.product.set('id', options.productId);

      troller.spinner.spin();


      this.product.fetch({queryParams: {include: ['collections']}, complete: function(error) {
        troller.spinner.stop();

        if (error) {
          if (error.status === 404) {
            troller.modals.close(null, {silent: true});
            return troller.app.changePage('404');
          }
          return troller.error(error);
        }

        this_.render();
      }});
    }

  , onClose: function(){
      // The modal was closed by navigating away
      if (utils.history.location.hash.indexOf('/products/') == -1) return;

      // Navigate to page underneath
      utils.history.navigate(
        utils.history.location.hash.replace('/products/' + this.product.id, '').substring(1)
      );
    }
  });
});
