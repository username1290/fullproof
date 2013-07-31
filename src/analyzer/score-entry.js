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
goog.require('ydn.db.schema.fulltext.Index');



/**
 * An object that associates a value and a numerical score
 * @param {string} keyword normalized value of original word.
 * @param {string} value original word.
 * @param {number} position source key path.
 * @param {string=} opt_store_name source store name.
 * @param {string=} opt_key_path source key path.
 * @param {IDBKey=} opt_p_key source primary key.
 * @param {number=} opt_score score.
 * @constructor
 * @implements {ydn.db.schema.fulltext.ScoreEntry}
 */
fullproof.ScoreEntry = function(keyword, value, position, opt_store_name,
                                opt_key_path, opt_p_key, opt_score) {
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
   * @type {string|undefined}
   */
  this.store_name = opt_store_name;
  /**
   * @final
   * @type {number}
   */
  this.position = position;
  /**
   * @final
   * @type {string|undefined}
   */
  this.key_path = opt_store_name;
  /**
   * @final
   * @type {IDBKey|undefined}
   */
  this.primary_key = opt_p_key;
  /**
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
   * This is computed lazily.
   * @see #getId
   * @type {number}
   * @private
   */
  this.id_ = NaN;
  /**
   * If this entry represents an result, parent query entry is defined.
   * @type {fullproof.ScoreEntry} parent query.
   */
  this.query = null;
  /**
   * If this entry represents an query entry, left entry is defined.
   * @type {fullproof.ScoreEntry} parent query.
   */
  this.left = null;
  /**
   * If this entry represents an query entry, right entry is defined.
   * @type {fullproof.ScoreEntry} parent query.
   */
  this.right = null;
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
fullproof.ScoreEntry.prototype.getValue = function() {
  return this.value;
};


/**
 * @return {string} source store name.
 */
fullproof.ScoreEntry.prototype.getStoreName = function() {
  return /** @type {string} */ (this.store_name);
};


/**
 * @return {IDBKey} source primary key.
 */
fullproof.ScoreEntry.prototype.getPrimaryKey = function() {
  return /** @type {IDBKey} */ (this.primary_key);
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
 * Rescale the score.
 * @param {number} scale scale value to multiply the score.
 */
fullproof.ScoreEntry.prototype.rescale = function(scale) {
  this.getScore(); // get computed, if necessary.
  this.score *= scale;
};


/**
 * Compare by score, then by id.
 * Note: this result 0 only if same entry is compared.
 * @param {fullproof.ScoreEntry} a entry a.
 * @param {fullproof.ScoreEntry} b entry b.
 * @return {number} return 1 if score of entry a is larger than that of b, -1
 * if score of entry b is larger than a, otherwise compare by id.
 */
fullproof.ScoreEntry.cmp = function(a, b) {
  var a_score = a.getScore();
  var b_score = b.getScore();
  return a > b ? 1 : b > a ? -1 :
      a.getId() > b.getId() ? 1 : a.getId() < b.getId() ? -1 : 0;
};


/**
 *
 * @param {fullproof.ScoreEntry} a
 * @param {fullproof.ScoreEntry} b
 * @return {fullproof.ScoreEntry}
 */
fullproof.ScoreEntry.mergeFn = function(a,b) {
  return new fullproof.ScoreEntry(a.key, a.value, a.position, a.store_name,
      a.key_path, a.primary_key, a.score + b.score);
};


/**
 * Uniquely identify this entry.
 * @return {number} Entry identifier.
 */
fullproof.ScoreEntry.prototype.getId = function() {
  if (isNaN(this.id_)) {
    var st = this.store_name || '';
    var kp = this.key_path || '';
    var p = this.position || 0;
    this.id_ = goog.string.hashCode(st + kp + p + this.key);
  }
  return this.id_;
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

