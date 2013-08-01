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

  , defaultOptions: {
      sort: 'popular'
    , pageSize: 30
    }

  , allowedOptions: ['sort', 'lat', 'lon', 'pageSize', 'filter']

  , headerContext: function() {
      return {
        'data-toggle': 'radio'
        // TODO: set active based on current state
        , buttons: [
          {class:'filter-popular', name: 'Popular', active: true}
          , {class:'filter-nearby',  name: 'Nearby'}
          , {class:'filter-random',  name: 'Mix It Up!'}
        ]
      };
    }

  , getOptions: function(options) {
      return utils.defaults(utils.pick(options || {}, this.allowedOptions), this.defaultOptions);
      // TODO: make sure sort agrees with presence of lat/lon
    }

  , initialize: function(options){
      this.options = this.getOptions(options);

      this.children = {
        header:   new Components.ProductsListHeader(this.headerContext)
      };

      this.listenTo(this.children.header, 'search', this.onSearchSubmit, this);
      this.listenTo(this.children.header, {
        'toggle:filter-popular': utils.bind(this.onFilterToggle, this, '/explore/popular')
      , 'toggle:filter-nearby':  utils.bind(this.onFilterToggle, this, '/explore/nearby')
      , 'toggle:filter-random':  utils.bind(this.onFilterToggle, this, '/explore/random')
      });

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

      this.render();
    }

  , onShow: function(options){
      utils.invokeIf(this.children, 'onShow', options);
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

      utils.invoke(utils.pick(this.children, utils.keys(this.products)), 'hide');

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
      utils.invokeIf(this.children, 'onHide');
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

      // Attach header
      this.children.header.setElement(
        this.$el.find('.page-header-box')[0]
      ).render(this.headerContext());

      // Attach products list
      for (var key in this.products)
        this.children[key].setElement(this.$el.find('.products-list#' + key)[0]);

      this.$spinnerContainer = this.$el.find('.products-list-spinner')[0];

      return this;
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

  , onSearchSubmit: function(value, component){
      // empty search should be noop
      if (!value) return this.onSearchClear();

      // cache old state for reverting on clear
      if (this.preSearchState == null) this.preSearchState = {
        activeChild: utils.find(utils.pick(this.children, utils.keys(this.products)),
                                function(child) { return child.$el.is(':visible'); })
      , activeBtns: this.children.header.activeButtons()
      }

      var key = this.options.sort === 'nearby' ? 'searchNearby' : 'search';

      var coll = this.products[key];
      var view = this.children[key];

      utils.invoke(utils.pick(this.children, utils.keys(this.products)), 'hide');
      view.show();

      // if you're searching for the same thing as last time:
      // TODO: might think about having some sort of cache expires value and redoing the search if it's expired.
      if (coll.queryParams.filter === value) return;

      // unless it's a nearby search, remove the active state on the current active button
      if (key === 'search') this.children.header.clearButtons();

      var spinner = this.spinner;
      spinner.spin();
      var $noResults = this.$el.find('.no-results');

      coll.fetch({
        queryParams: {filter: value}
      , reset: true
      , error: function(err) { troller.error(err); }
      , success: function(data) { $noResults.toggleClass('hide', data.length > 0); }
      , complete: function(err, data) { spinner.stop(); }
      });
    }

  , onSearchClear: function(e) {
      if (this.preSearchState == null) return;
      this.children.header.clearButtons();
      utils.invoke(utils.pick(this.children, utils.keys(this.products)), 'hide');

      utils.each(utils.pluck(this.preSearchState.activeBtns, 'btnClass'), this.children.header.toggle, this.children.header);
      this.preSearchState.activeChild.show();

      this.preSearchState = null;
    }

  , onFilterToggle: function(href, active, e, component){
      if (!active) return;
      this.onSearchClear();
      utils.history.navigate(href, {trigger: true});
      troller.analytics.track('Click Explore Filter', { filter: href });
    }

  , onScrollNearEnd: function() {
      var this_ = this;

      this.spinner.spin(this.$spinnerContainer);

      var activeChild = utils.find(utils.pick(this.children, utils.keys(this.products)), function(child) { return child.$el.is(':visible'); });

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
  });
});
