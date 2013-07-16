define(function(require){
  require('backbone');
  return {
    Backbone:   Backbone,
    Events:     Backbone.Events,
    Router:     Backbone.Router,
    Model:      Backbone.Model,
    Collection: require('./collection.js'),
    View:       require('./view.js'),
    History:    Backbone.History
  };
});
