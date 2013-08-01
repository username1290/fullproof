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


goog.provide('ydn.db.text.ResultEntry');
goog.require('ydn.db.text.IndexEntry');



/**
 * Index entry for scoring keyword.
 * @param {ydn.db.schema.fulltext.InvIndex} index index source.
 * @param {ydn.db.text.QueryEntry} query query entry belong to this result.
 * @param {Object} json entry JSON read from the database.
 * @constructor
 * @extends {ydn.db.text.IndexEntry}
 * @struct
 */
ydn.db.text.ResultEntry = function(index, query, json) {
  var es = json['source'];
  goog.base(this, es['storeName'], es['keyPath'], es['primaryKey'],
      json['keyword'], json['value'],
      json['positions'], json['score']);
  /**
   * @type {ydn.db.schema.fulltext.InvIndex}
   * @protected
   */
  this.index = index;
  /**
   * @type {ydn.db.text.QueryEntry}
   * @protected
   */
  this.query = query;
};
goog.inherits(ydn.db.text.ResultEntry, ydn.db.text.IndexEntry);


/**
 * @return {number} element score.
 */
ydn.db.text.ResultEntry.prototype.getScore = function() {
  var query_weight = this.query ? this.query.getWeight() : 1;
  var index_weight = this.index ? this.index.getWeight() : 1;
  goog.asserts.assert(goog.isNumber(query_weight) && !isNaN(query_weight),
      'query_weight');
  goog.asserts.assert(goog.isNumber(index_weight) && !isNaN(index_weight),
      'index_weight');
  return this.score * query_weight * index_weight;
};




