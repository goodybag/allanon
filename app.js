// This is a little wonky, but it makes build a lot easier
// If confused, contact John
(function(){
  var requireConfig = {
    packages: [
      {
        "name":     "utils",
        "location": "lib",
        "main":     "utils.js"
      }
    , {
        "name":     "troller",
        "location": "lib",
        "main":     "troller.js"
      }
    , {
        "name":     "api",
        "location": "lib",
        "main":     "api.js"
      }
    , {
        "name":     "geo",
        "location": "lib",
        "main":     "geo-location.js"
      }
    , {
        "name":     "user",
        "location": "lib",
        "main":     "user.js"
      }
    , {
        "name":     "scrollWatcher",
        "location": "lib",
        "main":     "scrollWatcher.js"
      }
    , {
        "main":     "config.js"
      }
    , {
        "name":     "models",
        "location": "models",
        "main":     "index.js"
      }
    ]

  , map: {
      '*': {
        'css':  'jam/require-css/css', // or whatever the path to require-css and require-less are
        'less': 'jam/require-less/less'
      }
    }
  };

  if (typeof require !== "undefined" && require.config){
    require.config(requireConfig);
  }

  if (typeof exports !== "undefined" && typeof module !== "undefined")
    module.exports = requireConfig;

  else {

    /**********************\
     * MODULE STARTS HERE *
    \**********************/
    define(function(require){
      // Styles
      require('less!styles/main');

      // Helpers
      require('./lib/hbt-helpers');

      var
        utils           = require('utils')
      , troller         = require('troller')
      , config          = require('config')
      , user            = require('user')
      , Router          = require('lib/router')
      , Components      = require('components/index')
      , scrollWatcher   = require('scrollWatcher')

        // Pages provided to app-level page manager
      , Pages = {
          'explore':                  require('./pages/explore/index')
        , 'collections':              require('./pages/collections/index')
        , 'explore-collection':       require('./pages/explore-collection/index')
        , 'settings':                 require('./pages/settings/index')
        , 'my-punchcards':            require('./pages/punch-cards/index')
        , 'legal':                    require('./pages/legal/index')
        , 'privacy':                  require('./pages/privacy/index')
        , 'charities':                require('./pages/charities/index')
        , 'gb-for-businesses':        require('./pages/gb-for-businesses/index')
        , 'about-us':                 require('./pages/about-us/index')
        , 'how-it-works':             require('./pages/how-it-works/index')
        , 'locations':                require('./pages/locations/index')
        }

        // Modals provided to app-level modal manager
      , Modals = {
          'product-details':          require('./modals/product-details/index')
        , 'add-new-collection':       require('./modals/add-new-collection/index')
        , 'enter-keytag':             require('./modals/enter-keytag/index')
        , 'edit-collection':          require('./modals/edit-collection/index')
        , 'update-password':          require('./modals/update-password/index')
        , 'punchcard':                require('./modals/punchcard/index')
        , 'location-details':         require('./modals/location-details/index')
        }

      , app = {
          init: function(){
            // Initial call to session
            utils.parallel({
              session: function(done){ user.isLoggedIn(done); }
            , domready: function(done){ utils.domready(function(){ done() }); }
            }, function(error){
              if (error) troller.error(error);

              document.body.appendChild( utils.dom('<div id="main-loader" />')[0] )
              document.body.appendChild( app.appView.el );

              utils.startHistory();

              // Load in File picker
              require(['./lib/filepicker'], function(filepicker){});
            });

            app.appView = new Components.App.Main();

            app.appView.providePages(Pages);
            app.appView.provideModals(Modals);

            app.appView.render();

            app.loadTypekit();

            troller.on('user.deauth', function(){
              window.location.href = "/";
            });

            // The only browser we support that doesn't support ajax is
            // IE, so we can reasonably use this to check for IE
            if (!utils.support.cors) app.loadIEModules();
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

        , loadIEModules: function(){
            require(config.ieOnlyModules, function(){});
          }

        , confirm: function(msg){
            return confirm(msg);
          }

        , error: function(error, $el, action){
            // No filepicker "they cancelled the modal error"
            if (error.code && error.code == 104) return;

            // No XHR errors - they probably just canceled the request
            if (error.hasOwnProperty('status') && error.status == 0) return;

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

        , openModal: function(modal, options, callback){
            return app.appView.children.modals.open(modal, options, callback);
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
  }
})();