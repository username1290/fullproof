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


goog.provide('ydn.db.text.RankEntry');
goog.require('ydn.db.text.IndexEntry');



/**
 * Output result entry.
 * @param {ydn.db.text.Entry} entry original entry.
 * @constructor
 * @extends {ydn.db.text.Entry}
 * @struct
 */
ydn.db.text.RankEntry = function(entry) {
  goog.base(this, entry.getKeyword(), entry.getValue(), entry.getScore());
};
goog.inherits(ydn.db.text.RankEntry, ydn.db.text.Entry);





