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

goog.provide('fullproof.ResultSet');
goog.require('fullproof.ScoreEntry');
goog.require('ydn.db.KeyRange');



/**
 * Result set.
 *
 * @constructor
 * @param {ydn.db.schema.fulltext.Index} ft_schema full text schema.
 * @param {Array.<fullproof.ScoreEntry>} query_tokens query tokens.
 * @param {number} limit Maximum number of satisfactory results.
 * @param {number} threshold Threshold score of a result to consider as
 * satisfactory.
 * @implements {ydn.db.schema.fulltext.ResultSet}
 */
fullproof.ResultSet = function(ft_schema, query_tokens, limit, threshold) {
  /**
   * @protected
   * @type {ydn.db.schema.fulltext.Index}
   */
  this.ft_schema = ft_schema;
  /**
   * @protected
   * @type {Array.<fullproof.ScoreEntry>}
   */
  this.query_tokens = query_tokens || [];
  /**
   * @protected
   * @type {Array.<fullproof.ScoreEntry>}
   */
  this.results = [];
  /**
   * Maximum number of satisfactory results.
   * @type {number}
   * @protected
   */
  this.limit = limit;
  /**
   * Threshold score of a result to consider as satisfactory.
   * @type {number}
   * @protected
   */
  this.threshold = threshold;
  /**
   * Current position of type looking up from database.
   * @type {number}
   * @private
   */
  this.i_type_ = 0;
  for (var i = 0; i < this.query_tokens.length; i++) {
    this.query_tokens[i].left = this.query_tokens[i - 1] || null;
    this.query_tokens[i].right = this.query_tokens[i + 1] || null;
  }
};


/**
 * @const
 * @type {Array.<string>}
 */
fullproof.ResultSet.Q_TYPES = ['value', 'keyword', 'value', 'keyword'];


/**
 * Next database lookup.
 * @param {function(string, string, ydn.db.KeyRange,
 * fullproof.ScoreEntry)} cb callback for next query.
 */
fullproof.ResultSet.prototype.nextLookup = function(cb) {
  if (this.i_type_ > fullproof.ResultSet.Q_TYPES.length) {
    return;
  }
  var index_name = fullproof.ResultSet.Q_TYPES[this.i_type_];
  for (var i = 0; i < this.ft_schema.count(); i++) {
    var index_schema = this.ft_schema.index(i);
    var store_name = index_schema.getStoreName();
    for (var j = 0; j < this.query_tokens.length; j++) {
      var token = this.query_tokens[j];
      var key = this.i_type_ == 0 || this.i_type_ == 3 ?
          token.getValue() : token.getKeyword();
      var key_range = this.i_type_ >= 2 ? ydn.db.KeyRange.starts(key) :
          ydn.db.KeyRange.only(key);
      cb(store_name, index_name, key_range, this.query_tokens[j]);
    }
  }
  ++this.i_type_;
};


/**
 * Count number of results.
 * @param {boolean=} opt_only_satisfactory count only result of score larger
 * than or equal to threadhold value.
 * @return {number} number of results.
 */
fullproof.ResultSet.prototype.count = function(opt_only_satisfactory) {
  if (opt_only_satisfactory && !isNaN(this.threshold)) {
    var cnt = 0;
    for (var i = 0; i < this.results.length; i++) {
      if (this.results[i].getScore() >= this.threshold) {
        cnt++;
      } else {
        break;
      }
    }
    return cnt;
  } else {
    return this.results.length;
  }
};


/**
 * @inheritDoc
 */
fullproof.ResultSet.prototype.addResult = function(query, results) {
  for (var i = 0; i < results.length; i++) {
    var entry = fullproof.ScoreEntry.fromJson(results[i]);
    entry.query = query;
    goog.array.binaryInsert(this.results, entry, fullproof.ScoreEntry.cmp);
  }
  return this.count(true) <= this.limit;
};

