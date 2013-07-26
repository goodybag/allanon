define(function(require) {
  var utils = require('utils');
  var template = require('hbt!./products-list-header-tmpl');
  require('bootstrap-button');

  require('less!./products-list-header-style');

  return utils.View.extend({
    className: 'page-header-box',

    tagName: 'header',

    events: {
      'submit #header-search-form': 'search',
      'keyup .field-search': 'search',
      'click .field-search-clear': 'clearSearch'
    },

    initialize: function(options) {
      var triggerToggle = utils.bind(this.triggerToggle, this);
      this.triggerToggle = function() {
        utils.defer(triggerToggle, arguments);
      };
      this.context = options || {};
      this.render();
    },

    render: function(context) {
      this.$el.html(template(context || this.context));
      var buttons = (context || this.context).buttons;
      this.btnStates = utils.object(utils.pluck(buttons, 'class'), utils.pluck(buttons, 'active'));

      this.$searchInput = this.$el.find('.field-search');
      this.$searchClearBtn = this.$el.find('.field-search-clear');
    },

    activeButtons: function() {
      var $active = this.$el.find('.filters-btn-group .btn.active');
      return utils.compact(utils.map(this.btnStates, function(val, key, obj) {
        var $btn = $active.filter('.' + key);
        return $btn.length > 0 ? {key: $btn} : undefined;
      }));
    },

    toggle: function(btnClass) {
      this.$el.find('.filters-btn-group .btn.' + btnClass).button('toggle');
    },

    clearButtons: function() {
      this.$el.find('.filters-btn-group .btn').removeClass('active');
    },

    delegateEvents: function() {
      utils.View.prototype.delegateEvents.apply(this, arguments);
      var self = this;
      // trigger a toggle event
      // This has to go on the body because that's where the bootstrap event handler that updates the active state is
      utils.dom('body').on('click', '.filters-btn-group .btn', this.triggerToggle);
    },

    undelegateEvents: function() {
      utils.View.prototype.undelegateEvents.apply(this, arguments);
      utils.dom('body').off('click', '.filters-btn-group .btn', this.triggerToggle);
    },

    search: function(e) {
      e.preventDefault();
      var val = this.$searchInput.val();
      this.$searchClearBtn.toggleClass('hide', !val);
      this.triggerSearch(val);
    },

    // debounced to emit event only after user stops typing
    triggerSearch: utils.debounce(function(val) {
      this.trigger('search', val, this);
    }, 666),

    triggerToggle: function(e) {
      var changes = [];
      for (var key in this.btnStates) {
        var active = this.$el.find('.btn.'+key).hasClass('active');
        if (active !== !!this.btnStates[key]) {
          this.trigger('toggle:' + key, active, e, this);
          var change = {};
          change[key] = active;
          changes.push(change);
        }
        this.btnStates[key] = active;
      }

      if (changes.length > 0) this.trigger('toggle', changes, e, this);
    },

    clearSearch: function(e) {
      this.$searchInput.val('');
      this.search(e);
    }
  });
});
