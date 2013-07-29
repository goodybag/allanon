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
    className: 'page page-explore explore-collection'

  , title: 'Explore My Collection'

  , defaultOptions: {
      pageSize: 30
    }

  , allowedOptions: ['pageSize', 'filter', 'collection', 'cid', 'pid']

  , getOptions: function(options) {
      return utils.defaults(utils.pick(options || {}, this.allowedOptions), this.defaultOptions);
      // TODO: make sure sort agrees with presence of lat/lon
    }

  , headerContext: function() {
      var model = this.model || new models.Collection();
      var context = {
        'data-toggle': 'checkbox'
      , buttons: [
          {class: 'btn-want',  name: 'Want (<span class="count">'  + model.get('totalMyWants') + '</span>)'}
        , {class: 'btn-like',  name: 'Like (<span class="count">'  + model.get('totalMyLikes') + '</span>)'}
        , {class: 'btn-tried', name: 'Tried (<span class="count">' + model.get('totalMyTries') + '</span>)'}
        ]
      , tagline: model.get('name')
      };

      if (model.isEditable()) context.topButtons = {right: 'Edit Collection'};
      return context;
    }

  , regions: {
      products: '.products-list'
    , header: '.page-header-box'
    }

  , initialize: function(options) {
      this.options = this.getOptions(options);

      if (!options.cid && !options.collection) {
        troller.modals.close();
        troller.app.changePage('404');
        return;
      }

      this.children = {
        products: new Components.ProductsList.Main()
      , header: new Components.ProductsListHeader(this.headerContext())
      };

      this.children.header.on({
        'click:top-right-btn': utils.bind(this.onEditCollectionClick, this)
      , 'search': utils.bind(this.onSearchSubmit, this)
      , 'toggle:btn-want':  utils.bind(this.onFiltersToggle, this, 'userWants')
      , 'toggle:btn-like':  utils.bind(this.onFiltersToggle, this, 'userLikes')
      , 'toggle:btn-tried': utils.bind(this.onFiltersToggle, this, 'userTried')
      });

      this.products = [];

      if (options.collection) {
        this.provideCollection(options.collection);
      } else {
        var model = new models.Collection({id: options.cid});
        model.fetch({success: utils.bind(this.provideCollection, this, model)});
      }

      this.spinner = new utils.Spinner();

      // TODO: listen to modal directly
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
      this.options = this.getOptions(options);

      // Don't worry about this. Data might go stale
      // if (options.collection.id == this.collection.id && this.products.length > 0) return this;

      if (this.options.collection != null) this.provideCollection(this.options.collection);

      this.model.products.clear();

      this.title = this.model.get('name');

      troller.scrollWatcher.addEvent(120);
      if (window.scrollY >= 120) this.stickHead();

      var self = this;
      this.spinner.spin();

      this.children.header.render(this.headerContext());

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
      utils.invokeIf(this.children, 'onHide');
      this.destroyPagination();
    }

  , provideCollection: function(collection){
      this.stopListening(this.model);

      this.model = collection;

      this.listenTo(this.model, {
        'change:totalMyLikes': utils.bind(this.onCountChange, this, 'btn-like')
      , 'change:totalMyWants': utils.bind(this.onCountChange, this, 'btn-want')
      , 'change:totalMyTries': utils.bind(this.onCountChange, this, 'btn-tried')
      , 'change:name': utils.compose(this.children.header.render, this.headerContext)
      });

      this.children.products.provideData(this.model.products);

      this.render();
      return this;
    }

  , onCountChange: function(btnClass, model, value, options) {
      this.children.header.$el.find('.filters-btn-group .' + btnClass + ' .count').text(value);
    }

  , render: function(){
      this.$el.html( template({ collection: utils.extend(this.model.toJSON(), {isEditable: this.model.isEditable()}) }) );

      this.applyRegions();

      // TODO: does this need to be defered?  will this ever run before the dom update on any browser?
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

      var self = this;
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
    }

  , onFiltersToggle: function(property, active, e, component){
      this.model.products.toggleFilter(property, active);

      if (!active) return; // should cause only one fetch

      this.spinner.spin();
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
  });
});
