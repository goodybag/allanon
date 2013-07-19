define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('components')
  , models      = require('models')

  , template    = require('hbt!./explore-tmpl')
  , collections = require('./collections')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , title: 'Explore Goodybag'

  , events: {
      'submit #explore-search-form':        'onSearchSubmit'
    , 'keyup  .field-search':               'onSearchSubmit'
    , 'click .search-form-btn':             'onSearchSubmit'
    , 'click .field-search-clear':          'onSearchClear'
    , 'click .filters-btn-group > .btn':    'onFiltersClick'
    }

  , defaultOptions: {
      sort: 'popular'
    , pageSize: 30
    }

  , allowedOptions: ['sort', 'lat', 'lon', 'pageSize', 'filter']

  , getOptions: function(options) {
      return utils.defaults(utils.pick(options || {}, this.allowedOptions), this.defaultOptions);
      // TODO: make sure sort agrees with presence of lat/lon
    }

  , initialize: function(options){

      this.options = this.getOptions(options);

      this.products = {
        popular: new collections.Products([], {
          queryParams: { sort: '-popular' }
          , pageSize: this.options.pageSize
        })
      , nearby: new collections.Nearby([], {
          pageSize: this.options.pageSize
        })
      , random: new collections.Products([], {
          queryParams: { sort: 'random' }
        , pageSize: this.options.pageSize
        })
      , search: new collections.Products([], {
          pageSize: this.options.pageSize
        })
      , searchNearby: new collections.Nearby([], {
          pageSize: this.options.pageSize
        })
      };

      this.children = {}
      for (var key in this.products) {
        this.children[key] = new Components.ProductsList.Main({products: this.products[key]})
        this.children[key].on('render', this.setupPagination, this);

        // Set Correct Title
        // TODO: listen to the modal directly instead of bubbling up the event
        this.children[key].on('product-details-modal:open', function(product){
          troller.app.setTitle(product.get('name'));
        });

        this.children[key].on('product-details-modal:close', function(){
          troller.app.setTitle(this.title);
        }, this);
      }

      this.spinner = new utils.Spinner();

      troller.scrollWatcher.on('scroll-120', this.unStickHead, this);
      troller.scrollWatcher.on('scrollOut-120', this.stickHead, this);

      this.render();
      this.$head = this.$el.find('.page-header-box');
      troller.scrollWatcher.addEvent(120);
      if (window.scrollY >= 120) this.stickHead();

      this.once('show', this.showBanner, this);
    }

  , onShow: function(options){
      troller.spinner.spin();

      options = this.getOptions(options);
      var isDifferent = !utils.isEqual(this.options, options);
      this.options = options;

      // Don't fetch again if nothing has changed
      if (!isDifferent && this.products[options.sort] && this.products[options.sort].length > 0){
        this.setupPagination();
        troller.spinner.stop();
        return this;
      }

      var this_ = this;

      var coll = this.products[options.sort];
      var subview = this.children[options.sort];

      utils.invoke(this.children, 'hide');

      subview.show();

      coll.reset([]);

      coll.nextPage({
        error: function(err) { troller.error(err); }
      , success: function(data) {
          subview.render(null, {reset: true});
          if (data.length < this_.options.pageSize) this_.destroyPagination();
        }
      , complete: function(err, data) { troller.spinner.stop(); }
      });

      return this;
    }

  , onHide: function() {
      this.destroyPagination();
    }

  , provideData: function(data){
      if (data instanceof utils.Collection) {
        this.products = data;
        this.children.products.provideData(data);
      } else
        this.products.reset(data);

      return this;
    }

  , render: function() {
      this.$el.html( template({ options: this.options }) );

      // TODO: do we need to defer the rest until the dom update?

      // Attach products list
      for (var key in this.children)
        this.children[key].setElement(this.$el.find('.products-list#' + key)[0]);

      this.$search = this.$el.find('.field-search');
      this.$searchClearBtn = this.$el.find('.field-search-clear');
      this.$spinnerContainer = this.$el.find('.products-list-spinner')[0];

      return this;
    }

  , showBanner: function() {
      if (!troller.app.bannerShown()){
        this.bannerShown = true;
        troller.app.showBanner();
        setTimeout(function(){
          troller.app.hideBanner();
        }, 2500);
      };
    }

  , destroyPagination: function() {
      troller.scrollWatcher.removeEvent(this.paginationTrigger);
      this.paginationTrigger = null;

      return this;
    }

  , setupPagination: function() {
      if (this.$el.is(':hidden')) return;
      if (this.paginationTrigger) this.destroyPagination();

      // height at which to trigger fetching next page
      this.paginationTrigger = utils.dom(document).height() - (utils.dom(window).height() / 4);
      troller.scrollWatcher.once('scroll-' + this.paginationTrigger, this.onScrollNearEnd, this);
      troller.scrollWatcher.addEvent(this.paginationTrigger);

      return this;
    }

  , onSearchSubmit: utils.throttle(function(e){
      e.preventDefault();

      var value = this.$search.val();

      // empty search should be noop
      if (!value) return this.onSearchClear();

      // cache old state for reverting on clear
      if (this.preSearchState == null) this.preSearchState = {
        activeChild: utils.find(this.children, function(child) { return child.$el.is(':visible'); })
      , activeBtn: this.$el.find('.filters-btn-group > .btn.active')
      }

      var key = this.options.sort === 'nearby' ? 'searchNearby' : 'search';

      var coll = this.products[key];
      var view = this.children[key];

      utils.invoke(this.children, 'hide');
      view.show();

      // if you're searching for the same thing as last time:
      // TODO: might think about having some sort of cache expires value and redoing the search if it's expired.
      if (coll.queryParams.filter === value) return;

      // unless it's a nearby search, remove the active state on the current active button
      if (key === 'search') this.$el.find('.filters-btn-group > .btn').removeClass('active');

      var spinner = this.spinner;
      // If keyup takes too long, put up spinner
      var loadTooLong = setTimeout(function(){
        spinner.spin();
      }, 1000);
      if (e.type !== 'keyup') spinner.spin();

      var $noResults = this.$el.find('.no-results');
      coll.fetch({
        queryParams: {filter: value}
      , reset: true
      , error: function(err) {
          troller.error(err);
        }
      , success: function(data) {
          $noResults.toggleClass('hide', data.length > 0);
        }
      , complete: function(err, data) {
          clearTimeout( loadTooLong );
          spinner.stop();
        }
      });
    }, 666)

  , onSearchClear: function(e) {
      this.$search.val('');
      this.$searchClearBtn.hide();

      if (this.preSearchState == null) return;
      this.$el.find('.filters-btn-group > .btn').removeClass('active');
      utils.invoke(this.children, 'hide')

      this.preSearchState.activeBtn.addClass('active');
      this.preSearchState.activeChild.show();

      this.preSearchState = null;
    }

  , onFiltersClick: function(e){
      if (utils.dom(e.target).hasClass('active')) e.preventDefault();
      else this.onSearchClear();
      this.$el.find('.filters-btn-group > .btn').removeClass('active');
      utils.dom(e.target).addClass('active');
      troller.analytics.track('Click Explore Filter', { filter: e.target.href });
    }

  , onScrollNearEnd: function() {
      var this_ = this;

      this.spinner.spin(this.$spinnerContainer);

      var activeChild = utils.find(this.children, function(child) { return child.$el.is(':visible'); });

      activeChild.products.nextPage({
        error: function(err) {
          troller.error(err);
        }
      , complete: function(err, data) {
          this_.spinner.stop();
          troller.analytics.track('InfiniScroll Paginated', { page: this_.page });
        }
      });
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
