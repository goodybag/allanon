define(['troller', 'utils'], function(troller, utils) {
  var watchedPositions = {};
  var scrollWatcher = {};
  var $window;
  utils.extend(scrollWatcher, utils.Events);

  utils.domready(function(){
    $window = utils.dom(window);
  })

  var isInView = function(offset) {
    var index = offset % utils.dom(document).height();
    return index >= $window.scrollTop() && index < $window.scrollTop() + $window.innerHeight();
  }

  var triggerEventForPosition = function(pos) {
    scrollWatcher.trigger('scroll-' + pos, 'position ' + pos + ' is in view');
  }

  var triggerLeaveEventForPosition = function(pos) {
    scrollWatcher.trigger('scrollOut-' + pos, 'position ' + pos + ' left view');
  }

  var addEvent = function(position) {
    // if it's the first event, start the scrollWatcher
    if (utils.size(watchedPositions) === 0)
      utils.dom(window).scroll(throttledScrollHandler);

    var isNew = watchedPositions[position] == null;
    watchedPositions[position] = isInView(position);
    if (isNew && watchedPositions[position]) triggerEventForPosition(position);
  }

  var removeEvent = function(position) {
    delete watchedPositions[position];
    scrollWatcher.off('scroll-' + position);

    // if it's the last event, stop the scrollWatcher
    if (utils.size(watchedPositions) === 0)
      utils.dom(window).off('scroll', throttledScrollHandler);
  };

  var scrollHandler = function() {
    var enteredView = [];
    var leftView = [];

    for (pos in watchedPositions) {
      if (isInView(pos) !== watchedPositions[pos]) {
        (watchedPositions[pos] ? leftView : enteredView).push(pos);
        watchedPositions[pos] = !watchedPositions[pos];
      }
    }

    utils.each(enteredView, triggerEventForPosition);
    utils.each(leftView, triggerLeaveEventForPosition);
  }

  var throttledScrollHandler = utils.throttle(scrollHandler, 100);


  troller.add('scrollWatcher', scrollWatcher);
  troller.add('scrollWatcher.addEvent', addEvent);
  troller.add('scrollWatcher.removeEvent', removeEvent);


  // nearEnd is 1/4 of the screen height from the bottom of the page
  var nearEnd = utils.dom(document).height() - (utils.dom(window).height() / 4);

  var destroyNearEnd = utils.debounce(function() {
    troller.scrollWatcher.removeEvent(nearEnd);
    nearEnd = null;
  }, 100, true);

  var setupNearEnd = utils.debounce(function() {
    nearEnd = utils.dom(document).height() - (utils.dom(window).height() / 4);
    troller.scrollWatcher.on('scroll-' + nearEnd, utils.partial(troller.scrollWatcher.trigger, 'scroll-near-end'));
    troller.scrollWatcher.addEvent(nearEnd);
  }, 100);


  var documentHeight;
  var intervalId;

  var startNearEnd = function(options) {
    if (options && options.poll) {
      intervalId = setInterval(function() {
        if (utils.dom(document).height() !== documentHeight) {
          documentHeight = utils.dom(document).height();
          setupNearEnd();
        }
      }, 100);
    }

    utils.dom(window).on('resize', setupNearEnd);
    utils.dom(window).on('resize', destroyNearEnd);

    setupNearEnd();
  }

  var stopNearEnd = function() {
    clearInterval(intervalId);

    utils.dom(window).off('resize', setupNearEnd);
    utils.dom(window).off('resize', destroyNearEnd);

    destroyNearEnd();
  }

  troller.add('scrollWatcher.startNearEnd', startNearEnd);
  troller.add('scrollWatcher.stopNearEnd', stopNearEnd);
});
