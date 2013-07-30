/*
 * Copyright 2012 Rodrigo Reyes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */




goog.provide('fullproof.Analyzer');
goog.require('fullproof.ScoredElement');
goog.require('fullproof.normalizer.Normalizer');



/**
 * A prototype for Analyzers objects.
 * @param {Array.<fullproof.normalizer.Normalizer>} normalizers
 * @constructor
 */
fullproof.Analyzer = function(normalizers) {
  /**
   * @protected
   * @type {Array.<fullproof.normalizer.BasicNormalizer>}
   */
  this.normalizers = normalizers || [];

};


/**
 * Apply normalizers successively.
 * @param {string} word
 * @return {string}
 */
fullproof.Analyzer.prototype.normalize = function(word) {
  for (var i = 0; i < this.normalizers.length; i++) {
    word = this.normalizers[i].normalize(word);
  }
  return word;
};


/**
 * Sometimes it's convenient to receive the whole set of words cut and
 * normalized by the analyzer. This method calls the callback parameter only
 * once, with as single parameter an array of normalized words.
 * @param {string} text
 * @return {Array.<string>}
 */
fullproof.Analyzer.prototype.parse = function (text) {
  var result = [];
  // Note: parse is always sync.
  this.tokenize(text, function(start, len) {
    var token = text.substr(start, len);
    result.push(token);
  });
  return result;
};


/**
 * A simple private parser that relies on the unicode letter/number
 * categories. Word boundaries are whatever is not a letter
 * or a number.
 * @param {string} text text to parse.
 * @param {function(number, number)} callback yield start and length for each
 * token. Length is always larger than 0.
 */
fullproof.Analyzer.prototype.tokenize = function(text, callback) {
  var functor = net.kornr.unicode.is_letter_number;
  var start = 0;
  var len = 0;
  var max = text.length;
  for (var i = 0; i < max; ++i) {
    if (!functor(text.charCodeAt(i))) {
      len = i - start;
      if (len) {
        callback(start, len);
      }
      start = i;
    }
  }
  if (i - start > 1) {
    callback(start, len);
  }
};


