define(function(require){
  var
    $         = require('jquery') || jQuery
  , Modal     = require('bootstrap-modal')
  , Spinner   = require('spin-js').Spinner
  , _         = require('underscore') || window._
  , geo       = require('geo')

  , config    = require('../config')
  , utils     = _.extend({}, _, require('async'))
  ;

  require('backbone');

  utils.dom = jQuery;
  utils.getScript = jQuery.getScript;
  utils.domready = jQuery;
  utils.support = jQuery.support;
  utils.browser = jQuery.browser;

  utils.Modal = Modal;

  utils.Spinner = Spinner;

  utils.Backbone   = Backbone;
  utils.Events     = Backbone.Events;
  utils.Router     = Backbone.Router;
  utils.Model      = Backbone.Model;
  utils.View       = Backbone.View;
  utils.Collection = Backbone.Collection;
  utils.History    = Backbone.History;

  utils.geo = geo;

  // Add CSS3 transition - This breaks our modals for some reason. Dammit, @fat
  // utils.domready(function(){
  //   $.support.transition = (function () {

  //     var transitionEnd = (function () {

  //       var el = document.createElement('bootstrap')
  //         , transEndEventNames = {
  //              'WebkitTransition' : 'webkitTransitionEnd'
  //           ,  'MozTransition'    : 'transitionend'
  //           ,  'OTransition'      : 'oTransitionEnd otransitionend'
  //           ,  'transition'       : 'transitionend'
  //           }
  //         , name

  //       for (name in transEndEventNames){
  //         if (el.style[name] !== undefined) {
  //           return transEndEventNames[name]
  //         }
  //       }

  //     }())

  //     return transitionEnd && {
  //       end: transitionEnd
  //     }

  //   })()
  // });

  // add regions to backbone views
  utils.View = utils.View.extend({
    applyRegions: function(){
      var append;
      for (var key in this.regions){
        if (key[key.length - 1] == '>'){
          append = true;
          key = key.substring(0, key.length - 1);
        } else append = false;

        if (!(key in this.children)) continue;

        if (append){
          this.$el.find(this.regions[key + '>']).append(
            this.children[key].$el
          );
        } else {
          this.children[key].setElement(
            this.$el.find(this.regions[key]).eq(0)
          );
        }

        this.children[key].render();
        this.children[key].delegateEvents();

        if (this.children[key].constructor.prototype.className)
          this.children[key].$el.addClass(this.children[key].constructor.prototype.className);
      }
      return this;
    }
  });

  if (!utils.geo.isSupported()){
    // Override for browsers that do not support and give
    // default location
    utils.geo.getLocation = function(callback){
      if (callback) return callback(null, config.defaults.location);
    };
  }

  if (!utils.support.cors){
    utils.rpc = new easyXDM.Rpc({ remote: config.proxyUrl }, {
      remote: { request: {} }
    });
  }


  utils.filter = function(set, fn){
    var filtered = [];
    for (var i = 0, l = set.length; i < l; ++i){
      if (fn(set[i])) filtered.push(set[i]);
    }
    return filtered;
  };

  utils.ajax = function(method, url, data, callback){
    switch (method){
      case "get":     method = "GET";     break;
      case "post":    method = "POST";    break;
      case "del":     method = "DELETE";  break;
      case "put":     method = "PUT";     break;
      case "patch":   method = "PUT";     break;
    }

    if (typeof data === "function"){
      callback = data;
      data = null;
    }

    if (method === "GET" || method === "get"){
      url += utils.queryParams(data);
      data = null;
    }

    var ajax = {
      type: method
    , method: method
    , url: url
    , xhrFields: { withCredentials: true }
    , crossDomain: true
    , success: function(results){
        if (typeof results == 'string' && results) results = JSON.parse(results);
        results = results || {};
        callback && callback(results.error, results.data, results.meta);
      }
    , error: function(error, results, res, r){
        callback && callback(error.responseText ? JSON.parse(error.responseText).error : error);
      }
    };


    if (data) ajax.data = data;

    if (!utils.support.cors){
      ajax.cache = false;
      delete ajax.xhrFields;
      delete ajax.crossDomain;
    }

    if (!utils.support.cors) utils.rpc.request(ajax, ajax.success, ajax.error);
    else $.ajax(ajax);
  };

  utils.get = function(url, params, callback){
    utils.ajax('get', url, params, callback);
    return utils;
  };

  utils.post = function(url, data, callback){
    utils.ajax('post', url, data, callback);
    return utils;
  };

  utils.put = function(url, data, callback){
    utils.ajax('put', url, data, callback);
    return utils;
  };

   utils.patch = function(url, data, callback){
    utils.ajax('patch', url, data, callback);
    return utils;
  };

  utils.del = function(url, data, callback){
    utils.ajax('delete', url, data, callback);
    return utils;
  };

  utils.queryParams = function(data){
    if (typeof data !== "object") return "";
    var params = "?";
    for (var key in data){
      params += key + "=" + data[key] + "&";
    }
    return params.substring(0, params.length - 1);
  };

  utils.noop = function(){};

  utils.api = {};

  utils.api.get = function(url, data, callback){
    utils.ajax('get', config.apiUrl + url, data, callback);
  };

  utils.api.post = function(url, data, callback){
    utils.ajax('post', config.apiUrl + url, data, callback);
  };

  utils.api.patch = function(url, data, callback){
    utils.ajax('patch', config.apiUrl + url, data, callback);
  };

  utils.api.update = function(url, data, callback){
    utils.ajax('patch', config.apiUrl + url, data, callback);
  };

  utils.api.del = function(url, data, callback){
    utils.api.ajax('del', config.apiUrl + url, data, callback);
  };

  return utils;
});
