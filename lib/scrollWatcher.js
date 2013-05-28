define(['troller', 'utils'], function(troller, utils) {
  var watchedPositions = {};
  var scrollWatcher = {};
  utils.extend(scrollWatcher, utils.Events);

  var isInView = function(offset) {
    var index = offset % document.height;
    return index >= window.pageYOffset && index < window.pageYOffset + window.innerHeight;
  }

  var triggerEventForPosition = function(pos) {
    scrollWatcher.trigger('scroll-' + pos, 'position ' + pos + ' is in view');
  }

  var addEvent = function(position) {
    var isNew = watchedPositions[position] == null;
    watchedPositions[position] = isInView(position);
    if (isNew && watchedPositions[position]) triggerEventForPosition(position);
  }

  var scrollHandler = function() {
    var enteredView = [];
    var leftView = [];

    for (pos in watchedPositions) {
      if (isInView(pos) !== watchedPositions[pos]) {
        (watchedPositions[pos] ? leftView : enteredView).push(pos);
        watchedPositions[pos] = !watchedPositions[pos];
      }
    }

    enteredView.map(triggerEventForPosition);
  }

  troller.add('scrollWatcher', scrollWatcher);
  troller.add('scrollWatcher.addEvent', addEvent);
  window.onscroll = scrollHandler;
});
