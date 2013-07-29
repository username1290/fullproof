/**
 * Created with IntelliJ IDEA.
 * User: kyawtun
 * Date: 27/7/13
 * Time: 7:22 PM
 * To change this template use File | Settings | File Templates.
 */

goog.provide('fullproof.normalizer.english');
goog.require('fullproof.normalizer.StopWordRemover');
goog.require('fullproof.normalizer.english.Metaphone');
goog.require('fullproof.normalizer.english.PorterStemmer');
goog.require('fullproof.normalizer.english.stopwords');


/**
 * @final
 * @type {!fullproof.normalizer.english.Metaphone}
 */
fullproof.normalizer.english.metaphone =
    new fullproof.normalizer.english.Metaphone(32);


/**
 * @final
 * @type {!fullproof.normalizer.english.PorterStemmer}
 */
fullproof.normalizer.english.stemmer =
    new fullproof.normalizer.english.PorterStemmer();


/**
 * @final
 * @type {fullproof.normalizer.StopWordRemover}
 */
fullproof.normalizer.english.stop = new fullproof.normalizer.StopWordRemover(
    fullproof.normalizer.english.stopwords);


/**
 * @param {Array.<string>=} opt_names name of normalizers.
 * @return {!Array.<!fullproof.normalizer.Normalizer>} list of English
 * normalizers.
 */
fullproof.normalizer.english.getNormalizers = function(opt_names) {
  var names = opt_names || ['metaphone', 'stemmer', 'stop'];
  var normalizers = [];
  for (var i = 0; i < names.length; i++) {
    if (names[i] == 'metaphone') {
      normalizers.push(fullproof.normalizer.english.metaphone);
    } else if (names[i] == 'stemmer') {
      normalizers.push(fullproof.normalizer.english.stemmer);
    } else if (names[i] == 'stop') {
      normalizers.push(fullproof.normalizer.english.stop);
    } else if (goog.DEBUG) {
      throw new Error('Invalid normalizer "' + names[i] + '" for English lang');
    }
  }
  return normalizers;
};

