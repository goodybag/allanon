define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')
  , template  = require('hbt!./wlt-tmpl')
  ;

  return utils.View.extend({
    className: 'btn-group wlt-btn-group'

  , events: {
      'click .btn-like':      'onLikeClick'
    , 'click .btn-try':       'onTriedClick'
    , 'click .btn-want':      'onWantClick'
    }

  , initialize: function(options){
      options = options || {};

      if (options.large) this.$el.addClass('btn-group-large')

      return this;
    }

  , provideModel: function(model){
      this.model = model;

      if (this.model.userLikes == null || this.model.userLikes == undefined)
        throw new Error('WLT model requires userLikes property');
      if (this.model.userWants == null || this.model.userWants == undefined)
        throw new Error('WLT model requires userWants property');
      if (this.model.userTried == null || this.model.userTried == undefined)
        throw new Error('WLT model requires userTried property');

      return this;
    }

  , render: function(){
      this.$el.html(template(this.model));
      return this;
    }

  , onWantClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.userWants = !this.model.userWants;

      if (this.model.userWants) this.model.wants++;
      else this.model.wants--;

      this.$el.find('.btn-want')[(this.model.userWants ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });

      troller.trigger('product:' + this.model.id + ':change:wlt', 'want', this.model);
      troller.trigger('product:' + this.model.id + ':change', this.model);
      this.trigger('wlt:change', 'want', this.model);
    }

  , onTriedClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.userTried = !this.model.userTried;

      if (this.model.userTried) this.model.tries++;
      else this.model.tries--;

      this.$el.find('.btn-try')[(this.model.userTried ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });

      troller.trigger('product:' + this.model.id + ':change:wlt', 'try', this.model);
      troller.trigger('product:' + this.model.id + ':change', this.model);
      this.trigger('wlt:change', 'tried', this.model);
    }

  , onLikeClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      this.model.userLikes = !this.model.userLikes;

      if (this.model.userLikes) this.model.likes++;
      else this.model.likes--;

      this.$el.find('.btn-like')[(this.model.userLikes ? 'add' : 'remove') + 'Class']('active');

      user.updateProductFeelings(this.model.id, {
        isWanted: this.model.userWants
      , isLiked:  this.model.userLikes
      , isTried:  this.model.userTried
      });

      troller.trigger('product:' + this.model.id + ':change:wlt', 'like', this.model);
      troller.trigger('product:' + this.model.id + ':change', this.model);
      this.trigger('wlt:change', 'like', this.model);
    }
  });
});