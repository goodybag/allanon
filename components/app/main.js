/**
 * Component: App
 */

define(function(require){
  var
    utils = require('utils')

  , Views = {
      Nav:  require('../header-nav/component').Main
    }
  ;

  return utils.View.extend({
    className: 'app-container'

  , children: {
      nav: new Views.Nav()
    }

  , initialize: function(){
      this.childOrder = [
        this.children.nav
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