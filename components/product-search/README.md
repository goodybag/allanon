**Components.ProductSearch.Main** extends utils.View

Usage
-----

From a parent view, instantiate a ProductSearch view and 
[listenTo](http://backbonejs.org/#Events-listenTo) ProductSearch events.
The two events are:

 * 'search:submit' - Triggered on key up, form submit or clicking search button
 * 'search:clear'  - Triggered by clicking the 'x' to clear text input

  Components.Pages.Page.extend({
    className: 'page page-explore'

  , title: 'Explore Goodybag'

  , initialize: function() {
      // ...

      // Create child views
      this.productSearchView = new Components.ProductSearch.Main();
      
      // Listen to child views
      this.listenTo(this.productSearchView, 'search:submit', this.onSearchSubmit);
      this.listenTo(this.productSearchView, 'search:clear',  this.onSearchClear);
    }

  , onSearchSubmit(e) {
      // ...
    }

  , onSearchClear(e) {
      // ...
    }

Then attach the ProductSearch view to the parent $el.

  , render: function() {
      // Render parent's template
      this.$el.html( template() );

      // Render children and attach to placeholder div, .product-search for example
      this.productSearchView.render();
      this.$el.find('.product-search').html(this.productSearchView.$el);
    }



