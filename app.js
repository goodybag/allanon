require.config({
  paths: {
    'utils':      './lib/utils'
  , 'troller':    './lib/troller'
  , 'api':        './lib/api'
  , 'geo':        './lib/geo-location'
  , 'user':       './lib/user'
  , 'config':     './config'
  , 'models':     './models/index'
  // , 'cmpnts':     './lib/components'
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

  // Helpers
  require('./lib/hbt-helpers');

  var
    utils       = require('utils')
  , troller     = require('troller')
  , config      = require('config')
  , user        = require('user')
  , Router      = require('lib/router')
  , Components  = require('components/index')

    // Pages provided to app-level page manager
  , Pages = {
      explore:        require('./pages/explore/index')
    , collections:    require('./pages/collections/index')
    , settings:       require('./pages/settings/index')
    }

    // Modals provided to app-level modal manager
  , Modals = {
      'product-details':        require('./modals/product-details/index')
    , 'add-new-collection':     require('./modals/add-new-collection/index')
    }

  , app = {
      init: function(){
        // Initial call to session
        user.isLoggedIn();

        app.appView = new Components.App.Main();

        app.appView.providePages(Pages);
        app.appView.provideModals(Modals);

        app.appView.render();

        utils.domready(function(){
          document.body.appendChild( utils.dom('<div id="main-loader" />')[0] )
          document.body.appendChild( app.appView.el );

          utils.history = Backbone.history;
          utils.history.start();
        });

        app.loadTypekit();
      }

    , changePage: function(page, options){
        return app.appView.changePage(page, options);
      }

    , router: new Router()

    , loadTypekit: function(){
        var script = document.createElement('script');
        script.src = config.typekitUrl;
        script.async = true;

        script.onload = function(e){
          try { Typekit.load(); } catch(e) {}
        };

        document.head.appendChild(script);
      }

    , confirm: function(msg){
        return confirm(msg);
      }

    , error: function(error, $el, action){
        // No XHR errors - they probably just canceled the request
        // if (error.hasOwnProperty('status') && error.status == 0) return;

        if (typeof $el == 'function'){
          action = $el;
          $el = null;
        }

        if (!action) action = alert;

        if (error){
          var msg, detailsAdded = false;

          if (typeof error == "object")
            msg = error.message || (window.JSON ? window.JSON.stringify(error) : error);
          else
            msg = error;

          if (error.details){
            msg += "\n";
            if (typeof error.details == 'string')
              msg += error.details
            else {
              for (var key in error.details){
                if ($el) $el.find('.field-' + key).addClass('error');
                if (error.details[key]){
                  msg += "\n" + app.getKeyNiceName(key) + ": " + error.details[key] + ", ";
                  detailsAdded = true;
                }
              }
              if (detailsAdded) msg = msg.substring(0, msg.length -2);
            }
          }

          action(msg, error);

          return msg;
        }
      }

    , getKeyNiceName: function(key){
        return config.niceNames[key] || key;
      }

    , spinner: new utils.Spinner(config.spinner)

    , spin: function(el){
        if (typeof el == 'string')
          el = utils.dom(el)[0];

        if (!el) el = utils.dom('#main-loader')[0];

        if (el.id == 'main-loader') utils.dom(el).css('display', 'block');

        app.spinner.spin(el);
      }

    , stopSpinning: function(){
        utils.dom('#main-loader').css('display', 'none');
        app.spinner.stop();
      }

    , openModal: function(modal, options){
        return app.appView.children.modals.open(modal, options);
      }
    , closeModal: function(modal){
        return app.appView.children.modals.close(modal);
      }
    }
  ;

  troller.add('app.changePage', app.changePage);

  troller.add('app.error',      app.error);
  troller.add('error',          app.error);
  troller.add('confirm',        app.confirm);

  troller.add('spinner.spin',   app.spin);
  troller.add('spinner.stop',   app.stopSpinning)

  troller.add('modals.open',    app.openModal);
  troller.add('modals.close',   app.closeModal);

  return app;
});