define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('components')
  , models      = require('models')

  , template    = require('hbt!./explore-collection-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , title: 'Explore My Collection'

  , events: {
      'submit #explore-search-form':        'onSearchSubmit'
    , 'click .search-form-btn':             'onSearchSubmit'
    , 'keyup .field-search':                'onSearchSubmit'
    , 'click .field-search-clear':          'onSearchClearClick'

    , 'click .btn-edit-collection':         'onEditCollectionClick'
    }

  , defaultOptions: {
      pageSize: 30
    }

  , allowedOptions: ['pageSize', 'filter', 'collection', 'cid', 'pid']

  , getOptions: function(options) {
      return utils.defaults(utils.pick(options || {}, this.allowedOptions), this.defaultOptions);
      // TODO: make sure sort agrees with presence of lat/lon
    }

  , children: {
      products: new Components.ProductsList.Main()
    }

  , regions: {
      products: '.products-list'
    }

  , initialize: function(options) {
      this.options = this.getOptions(options);

      // I love partial appliation of functions
      utils.extend(this.events, {
        'click .filters-btn-group > .btn.btn-like':  utils.bind(this.onFiltersClick, this, 'userLikes')
      , 'click .filters-btn-group > .btn.btn-want':  utils.bind(this.onFiltersClick, this, 'userWants')
      , 'click .filters-btn-group > .btn.btn-tried': utils.bind(this.onFiltersClick, this, 'userTried')
      });

      if (!options.cid && !options.collection) {
        troller.modals.close();
        troller.app.changePage('404');
        return;
      }

      var model;
      if (options.collection) model = options.collection;
      else {
        model = new models.Collection({id: options.cid});
        model.fetch();
      }

      this.provideCollection(model);

      this.spinner = new utils.Spinner();

      // TODO: listen to modal directly
      // Set Correct Title
      this.children.products.on('product-details-modal:open', function(product){
        troller.app.setTitle(product.name);
      });

      this.children.products.on('product-details-modal:close', function(){
        troller.app.setTitle(this_.title);
      });

      this.render();

      troller.scrollWatcher.on('scroll-120', this.unStickHead, this);
      troller.scrollWatcher.on('scrollOut-120', this.stickHead, this);
    }

  , onShow: function(options){
      this.options = this.getOptions(options);

      // Don't worry about this. Data might go stale
      // if (options.collection.id == this.collection.id && this.products.length > 0) return this;

      if (this.options.collection != null) this.provideCollection(this.options.collection);

      this.model.products.clear();

      this.title = this.model.name;

      troller.scrollWatcher.addEvent(120);
      if (window.scrollY >= 120) this.stickHead();

      var self = this;
      this.spinner.spin();

      this.model.products.nextPage({
        complete: function(err, data) {
          if (data.length < self.options.pageSize) self.destroyPagination();
          self.spinner.stop();
          self.setupPagination();
        }
      });

      return this;
    }

  , onHide: function() {
      this.destroyPagination();
    }

  , provideCollection: function(collection){
      this.stopListening(this.model);

      this.model = collection;

      this.listenTo(this.model, 'change:totalMyLikes change:totalMyWants change:TotalMyTries', function(model, value, options) {
        utils.each(utils.pick(model.changed, ['totalMyLikes', 'totalMyWants', 'totalMyTries']), function(val, key, changed) {
          var btnSelector = '.btn-' + {
            totalMyWants: 'want'
          , totalMyLikes: 'like'
          , totalMyTries: 'tried'
          }[key];
          this.$el.find('.filters-btn-group > ' + btnSelector + ' > .count').text(val);
        }, this);
      });

      utils.each(this.children, function(val, key, obj) { val.provideData(this.model.products) }, this);
      return this;
    }

  , render: function(){
      this.$el.html( template({ collection: this.model.toJSON() }) );

      this.applyRegions();

      // TODO: does this need to be defered?  will this ever run before the dom update on any browser?
      this.$search = this.$el.find('.field-search');
      this.$searchClearBtn = this.$el.find('.field-search-clear');
      this.$spinnerContainer = this.$el.find('.products-list-spinner')[0];
      this.$head = this.$el.find('.page-header-box');

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

  , onSearchSubmit: utils.throttle(function(e){
      e.preventDefault();

      var value = this.$search.val();

      this.$searchClearBtn.toggle(!!value);

      var self = this;

      // If keyup takes too long, put up spinner
      if (e.type === 'keyup') {
        var loadTooLong = setTimeout(function(){
          self.spinner.spin();
        }, 1000);
      } else
        this.spinner.spin();

      this.model.products.search(value, {
        error: function(err) {
          troller.error(err);
        }
      , success: function(data) {
          self.$el.find('.no-results').toggleClass('hide', data.length > 0);
          self.setupPagination();
        }
      , complete: function(error, data) {
          clearTimeout(loadTooLong);
          self.spinner.stop();
        }
      })
    }, 666)

  , onSearchClearClick: function(e) {
      // Cleared by mouse
      this.$search.val('');
      this.onSearchSubmit(e);
    }

  , onFiltersClick: function(filter, e){
      this.spinner.spin();

      var active = this.model.products.toggleFilter(filter);
      utils.dom(e.target).toggleClass('active', active);

      var self = this;
      this.model.products.nextPage({
        complete: function(err, data) {
          self.spinner.stop();
          self.setupPagination();
        }
      });
    }

  , onEditCollectionClick: function(e){
      troller.modals.open('edit-collection', { collection: this.model });
    }

  , onScrollNearEnd: function() {
      var self = this;
      this.spinner.spin(this.$spinnerContainer);
      this.model.products.nextPage({
        complete: function() {
          self.spinner.stop();
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
