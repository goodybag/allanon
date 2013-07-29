define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('components')

  , template    = require('hbt!./explore-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , title: 'Explore Goodybag'

  , headerContext: {
      'data-toggle': 'radio'
    , buttons: [
        {class:'filter-popular', name: 'Popular', active: true}
      , {class:'filter-nearby',  name: 'Nearby'}
      , {class:'filter-random',  name: 'Mix It Up!'}
      ]
    }

  , initialize: function(options) {
      this.children = {
        products: new Components.ProductsList.Main()
      , header:   new Components.ProductsListHeader(this.headerContext)
      };


      this.listenTo(this.children.header, 'search', this.onSearchSubmit, this);
      this.listenTo(this.children.header, {
        'toggle:filter-popular': utils.bind(this.onFilterToggle, this, '/explore/popular')
      , 'toggle:filter-nearby':  utils.bind(this.onFilterToggle, this, '/explore/nearby')
      , 'toggle:filter-random':  utils.bind(this.onFilterToggle, this, '/explore/random')
      });

      // Override products list render to reset pagination height
      var oldRender = this.children.products.render, this_ = this;
      this.children.products.render = function() {
        this_.destroyPagination();

        oldRender.apply(this_.children.products, arguments);

        if (this.products.length === 0) return;

        this_.setupPagination();
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
        troller.app.setTitle(product.get('name'));
      });

      this.children.products.on('product-details-modal:close', function(){
        troller.app.setTitle(this_.title);
      });
    }

  , onShow: function(options){
      utils.invokeIf(this.children, 'onShow', options);
      troller.spinner.spin();

      var isDifferent = false;
      for (var key in options) {
        if (this.options[key] !== options[key]) {
          this.options[key] = options[key];
          isDifferent = true;
        }
      }

      // Don't fetch again if nothing has changed
      if (!isDifferent && this.products && this.products.length > 0){
        this.setupPagination();
        troller.spinner.stop();
        return this;
      }

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
      });

      return this;
    }

  , onHide: function() {
      utils.invokeIf(this.children, 'onHide');
      this.destroyPagination();
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
          this_.destroyPagination();

        if (callback) callback(null, results);
      });
    }

  , provideData: function(data){
      this.products = data;
      this.children.products.provideData(data); // multiple references to the same piece of mutable state break modularity.  TODO: fix

      return this;
    }

  , render: function(){
      // reset button states.  this will be significantly less ugly in the #160 version
      utils.each(this.headerContext.buttons, function(button) { button.active = false });

      var btnClass = {
        '-popular': 'filter-popular'
      , '-distance': 'filter-nearby'
      , '-random': 'filter-random'
      }[this.options.sort]

      utils.find(this.headerContext.buttons, function(button) {return button.class === btnClass}).active = true;


      this.$el.html( template({ options: this.options }) );

      // Attach header
      this.children.header.setElement(
        this.$el.find('.page-header-box')[0]
      ).render(this.headerContext);

      // Attach products list
      this.children.products.setElement(
        this.$el.find('.products-list')[0]
      ).render();

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
      } else if (!this.onSearchClear()) return;

      // Reset offset so results don't get effed
      this.options.offset = 0;
      this._page = 1;

      // goodybag/allonon#133 Don't sort when searching, except by distance
      if (this.options.sort != null) {
        this.$oldSortBtn = this.$el.find('.filters-btn-group > .btn.active');
        this.oldSort = this.options.sort;
      }

      if (value && this.options.sort !== '-distance') {
        this.$el.find('.filters-btn-group > .btn').removeClass('active');
        delete this.options.sort;
      }

      var this_ = this;
      this.fetchData({ spin: true }, function(error, results){
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
      // Cleared by keyboard
      var result = this.options.filter != null;
      delete this.options.filter;
      this.$oldSortBtn.addClass('active');
      this.options.sort = this.oldSort;
      return result;
    }

  , onFilterToggle: function(href, active, e, component){
      if (!active) return;
      utils.history.navigate(href, {trigger: true});
      troller.analytics.track('Click Explore Filter', { filter: href });
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
  });
});
