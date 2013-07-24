define(function(require) {
  var utils   = require('utils');
  var Product = require('./product');

  var acceptable = [
    'id',
    'userId',
    'name',
    'isHidden',
    'numProducts',
    'photoUrl',
    'totalMyLikes',
    'totalMyWants',
    'totalMyTries',
    'secondaries'
  ];

  var GBCollection = utils.Collection.extend({
    url: function() {
      return '/consumers/' + require('user').id + '/collections/' + this.collection.id + '/products';
    },

    model: Product,

    queryParams: {
      include: ['collections', 'userPhotos']
    },

    initialize: function(models, options) {
      utils.Collection.prototype.initialize.apply(this, arguments);
      if (options && options.collection) this.collection = options.collection;
    },

    toggleFilter: function(filter, bool) {
      if (['userWants', 'userLikes', 'userTried'].indexOf(filter) === -1) return;
      var newState = bool != null ? !!bool : !this.queryParams[filter];
      newState ? this.queryParams[filter] = newState : delete this.queryParams[filter];
      this.reset([]);
      return newState;
    },

    search: function(search, options) {
      if (search === this.queryParams.filter || (!search && this.queryParams.filter == null)) return false;
      if (search) this.queryParams.filter = search;
      else delete this.queryParams.filter;
      this.reset([]);
      this.nextPage(options);
      return true;
    },

    clear: function() {
      this.queryParams = utils.omit(this.queryParams, ['filter', 'userWants', 'userLikes', 'userTried']);
      this.reset([]);
    },

    // I'm not sure if this should go here or on the containing model.
    addProduct: function(product, callback) {
      if (!(product instanceof Product)) {
        product = new Product({id: product});
        product.fetch(); // don't care when this completes.  might need to change that later
      }

      product.set('collections', product.get('collections').push('' + this.collection.id));

      this.sync('create', this, {
        data: {productId: product.id},
        complete: callback
      });
    },

    removeProduct: function(product, callback) {
      this.remove(product);

      product.set('collections', utils.without(product.get('collections'), ''+this.collection.id));

      this.sync('delete', this, {
        url: this.url() + '/' + product.id,
        complete: callback
      });
    }
  });

  return utils.Model.extend({
    validate: function(attrs, options) {
      for (key in attrs)
        if (acceptable.indexOf(key) === -1) return key + ' is not an acceptable attribute';

      if (attrs.name == null)
        return 'name is required';
    },

    defaults: {
      isHidden: false,
      numProducts: 0,
      totalMyLikes: 0,
      totalMyWants: 0,
      totalMyTries: 0,
      secondaries: [{}, {}, {}]
    },

    isEditable: function() {
      return !utils.contains(['all', 'food'], this.id);
    },

    urlRoot: function() {
      return '/consumers/' + require('user').id + '/collections'
    },

    getSecondaries: function() {
      var coll = this;
      this.sync('read', this.products, {
        queryParams: {
          limit: 3,
          offset: this.get('numProducts') > 3 ? parseInt(Math.random() * (this.get('numProducts') - 3)) : 0
        },
        success: function(data) {
          coll.set('secondaries', utils.first(utils.map(data, function(e) {
            return e instanceof utils.Model ? e.toJSON() : e;
          }).concat([{}, {}, {}]), 3));
        }
      });
    },

    sync: function(method, model, options) {
      if (model === this && utils.contains(['create', 'update'], method) && options.data == null)
        options.data = utils.pick(this.toJSON(), ['name']);
      utils.Model.prototype.sync.apply(this, arguments);
    },

    initialize: function(attrs, options) {
      this.products = new GBCollection([], {collection: this});

      this.listenTo(this.products, 'change:userWants', function(model, value, options) {
        if (model.changed.userWants != null && model.previousAttributes().userWants != null && !options.deauth)
          this.set('totalMyWants', this.get('totalMyWants') + (value ? 1 : -1));
      });

      this.listenTo(this.products, 'change:userLikes', function(model, value, options) {
        if (model.changed.userLikes != null && model.previousAttributes().userLikes != null && !options.deauth)
          this.set('totalMyLikes', this.get('totalMyLikes') + (value ? 1 : -1));
      });

      this.listenTo(this.products, 'change:userTried', function(model, value, options) {
        if (model.changed.userTried != null && model.previousAttributes().userTried != null && !options.deauth)
          this.set('totalMyTries', this.get('totalMyTries') + (value ? 1 : -1));
      });
    }
  });
});
