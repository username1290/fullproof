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
 * Entry restored from the database.
 * @param {ydn.db.text.QueryEntry} query query entry belong to this result.
 * @param {Object} json entry JSON read from the database.
 * @constructor
 * @extends {ydn.db.text.IndexEntry}
 * @struct
 */
ydn.db.text.ResultEntry = function(query, json) {
  // the primary key 'id' is composite key having store name, key path, key
  // and value. @see ydn.db.text.IndexEntry#getId().
  var id = json['id'];
  if (goog.isString(id)) {
    id = ydn.db.utils.decodeKey(id);
  }
  goog.asserts.assertArray(id, 'Inverted entry key "' + json['id'] + '" is ' +
      'invalid.');
  goog.base(this, id, json['keyword'], json['positions'], json['score']);
  /**
   * @type {ydn.db.text.QueryEntry}
   */
  this.query = query;
};
goog.inherits(ydn.db.text.ResultEntry, ydn.db.text.IndexEntry);





