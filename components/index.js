define(function(require){
  return {
    App:              require('./app/component')
  , Pages:            require('./pages/component')
  , HeaderNav:        require('./header-nav/component')
  , ProductsList:     require('./products-list/component')
  , Modal:            require('./modal/component')
  , ModalManager:     require('./modal-manager/component')
  }
});