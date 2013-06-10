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

    utils.map(enteredView, triggerEventForPosition);
  }

  var throttledScrollHandler = utils.throttle(scrollHandler, 100);

  troller.add('scrollWatcher', scrollWatcher);
  troller.add('scrollWatcher.addEvent', addEvent);
  troller.add('scrollWatcher.removeEvent', removeEvent);
});
