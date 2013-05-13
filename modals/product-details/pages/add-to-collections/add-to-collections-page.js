define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../../../components/index')

  , template    = require('hbt!./add-to-collections-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-add-to-collections'

  , children: {
      'add-to-collections': new Components.AddToCollections.Main()
    }

  , regions: {
      'add-to-collections':    '.add-to-collections'
    }

  , initialize: function(options){
      return this;
    }
  });
});