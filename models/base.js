define(function(require){
  var
    utils   = require('utils')
  , api     = require('api')
  , config  = require('config')

  , Model = utils.Model.extend({
      acceptable: [
        'id'
      ]

    , defaults: {
        id:             'New'
      }

    , types: {}

    , typeCasters: {
        'int':    function(value){ return parseInt(value); }
      , 'float':  function(value){ return parseFloat(value); }
      , 'string': function(value){ return "" + value + ""; }
      }

    , constructor: function(){
        this.changed_ = {};
        this._changed = [];

        utils.Model.prototype.constructor.apply(this, arguments);
      }

    , initialize: function(attributes, options){
        options = options || {};

        if (attributes && attributes.userId){
          this.attributes.id = attributes.userId;
          delete this.attributes.userId;
        }

        for (var key in this.attributes){
          if (this.acceptable.indexOf(key) === -1)
            delete this.attributes[key];
        }

        if (options.isNew == true) this.set('id', 'New');

        return this;
      }

    , makeNew: function(){
        this.set('id', 'New');
        return this;
      }

    , set: function(key, value){
        if (typeof key === "object"){
          for (var k in key)
            if (this.acceptable.indexOf(k) === -1) delete key[k];
        } else if (this.acceptable.indexOf(key) === -1) return this;

        if (this.types[key] && this.typeCasters[this.types[key]])
          value = this.typeCasters[this.types[key]](value);

        if (this.attributes[key] != value && key != 'id' && typeof key !== "object"){
          this._changed.push(value);
          this.changed_[key] = value;
        }

        utils.Model.prototype.set.apply(this, arguments);
      }

    , push: function(key){
        var args = Array.prototype.slice.call(arguments, 1);
        Array.prototype.push.apply(this.attributes[key], args);
        this._changed.push(this.attributes[key]);
        this.changed_[key] = this.attributes[key];
        return this;
      }

    , getChanged: function(){
        return this.changed_;
      }

    , save: function(data, callback){
        var this_ = this;

        if (typeof data === "function"){
          callback = data;
          data = null;
        }

        if (data) this.set(data);

        if (this.attributes.id && this.attributes.id !== 'New'){
          var attr = utils.clone(this.getChanged());

          delete attr.id;

          api[this.resource].update(this.attributes.id, attr, callback);
        } else {

          delete this.attributes.id;

          api[this.resource].create(this.attributes, function(error, result){
            if (error) return callback && callback(error);

            this_.set('id', result.id);

            if (callback) callback(null, result)
          });
        }

        return this;
      }

    , delete: function(callback){
        api[this.resource].del(this.attributes.id, callback);
      }
    })
  ;

  return Model;
});