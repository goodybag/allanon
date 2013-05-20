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
    // , 'keyup .field-search':                'onSearchSubmit'

    , 'click .filters-btn-group > .btn':    'onFiltersClick'
    }

  , initialize: function(options){
      this.children = {
        products: new Components.ProductsList.Main()
      };

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

      api.products.list(this.options, function(error, results){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.provideData(results);

        if (callback) callback(null, results);
      });
    }

  , provideData: function(data){
      this.products = data;
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
      if (utils.dom(e.target).hasClass('active')) e.preventDefault();
      this.$el.find('.filters-btn-group > .btn').removeClass('active');
      utils.dom(e.target).addClass('active');
    }
  });
});