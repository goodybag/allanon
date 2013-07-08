define(function(require){
  var
    utils = require('utils')
  , transitions = {}
  ;

  transitions.none = function(viewA, viewB, callback){
    if (viewA) viewA.$el.css('display', 'none');
    viewB.$el.css('display', 'block');
    if (callback) callback();
  };

  transitions.fade = function(viewA, viewB, callback){
    (function(done){
      if (!viewA) return done();

      viewA.$el.fadeOut(done);

    })(function(){
      viewB.$el.fadeIn(callback);
    });
  };

  return transitions;
});