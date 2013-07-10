define(function(require){
  var
    $         = require('jquery') || jQuery
  , Modal     = require('bootstrap-modal')
  , Spinner   = require('spin-js').Spinner
  , _         = require('underscore') || window._
  , geo       = require('geo')
  , async     = require('async')

  , config    = require('../config')
  , utils     = _.extend({}, _)
  ;

  require('jquery-cookie');
  utils.cookie = $.cookie;

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

  utils.async      = async;
  utils.parallel   = async.parallel;

  utils.geo = geo;

  // Fix map
  utils.map = _.map;
  utils.asyncMap = async.map

  var pkg;
  try {
    pkg = JSON.parse(require('text!../package.json'));
  } catch(e){}

  /**
   * Indexes an array of objects by a field onto an object
   * @param  {Array} set    The set of objects to be indexed
   * @param  {Object} obj   The object you want to do the indexing
   * @param  {String} field The field to be indexed on
   * @return {Object}       Returns the passed in object for convenience
   */
  utils.index = function(set, obj, field){
    if (typeof obj == 'string'){
      field = obj;
      obj = {};
    }

    for (var i = 0, l = set.length; i < l; ++i)
      obj[ set[i][field] ] = set[i];

    return obj;
  };

  utils.capitalize = function(str){
    return str[0].toUpperCase() + str.substring(1);
  };

  utils.domready(function(){
    utils.support.transform = (function(){
      var div = document.createElement('div');
      var props = [
        'webkitTransform'
      , 'mozTransform'
      , 'msTransform'
      , 'oTransform'
      , 'transform'
      ];

      for (var i = props.length - 1; i >= 0; i--)
        if (props[i] in div.style) return true;

      return false;
    })();
  });

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

        this.children[key].$el.remove();
        this.children[key].undelegateEvents();
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

  , updateBehaviors: {}

  , updateModelWithFormData: function(){
      var $el;
      for (var key in this.model.attributes){
        if (($el = this.$el.find('.field-' + key)).length > 0){

          // Extended behavior
          if (this.updateBehaviors[key])
            this.model.set(key, this.updateBehaviors[key]($el));

          // Checkbox or radio
          else if ($el[0].tagName === "INPUT" && ($el[0].type === "checkbox" || $el[0].type === "radio"))
            this.model.set(key, $el[0].checked == true);

          // Textarea
          else if ($el[0].tagName === "TEXTAREA")
            this.model.set(key, $el[0].value);

          // Price needs to be multiplied by 100
          else if ($el.hasClass('field-price'))
            this.model.set(key, $el.val() * 100)

          // Everything else
          else this.model.set(key, $el.val());
        }
      }
      return this;
    }
  });

  utils.getProductsByCategory = function(products){
    var cats = [{ name: 'Uncategorized', products: [] }];
    var _cats = { 'Uncategorized': cats[0] };

    for (var i = 0, l = products.length, pcats; i < l; ++i){
      if (products[i].categories && products[i].categories.length){
        pcats = products[i].categories;

        for (var ii = 0, ll = pcats.length; ii < ll; ++ii){
          if (!_cats[pcats[ii].name]){
            cats.push(
              _cats[pcats[ii].name] = {
                name:     pcats[ii].name
              , products: [ products[i] ]
              }
            );
          } else {
            _cats[pcats[ii].name].products.push( products[i] );
          }
        }
      } else {
        _cats.Uncategorized.products.push( products[i] );
      }
    }

    if (cats[0].products.length == 0) cats.shift();

    _cats = null;

    return cats;
  };

  utils.escapeRegExp = function(str){
    if (str == null) return '';
    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  };

  utils.defaultToWhiteSpace = function(characters) {
    if (characters == null)
      return '\\s';
    else if (characters.source)
      return characters.source;
    else
      return '[' + utils.escapeRegExp(characters) + ']';
  };

  utils.trim = function(str, characters){
    if (str == null) return '';
    if (!characters && String.prototype.trim) return String.prototype.trim.call(str);
    characters = utils.defaultToWhiteSpace(characters);
    return String(str).replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
  }

  utils.pickFile = function(options, callback){
    if (typeof options == 'function'){
      callback = options;
      options = null;
    }

    options = options || { mimetypes:['image/*'] };

    filepicker.pick(
      options
    , function(file){  if (callback) callback(null, file); }
    , function(error){ if (callback) callback(error); }
    );
  };

  utils.base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = utils.base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            utils.base64._keyStr.charAt(enc1) + utils.base64._keyStr.charAt(enc2) +
            utils.base64._keyStr.charAt(enc3) + utils.base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = utils.base64._keyStr.indexOf(input.charAt(i++));
            enc2 = utils.base64._keyStr.indexOf(input.charAt(i++));
            enc3 = utils.base64._keyStr.indexOf(input.charAt(i++));
            enc4 = utils.base64._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = utils.base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    }
  };

  // Native base64
  if (window.btoa) utils.base64.encode = function(input){ return btoa(input) };
  if (window.atob) utils.base64.decode = function(input){ return atob(input) };

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

  utils.startHistory = function(){
    utils.history = Backbone.history;
    utils.history.start();
    utils.navigate = function(){ utils.history.navigate.apply(utils.history, arguments); };
  }

  utils.filter = function(set, fn){
    var filtered = [];
    for (var i = 0, l = set.length; i < l; ++i){
      if (fn(set[i])) filtered.push(set[i]);
    }
    return filtered;
  };

  utils._ajax = $.ajax;

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
    , headers: { application: 'allanon ' + pkg.version }
    , xhrFields: { withCredentials: true }
    , crossDomain: true
    , success: function(results){
        if (typeof results == 'string' && results) results = JSON.parse(results);
        results = results || {};
        callback && callback(results.error, results.data, results.meta);
      }
    , error: function(error, results, res, r){
        var message;
        if (typeof error.responseText === 'string')
          try {
            message = JSON.parse(error.responseText).error;
          } catch(e) {
            message = error;
          }
        else
          message = error;
        callback && callback(message);
      }
    };

    if (data) ajax.data = data;

    if (!utils.support.cors){
      ajax.cache = false;
      delete ajax.xhrFields;
      delete ajax.crossDomain;
    }

    if (!utils.support.cors) return utils.rpc.request(ajax, ajax.success, ajax.error);

    return $.ajax(ajax);
  };

  utils.get = function(url, params, callback){
    return utils.ajax('get', url, params, callback);
  };

  utils.post = function(url, data, callback){
    return utils.ajax('post', url, data, callback);
  };

  utils.put = function(url, data, callback){
    return utils.ajax('put', url, data, callback);
  };

   utils.patch = function(url, data, callback){
    return utils.ajax('patch', url, data, callback);
  };

  utils.del = function(url, data, callback){
    return utils.ajax('delete', url, data, callback);
  };

  utils.queryParams = function(data){
    if (typeof data !== "object") return "";
    var params = "?";
    for (var key in data){
      if (utils.isArray(data[key])){
        for (var i = 0, l = data[key].length; i < l; ++i){
          params += key + "[]=" + data[key][i] + "&";
        }
      } else {
        params += key + "=" + data[key] + "&";
      }
    }
    return params.substring(0, params.length - 1);
  };

  utils.parseQueryParams = function() {
    var params = {};
    var match = /^\?(\S*)$/.exec(window.location.search);
    if (match == null || match.length !== 2) return params;
    var pairs = match[1].split(/[&;]/);
    for (var i=0, len=pairs.length; i < len; i++) {
      var pair = pairs[i].split('=');
      if (pair.length === 2)
        params[pair[0]] = pair[1];
      if (pair.length === 1)
        params[pair[0]] = null;
    };
    return params;
  };

  utils.noop = function(){};

  utils.api = {};

  utils.api.get = function(url, data, callback){
    return utils.get(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  utils.api.post = function(url, data, callback){
    return utils.post(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  utils.api.patch = function(url, data, callback){
    return utils.put(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  utils.api.update = function(url, data, callback){
    return utils.put(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  utils.api.put = function(url, data, callback){
    return utils.put(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  utils.api.del = function(url, data, callback){
    return utils.del(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  return utils;
});
