**Components.ProductSearch.Main** extends utils.View

Usage
-----

From a parent view, instantiate a ProductSearch view and 
[listenTo](http://backbonejs.org/#Events-listenTo) ProductSearch events.
The two events are:

* _"search:submit"_ : Triggered on key up, form submit or clicking search button
* _"search:clear"_  : Triggered by clicking the 'x' to clear text input

**Example**

```
var ExplorePage = Components.Pages.Page.extend({
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
```      

Then attach the ProductSearch view to the parent $el.

```
, render: function() {
    // Render parent's template
    this.$el.html( template() );

    // Attach search component to placeholder div
    this.$el.find('.product-search').html(this.productSearchView.$el);
  }
```
