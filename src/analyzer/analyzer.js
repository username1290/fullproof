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
goog.require('fullproof.ScoreEntry');
goog.require('fullproof.normalizer.Normalizer');
goog.require('goog.array');



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
fullproof.Analyzer.prototype.parse = function(text) {
  var tokens = [];
  // Note: parse is always sync.
  this.tokenize(text, function(start, len) {
    var token = text.substr(start, len);
    tokens.push(token);
  });
  return tokens;
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
      start = i + 1;
    }
  }
  len = max - start;
  if (len) {
    callback(start, len);
  }
};


/**
 * @param {string} text text to be prase and scored.
 * @param {ydn.db.schema.FullTextSource} source
 * @param {IDBKey=} opt_key primary key.
 * @return {Array.<fullproof.ScoreEntry>} scores for each unique token.
 */
fullproof.Analyzer.prototype.score = function(text, source, opt_key) {
  var tokens = [];
  var positions = [];
  // Note: parse is always sync.
  this.tokenize(text, function(start, len) {
    var token = text.substr(start, len);
    tokens.push(token);
    positions.push(start);
  });
  var nTokens = [];
  for (var i = 0; i < tokens.length; i++) {
    nTokens[i] = this.normalize(tokens[i]);
  }
  var store_name = source ? source.getStoreName() : undefined;
  var key_path = source ? source.getKeyPath() : undefined;
  var scores = [];
  var wordcount = 0;
  for (var i = 0; i < tokens.length; i++) {
    var word = nTokens[i];
    var score = goog.array.find(scores, function(s) {
      return s.getKey() == word;
    });
    if (!score) {
      score = new fullproof.ScoreEntry(word, tokens[i], positions[i],
          store_name, key_path, opt_key);
      scores.push(score);
    }
    score.encounter(++wordcount);
  }

  return scores;
};

