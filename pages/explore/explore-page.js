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

      // Override products list render to reset pagination height
      var oldRender = this.children.products.render, this_ = this;
      this.children.products.render = function(){
        troller.scrollWatcher.removeEvent(this_.paginationTrigger);

        oldRender.apply(this_.children.products, arguments);

        // trigger fetching next page
        this_.paginationTrigger = utils.dom(document).height() - (utils.dom(window).height() / 4);
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
        isDifferent = true;
      }

      // Don't fetch again if nothing has changed
      if (!isDifferent && this.products && this.products.length > 0)
        return troller.spinner.stop(), this;

      // Reset offset/query
      this.options.offset = 0;
      delete this.options.filter;
      this.products = [];

      var this_ = this;

      this.fetchData(function(error, results){
        if (error) troller.error(error), troller.spinner.stop();

        troller.spinner.stop();  // redundant?  both with the above line and the stop in fetch data?
        this_.render();

        // only trigger fetching the next page once
        if (results.length < this_.options.limit) return;
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
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

      api.products.food(this.options, function(error, results){
        troller.spinner.stop();

        if (error) return callback ? callback(error) : troller.error(error);

        this_.provideData(options.append ? this_.products.concat(results) : results);

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

      // Reset offset so results don't get effed
      this.options.offset = 0;

      this.fetchData(function(error, results){
        if (error) return troller.error(error);

        this_.children.products.render();

        // Reset scroll watcher
        if (results.length < this_.options.limit) return;
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
      });
    }

  , onFiltersClick: function(e){
      if (utils.dom(e.target).hasClass('active')) e.preventDefault();
      this.$el.find('.filters-btn-group > .btn').removeClass('active');
      utils.dom(e.target).addClass('active');
    }

  , onScrollNearEnd: function() {
      var this_ = this;

      this.options.offset += this.options.limit; // bump the page

      this.fetchData({ append: true, spin: false }, function(error, results) {
        if (error) troller.error(error);

        this_.children.products.render();

        // Do not setup next fetch
        if (results.length < this_.options.limit) return;

        // only trigger fetching the next page once
        troller.scrollWatcher.once('scroll-' + this_.paginationTrigger, this_.onScrollNearEnd, this_);
        troller.scrollWatcher.addEvent(this_.paginationTrigger);
      })
    }
  });

});
