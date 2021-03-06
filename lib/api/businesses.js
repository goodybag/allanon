define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('businesses', query, callback);
    }

  , get: function(id, callback){
      return utils.api.get('businesses/' + id, callback);
    }

  , create: function(data, callback){
      return utils.api.post('businesses', data, callback);
    }

  , update: function(id, data, callback){
      return utils.api.update('businesses/' + id, data, callback);
    }

  , remove: function(id, callback){
      return utils.api.del('businesses/' + id, callback);
    }

  , locations: {
      list: function(bid, query, callback){
        return utils.api.get('businesses/' + bid + '/locations', query, callback);
      }

    , get: function(bid, id, callback){
        return utils.api.get('businesses/' + bid + '/locations/' + id, callback);
      }

    , create: function(bid, data, callback){
        return utils.api.post('businesses/' + bid + '/locations', data, callback);
      }

    , update: function(bid, id, data, callback){
        return utils.api.update('businesses/' + bid + '/locations/' + id, data, callback);
      }

    , remove: function(bid, id, callback){
        return utils.api.del('businesses/' + bid + '/locations/' + id, callback);
      }
    }

  , loyalty: {
      get: function(bid, callback){
        return utils.api.get('businesses/' + bid + '/loyalty', callback);
      }

    , update: function(bid, data, callback){
        return utils.api.update('businesses/' + bid + '/loyalty', data, callback);
      }
    }

  , products: {
      list: function(bid, query, callback){
        return utils.api.get('businesses/' + bid + '/products', query, callback);
      }
    }

  , productCategories: {
      list: function(bid, query, callback){
        return utils.api.get('businesses/' + bid + '/product-categories', query, callback);
      }

    , get: function(bid, id, callback){
        return utils.api.get('businesses/' + bid + '/product-categories/' + id, callback);
      }

    , create: function(bid, data, callback){
        return utils.api.post('businesses/' + bid + '/product-categories', data, callback);
      }

    , update: function(bid, id, data, callback){
        return utils.api.update('businesses/' + bid + '/product-categories/' + id, data, callback);
      }

    , remove: function(bid, id, callback){
        return utils.api.del('businesses/' + bid + '/product-categories/' + id, callback);
      }
    }

  , productTags: {
      list: function(bid, query, callback){
        return utils.api.get('businesses/' + bid + '/product-tags', query, callback);
      }

    , get: function(bid, id, callback){
        return utils.api.get('businesses/' + bid + '/product-tags/' + id, callback);
      }

    , create: function(bid, data, callback){
        return utils.api.post('businesses/' + bid + '/product-tags', data, callback);
      }

    , update: function(bid, id, data, callback){
        return utils.api.update('businesses/' + bid + '/product-tags/' + id, data, callback);
      }

    , remove: function(bid, id, callback){
        return utils.api.del('businesses/' + bid + '/product-tags/' + id, callback);
      }
    }
  };
});