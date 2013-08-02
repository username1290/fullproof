/**
 * Created with IntelliJ IDEA.
 * User: kyawtun
 * Date: 27/7/13
 * Time: 8:18 PM
 * To change this template use File | Settings | File Templates.
 */

goog.provide('fullproof.normalizer.Normalizer');



/**
 * Normalization language service.
 * @interface
 */
fullproof.normalizer.Normalizer = function() {

};


/**
 * Normalize a given word.
 * @param {string?} word word to be normalized.
 * @return {string?} normalized word.
 */
fullproof.normalizer.Normalizer.prototype.normalize = function(word) {};



