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
  this.analyzer = new fullproof.ScoringAnalyzer(this.normalizers);
};


/**
 * @return {fullproof.ScoringAnalyzer} analyzer.
 */
fullproof.ScoringEngine.prototype.getAnalyzer = function() {
  return this.analyzer;
};


/**
 * Analyze query string or index value.
 * @param {string} query query string.
 * @return {Array.<string>} list of tokens.
 */
fullproof.ScoringEngine.prototype.analyze = function(query) {
  return this.analyzer.parseAll(query);
};


/**
 * @inheritDoc
 */
fullproof.ScoringEngine.prototype.prepare = function(req) {
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
 * @param {string} text
 * @return {Array.<fullproof.ScoredElement>}
 */
fullproof.ScoringEngine.prototype.scoreAll = function(text) {
  var tokens = this.analyzer.parseAll
  var result = [];
  // Note: score is always sync.
  this.score(text, function(token) {
    if (!goog.isNull(token)) {
      result.push(token);
    }
  });
  return result;
};


/**
 * @param {string} text
 * @param {function(fullproof.ScoredElement)} callback
 */
fullproof.ScoringEngine.prototype.score = function(text, callback) {
  this.analyzer.parse(text, function(word) {
    callback(new fullproof.ScoredEntry(word));
  });
};

