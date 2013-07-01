define(function(require){
  var utils = require('utils');

  return {
    list: function(uid, options, callback){
      if (typeof options === "function"){
        callback = options;
        options = null;
      }

      return utils.api.get('consumers/' + uid + '/collections', options, callback);
    }

  , get: function(uid, cid, options, callback){
      return utils.api.get('consumers/' + uid + '/collections/' + cid, options, callback);
    }

  , create: function(uid, collection, callback){
      return utils.api.post('consumers/' + uid + '/collections', collection, callback);
    }

  , products: function(uid, cid, options, callback){
      return utils.api.get('consumers/' + uid + '/collections/' + cid + '/products', options, callback);
    }

  , add: function(uid, cid, pid, callback){
      return utils.api.post('consumers/' + uid + '/collections/' + cid + '/products', { productId: pid }, callback);
    }

  , remove: function(uid, cid, pid, callback){
      return utils.api.del('consumers/' + uid + '/collections/' + cid + '/products/' + pid, callback);
    }

  , update: function(uid, cid, collection, callback){
      if (typeof cid === "object"){
        callback = collection;
        collection = cid;
        cid = collection.id;
        delete collection.id;
      }

      return utils.api.put('consumers/' + uid + '/collections/' + cid, collection, callback);
    }

  , del: function(uid, cid, callback){
      return utils.api.del('consumers/' + uid + '/collections/' + cid, callback);
    }
  };
});
