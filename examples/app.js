/**
 * Created with IntelliJ IDEA.
 * User: kyawtun
 * Date: 30/7/13
 * Time: 6:14 PM
 * To change this template use File | Settings | File Templates.
 */


/**
 * Basic app.
 * @param {string} name app name as db name.
 * @constructor
 */
var App = function(name) {
  var db_schema = {
    fullTextIndexes: [{
      name: 'test',
      lang: 'en',
      sources: [
        {
          storeName: 'article',
          keyPath: 'title',
          weight: 1.0
        }, {
          storeName: 'article',
          keyPath: 'body',
          weight: 0.5
        }]
    }],
    stores: [
      {
        name: 'article',
        keyPath: 'title'
      }]
  };
  this.db = new ydn.db.Storage(name, db_schema);
};


/**
 *
 * @param url
 */
App.prototype.load = function(url) {

};