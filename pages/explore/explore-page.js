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
      // , filter:     null
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

      var this_ = this;

      this.fetchData(function(error, results){
        if (error) troller.error(error), troller.spinner.stop();

        troller.spinner.stop();
        this_.render();
      });

      return this;
    }

  , fetchData: function(callback){
      var this_ = this;

      troller.spinner.spin();

      api.products.list(this.options, function(error, results){
        troller.spinner.stop();

        if (error) return callback ? callback(error) : troller.error(error);

        this_.options.offset += this_.options.limit; // bump the page

        this_.provideData(results);

        if (callback) callback(null, results);
      });
    }

  , provideData: function(data){
      this.products = this.products.concat(data);
      this.children.products.provideData(data);

      return this;
    }

  , render: function(){
      this.$el.html( template({ options: this.options }) );

      // Attach products list
      this.children.products.setElement(
        this.$el.find('.products-list')[0]
      ).render();

      this.$search = this.$el.find('.field-search');

      this.paginationTrigger = parseInt(document.height - (window.innerHeight / 4));

      troller.scrollWatcher.once('scroll-' + this.paginationTrigger, this.fetchData, this);
      troller.scrollWatcher.addEvent(this.paginationTrigger);

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
  });
});
