define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/businesses', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/businesses/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/businesses', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/businesses/' + id, data, callback);
    }

  , remove: function(id, callback){
      utils.api.del('v1/businesses/' + id, callback);
    }

  , locations: {
      list: function(bid, query, callback){
        utils.api.get('v1/businesses/' + bid + '/locations', query, callback);
      }

    , get: function(bid, id, callback){
        utils.api.get('v1/businesses/' + bid + '/locations/' + id, callback);
      }

    , create: function(bid, data, callback){
        utils.api.post('v1/businesses/' + bid + '/locations', data, callback);
      }

    , update: function(bid, id, data, callback){
        utils.api.update('v1/businesses/' + bid + '/locations/' + id, data, callback);
      }

    , remove: function(bid, id, callback){
        utils.api.del('v1/businesses/' + bid + '/locations/' + id, callback);
      }
    }

  , loyalty: {
      get: function(bid, callback){
        utils.api.get('v1/businesses/' + bid + '/loyalty', callback);
      }

    , update: function(bid, data, callback){
        utils.api.update('v1/businesses/' + bid + '/loyalty', data, callback);
      }
    }

  , products: {
      list: function(bid, query, callback){
        utils.api.get('v1/businesses/' + bid + '/products', query, callback);
      }
    }

  , productCategories: {
      list: function(bid, query, callback){
        utils.api.get('v1/businesses/' + bid + '/product-categories', query, callback);
      }

    , get: function(bid, id, callback){
        utils.api.get('v1/businesses/' + bid + '/product-categories/' + id, callback);
      }

    , create: function(bid, data, callback){
        utils.api.post('v1/businesses/' + bid + '/product-categories', data, callback);
      }

    , update: function(bid, id, data, callback){
        utils.api.update('v1/businesses/' + bid + '/product-categories/' + id, data, callback);
      }

    , remove: function(bid, id, callback){
        utils.api.del('v1/businesses/' + bid + '/product-categories/' + id, callback);
      }
    }

  , productTags: {
      list: function(bid, query, callback){
        utils.api.get('v1/businesses/' + bid + '/product-tags', query, callback);
      }

    , get: function(bid, id, callback){
        utils.api.get('v1/businesses/' + bid + '/product-tags/' + id, callback);
      }

    , create: function(bid, data, callback){
        utils.api.post('v1/businesses/' + bid + '/product-tags', data, callback);
      }

    , update: function(bid, id, data, callback){
        utils.api.update('v1/businesses/' + bid + '/product-tags/' + id, data, callback);
      }

    , remove: function(bid, id, callback){
        utils.api.del('v1/businesses/' + bid + '/product-tags/' + id, callback);
      }
    }
  };
});