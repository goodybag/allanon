/**
 * Component: App
 */

define(function(require){
  var
    utils = require('utils')

  , Views = {
      Nav:    require('../header-nav/component').Main
    // , Pages:  require('../pages/component').Main
    }
  ;

  return utils.View.extend({
    className: 'app-container'

  , children: {
      nav:    new Views.Nav()
    // , pages:  new Views.Pages()
    }

  , initialize: function(){
      this.childOrder = [
        this.children.nav
      // , this.children.pages
      ];

      return this;
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