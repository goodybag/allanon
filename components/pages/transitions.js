define(function(require){
  var
    utils = require('utils')

  , transitions = {}

  , helpers = {
      slideA: function(view, toDirection, callback){
        toDirection = utils.capitalize( toDirection );

        // Get first-child's margin-top as that factors into the offsetheight
        var top = view.$el.offset().top;
        var $first = view.$el.find('> *:first-child');

        if ($first.length && $first.css('margin-top'))
          top -= parseInt($first.css('margin-top'));

        top += 'px';

        view.$el.css('position', 'absolute')
        view.$el.css('top', top)
        view.$el.addClass('pt-page-moveTo' + toDirection + 'Fade');
        view.$el.one('webkitAnimationEnd mozAnimationEnd animationEnd', function(){
          view.$el.css('display', 'none');
          view.$el.css('position', "");
          view.$el.removeClass('pt-page-moveTo' + toDirection + 'Fade');

          if (callback) callback();
        });
      }

    , slideB: function(view, fromDirection, callback){
        fromDirection = utils.capitalize( fromDirection );

        view.$el.css('display', 'block')
        view.$el.addClass('pt-page-moveFrom' + fromDirection + 'Fade');
        view.$el.one('webkitAnimationEnd mozAnimationEnd animationEnd', function(){
          view.$el.removeClass('pt-page-moveFrom' + fromDirection + 'Fade');

          if (callback) callback();
        });
      }
    }
  ;

  transitions.none = function(viewA, viewB, options, callback){    
    // Transition viewA out
    if (options.onViewAAnimationStart) options.onViewAAnimationStart(viewA);
    if (viewA) viewA.$el.css('display', 'none');
    if (options.onViewAAnimationComplete) options.onViewAAnimationComplete(viewA);

    // Transition viewB in
    if (options.onViewBAnimationStart) options.onViewBAnimationStart(viewB);
    viewB.$el.css('display', 'block');
    if (options.onViewBAnimationComplete) options.onViewBAnimationComplete(viewB);

    // Transition completed
    if (callback) callback();
  };

  transitions.fade = function(viewA, viewB, options, callback){
    (function(done){
      if (!viewA) return done();

      // Transition viewA out
      if (options.onViewAAnimationStart) options.onViewAAnimationStart(viewA);
      viewA.$el.fadeOut(function() {
        if (options.onViewAAnimationComplete) options.onViewAAnimationComplete(viewA);  
        done();
      });
      
    })(function(){    
      // Transition viewB in
      if (options.onViewBAnimationStart) options.onViewBAnimationStart(viewB);
      viewB.$el.fadeIn(callback);
      if (options.onViewAAnimationComplete) options.onViewAAnimationComplete(viewA);      
    });
  };

  transitions.slideToLeft = function(viewA, viewB, options, callback){
    var slideA = function(done){
      helpers.slideA( viewA, 'Left', callback );
    };

    var slideB = function(done){
      helpers.slideB( viewB, 'Right', callback );
    };

    if ( !viewA ) return slideB( callback );

    utils.parallel([ slideA, slideB ], callback);
  };

  transitions.slideToRight = function(viewA, viewB, options, callback){
    var slideA = function(done){
      helpers.slideA( viewA, 'Right', callback );
    };

    var slideB = function(done){
      helpers.slideB( viewB, 'Left', callback );
    };

    if ( !viewA ) return slideB( callback );

    utils.parallel([ slideA, slideB ], callback);
  };

  return transitions;
});