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


goog.provide('fullproof.ScoringEngine');
goog.require('fullproof.ScoredEntry');



/**
 * @param {ydn.db.schema.fulltext.Index} schema full text search schema.
 * @constructor
 * @implements {ydn.db.schema.fulltext.Engine}
 */
fullproof.ScoringEngine = function(schema) {
  /**
   * @final
   * @protected
   * @type {ydn.db.schema.fulltext.Index}
   */
  this.schema = schema;
  /**
   * @final
   * @protected
   * @type {!Array.<!fullproof.normalizer.Normalizer>}
   */
  this.normalizers = fullproof.normalizer.english.getNormalizers(
      schema.getNormalizers());
  /**
   * @final
   * @protected
   * @type {fullproof.ScoringAnalyzer}
   */
  this.analyzer = new fullproof.Analyzer(this.normalizers);
};


/**
 * Analyze an indexing value.
 * @param {string} store_name the store name in which document belong.
 * @param {IDBKey} key primary of the document.
 * @param {Object} obj the document to be indexed.
 * @return {Array.<ydn.db.schema.fulltext.Score>} score for each token.
 */
fullproof.ScoringEngine.prototype.analyze = function(store_name, key, obj) {
  var scores = [];
  for (var i = 0; i < this.schema.count(); i++) {
    var source = this.schema.index(i);
    if (source.getStoreName() == store_name) {
      var text = ydn.db.utils.getValueByKeys(obj, source.getKeyPath());
      if (text) {
        var tokens = this.parse(text);
        scores = scores.concat(this.score(tokens, source, key));
      }
    }
  }
  return scores;
};


/**
 * Analyze query string or index value.
 * @param {string} query query string.
 * @return {Array.<string>} list of tokens.
 */
fullproof.ScoringEngine.prototype.parse = function(query) {
  return this.analyzer.parseAll(query);
};


/**
 * @inheritDoc
 */
fullproof.ScoringEngine.prototype.rank = function(req) {
  var result_req = req.copy();
  var result = new fullproof.ResultSet();
  req.addProgback(function(x) {
    var values = /** @type {Array.<Object>} */ (x);
    var scores = values.map(function(v) {
      var score = fullproof.ScoredEntry.fromJson(v);
      var ft_index = this.schema.getIndex(v['store_name']);
      if (ft_index) {
        score.rescale(ft_index.getWeight());
      } else if (goog.DEBUG) {
        throw new Error('full text search primary index store name "' +
            v['store_name'] + '" not found in ' + this.schema.getName());
      }
      return score;
    });
    result.merge(scores);
    result_req.notify(result);
    values.length = 0;
  }, this);
  req.addCallbacks(function() {
    result_req.callback(result);
  }, function(e) {
    result_req.errback(result);
  }, this);
  return result_req;
};


/**
 * Normalized tokens.
 * @param {Array.<string>} tokens tokens.
 * @returns {Array.<string>} normalized tokens.
 */
fullproof.ScoringEngine.prototype.normalize = function(tokens) {
  var nTokens = [];
  for (var i = 0; i < tokens.length; i++) {
    nTokens[i] = this.analyzer.normalize(tokens[i]);
  }
  return nTokens;
};


/**
 * @param {Array.<string>} tokens
 * @param {ydn.db.schema.FullTextSource} source
 * @param {IDBKey=} opt_key primary key.
 * @return {Array.<ydn.db.schema.fulltext.Score>} scores for each unique token.
 */
fullproof.ScoringEngine.prototype.score = function(tokens, source, opt_key) {
  var nTokens = this.normalize(tokens);
  var scores = [];
  var wordcount = 0;
  for (var i = 0; i < tokens.length; i++) {
    var word = nTokens[i];
    var score = goog.array.find(scores, function(s) {
      return s.getKey() == word;
    });
    if (!score) {
      score = new ydn.db.schema.fulltext.Score(word, tokens[i],
          source.getStoreName(), source.getKeyPath(), opt_key);
      scores.push(score);
    }
    score.encounter(wordcount);
  }

  return scores;
};

