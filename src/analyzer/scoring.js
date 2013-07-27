/**
 * Created with IntelliJ IDEA.
 * User: kyawtun
 * Date: 27/7/13
 * Time: 8:47 PM
 * To change this template use File | Settings | File Templates.
 */


goog.provide('fullproof.ScoringAnalyzer');
goog.require('fullproof.StandardAnalyzer');



/**
 * The ScoringAnalyzer is not unlike the StandardAnalyzer, except that is attaches a score to each token,
 * related to its place in the text. This is a very naive implementation, and therefore the adjustement
 * is tweaked to be very light: it simplistically says that the more a token is near the start of the text,
 * the more relevant it is to the document. Although very simple, it follows the normally expected form
 * of a text where the headers and titles come first, and should provide decent result. You can use
 * this as a basis and make a ScoringAnalyzer adapted to your data.
 * @constructor
 * @extends {fullproof.StandardAnalyzer}
 */
fullproof.ScoringAnalyzer = function(normalizers) {
  goog.base(this);
};
goog.inherits(fullproof.ScoringAnalyzer, fullproof.StandardAnalyzer);


/**
 * @protected
 * @type {boolean}
 */
fullproof.ScoringAnalyzer.prototype.provideScore = true;


/**
 * @inheritDoc
 */
fullproof.ScoringAnalyzer.prototype.score = function(text, callback) {
  var words = {};
  var wordcount = 0;
  var totalwc = 0;
  var self = this;
  this.parse(text, function(word) {

    if (!words[word]) {
      words[word] = [];
    }
    words[word].push(wordcount);
    totalwc += ++wordcount;
  });

  // Evaluate the score for each word
  for (var w in words) {
    var res = words[w];
    var occboost = 0;
    for (var i = 0; i < res.length; ++i) {
      occboost += (3.1415 - Math.log(1 + res[i])) / 10;
    }
    var countboost = Math.abs(Math.log(1 + res.length)) / 10;
    var score = 1 + occboost * 1.5 + countboost * 3;
    callback(new fullproof.ScoredEntry(w, undefined, score));
  }

};
