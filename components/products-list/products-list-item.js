define(function(require){
  var
    utils     = require('utils')
  , user      = require('user')
  , template  = require('hbt!./products-list-item-tmpl')
  ;

  return utils.View.extend({
    className: 'product-list-item'

  , tagName: 'li'

  , events: {
      'click .like':      'onLikeClick'
    , 'click .try':       'onTriedClick'
    , 'click .want':      'onWantClick'
    }

  , initialize: function(options){
      this.template = options.template || template;

      return this;
    }

  , save: function(){
      return this;
    }

  , render: function(){
      var this_ = this;

      this.$el.html(
        this.template({
          product: this.model
        })
      );

      // Set the header top to the appropriate value based on height
      setTimeout(function(){
        this_.$el.find('.header').css(
          'top'
          // Extra to hide box-shadow
        , '-' + (this_.$el.find('.header').outerHeight() + 3) + 'px'
        );

        this_.$el.find('.product-feelings').css(
          'bottom'
          // Extra to hide box-shadow
        , '-' + (this_.$el.find('.product-feelings').outerHeight() + 3) + 'px'
        );
      }, 100)

      return this;
    }

  , onWantClick: function(e){
      this.model.userWants = !this.model.userWants;

      this.user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });
    }

  , onTriedClick: function(e){
      this.model.userTried = !this.model.userTried;

      this.user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });
    }

  , onLikeClick: function(e){
      this.model.userLikes = !this.model.userLikes;

      this.user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });
    }
  });
});