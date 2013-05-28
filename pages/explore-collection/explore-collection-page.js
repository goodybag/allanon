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
      this.products = [];

      // Page state
      this.options = {
        limit:      30
      , offset:     0
      , include:    ['collections']
      };
    }

  , onShow: function(options){
      if (options.collection.id == this.collection.id && this.products) return this;

      this.collection = options.collection;

      this.fetchData();

      return this;
    }

  , fetchData: function(callback){
      var this_ = this;

      troller.spinner.spin();

      api.collections.products(user.get('id'), this.collection.id, this.options, function(error, products){
        troller.spinner.stop();

        if (error) return callback ? callback(error) : troller.error(error);

        this_.products = this_.products.concat(products);
        this_.children.products.provideData(this_.products).render();

        // trigger fetching next page when we get within 1/4 of the viewport height of the bottom
        this_.paginationTrigger = parseInt(document.height - (window.innerHeight / 4));

        // only trigger fetching the next page once
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.fetchData, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);


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

      return this;
    }

  , onSearchSubmit: function(e){
      e.preventDefault();

      var value = this.$search.val(), this_ = this;

      if (!value){
        if (this.options.filter)
          delete this.options.filter;
        else return;
      } else {
        this.options.filter = value;
      }

      this.fetchData(function(error){
        if (error) return troller.error(error);

        this_.children.products.render()
      });
    }

  , onFiltersClick: function(e){
      troller.spinner.spin();

      var $target = utils.dom(e.target);

      var filter = (
        $target.hasClass('btn-like') ? 'userLikes' : (
        $target.hasClass('btn-want') ? 'userWants' : 'userTried'
      ));

      if ($target.hasClass('active')){
        $target.removeClass('active');
        delete this.options[filter];
      } else {
        $target.addClass('active');
        this.options[filter] = true;
      }

      this.fetchData();
    }

  , onEditCollectionClick: function(e){
      troller.modals.open('edit-collection', { collection: this.collection });
    }
  });
});
