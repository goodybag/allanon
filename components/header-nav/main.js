/**
 * Component: Header Navbar
 */

define(function(require){
  var
    utils     = require('utils')
  , template  = require('hbt!./main')
  ;

  require('less!./main.less');

  return utils.View.extend({
    className: 'header-navbar'

  , initialize: function(){
      return this;
    }

  , render: function(){
      this.$el.html( template() );

      return this;
    }
  });
});