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

  , template = require('hbt!./app-tmpl')
  ;

  return utils.View.extend({
    className: 'app-container'

  , children: {
      nav:    new Views.Nav()
    , pages:  new Views.Pages()
    , loader: utils.dom('<div id="main-loader" />')
    }

  , initialize: function(){
      this.pages = {};

      return this;
    }

  , providePages: function(Pages){
      this.children.pages.providePages(Pages);
      return this;
    }

  , changePage: function(page, options, callback){
      return this.children.pages.changePage(page, options, callback);
    }

  , render: function(){
      this.$el.html( template() );

      this.$el.append(this.children.loader);

      this.children.nav.setElement(   this.$el.find('.header-navbar')[0] ).render();
      this.children.pages.setElement( this.$el.find('.pages')[0] ).render();

      return this;
    }
  });
});