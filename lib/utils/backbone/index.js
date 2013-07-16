define(function(require){
  require('backbone');
  return {
    Backbone:   Backbone,
    Events:     Backbone.Events,
    Router:     Backbone.Router,
    Model:      Backbone.Model,
    Collection: Backbone.Collection,
    View:       require('./view.js'),
    History:    Backbone.History
  };
});
