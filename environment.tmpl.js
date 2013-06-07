/**
 * Environment Variables
 */

if (typeof module === 'object' && typeof define !== 'function'){
  var define = function (factory){
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  return {
    mode: 'dev'
  , s3: {
      key: 'MY_S3_KEY'
    , secret: 'SUPER_SECRET_SECRET'
    }
  };
});