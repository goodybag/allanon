define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , Components  = require('../../components/index')

  , template    = require('hbt!./explore-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-explore'

  , events: {
      'submit #explore-search-form':        'onSearchSubmit'
    , 'click .search-form-btn':             'onSearchSubmit'
    }

  , initialize: function(){
      this.children = {
        products: new Components.ProductsList.Main()
      };
    }

  , provideData: function(data){
      this.products = data;
      this.children.products.provideData(data);

      return this;
    }

  , render: function(){
      this.$el.html( template() );

      // Attach products list
      this.children.products.setElement(
        this.$el.find('.products-list')[0]
      ).render();

      return this;
    }

  , onSearchSubmit: function(e){
      e.preventDefault();

      //TODO
    }
  });
});