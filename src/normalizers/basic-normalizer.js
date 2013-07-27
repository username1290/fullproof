/**
 * Created with IntelliJ IDEA.
 * User: kyawtun
 * Date: 27/7/13
 * Time: 8:18 PM
 * To change this template use File | Settings | File Templates.
 */

goog.provide('fullproof.normalizer.BasicNormalizer');



/**
 * Normalization language service.
 * @constructor
 */
fullproof.normalizer.BasicNormalizer = function() {

};


/**
 * Language name.
 * @type {string}
 * @protected
 */
fullproof.normalizer.BasicNormalizer.prototype.name = '';


/**
 * @return {string} language name.
 */
fullproof.normalizer.BasicNormalizer.prototype.getName = function() {
  return this.name;
};



