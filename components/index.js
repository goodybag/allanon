define(function(require){
  return {
    App:                  require('./app/component')
  , Pages:                require('./pages/component')
  , HeaderNav:            require('./header-nav/component')
  , ProductsList:         require('./products-list/component')
  , ProductsListHeader:   require('./products-list-header/component')
  , Modal:                require('./modal/component')
  , ModalManager:         require('./modal-manager/component')
  , WLT:                  require('./wlt/component')
  , AddToCollections:     require('./add-to-collection/component')
  , Alert:                require('./alert/component')
  // , ProductPhotoViewer:   require('./product-photo-viewer/component')
  };
});
