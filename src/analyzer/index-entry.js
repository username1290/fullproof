// Copyright 2013 YDN Authors. All Rights Reserved.
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
 * @fileoverview Indexed entry.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


goog.provide('ydn.db.text.IndexEntry');
goog.require('ydn.db.text.Entry');



/**
 * Index entry for scoring keyword.
 * @param {Array} id inverted index schema.
 * @param {string} keyword normalized value of original word.
 * @param {Array.<number>=} opt_positions score.
 * @param {number=} opt_score score.
 * @constructor
 * @extends {ydn.db.text.Entry}
 * @struct
 */
ydn.db.text.IndexEntry = function(id, keyword, opt_positions, opt_score) {
  goog.base(this, keyword, id[3], opt_score);
  /**
   * @final
   * @type {string?}
   * @protected
   */
  this.store_name = id[0];
  /**
   * @final
   * @type {string?}
   * @protected
   */
  this.key_path = id[1];
  /**
   * @final
   * @type {IDBKey?}
   * @protected
   */
  this.primary_key = id[2];
  /**
   * Word count that this keyword encounter in the document.
   * @final
   * @protected
   * @type {Array.<number>}
   */
  this.positions = opt_positions || [];
};
goog.inherits(ydn.db.text.IndexEntry, ydn.db.text.Entry);


/**
 * @return {number} element score.
 */
ydn.db.text.IndexEntry.prototype.getScore = function() {
  if (isNaN(this.score)) {
    this.score = this.compute();
  }
  return this.score;
};


/**
 * Token encounter in indexing string.
 * @param {number} count current word count.
 */
ydn.db.text.IndexEntry.prototype.encounter = function(count) {
  this.positions.push(count);
};


/**
 * Compute score base on word encounter.
 * @return {number} computed score.
 */
ydn.db.text.IndexEntry.prototype.compute = function() {
  var occboost = 0;
  for (var i = 0; i < this.positions.length; ++i) {
    occboost += (3.1415 - Math.log(1 + this.positions[i])) / 10;
  }
  var countboost = Math.abs(Math.log(1 + this.positions.length)) / 10;
  return 1 + occboost * 1.5 + countboost * 3;
};


/**
 * @return {!Object} JSON to stored into the database.
 */
ydn.db.text.IndexEntry.prototype.toJson = function() {
  return {
    'keyword': this.keyword,
    'value': this.value,
    'score': this.getScore(),
    'id': this.getId(),
    'positions': this.positions // .slice() // no need defensive
  };
};


/**
 * @override
 */
ydn.db.text.IndexEntry.prototype.getSignature = function() {
  var st = this.store_name || '';
  var kr = this.primary_key || '';
  var kp = this.key_path || '';
  return [st, kr, kp, this.value];
};


/**
 * @return {string} source store name.
 */
ydn.db.text.IndexEntry.prototype.getStoreName = function() {
  return /** @type {string} */ (this.store_name);
};


/**
 * @return {string} source store name.
 */
ydn.db.text.IndexEntry.prototype.getKeyPath = function() {
  return /** @type {string} */ (this.key_path);
};


/**
 * @return {IDBKey} source primary key.
 */
ydn.db.text.IndexEntry.prototype.getPrimaryKey = function() {
  return /** @type {IDBKey} */ (this.primary_key);
};


