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
  , router      = require('lib/router')
  , Components  = require('components/index')

    // Top level Pages
  , Pages = {
      explore:    require('./pages/explore/index')
    }

  , app = {
      init: function(){
        app.appView = new Components.App.Main();

        app.appView.providePages(Pages);

        app.appView.render();

        utils.domready(function(){
          document.body.appendChild( app.appView.el );

          utils.history = Backbone.history;
          utils.history.start();
        });

        app.loadTypekit();
      }

    , router: new AppRouter()

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