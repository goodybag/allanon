define(function(require){
  // Styles
  require( 'css!./styles/bootstrap.css')
  require('less!./styles/main');

  var
    utils       = require('utils')
  , Components  = require('components')

  , app = {
      init: function(){
        app.appView = new Components.App.Main();

        utils.domready(function(){
          document.body.appendChild( app.appView.el );

          utils.history = Backbone.history;
          utils.history.start();
        });
      }
    }
  ;

  return app;
});