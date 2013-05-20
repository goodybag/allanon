define(function(require){
  var utils = require('utils');

  return {
    list: function(uid, options, callback){
      if (typeof options === "function"){
        callback = options;
        options = null;
      }

      utils.api.get('v1/consumers/' + uid + '/collections', options, callback);
    }

  , get: function(uid, cid, options, callback){
      utils.api.get('v1/consumers/' + uid + '/collections/' + cid, options, callback);
    }

  , create: function(uid, collection, callback){
      utils.api.post('v1/consumers/' + uid + '/collections', collection, callback);
    }

  , products: function(uid, cid, options, callback){
      utils.api.get('v1/consumers/' + uid + '/collections/' + cid + '/products', options, callback);
    }

  , add: function(uid, cid, pid, callback){
      utils.api.post('v1/consumers/' + uid + '/collections/' + cid + '/products', { productId: pid }, callback);
    }

  , remove: function(uid, cid, pid, callback){
      utils.api.del('v1/consumers/' + uid + '/collections/' + cid + '/products/' + pid, callback);
    }

  , update: function(uid, cid, collection, callback){
      if (typeof cid === "object"){
        callback = collection;
        collection = cid;
        cid = collection.id;
        delete collection.id;
      }

      utils.api.put('v1/consumers/' + uid + '/collections/' + cid, collection, callback);
    }

  , del: function(uid, cid, callback){
      utils.api.del('v1/consumers/' + uid + '/collections/' + cid, callback);
    }
  };
});
