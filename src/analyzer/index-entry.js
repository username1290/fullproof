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
 * @param {string} keyword normalized value of original word.
 * @param {string} value original word.
 * @param {number} position source key path.
 * @param {string=} opt_store_name source store name.
 * @param {string=} opt_key_path source key path.
 * @param {IDBKey=} opt_p_key source primary key.
 * @param {number=} opt_score score.
 * @constructor
 * @extends {ydn.db.text.Entry}
 * @struct
 */
ydn.db.text.IndexEntry = function(keyword, value, position, opt_store_name,
                                  opt_key_path, opt_p_key, opt_score) {
  goog.base(this, keyword, value, position, opt_store_name,
      opt_key_path, opt_p_key, opt_score);
  /**
   * Word count that this keyword encounter in the document.
   * @final
   * @private
   * @type {Array.<number>}
   */
  this.encounter_count_ = [];
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
  this.encounter_count_.push(count);
};


/**
 * Compute score base on word encounter.
 * @return {number} computed score.
 */
ydn.db.text.IndexEntry.prototype.compute = function() {
  var occboost = 0;
  for (var i = 0; i < this.encounter_count_.length; ++i) {
    occboost += (3.1415 - Math.log(1 + this.encounter_count_[i])) / 10;
  }
  var countboost = Math.abs(Math.log(1 + this.encounter_count_.length)) / 10;
  return 1 + occboost * 1.5 + countboost * 3;
};


/**
 *
 * @param {ydn.db.text.IndexEntry} a
 * @param {ydn.db.text.IndexEntry} b
 * @return {ydn.db.text.IndexEntry}
 */
ydn.db.text.IndexEntry.mergeFn = function(a,b) {
  return new ydn.db.text.IndexEntry(a.keyword, a.value, a.position,
      a.store_name, a.key_path, a.primary_key, a.getScore() + b.getScore());
};



