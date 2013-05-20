define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./explore-collection-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , events: {
      'submit #explore-search-form':        'onSearchSubmit'
    , 'click .search-form-btn':             'onSearchSubmit'
    // , 'keyup .field-search':                'onSearchSubmit'

    , 'click .filters-btn-group > .btn':    'onFiltersClick'

    , 'click .btn-edit-collection':         'onEditCollectionClick'
    }

  , children: {
      products: new Components.ProductsList.Main()
    }

  , regions: {
      products: '.products-list'
    }

  , initialize: function(options){

      // Page state
      this.options = {
        limit:      30
      , offset:     0
      // , filter:     null
      };
    }

  , onShow: function(options){
      if (options.collection.id == this.collection.id && this.products) return this;

      this.collection = options.collection;

      // Put on loader and get products for collection
      troller.spinner.spin();

      var this_ = this;

      api.collections.products(user.get('id'), this.collection.id, this.options, function(error, products){
        if (error) return troller.error(error);

        troller.spinner.stop();
        this_.products = products;
        this_.children.products.provideData(this_.products).render();
      });

      return this;
    }

  , provideCollection: function(collection){
      this.collection = collection;
      return this;
    }

  , render: function(){
      this.$el.html( template({ collection: this.collection }) );

      this.applyRegions();

      this.$search = this.$el.find('.field-search');

      return this;
    }

  , onSearchSubmit: function(e){
      e.preventDefault();

      if (!this.$search.val()) return;

      utils.history.navigate(
        '/#/explore/'
        + this.options.sort.replace('-', '')
        + '/search/'
        + this.$search.val()
      );
    }

  , onFiltersClick: function(e){
      var $target = utils.dom(e.target);
      if ($target.hasClass('active')){
        $target.removeClass('active');
      } else {
        $target.addClass('active');
      }

    }

  , onEditCollectionClick: function(e){
      troller.modals.open('edit-collection', { collection: this.collection });
    }
  });
});