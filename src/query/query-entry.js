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
 * @fileoverview Query entry.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


goog.provide('ydn.db.text.QueryEntry');
goog.require('ydn.db.schema.fulltext.Entry');



/**
 * Index entry for scoring keyword.
 * @param {string} keyword normalized value of original word.
 * @param {string} value original word.
 * @param {number} position source key path.
 * @constructor
 * @extends {ydn.db.schema.fulltext.Entry}
 * @struct
 */
ydn.db.text.QueryEntry = function(keyword, value, position) {
  goog.base(this, keyword, value, position);
  /**
   * @type {ydn.db.text.ResultSet}
   */
  this.resultset = null;
};
goog.inherits(ydn.db.text.QueryEntry, ydn.db.schema.fulltext.Entry);


/**
 * @return {number} element score.
 */
ydn.db.text.QueryEntry.prototype.getScore = function() {
  return this.score;
};


/**
 * @return {number} element score.
 */
ydn.db.text.QueryEntry.prototype.getWeight = function() {
  return 1;
};
