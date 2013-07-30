// Copyright 2012 YDN Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Fulltext element score.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


goog.provide('fullproof.ScoreEntry');



/**
 * An object that associates a value and a numerical score
 * @param {string} keyword normalized value of original word.
 * @param {string} value original word.
 * @param {number} position source key path.
 * @param {string} store_name source store name.
 * @param {string} key_path source key path.
 * @param {IDBKey=} opt_p_key source primary key.
 * @param {number=} opt_score score.
 * @constructor
 * @implements {ydn.db.schema.fulltext.ScoreEntry}
 */
fullproof.ScoreEntry = function(keyword, value, position, store_name, key_path,
                                opt_p_key, opt_score) {
  /**
   * @final
   * @type {string}
   */
  this.key = keyword;
  /**
   * @final
   * @type {string}
   */
  this.value = value;
  /**
   * @final
   * @type {string}
   */
  this.store_name = store_name;
  /**
   * @final
   * @type {number}
   */
  this.position = position;
  /**
   * @final
   * @type {string}
   */
  this.key_path = store_name;
  /**
   * @final
   * @type {IDBKey}
   */
  this.primary_key = opt_p_key;
  /**
   * @final
   * @type {number}
   * @protected
   */
  this.score = goog.isDef(opt_score) ? opt_score : NaN;
  /**
   * @final
   * @private
   * @type {Array.<number>}
   */
  this.encounter_count_ = [];
  /**
   * @final
   * @private
   * @type {!Array.<!fullproof.ScoreEntry>}
   */
  this.results_ = [];
};


/**
 * @return {string} source store name.
 */
fullproof.ScoreEntry.prototype.getKeyword = function() {
  return this.key;
};


/**
 * @return {string} source store name.
 */
fullproof.ScoreEntry.prototype.getStoreName = function() {
  return this.store_name;
};


/**
 * @return {IDBKey} source primary key.
 */
fullproof.ScoreEntry.prototype.getPrimaryKey = function() {
  return this.primary_key;
};


/**
 * @return {number} element score.
 */
fullproof.ScoreEntry.prototype.getScore = function() {
  if (isNaN(this.score)) {
    this.score = this.compute();
  }
  return this.score;
};


/**
 * Token encounter in indexing string.
 * @param {number} count current word count.
 */
fullproof.ScoreEntry.prototype.encounter = function(count) {
  this.encounter_count_.push(count);
};


/**
 * Compute score base on word encounter.
 * @return {number} computed score.
 */
fullproof.ScoreEntry.prototype.compute = function() {
  var occboost = 0;
  for (var i = 0; i < this.encounter_count_.length; ++i) {
    occboost += (3.1415 - Math.log(1 + this.encounter_count_[i])) / 10;
  }
  var countboost = Math.abs(Math.log(1 + this.encounter_count_.length)) / 10;
  return 1 + occboost * 1.5 + countboost * 3;
};


/**
 * Set search results of this keyword.
 * @param {Array} results database lookup entries.
 */
fullproof.ScoreEntry.prototype.setResult = function(results) {
  if (results) {
    this.results_ = results.map(function(json) {
      return fullproof.ScoreEntry.fromJson(json);
    });
  } else {
    this.results_.length = 0;
  }
};


/**
 * @return {!Array.<!fullproof.ScoreEntry>} results database lookup entries.
 */
fullproof.ScoreEntry.prototype.setResult = function(results) {
  return this.results_;
};


/**
 * Rescale the score.
 * @param {number} scale scale value to multiply the score.
 */
fullproof.ScoreEntry.prototype.rescale = function(scale) {
  this.getScore(); // get computed, if necessary.
  this.score *= scale;
};

fullproof.ScoreEntry.cmp = {
  lower_than: function(a,b) {
    return a.value < b.value;
  },
  equals: function(a,b) {
    return a.value == b.value;
  }
};


/**
 *
 * @param {fullproof.ScoreEntry} a
 * @param {fullproof.ScoreEntry} b
 * @return {fullproof.ScoreEntry}
 */
fullproof.ScoreEntry.mergeFn = function(a,b) {
  return new fullproof.ScoreEntry(a.value, a.score + b.score);
};


/**
 * @return {string}
 */
fullproof.ScoreEntry.prototype.getKey = function() {
  return this.key;
};


/**
 * @return {!Object}
 */
fullproof.ScoreEntry.prototype.toJson = function() {
  return {
    'storeName': this.store_name,
    'primaryKey': this.primary_key,
    'keyword': this.key,
    'keyPath': this.key_path,
    'position': this.position,
    'value': this.value,
    'score': this.getScore()
  };
};


/**
 * @param {Object} json
 * @return {!fullproof.ScoreEntry}
 */
fullproof.ScoreEntry.fromJson = function(json) {
  return new fullproof.ScoreEntry(json['keyword'], json['value'], json['position'],
      json['storeName'], json['keyPath'], json['primaryKey'], json['score']);
};


if (goog.DEBUG) {
  /**
   * @inheritDoc
   */
  fullproof.ScoreEntry.prototype.toString = function() {
    return 'Score:' + this.key + '|' + this.value + '|' + this.score;
  };
}

