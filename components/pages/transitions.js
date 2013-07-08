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

  transitions.slideToLeft = function(viewA, viewB, callback){
    var slideA = function(done){
      var top = viewA.$el.offset().top;
      var $first = viewA.$el.find('> *:first-child');
      if ($first.length && $first.css('margin-top')) top -= parseInt($first.css('margin-top'));
      top += 'px';
      viewA.$el.css('position', 'absolute')
      viewA.$el.css('top', top)
      viewA.$el.addClass('pt-page-moveToLeftFade');
      viewA.$el.one('webkitAnimationEnd mozAnimationEnd animationEnd', done);
    };

    var slideB = function(done){
      viewB.$el.css('display', 'block')
      viewB.$el.addClass('pt-page-moveFromRightFade');
      viewB.$el.one('webkitAnimationEnd mozAnimationEnd animationEnd', done);
    };

    if ( !viewA ) return slideB( callback );

    utils.parallel([ slideA, slideB ], function(){
      viewA.$el.css('display', 'none');
      viewA.$el.css('position', "")
      viewA.$el.removeClass('pt-page-moveToLeftFade');
      viewB.$el.removeClass('pt-page-moveFromRightFade');
      if (callback) callback();
    });
  };

  transitions.slideToRight = function(viewA, viewB, callback){
    var slideA = function(done){
      var top = viewA.$el.offset().top;
      var $first = viewA.$el.find('> *:first-child');
      if ($first.length && $first.css('margin-top')) top -= parseInt($first.css('margin-top'));
      top += 'px';
      viewA.$el.css('position', 'absolute')
      viewA.$el.css('top', top)
      viewA.$el.addClass('pt-page-moveToRightFade');
      viewA.$el.one('webkitAnimationEnd mozAnimationEnd animationEnd', done);
    };

    var slideB = function(done){
      viewB.$el.css('display', 'block')
      viewB.$el.addClass('pt-page-moveFromLeftFade');
      viewB.$el.one('webkitAnimationEnd mozAnimationEnd animationEnd', done);
    };

    if ( !viewA ) return slideB( callback );

    utils.parallel([ slideA, slideB ], function(){
      viewA.$el.css('display', 'none');
      viewA.$el.css('position', "")
      viewA.$el.removeClass('pt-page-moveToRightFade');
      viewB.$el.removeClass('pt-page-moveFromLeftFade');
      if (callback) callback();
    });
  };

  return transitions;
});