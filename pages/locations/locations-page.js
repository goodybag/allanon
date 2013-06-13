define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./locations-tmpl')
  , bizTmpl     = require('hbt!./business-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-locations'

  , events: {
      'click .businesses-list > .business':     'onBusinessClick'
    , 'submit .businesses-search':              'onBusinessSearch'
    , 'submit .businesses-request':             'onBusinessRequest'
    }

  , initialize: function(){
      this.businesses = [];
      this.businessesPerRow = 5;
    }

  , onShow: function(){
      if (this.businesses.length > 0) return;

      var this_ = this;

      troller.spinner.spin();

      api.businesses.list(
        { limit: 1000, isGB: true, include: ['locations'] }
      , function(error, businesses){
          troller.spinner.stop();

          if (error) return troller.error(error);

          this_.businesses = businesses;
          this_.renderBusinesses();

          // Memoize
          this_.businessesById = {};
          for (var i = 0, l = businesses.length; i < l; ++i){
            this_.businessesById[businesses[i].id] = businesses[i];
          }
        }
      );
    }

  , render: function(){
      this.$el.html( template() );

      this.$bizList = this.$el.find('#business-listing');

      return this;
    }

  , renderBusinesses: function(){
      var fragment = document.createDocumentFragment();
      for (var i = 0, l = this.businesses.length, $el; i < l; ++i){
        $el = utils.dom(bizTmpl( this.businesses[i] ));

        // Make sure we place the gutter correctly
        if (i % this.businessesPerRow == 0)
          $el.addClass('first');
        if (i % this.businessesPerRow == (this.businessesPerRow - 1))
          $el.addClass('last');

        fragment.appendChild( $el[0] );
      }

      this.$bizList.html( fragment );

      this.delegateEvents();

      return this;
    }

  , onBusinessClick: function(e){
      // Get parent LI
      while (e.target.tagName != 'LI') e.target = e.target.parentElement;

      var id = utils.dom(e.target).data('id');

      troller.modals.open('location-details', this.businessesById[id]);
    }

  , onBusinessSearch: function(e){
      e.preventDefault();
    }

  , onBusinessRequest: function(e){
      e.preventDefault();
    }
  });
});