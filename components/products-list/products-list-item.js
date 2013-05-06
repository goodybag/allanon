define(function(require){
  var
    utils     = require('utils')
  , user      = require('user')
  , template  = require('hbt!./products-list-item-tmpl')
  ;

  return utils.View.extend({
    className: 'product-list-item'

  , events: {
      'click .like':      'onLikeClick'
    , 'click .try':       'onTriedClick'
    , 'click .want':      'onWantClick'
    }

  , initialize: function(options){
      this.product = options.product;

      this.template = options.template || template;

      return this;
    }

  , save: function(){
      this.product

      return this;
    }

  , render: function(){
      this.template({
        product: this.product
      });

      return this;
    }

  , onWantClick: function(e){
      this.product.userWants = !this.product.userWants;

      this.user.updateProductFeelings(this.product.id, {
        isWanted: this.product.userWants
      , isLiked:  this.product.userLikes
      , isTried:  this.product.userTried
      });
    }

  , onTriedClick: function(e){
      this.product.userTried = !this.product.userTried;

      this.user.updateProductFeelings(this.product.id, {
        isWanted: this.product.userWants
      , isLiked:  this.product.userLikes
      , isTried:  this.product.userTried
      });
    }

  , onLikeClick: function(e){
      this.product.userLikes = !this.product.userLikes;

      this.user.updateProductFeelings(this.product.id, {
        isWanted: this.product.userWants
      , isLiked:  this.product.userLikes
      , isTried:  this.product.userTried
      });
    }
  });
});