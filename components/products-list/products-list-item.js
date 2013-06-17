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

      this._boundWltChange = utils.bind(this.onWltChange, this);
      troller.on('product:' + this.model.id + ':change:wlt', this._boundWltChange);

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

  , onWltChange: function(change, model){
      var userAction = (
        change == 'want' ? 'userWants' : (
        change == 'like' ? 'userLikes' : 'userTried'
      ));

      // Could potentially be two different models, so sync them
      this.model = model;

      this.$el.find('.feeling-' + change)[(this.model[userAction] ? 'add' : 'remove') + 'Class']('active');

      if (change == 'like') this.$el.find('.like-count').text(this.model.likes);
      this.trigger('feelings:change', change, model[userAction], model);
    }

  , onWantClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.userWants = !this.model.userWants;

      if (this.model.userWants) this.model.wants++;
      else this.model.wants--;

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });

      troller.trigger('product:' + this.model.id + ':change:wlt', 'want', this.model);
      troller.trigger('product:' + this.model.id + ':change', this.model);
    }

  , onTriedClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.userTried = !this.model.userTried;

      if (this.model.userTried) this.model.tries++;
      else this.model.tries--;

      this.$el.find('.feeling-try')[(this.model.userTried ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });

      troller.trigger('product:' + this.model.id + ':change:wlt', 'try', this.model);
      troller.trigger('product:' + this.model.id + ':change', this.model);
    }

  , onLikeClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.userLikes = !this.model.userLikes;

      if (this.model.userLikes) this.model.likes++;
      else this.model.likes--;

      this.$el.find('.feeling-like')[(this.model.userLikes ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });

      troller.trigger('product:' + this.model.id + ':change:wlt', 'like', this.model);
      troller.trigger('product:' + this.model.id + ':change', this.model);
    }

  , onProductPhotoClick: function(e){
      utils.history.navigate(
        utils.history.location.hash.substring(1) + '/products/' + this.model.id
      );

      var options = { product: this.model, productId: this.model.id };

      troller.modals.open('product-details', options);
    }

  , stopListening: function(){
      // clean up events
      troller.off('product:' + this.model.id + ':change:wlt', this._boundWltChange);
      utils.View.prototype.stopListening.apply(this, arguments);
    }
  });
});