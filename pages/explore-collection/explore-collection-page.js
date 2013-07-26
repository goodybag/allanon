define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('components')

  , template    = require('hbt!./explore-collection-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , title: 'Explore My Collection'

  , headerContext: function() {
      return {
        'data-toggle': 'checkbox'
      , buttons: [
          {class: 'btn-want',  name: 'Want <span class="count">('  + this.collection.totalMyWants + ')</span>'}
        , {class: 'btn-like',  name: 'Like <span class="count">('  + this.collection.totalMyLikes + ')</span>'}
        , {class: 'btn-tried', name: 'Tried <span class="count">(' + this.collection.totalMyTries + ')</span>'}
        ]
      , topButtons: {right: 'Edit Collection'}
      , tagline: this.collection.name
      }
    }

  , children: {
      products: new Components.ProductsList.Main()
    , header: new Components.ProductsListHeader()
    }

  , regions: {
      products: '.products-list'
    , header: '.page-header-box'
    }

  , initialize: function(options){
      this.children.header.context = this.headerContext();
      // Override products list render to reset pagination height
      var oldRender = this.children.products.render, this_ = this;
      this.children.products.render = function(){
        this_.destroyPagination();

        oldRender.apply(this_.children.products, arguments);

        if (this_.products.length === 0) return;

        this_.setupPagination();
      };

      this.children.products.on('feelings:change', function(feeling, direction){
        var pluralFeel = (
          feeling == 'like' ? 'Likes' : (
          feeling == 'want' ? 'Wants' :
                              'Tries'
        ));

        this_.$el.find('.filters-btn-group > .btn-' + feeling + ' > .count').html(
          '(' + (
            direction
            ? ++this_.collection['totalMy' + pluralFeel]
            : --this_.collection['totalMy' + pluralFeel]
           ) + ')'
        );
      });

      this.children.header.on({
        'click:top-right-btn': utils.bind(this.onEditCollectionClick, this)
      , 'search': utils.bind(this.onSearchSubmit, this)
      , 'toggle:btn-want':  utils.bind(this.onFiltersToggle, this, 'userWants')
      , 'toggle:btn-like':  utils.bind(this.onFiltersToggle, this, 'userLikes')
      , 'toggle:btn-tried': utils.bind(this.onFiltersToggle, this, 'userTried')
      });

      this.products = [];

      this.spinner = new utils.Spinner();

      // Page state
      this.options = {
        limit:      30
      , offset:     0
      , include:    ['collections', 'userPhotos']
      };

      // Set Correct Title
      this.children.products.on('product-details-modal:open', function(product){
        troller.app.setTitle(product.name);
      });

      this.children.products.on('product-details-modal:close', function(){
        troller.app.setTitle(this_.title);
      });
    }

  , onShow: function(options){
      // Don't worry about this. Data might go stale
      // if (options.collection.id == this.collection.id && this.products.length > 0) return this;

      // Data might be stale, reset query params
      this.options.offset = 0;
      delete this.options.filter;
      delete this.options.userWants;
      delete this.options.userLikes;
      delete this.options.userTried;

      this.collection = options.collection;

      this.title = this.collection.name;

      this.fetchData();

      return this;
    }

  , onHide: function() {
      this.destroyPagination();
    }

  , fetchData: function(options, callback){
      if (typeof options === 'function'){
        callback = options;
        options = null;
      }

      options = options || { spin: true };

      var this_ = this;

      if (options.spin) troller.spinner.spin();

      if (this.previousRequest)
        this.previousRequest.abort();

      this.previousRequest = api.collections.products(user.get('id'), this.collection.id, this.options, function(error, products){
        troller.spinner.stop();

        if (error) return callback ? callback(error) : troller.error(error);

        for (var i = 0, l = products.length, p; i < l; ++i){
          p = products[i];
          if (!p.photoUrl && p.photos && p.photos.length > 0) p.photoUrl = p.photos[0].url;
        }

        this_.products = options.append ? this_.products.concat(products) : products;
        this_.children.products.provideData(this_.products).render();

        if (products.length < this_.options.limit) // if it's the last page
          this_.destroyPagination();

        if (callback) callback(null, products);
      });
    }

  , provideCollection: function(collection){
      this.collection = collection;
      return this;
    }

  , render: function(){
      this.$el.html( template({ collection: this.collection }) );

      this.applyRegions();

      this.$search = this.$el.find('.field-search');
      this.$searchClearBtn = this.$el.find('.field-search-clear');
      this.$spinnerContainer = this.$el.find('.products-list-spinner')[0];

      return this;
    }

  , destroyPagination: function(){
      troller.scrollWatcher.removeEvent(this.paginationTrigger);
      this.paginationTrigger = null;

      return this;
    }

  , setupPagination: function(){
      if (this.paginationTrigger) this.destroyPagination();

      // height at which to trigger fetching next page
      this.paginationTrigger = utils.dom(document).height() - (utils.dom(window).height() / 4);
      troller.scrollWatcher.once('scroll-' + this.paginationTrigger, this.onScrollNearEnd, this);
      troller.scrollWatcher.addEvent(this.paginationTrigger);

      return this;
    }

  , onSearchSubmit: function(value, component){
      if (value == this.options.filter) return;

      if (value) {
        this.options.filter = value;
      }
      else if (!this.onSearchClear()) return;

      // Reset offset so results don't get effed
      this.options.offset = 0;

      var this_ = this;
      this.fetchData({ spin: true }, function(error, results){
        if (error) return troller.error(error);

        this_.children.products.render()

        // Add/Remove hide class based on number of products
        this_.$el.find('.no-results')[
          (results.length == 0 ? 'remove' : 'add')
        + 'Class'
        ]('hide');
      });
    }

  , onSearchClear: function(e) {
      // Cleared by keyboard
      var result = this.options.filter != null;
      delete this.options.filter;
      return result;
    }

  , onFiltersToggle: function(property, active, e, component){
      active ? this.options[property] = true : delete this.options[property];

      troller.spinner.spin();
      this.options.offset = 0;
      this.fetchData();
    }

  , onEditCollectionClick: function(e){
      troller.modals.open('edit-collection', { collection: this.collection });
    }

  , onScrollNearEnd: function() {
      var this_ = this;

      if (this.options.offset > this.products.length) return;

      this.options.offset += this.options.limit; // bump the page

      this.spinner.spin(this.$spinnerContainer);
      this.fetchData({ append: true, spin: false }, function() {
        this_.spinner.stop();
      });
    }
  });
});
