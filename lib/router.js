define(function(require){
  var
    utils     = require('./utils')
  , troller   = require('./troller')
  ;

  return utils.Router.extend({
    routes: {
      '':                                                 'index'

    , 'explore/:type/:page':                             'explore'
    , 'explore/:type/:page':                             'explore'
    , 'explore/:type/:page':                             'explore'
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

      var page = troller.app.changePage('explore');

      var options = {
        limit: 30
      , sort: '-'
        + ((type == 'popular' ? 'popular'  : (
           type == 'nearby'   ? 'distance' : (
           type == 'random'   ? 'random'   : false
          )))
        || 'popular')
      };

      options.offset = page * options.limit;

      api.products.list(function(error, results){
        if (error) return troller.error(error), troller.spinner.stop();

        page.provideData(results);
        page.render();
        troller.spinner.stop()
      });
    }
});