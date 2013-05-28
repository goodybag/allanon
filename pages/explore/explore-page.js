define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./explore-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , events: {
      'submit #explore-search-form':        'onSearchSubmit'
    , 'click .search-form-btn':             'onSearchSubmit'

    , 'click .filters-btn-group > .btn':    'onFiltersClick'
    }

  , initialize: function(options){
      this.children = {
        products: new Components.ProductsList.Main()
      };

      this.products = [];

      // Page state
      this.options = utils.extend({
        sort:       '-popular'
      , limit:      30
      , offset:     0
      , include:    ['collections']
      , hasPhoto:   true
      }, options);
    }

  , onShow: function(options){
      troller.spinner.spin();

      var isDifferent = false;
      for (var key in options){
        if (this.options[key] == options[key]) continue;

        this.options[key] = options[key];
        if(key === 'sort') this.resetData(); // reset the list
        isDifferent = true;
      }

      // Don't fetch again if nothing has changed
      if (!isDifferent && this.products && this.products.length > 0)
        return troller.spinner.stop(), this;

      var this_ = this;

      this.fetchData(function(error, results){
        if (error) troller.error(error), troller.spinner.stop();

        troller.spinner.stop();  // redundant?  both with the above line and the stop in fetch data?
        this_.render();

        // trigger fetching next page when we get within 1/4 of the viewport height of the bottom
        this_.paginationTrigger = parseInt(document.height - (window.innerHeight / 4));

        // only trigger fetching the next page once
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
      });

      return this;
    }

  , resetData: function() {
      this.products = []; // reset
      this.options.offset = 0;
  }

  , fetchData: function(callback){
      var this_ = this;

      troller.spinner.spin();

      api.products.food(this.options, function(error, results){
        troller.spinner.stop();

        if (error) return callback ? callback(error) : troller.error(error);

        this_.options.offset += this_.options.limit; // bump the page

        this_.provideData(this_.products.concat(results));

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
      if (utils.dom(e.target).hasClass('active')) e.preventDefault();
      this.$el.find('.filters-btn-group > .btn').removeClass('active');
      utils.dom(e.target).addClass('active');
    }

  , onScrollNearEnd: function() {
      var this_ = this;
      this.fetchData(function(error, results) {
        if (error) troller.error(error);

        this_.children.products.render();

        // setup the next page fetch

        // trigger fetching next page when we get within 1/4 of the viewport height of the bottom
        this_.paginationTrigger = parseInt(document.height - (window.innerHeight / 4));

        // only trigger fetching the next page once
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
      })
    }
  });

});
