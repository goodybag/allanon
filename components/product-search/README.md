**Components.ProductSearch.Main** extends utils.View

Usage
-----

From a parent view, instantiate a ProductSearch view and 
[listenTo](http://backbonejs.org/#Events-listenTo) ProductSearch events.

**Example**

```javascript
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

```javascript
, render: function() {
    // Render parent's template
    this.$el.html( template() );

    // Attach search component to placeholder div
    this.$el.find('.product-search').html(this.productSearchView.$el);
  }
```

API
---

**new ProductSearch.Main()**

Construct a new ProductSearch view.

**'search:submit'** event

Triggered by key up, form submission or clicking search button.

**'search:clear'** event

Triggered by clicking the clear button in the search text field.
