define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./explore-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , title: 'Explore Goodybag'

  , events: {
      'submit #explore-search-form':        'onSearchSubmit'
    , 'keyup  .field-search':               'onSearchSubmit'
    , 'click .search-form-btn':             'onSearchSubmit'

    , 'click .filters-btn-group > .btn':    'onFiltersClick'
    }

  , initialize: function(options){
      this.children = {
        products: new Components.ProductsList.Main()
      };

      // Override products list render to reset pagination height
      var oldRender = this.children.products.render, this_ = this;
      this.children.products.render = function() {
        troller.scrollWatcher.removeEvent(this_.paginationTrigger);

        oldRender.apply(this_.children.products, arguments);

        if (this.products.length === 0) return;
        // height at which to trigger fetching next page
        this_.paginationTrigger = utils.dom(document).height() - (utils.dom(window).height() / 4);
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
      };

      this._page = 1;

      this.products = [];

      this.spinner = new utils.Spinner();

      // Page state
      this.options = utils.extend({
        sort:       '-popular'
      , limit:      30
      , offset:     0
      , include:    ['collections']
      , hasPhoto:   true
      }, options);

      // Reset products on auth/de-auth
      user.on('auth', function(){
        this_.products = [];
        this_.onShow();
      });

      user.on('deauth', function(){
        this_.products = [];
        this_.onShow();
      });

      // Set Correct Title
      this.children.products.on('product-details-modal:open', function(product){
        troller.app.setTitle(product.name);
      });

      this.children.products.on('product-details-modal:close', function(){
        troller.app.setTitle(this_.title);
      });

      troller.scrollWatcher.on('scroll-120', this.unStickHead, this);
      troller.scrollWatcher.on('scrollOut-120', this.stickHead, this);
    }

  , onShow: function(options){
      troller.spinner.spin();

      var isDifferent = false;
      for (var key in options) {
        if (this.options[key] !== options[key]) {
          this.options[key] = options[key];
          isDifferent = true;
        }
      }

      // Don't fetch again if nothing has changed
      if (!isDifferent && this.products && this.products.length > 0)
        return troller.spinner.stop(), this;

      // Reset offset/query
      this.options.offset = 0;
      delete this.options.filter;
      this.products = [];

      // this makes onSearchClear a nop if you call it before running a search
      this.$oldSortBtn = this.$el.find('.filters-btn-group > .btn.active');
      this.oldSort = this.options.sort;

      var this_ = this;

      this.fetchData(function(error, results){
        if (error) return troller.error(error), troller.spinner.stop();

        troller.spinner.stop();
        this_.render();

        this_.$head = this_.$el.find('.page-header-box');
        troller.scrollWatcher.addEvent(120);
        if (window.scrollY >= 120) this_.stickHead();
      });

      return this;
    }

  , onHide: function() {
      troller.scrollWatcher.removeEvent(this.paginationTrigger);
    }

  , fetchData: function(options, callback){
      if (typeof options == 'function'){
        callback = options;
        options = null;
      }

      options = options || { spin: true };

      var this_ = this;

      if (options.spin) troller.spinner.spin();

      if (this.previousRequest)
        this.previousRequest.abort();

      this.previousRequest = api.products.food(this.options, function(error, results){
        troller.spinner.stop();
        this_.previousRequest = null;

        if (error) return typeof callback === 'function' ? callback(error) : troller.error(error);

        this_.provideData(options.append ? this_.products.concat(results) : results);

        if (results.length < this_.options.limit) // if it's the last page
          troller.scrollWatcher.removeEvent(this_.paginationTrigger);

        if (callback) callback(null, results);
      });
    }

  , provideData: function(data){
      this.products = data;
      this.children.products.provideData(data); // multiple references to the same piece of mutable state break modularity.  TODO: fix

      return this;
    }

  , render: function(){
      this.$el.html( template({ options: this.options }) );

      // Attach products list
      this.children.products.setElement(
        this.$el.find('.products-list')[0]
      ).render();

      this.$search = this.$el.find('.field-search');
      this.$spinnerContainer = this.$el.find('.products-list-spinner')[0];

      if (!troller.app.bannerShown()){
        this.bannerShown = true;
        troller.app.showBanner();
        setTimeout(function(){
          troller.app.hideBanner();
        }, 6500);
      };

      return this;
    }

  , onSearchSubmit: function(e){
      e.preventDefault();

      var value = this.$search.val(), this_ = this;

      if (value == this.options.filter) return;

      if (value) this.options.filter = value;
      else if (!this.onSearchClear()) return;

      // Reset offset so results don't get effed
      this.options.offset = 0;
      this._page = 1;

      // If keyup takes too long, put up spinner
      var loadTooLong = setTimeout(function(){
        troller.spinner.spin();
      }, 1000);

      // goodybag/allonon#133 Don't sort when searching, except by distance
      if (this.options.sort != null) {
        this.$oldSortBtn = this.$el.find('.filters-btn-group > .btn.active');
        this.oldSort = this.options.sort;
      }

      if (value && this.options.sort !== '-distance') {
        this.$el.find('.filters-btn-group > .btn').removeClass('active');
        delete this.options.sort;
      }

      this.fetchData({ spin: e.type != 'keyup' }, function(error, results){
        clearTimeout( loadTooLong );

        if (error) return troller.error(error);

        this_.children.products.render();

        // Add/Remove hide class based on number of products
        this_.$el.find('.no-results')[
          (results.length == 0 ? 'remove' : 'add')
        + 'Class'
        ]('hide');
      });
    }

  , onSearchClear: function(e) {
      var result = this.options.filter != null;
      delete this.options.filter;
      this.$oldSortBtn.addClass('active');
      this.options.sort = this.oldSort;
      return result;
    }

  , onFiltersClick: function(e){
      if (utils.dom(e.target).hasClass('active')) e.preventDefault();
      this.$el.find('.filters-btn-group > .btn').removeClass('active');
      utils.dom(e.target).addClass('active');
      troller.analytics.track('Click Explore Filter', { filter: e.target.href });
    }

  , onScrollNearEnd: function() {
      var this_ = this;

      if (this.options.offset > this.products.length) return;

      troller.analytics.track('InfiniScroll Paginated', { page: this._page++ });

      this.options.offset += this.options.limit; // bump the page

      this.spinner.spin(this.$spinnerContainer);
      this.fetchData({ append: true, spin: false }, function(error, results) {
        this_.spinner.stop();
        if (error) troller.error(error);
        this_.children.products.render();
      })
    }

  , stickHead: function() {
      this.$head.addClass('stuck');
      this.$el.addClass('fixed-header');
    }

  , unStickHead: function() {
      this.$head.removeClass('stuck');
      this.$el.removeClass('fixed-header');
    }
  });
});
