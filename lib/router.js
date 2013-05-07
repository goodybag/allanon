define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , api       = require('api')
  ;

  return utils.Router.extend({
    routes: {
      '':                                                 'index'

    , 'explore':                                          'explore'
    , 'explore/:type':                                    'explore'


    , 'collections':                                      'collections'


    , 'settings':                                         'settings'
    }

  , index: function(){
      alert('home');
      // utils.history.navigate('/dashboard', { trigger: true });
    }

  , explore: function(type){
      troller.spinner.spin();

      (function(callback){
        if (type != 'nearby') return callback();

        utils.geo.getPosition(callback);
      })(function(error, position){
        if (error) return troller.error(error), troller.spinner.spin();

        var options = {};

        if (type) options.sort = '-'
          + (type == 'popular' ? 'popular'  : (
             type == 'nearby'  ? 'distance' : (
             type == 'random'  ? 'random'   : null
            )));

        if (position){
          options.lat = position.lat;
          options.lon = position.lon;
        }

        troller.app.changePage('explore', options, function(error, view){
          if (error) return troller.error(error);
        });
      });
    }

  , collections: function(){
      troller.app.changePage('collections', function(error, view){
        if (error) return troller.error(error);
      });
    }

  , settings: function(){
      troller.app.changePage('settings', function(error, view){
        if (error) return troller.error(error);
      });
    }
  });
});