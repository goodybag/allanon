require.config({
  paths: {
    'utils':      './lib/utils'
  // , 'components': './components/index'
  }

, map: {
    '*': {
      'css':  'jam/require-css/css', // or whatever the path to require-css and require-less are
      'less': 'jam/require-less/less'
    }
  }
});

define(function(require){
  // Styles
  require('less!styles/main');

  var
    utils       = require('utils')
  , Components  = require('components/index')

  , app = {
      init: function(){
        app.appView = new Components.App.Main();

        app.appView.render();

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