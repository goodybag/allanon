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
    , 'explore/:type/:page':                              'explore'


    , 'collections':                                      'collections'


    , 'settings':                                         'settings'
    }

  , index: function(){
      alert('home');
      // utils.history.navigate('/dashboard', { trigger: true });
    }

  , explore: function(type, page){
      if (+type >= 0 || +type < 0) page = type;

      page = page || 1;

      if (['popular', 'nearby', 'random'].indexOf(type) == -1){
        utils.history.navigate('/explore/popular/' + page);
        type = 'popular';
      }

      troller.spinner.spin();

      troller.app.changePage('explore', function(error, view){
        if (error) return troller.error(error);

        var options = {
          limit: 30
        , sort: '-'
          + ((type == 'popular' ? 'popular'  : (
             type  == 'nearby'  ? 'distance' : (
             type  == 'random'  ? 'random'   : false
            )))
          || 'popular')
        };

        options.offset = page * options.limit;

        api.products.list(options, function(error, results){
          if (error) return troller.error(error), troller.spinner.stop();

          view.provideData(results);
          view.render();
          troller.spinner.stop()
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