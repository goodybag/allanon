define(function(require){
  require('./sync');
  return {
    Product: require('./product')
    Collection: require('./collection');
  };
});
