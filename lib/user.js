define(function(require){
  var
    utils   = require('utils')
  , api     = require('api')
  , config  = require('config')
  , troller = require('troller')

  // should be gone after getCollections is backbonified
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
      avatarUrl:  config.defaults.avatarUrl
    }

  , initialize: function(){
      return this;
    }

  // TODO: with the overridden sync method, this might no longer be necessary
  , save: function(callback){
      var user = this.toJSON();
      delete user.id;

      api.consumers.update(this.get('id'), user, callback || function(error, result){
        if (error) return troller.error(error);
      });
      return this;
    }

  , updatePassword: function(currPw, newPw, callback){
      utils._ajax({
        type: 'POST'
      , url: config.apiUrl + 'consumers/' + this.get('id') + '/password'
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

  // TODO: these three should be built in to the collections collection
  , addCollection: function(name, callback){
      var this_ = this, collection = { name: name };
      api.collections.create(this.get('id'), collection, function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        // Collection ids are usually returned as strings
        collection.id = "" + result.id;
        collection.numProducts = 0;
        collection.isEditable = true;

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

  , removeCollection: function(cid, callback){
      var this_ = this, collections = this.get('collections');

      api.collections.del(this.get('id'), cid, function(error){
        if (error) return callback ? callback(error) : troller.error(error);

        var updated = [];
        for (var i = 0, l = collections.length; i < l; ++i){
          if (collections[i].id != cid) updated.push( collections[i] );
        }

        this_.set('collections', updated);

        troller.trigger('user:collections:change', this_.get('collections'));

        if (callback) callback(null);
      });
    }

  // TODO: move these two to product model
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

  // apparently never used
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

  // TODO: should become backbone collection of Collection models
  , getCollections: function(options, callback){
      if (typeof options == 'function'){
        callback = options;
        options = {};
      }

      // Can we respond without making a network request?
      if (!options.force && this.get('collections') && (!options.withSecondaries || this._addedSecondaries))
        return callback ? callback(null, this.get('collections')) : null;

      var this_ = this;

      api.collections.list(this.get('id'), { limit: 1000 }, function(error, collections){
        if (error) return callback ? callback(error) : troller.error(error);

        for (var i = 0, l = collections.length; i < l; ++i){
          collections[i].isEditable = !utils.contains(['all', 'food'], collections[i].id);
        }

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

  // TODO: is this just this.fetch?
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

  , auth: function(email, password, remember, callback){
      if (typeof remember === 'function' && callback == null) {
        callback = remember;
        remember = null;
      }

      var this_ = this;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback ? callback(error) : troller.error(error);

        if (loggedIn) return callback ? callback() : null;

        this_.set('email', email);

        api.session.auth(email, password, remember, function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.loggedIn = true;
          this_.set(result);

          this_.getConsumerRecord(function(error, result){
            if (error) return callback ? callback(error) : troller.error(error);

            this_.trigger('auth');
            troller.trigger('user.auth')
            troller.analytics.track('Auth Email');


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

        this_.loggedIn = true;
        this_.set(result);

        this_.trigger('auth');
        troller.trigger('user.auth')
        troller.analytics.track('Auth Facebook');

        if (callback) callback(null, result);
      });
    }

  , register: function(email, password, username, callback){
      if (typeof username === 'function' && callback == null) {
        callback = username;
        username = null;
      }

      var this_ = this;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback ? callback(error) : troller.error(error);

        if (loggedIn) return callback ? callback() : null;

        this_.set('email', email);
        this_.set('username', username);

        var data = { email: email,
                     password: password,
                     screenName: username
                   };

        api.consumers.create(data, function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.loggedIn = true;
          this_.set(result);

          this_.getConsumerRecord(function(error, result){
            if (error) return callback ? callback(error) : troller.error(error);

            this_.trigger('auth');
            troller.trigger('user.auth')
            troller.analytics.track('User Registered Email');

            if (callback) callback();
          });
        });
      });
    }

  , completeRegistration: function(token, email, password, username, callback) {
      if (typeof username === 'function' && callback == null) {
        callback = username;
        username = null;
      }

      var data = { email: email,
                   password: password,
                   screenName: username
                 };
      api.users.completeRegistration(token, data, function(error, result) {
        if (error) return callback ? callback(error) : troller.error(error);

        this_.set('email', email);
        this_.set('username', username);
        this_.loggedIn = true;
        this_.set(result);

        this_.getConsumerRecord(function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.trigger('auth');
          troller.trigger('user.auth')

          if (callback) callback();
        });
      });
    }

  , logout: function(callback){
      callback = callback || utils.noop;

      var this_ = this;

      api.session.destroy(function(error){
        if (error) return callback ? callback(error) : null;

        this_.clear();
        this_.set(this_.defaults);
        this_.loggedIn = false;
        this_.trigger('deauth');
        troller.trigger('user.deauth')

        if (callback) callback();
      })
    }

  , isLoggedIn: function(callback){
      var this_ = this;
      // We previously set this to true, so it must be true!
      if (this.loggedIn === true) return callback ? callback(null, true) : null;

      // We're uncertain, so make an api call
      api.session.get(function(error, result){
        if (error) return callback ? callback(error) : troller.app.error(error);

        if (!result || !result.id) return callback ? callback(null, false) : null;

        this_.loggedIn = true;
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

  // TODO: replace with model.save on product model.  should work now.
  , updateProductFeelings: function(pid, feelings, callback){
      var this_ = this;

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

        , done = function(){
            var track = { productId: pid };
            for (var key in feelings) track[key] = feelings[key];

            troller.analytics.track('Feelings.Update', track);

            if (callback) callback();
          }
        ;

        while (batch.length > 0){
          batch.pop()(function(error){
            if (cancel) return;

            if (error){
              cancel = true;
              return callback ? callback(error) : troller.error(error);
            }

            if (++current >= current && callback) done();
          });
        }
      });
    }

  // TODO: again, this is just this.save()
  , setKeytag: function(keytag, callback) {
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

        api.consumers.update(this_.get('id'), {cardId:keytag}, callback);
      });
    }

  , forgotPassword: function(email, callback) {
      var url = 'users/password-reset';
      utils.api.post(url, {email: email}, callback);
    }

  , resetPassword: function(token, password, callback) {
      var url = 'users/password-reset/' + token;
      utils.api.post(url, {password: password}, callback);
    }
  }))();
});
