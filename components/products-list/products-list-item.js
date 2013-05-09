define(function(require){
  var
    utils     = require('utils')
  , user      = require('user')
  , troller   = require('troller')
  , template  = require('hbt!./products-list-item-tmpl')
  ;

  return utils.View.extend({
    className: 'product-list-item'

  , tagName: 'li'

  , events: {
      'click .feeling-like':      'onLikeClick'
    , 'click .feeling-try':       'onTriedClick'
    , 'click .feeling-want':      'onWantClick'

    , 'click .product-photo':     'onProductPhotoClick'
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
      e.preventDefault();

      this.model.userWants = !this.model.userWants;

      this.$el.find('.feeling-want')[(this.model.userWants ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });
    }

  , onTriedClick: function(e){
      e.preventDefault();

      this.model.userTried = !this.model.userTried;

      this.$el.find('.feeling-try')[(this.model.userTried ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });
    }

  , onLikeClick: function(e){
      e.preventDefault();

      this.model.userLikes = !this.model.userLikes;

      this.$el.find('.feeling-like')[(this.model.userLikes ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });
    }

  , onProductPhotoClick: function(e){
      utils.history.navigate(
        utils.history.location.hash.substring(1) + '/products/' + this.model.id
      );

      var options = { product: this.model, productId: this.model.id };

      troller.modals.open('product-details', options);
    }
  });
});