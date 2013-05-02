require.config({
  paths: {
    'utils':      './lib/utils'
  , 'troller':    './lib/troller'
  , 'config':     './config'
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
  , config      = require('config')
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

        app.loadTypekit();
      }

    , loadTypekit: function(){
        var script = document.createElement('script');
        script.src = config.typekitUrl;
        script.async = true;

        script.onload = function(e){
          try { Typekit.load(); } catch(e) {}
        };

        document.head.appendChild(script);
      }
    }
  ;

  return app;
});