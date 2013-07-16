define(function(require){
  require('backbone');
  return {
    Backbone:   Backbone,
    Events:     Backbone.Events,
    Router:     Backbone.Router,
    Model:      Backbone.Model,
    Collection: require('./collection'),
    View:       require('./view'),
    History:    Backbone.History
  };
});
