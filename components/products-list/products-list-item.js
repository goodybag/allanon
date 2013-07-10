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
/*
      this._boundWltChange = utils.bind(this.onWltChange, this);
      troller.on('product:' + this.model.id + ':change:wlt', this._boundWltChange);
*/
      return this;
    }

  , render: function(){
      var this_ = this;

      this.$el.html(
        this.template({
          product: this.model.toJSON()
        })
      );

      // the timeout is necessary make sure the dom has updated between the html
      // statement above and getting the newly inserted elements
      setTimeout(function(){
        // Set the header top to the appropriate value based on height
        var props = {this_.$el.find('.header'): 'top', this_.$el.find('.product-feelings'): 'bottom'};
        for (var elem in props)
          elem.css(props[elem], '-' + (elem.outerHeight() + 3) + 'px'); // extra 3 pixels is for drop shadow

        // setup properties
        this_.$wantBtn  = this_.$el.find('.feeling-want');
        this_.$likeBtn  = this_.$el.find('.feeling-like');
        this_.$triedBtn = this_.$el.find('.feeling-try');

        this_.$likeCount = this_.$el.find('.like-count');
      }, 100)

      return this;
    }

  , onFeelingsChange: function(e) {
      var buttons = {userWants: this.$wantBtn, userLikes: this.$likeBtn, userTried: this.$triedBtn};
      for (var prop in this.model.changed)
        if (buttons[prop] != null) buttons[prop].toggleClass('active', this.model.get(prop));

      user.updateProductFeelings(this.model.get('id'), {
        isWanted: this.model.get('userWants')
      , isLiked:  this.model.get('userLikes')
      , isTried:  this.model.get('userTried')
      });
     }

  , onLikeCountChange: function(e) {
      this.$likeCount.text(this.model.get('likes'));
    }

  , onWantClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      // changing the property triggers an event which switches the button state
      this.model.set('userWants', !this.model.get('userWants'));

      troller.analytics.track('Click Want', this.model);
    }

  , onTriedClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.set('userTried', !this.model.get('userTried'));

      troller.analytics.track('Click Tried', this.model);
    }

  , onLikeClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.set('userLikes', !this.model.get('userLikes'));

      troller.analytics.track('Click Like', this.model);
    }

  , onProductPhotoClick: function(e){
      utils.history.navigate(
        utils.history.location.hash.substring(1) + '/products/' + this.model.id
      );

      var options = { product: this.model, productId: this.model.get('id') };
      var this_ = this;

      troller.modals.open('product-details', options, function(error, modal){
        modal.once('close', function(){
          this_.trigger('product-details-modal:close')
        });
      });

      this.trigger('product-details-modal:open', this.model);
    }

  , stopListening: function(){
      // clean up events
      this.stopListening(model);
      utils.View.prototype.stopListening.apply(this, arguments);
    }
  });
});
