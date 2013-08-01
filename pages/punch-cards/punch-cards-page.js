define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('components')

  , template    = require('hbt!./punch-cards-tmpl')
  ;

  var Punchcards = utils.Collection.extend({
    queryParams: {limit: 5000}
  , url: '/loyalty'
  , elite:   function() { return this.where({isElite: true}); }
  , regular: function() { return this.where({isElite: false}); }
  });

  return Components.Pages.Page.extend({
    className: 'page page-punch-cards'

  , title: 'My Punch Cards'

  , manualRender: true

  , events: {
      'click .punchcard.row':         'onPunchcardClick'
    }

  , initialize: function(){
      this.punchcards = new Punchcards();
    }

  , onShow: function(options){
      // This view is unlikely to be invalidated, so we can reasonably say
      // to render it only once
      if (this.punchcards.length > 0) return this;

      var this_ = this;

      this.punchcards.fetch({
        error: function(error){
          troller.error(error);
        }
      , success: function() {
          this_.render();
        }
      });

      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          elite:    utils.invoke(this.punchcards.elite(), 'toJSON')
        , regular:  utils.invoke(this.punchcards.regular(), 'toJSON')
        })
      );
      return this;
    }

  , onPunchcardClick: function(e){
      // Get the punchcard row element
      while (e.target.className.indexOf('row') == -1) e.target = e.target.parentElement;

      troller.modals.open('punchcard', {
        punchcard: this.punchcards.get(utils.dom(e.target).data('id')).toJSON()
      });
    }
  }, { requiresLogin: true});
});
