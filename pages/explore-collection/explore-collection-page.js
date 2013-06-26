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

  , title: 'Explore My Collection'

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
      // Override products list render to reset pagination height
      var oldRender = this.children.products.render, this_ = this;
      this.children.products.render = function(){
        troller.scrollWatcher.removeEvent(this_.paginationTrigger);

        oldRender.apply(this_.children.products, arguments);

        if (this_.products.length === 0) return;
        // trigger fetching next page
        this_.paginationTrigger = utils.dom(document).height() - (utils.dom(window).height() / 4);
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
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

      // Data might be stale, reset offset
      this.options.offset = 0;

      this.collection = options.collection;

      this.title = this.collection.name;

      this.fetchData();

      return this;
    }

  , onHide: function() {
      troller.scrollWatcher.removeEvent(this.paginationTrigger);
    }

  , fetchData: function(options, callback){
      if (typeof options === 'function'){
        callback = options;
        options = null;
      }

      options = options || { spin: true };

      var this_ = this;

      if (options.spin) troller.spinner.spin();

      api.collections.products(user.get('id'), this.collection.id, this.options, function(error, products){
        troller.spinner.stop();

        if (error) return callback ? callback(error) : troller.error(error);

        for (var i = 0, l = products.length, p; i < l; ++i){
          p = products[i];
          if (!p.photoUrl && p.photos && p.photos.length > 0) p.photoUrl = p.photos[0].url;
        }

        this_.products = options.append ? this_.products.concat(products) : products;
        this_.children.products.provideData(this_.products).render();

        if (products.length < this_.options.limit) // if it's the last page
          troller.scrollWatcher.removeEvent(this_.paginationTrigger);

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
      this.$spinnerContainer = this.$el.find('.products-list-spinner')[0];

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
