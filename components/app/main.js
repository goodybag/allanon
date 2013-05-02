/**
 * Component: App
 */

define(function(require){
  var
    utils = require('utils')

  , Views = {
      Nav:    require('../header-nav/component').Main
    , Pages:  require('../pages/component').Main
    }
  ;

  return utils.View.extend({
    className: 'app-container'

  , children: {
      nav:    new Views.Nav()
    , pages:  new Views.Pages()
    }

  , initialize: function(){
      this.childOrder = [
        this.children.nav
      , this.children.pages
      ];

      this.pages = {};

      return this;
    }

  , providePages: function(Pages){
      this.pages.providePages(Pages);
      return this;
    }

  , changePage: function(page, options){
      this.pages.changePage(page, options);
    }

  , render: function(){
      this.$el.html("");

      for (var i = 0, l = this.childOrder.length; i < l; ++i){
        this.$el.append( this.childOrder[i].render().$el );
      }

      return this;
    }
  });
});