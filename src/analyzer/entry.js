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
 * @fileoverview Index entry.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


goog.provide('ydn.db.text.Entry');
goog.require('ydn.db.schema.fulltext.Entry');



/**
 * An object that associates a value and a numerical score
 * @param {string} keyword normalized value of original word.
 * @param {string} value original word.
 * @param {number=} opt_position source key path.
 * @param {number=} opt_score score.
 * @constructor
 * @struct
 * @implements {ydn.db.schema.fulltext.Entry}
 */
ydn.db.text.Entry = function(keyword, value, opt_position, opt_score) {
  /**
   * @final
   * @type {string}
   * @protected
   */
  this.keyword = keyword;
  /**
   * @final
   * @type {string}
   * @protected
   */
  this.value = value;
  /**
   * Location of the keyword in the document or query string.
   * @final
   * @type {number}
   */
  this.position = goog.isDef(opt_position) ? opt_position : NaN;
  /**
   * @type {number}
   * @protected
   */
  this.score = goog.isDefAndNotNull(opt_score) ? opt_score : NaN;
  /**
   * This is computed lazily.
   * @see #getId
   * @type {number}
   * @private
   */
  this.id_ = NaN;
};


/**
 * @return {string} source store name.
 */
ydn.db.text.Entry.prototype.getKeyword = function() {
  return this.keyword;
};


/**
 * @return {string} source store name.
 */
ydn.db.text.Entry.prototype.getValue = function() {
  return this.value;
};


/**
 * @return {number} source store name.
 */
ydn.db.text.Entry.prototype.getScore = function() {
  return this.score;
};


/**
 * Compare by score, then by id.
 * Note: this result 0 only if the same entry is compared.
 * @param {ydn.db.text.Entry} a entry a.
 * @param {ydn.db.text.Entry} b entry b.
 * @return {number} return 1 if score of entry a is larger than that of b, -1
 * if score of entry b is larger than a, otherwise compare by id.
 */
ydn.db.text.Entry.cmp = function(a, b) {
  var a_score = a.getScore();
  var b_score = b.getScore();
  return a_score > b_score ? 1 : b_score > a_score ? -1 :
      a.getId() > b.getId() ? 1 : a.getId() < b.getId() ? -1 : 0;
};


/**
 * @protected
 * @return {string}
 */
ydn.db.text.Entry.prototype.getSignature = function() {
  var p = this.position || 0;
  return '' + p + this.value;
};


/**
 * Uniquely identify this entry.
 * @return {number} Entry identifier.
 * @final
 */
ydn.db.text.Entry.prototype.getId = function() {
  if (isNaN(this.id_)) {
    this.id_ = goog.string.hashCode(this.getSignature());
  }
  return this.id_;
};


if (goog.DEBUG) {
  /**
   * @inheritDoc
   */
  ydn.db.text.Entry.prototype.toString = function() {
    return 'fulltext.Entry:' + this.keyword;
  };
}


