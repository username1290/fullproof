
goog.provide('fullproof.StandardAnalyzer');
goog.require('fullproof.Analyzer');


/**
 * An analyzer with a parse() method. An analyzer does more than
 * just parse, as it normalizes each word calling the sequence
 * of normalizers specified when calling the constructor.
 *
 * @constructor
 * @extends {fullproof.Analyzer}
 * @param {Array} normalizers the constructor can take normalizers as parameters. Each
 * normalizer is applied sequentially in the same order as they are
 * passed in the constructor.
 */
fullproof.StandardAnalyzer = function(normalizers) {
  goog.base(this);

  this.provideScore = false;
  /**
   * When true, the parser calls its callback function with
   * the parameter {boolean}false when complete. This allows
   * the callback to know when the parsing is complete. When
   * this property is set to false, the parser never triggers
   * the last call to callback(false).
   */
  this.sendFalseWhenComplete = true;


};
goog.inherits(fullproof.StandardAnalyzer, fullproof.Analyzer);


/**
 * The main method: cuts the text in words, calls the normalizers on each word,
 * then calls the callback with each non empty word.
 * @override
 */
fullproof.StandardAnalyzer.prototype.parse = function(text, callback) {

  var me = this;
  goog.base(this, 'parse', text, function(word) {
    callback(me.normalize(word.trim()));
  });
};


