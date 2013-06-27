/**
 * Component: Header Navbar
 */

define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')

  , template  = require('hbt!./main')
  ;

  require('less!./main.less');

  return utils.View.extend({
    className: 'header-navbar'

  , events: {
      'click .badge':             'onBadgeClick'
    , 'click .logo':              'onLogoClick'
    , 'click .edit-keytag-link':  'onEditKeytag'
    , 'click .logout':            'onLogoutClick'
    , 'click .login':             'onLoginClick'
    , 'click .more':              'onMoreClick'
    }

  , initialize: function(){

      // Manually bind onDocClick since it's outside of element scope
      // we can't use typical event binding
      this.onDocumentClick = utils.bind( this.onDocumentClick, this );

      // When we get/lose session data, user model changes, update header
      user.on('auth',               utils.bind(this.render, this));
      user.on('deauth',             utils.bind(this.render, this));
      user.on('change:avatarUrl',   utils.bind(this.render, this));
      user.on('change:screenName',  utils.bind(this.render, this));

      return this;
    }

  , render: function(){
      this.$el.html( template({ user: user.toJSON() }) );

      this.$badge = this.$el.find('.badge');
      this.$badgeWrapper = this.$el.find('.badge-wrapper');

      if (!this.$document) this.$document = utils.dom(document);

      return this;
    }

  , onBadgeClick: function(e){
      // Toggle active class, bind/unbind document click
      if (this.$badge.hasClass('active')){
        this.$badge.removeClass('active');

        // reset overflow - needs to be delayed because of a
        // painting bug in chrome
        var this_ = this;
        setTimeout(function(){
          this_.$badgeWrapper.css('overflow', '');
        }, 10);
        this.$document.unbind('click', this.onDocumentClick);
      } else {
        this.$badge.addClass('active');

        // Need to set overflow so menu shows up
        this.$badgeWrapper.css('overflow', 'visible');
        this.$document.bind('click', this.onDocumentClick);
      }

      troller.analytics.track('Click Header Badge');
    }

  , onDocumentClick: function(e){
      var $target = utils.dom(e.target);

      if ($target.hasClass('badge') || $target.parents('.badge').length > 0) return;

      if (this.$badge.hasClass('active')){
        this.$badge.removeClass('active');
        // reset overflow - needs to be delayed because of a
        // painting bug in chrome
        var this_ = this;
        setTimeout(function(){
          this_.$badgeWrapper.css('overflow', '');
        }, 10);
        this.$document.unbind('click', this.onDocumentClick);
      }
    }

  , onLogoClick: function(e){
      utils.history.navigate('/explore/popular', { trigger: true });
    }

  , onEditKeytag: function(e) {
      e.preventDefault();
      if (!user.get('loggedIn')) return troller.promptUserLogin();
      troller.modals.open('enter-keytag');
    }

  , onLogoutClick: function(e){
      e.preventDefault();
      user.logout();
    }

  , onLoginClick: function(e){
      e.preventDefault();
      troller.promptUserLogin();
    }

  , onMoreClick: function(e){
      e.preventDefault();
    }
  });
});
