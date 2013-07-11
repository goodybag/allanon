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

      this.listenTo(this.model, {
        'change:userWants': this.onFeelingsChange
      , 'change:userLikes': this.onFeelingsChange
      , 'change:userTried': this.onFeelingsChange
      , 'change:likes':     this.onLikeCountChange
      });

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
        var props = {'.header': 'top', '.product-feelings': 'bottom'};
        for (var selector in props) {
          var elem = this_.$el.find(selector);
          elem.css(props[selector], '-' + (elem.outerHeight() + 3) + 'px'); // extra 3 pixels is for drop shadow
        }

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

      //TODO: consider replacing this with this.model.save().  but maybe not here.
      user.updateProductFeelings(this.model.get('id'), {
        isWanted: this.model.get('userWants')
      , isLiked:  this.model.get('userLikes')
      , isTried:  this.model.get('userTried')
      });
     }

  , onLikeCountChange: function(e) {
      this.$likeCount.text(this.model.get('likes'));
    }

  , onFeelingsClick: function(e, prop, message) {
      e.preventDefault();

      troller.analytics.track(message, this.model.toJSON());

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      // changing the property triggers an event which switches the button state
      this.model.set(prop, !this.model.get(prop));
    }

  , onWantClick: function(e){
      this.onFeelingsClick(e, 'userWants', 'Click Want');
    }

  , onTriedClick: function(e){
      this.onFeelingsClick(e, 'userTried', 'Click Tried');
    }

  , onLikeClick: function(e){
      this.onFeelingsClick(e, 'userLikes', 'Click Like');
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
  });
});
