/**
 * Component: App
 */

define(function(require){
  var
    utils = require('utils')

  , Views = {
      Nav:      require('../header-nav/component').Main
    , Pages:    require('../pages/component').Main
    , Modals:   require('../modal-manager/component').Main
    }

  , template = require('hbt!./app-tmpl')
  ;

  return utils.View.extend({
    className: 'app-container'

  , children: {
      nav:    new Views.Nav()
    , pages:  new Views.Pages()
    , modals: new Views.Modals()
    }

  , initialize: function(){
      this.pages = {};
      return this;
    }

  , showBanner: function(){
      if (utils.support.transform)
        this.$el.find('#app-banner').removeClass('banner-hide');
      else
        this.$el.find('#app-banner').animate({ 'top': '60px' });

      return this;
    }

  , hideBanner: function(){
      if (utils.support.transform)
        this.$el.find('#app-banner').addClass('banner-hide');
      else
        this.$el.find('#app-banner').animate({ 'top': '-500px' });

      return this;
    }

  , providePages: function(Pages){
      this.children.pages.providePages(Pages);
      return this;
    }

  , provideModals: function(Modals){
      this.children.modals.provide(Modals);
      return this;
    }

  , changePage: function(page, options, callback){
      return this.children.pages.changePage(page, options, callback);
    }

  , render: function(){
      this.$el.html( template() );

      this.children.nav.setElement(   this.$el.find('#app-header')[0] ).render();
      this.children.pages.setElement( this.$el.find('#app-pages') [0] ).render();
      this.children.modals.setElement(this.$el.find('#app-modals')[0] ).render();

      return this;
    }
  });
});