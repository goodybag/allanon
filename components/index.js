define(function(require){
  // Since components is aliased, it messes up relative pathing
  // So just use global path
  return {
    App:          require('components/app/component')
  , Pages:        require('components/pages/component')
  }
});