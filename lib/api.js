define(function(require){
  return {
    businesses:             require('./api/businesses')
  , locations:              require('./api/locations')
  , session:                require('./api/session')
  , products:               require('./api/products')
  , productCategories:      require('./api/product-categories')
  , productTags:            require('./api/product-tags')
  , consumers:              require('./api/users').consumers
  };
});