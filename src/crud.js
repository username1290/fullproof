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
 * @fileoverview Hook into database operator to inject index on write and
 * add full text search function.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


/**
 * Add full text indexer
 * @param {ydn.db.schema.Store} store store object.
 * @param {ydn.db.schema.fulltext.Index} ft_schema synchronization options.
 * @protected
 */
ydn.db.crud.Storage.prototype.addFullTextIndexer = function(store, ft_schema) {
  var me = this;

  ft_schema.engine = new fullproof.ScoringEngine(ft_schema);
  /**
   * @param {!ydn.db.Request} rq
   * @param {Arguments} args
   */
  var indexer = function(rq, args) {
    if (rq.getMethod() == ydn.db.Request.Method.PUT) {
      var value = args[1];
      for (var i = 0; i < ft_schema.count(); i++) {
        var index = ft_schema.index(i);
        if (index.getStoreName() == store.getName()) {
          var text = ydn.db.utils.getValueByKeys(value, value);
          if (text) {
            var tokens = ft_schema.engine.analyze(text);
            if (tokens.length > 0) {
              var tokens = tokens.map(function(x) {
                return x.toJson();
              });
              me.getCoreOperator().dumpInternal(ft_schema.getName(), tokens);
            }
          }
        }
      }
    }
  };
  store.addHook(indexer);
};


/**
 * Full text search query.
 * @param {string} name full text search index name.
 * @param {string} query text query.
 * @return {!ydn.db.Request}
 */
ydn.db.crud.Storage.prototype.search = function(name, query) {
  var ft_schema = this.schema.getFullTextSchema(name);
  var scores = ft_schema.engine.analyze(query);
  if (scores.length == 0) {
    return ydn.db.Request.succeed(ydn.db.Request.Method.SEARCH, undefined);
  }
  var tokens = scores.map(function(x) {
    return x.key;
  });
  var search_req = this.getCoreOperator().search(ft_schema, tokens);
  return ft_schema.engine.score(search_req);
};
