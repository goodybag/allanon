define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./punch-cards-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-punch-cards'

  , title: 'My Punch Cards'

  , manualRender: true

  , events: {
      'click .punchcard.row':         'onPunchcardClick'
    }

  , initialize: function(){
      this.queryOptions = {
        limit: 5000
      };
    }

  , onShow: function(options){
      // This view is unlikely to be invalidated, so we can reasonably say
      // to render it only once
      if (this.punchcards) return this;

      var this_ = this;

      this.fetchData(function(error){
        if (error) troller.error(error);

        this_.render();
      });

      return this;
    }

  , fetchData: function(callback){
      var this_ = this;

      api.loyalty.list(this.queryOptions, function(error, punchcards){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.providePunchcards(punchcards);

        callback(null, punchcards);
      });

      return this;
    }

  , providePunchcards: function(punchcards){
      this.punchcards = punchcards;
      this.punchcards_ = {};

      this.elite = [];
      this.regular = [];

      for (var i = 0, l = punchcards.length; i < l; ++i){
        this[punchcards[i].isElite ? 'elite' : 'regular'].push(punchcards[i]);
        this.punchcards_[punchcards[i].id] = punchcards[i];
      }

      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          elite:    this.elite
        , regular:  this.regular
        })
      );
      return this;
    }

  , onPunchcardClick: function(e){
      // Get the punchcard row element
      while (e.target.className.indexOf('row') == -1) e.target = e.target.parentElement;

      troller.modals.open('punchcard', {
        punchcard: this.punchcards_[ utils.dom(e.target).data('id') ]
      });
    }
  });
});