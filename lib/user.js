define(function(require){
  var
    utils   = require('utils')
  , api     = require('api')
  , config  = require('config')
  , troller = require('troller')

  , getCollectionLookAheadFn = function(uid, collection){
      var options = {
        limit: 3
      , offset: parseInt(Math.random() * (collection.numProducts - 3))
      };

      if (options.offset < 0) options.offset = 0;

      return function(done){
        api.collections.products(uid, collection.id, options, function(error, results, meta){
          done(error, results);
        });
      };
    }
  ;

  return new (utils.Model.extend({
    defaults: {
      loggedIn:   false
    , email:      null
    , firstName:  null
    , lastName:   null
    , screenName: null
    , cardId:     null
    , avatarUrl:  config.defaults.avatarUrl
    }

  , initialize: function(){
      return this;
    }

  , toJSON: function(){
      return {
        email:      this.get('email')
      , firstName:  this.get('firstName')
      , lastName:   this.get('lastName')
      , screenName: this.get('screenName')
      , cardId:     this.get('cardId')
      , avatarUrl:  this.get('avatarUrl') || this.defaults.avatarUrl
      };
    }

  , save: function(callback){
      api.consumers.update(this.get('id'), this.toJSON(), callback || function(error, result){
        if (error) return troller.error(error);
      });
      return this;
    }

  , updatePassword: function(currPw, newPw, callback){
      utils._ajax({
        type: 'POST'
      , url: config.apiUrl + 'v1/consumers/' + this.get('id') + '/password'
      , data: { password: newPw }
      , headers: {
          authorization: 'Basic ' + utils.base64.encode( this.get('email') + ":" + currPw )
        }
      , xhrFields: { withCredentials: true }
      , crossDomain: true
      , success: function(results){
          if (typeof results == 'string' && results) results = JSON.parse(results);
          results = results || {};
          callback && callback(results.error, results.data, results.meta);
        }
      , error: function(error, results, res, r){
          try {
            callback && callback(error.responseText ? JSON.parse(error.responseText).error : error);
          } catch (e) {
            callback && callback({
              type: 'UNKNOWN'
            , message: "An unknown error occurred"
            });
          }
        }
      });

      return this;
    }

  , addCollection: function(name, callback){
      var this_ = this, collection = { name: name };
      api.collections.create(this.get('id'), collection, function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        // Collection ids are usually returned as strings
        collection.id = "" + result.id;
        collection.numProducts = 0;

        this_.get('collections').unshift(collection);
        troller.trigger('user:collections:change', this_.get('collections'));

        if (callback) callback(null, result);
      });
    }

  , editCollection: function(cid, data, callback){
      var this_ = this, collections = this.get('collections');

      api.collections.update(this.get('id'), cid, data, function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        if (collections){
          for (var i = 0, l = collections.length; i < l; ++i){
            if (collections[i].id == cid){
              for (var key in data) collections[i][key] = data[key];
              break;
            }
          }

          troller.trigger('user:collections:change', this_.get('collections'));
        }

        if (callback) callback(null, result);
      });
    }

  , addToCollection: function(cid, pid, callback){
      var this_ = this;

      api.collections.add(this.get('id'), cid, pid, function(error){
        if (error) return callback ? callback(error) : troller.error(error);

        if (callback) callback();
      });
    }

  , removeFromCollection: function(cid, pid, callback){
      var this_ = this;

      api.collections.remove(this.get('id'), cid, pid, function(error){
        if (error) return callback ? callback(error) : troller.error(error);

        if (callback) callback();
      });
    }

  , getCollectionWithProduct: function(id, options, callback){
      var
        this_ = this

      , fns = {
          collection: function(done){
            api.collections.get(this_.get('id'), id, function(error, collection){
              done(error, collection);
            });
          }

        , products: function(done){
            api.collections.products(this_.get('id'), id, function(error, products){
              done(error, products);
            });
          }
        }

      , pCallback = function(error, results){

        }
      ;

      utils.parallel(fns, pCallback);
    }

  , getCollections: function(options, callback, force){
      if (typeof options == 'function'){
        force = callback;
        callback = options;
        options = {};
      }

      // Can we respond without making a network request?
      if (options.withSecondaries){
         if (this.get('collections') && this._addedSecondaries && !force)
          return callback ? callback(null, this.get('collections')) : null;
      } else {
        if (this.get('collections') && !force)
          return callback ? callback(null, this.get('collections')) : null;
      }

      var this_ = this;

      api.collections.list(this.get('id'), { limit: 1000 }, function(error, collections){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.set('collections', collections);

        if (!options.withSecondaries){
          if (callback) return callback(null, collections);
        }

        // If they're requesting secondary images, queue up the network calls
        var reqs = [];

        for (var i = 0, l = collections.length; i < l; ++i){
          reqs.push(getCollectionLookAheadFn(this_.get('id'), collections[i]));
        }

        utils.parallel(reqs, function(error, results){
          if (error) return callback ? callback(error) : troller.error(error);

          for (var i = 0, l = results.length; i < l; ++i){
            // Ensure secondary integrity
            while (results[i].length < 3) results[i].push({});

            collections[i].secondaries = results[i];
          }

          this_._addedSecondaries = true;

          if (callback) callback(null, collections);
        });
      });
      return this;
    }

  , getConsumerRecord: function(callback){
      var this_ = this;

      // Uhmm. yeah
      if (!this.get('id')) throw new Error('Cannot get consumer record when id is null');

      api.consumers.get(this.get('id'), function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.set(result);

        callback();
      });

      return this;
    }

  , auth: function(email, password, callback){
      var this_ = this;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback ? callback(error) : troller.error(error);

        if (loggedIn) return callback ? callback() : null;

        this_.set('email', email);

        api.session.auth(email, password, function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.set('loggedIn', true);
          this_.set(result);

          this_.getConsumerRecord(function(error, result){
            if (error) return callback ? callback(error) : troller.error(error);

            this_.trigger('auth');
            troller.trigger('user.auth')

            if (callback) callback();
          });
        });
      });
    }

  , oauth: function(code, callback){
      var this_ = this;

      api.session.oauth(code, function(error, result){
        // Maybe leave it to the callback to tell app about error
        if (error) return callback ? callback(error) : troller.app.error(error);

        this_.set('loggedIn', true);
        this_.set(result);

        this_.trigger('auth');
        troller.trigger('user.auth')

        callback(null, result);
      });
    }

  , logout: function(callback){
      callback = callback || utils.noop;

      var this_ = this;

      api.session.destroy(function(error){
        if (error) return callback(error);

        this_.set(this_.defaults);
        this_.trigger('deauth');
        troller.trigger('user.deauth')

        callback();
      })
    }

  , isLoggedIn: function(callback){
      var this_ = this;
      // We previously set this to true, so it must be true!
      if (this.get('loggedIn') === true) return callback ? callback(null, true) : null;

      // We're uncertain, so make an api call
      api.session.get(function(error, result){
        if (error) return callback ? callback(error) : troller.app.error(error);

        if (!result || !result.id) return callback ? callback(null, false) : null;

        this_.set('loggedIn', true);
        this_.set(result);

        this_.getConsumerRecord(function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.trigger('auth');
          troller.trigger('user.auth')

          if (callback) callback();
        });
      });

      return this;
    }

  , updateProductFeelings: function(pid, feelings, callback){
      var this_ = this

      this.isLoggedIn(function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        // For now, manually throw this guy in. We need to bring in
        // errors.js from magic
        if (!result){
          var error = {
            type:     'AUTHENTICATION'
          , message:  'You must be authenticated to perform this action'
          };

          return callback ? callback(error) : troller.error(error);
        }

        var
          batch = [
            function(done){ api.products.feelings(pid, feelings, done); }
          , function(done){ this_.addToCollection('all',  pid, done); }
          , function(done){ this_.addToCollection('food', pid, done); }
          ]

        , total   = batch.length
        , current = 0
        , cancel  = false
        ;

        while (batch.length > 0){
          batch.pop()(function(error){
            if (cancel) return;

            if (error){
              cancel = true;
              return callback ? callback(error) : troller.error(error);
            }

            if (++current >= current && callback) callback();
          });
        }
      });
    }
  }))();
});