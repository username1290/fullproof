goog.provide('fullproof.tests');
goog.require('ydn.db.text.ResultEntry');

ydn.db.text.ResultEntry.prototype.mkRandom = function(maxValue) {
  var word = 'xxxxxx'.replace(/./g, function(c) {
    return String.fromCharCode(65 + parseInt(Math.random() * 26));
  });
  var value = parseInt(Math.random() * maxValue);
  var result = new ydn.db.text.ResultEntry(word, value, Math.random() * 2);
  return result;
};

fullproof.ResultSet.prototype.testEquals = function(otherResultSet) {
  otherResultSet = (otherResultSet instanceof fullproof.ResultSet) ? otherResultSet.getDataUnsafe() : otherResultSet;

  deepEqual(this.getDataUnsafe(), otherResultSet);
};


fullproof.tests.error = function() {
  ok(false);
};
fullproof.tests.error_restart = function() {
  ok(false);
  QUnit.start();
};
fullproof.tests.success_restart = function() {
  ok(true);
  QUnit.start();
};

fullproof.tests.mkRandomString = function(size) {
  var result = '';
  for (var i = 0; i < size; ++i) {
    result += String.fromCharCode(65 + parseInt(Math.random() * 26));
  }
  return result;
};

fullproof.tests.genericComparator = {
  lower_than: function(a, b) {
    var vala = a.value ? a.value : a;
    var valb = b.value ? b.value : b;
    return vala < valb;
  },
  equals: function(a, b) {
    var vala = a.value ? a.value : a;
    var valb = b.value ? b.value : b;
    return vala == valb;
  }
};

fullproof.tests.makeResultSetOfScoredEntries = function(count, maxValue) {
  var result = new fullproof.ResultSet(fullproof.tests.genericComparator);
  for (var i = 0; i < count; ++i) {
    result.insert(ydn.db.text.ResultEntry.prototype.mkRandom(maxValue));
  }
  return result;
};

fullproof.tests.makeResultSetOfScoredEntriesObjects = function(count) {
  var result = new fullproof.ResultSet(fullproof.tests.genericComparator);
  var curValue = parseInt(Math.random() * 100);
  for (var i = 0; i < count; ++i) {
    var obh = {
      param1: fullproof.tests.mkRandomString(8),
      param2: fullproof.tests.mkRandomString(8),
      intvalue: parseInt(Math.random() * 1000)
//					value: parseInt(Math.random()*100)
    };

    result.insert(new ydn.db.text.ResultEntry(fullproof.tests.mkRandomString(10), obh, Math.random() * 20));
  }
  return result;
};


fullproof.tests.testScoredElement = function(se1, se2) {
  deepEqual(se1.value, se2.value);
  equal(se1.score, se2.score);
  return result;
};

fullproof.tests.createAndOpenStore = function(indexName, storeRef, useScore, callback) {
  var store = new storeRef();
  var caps = new fullproof.Capabilities().setDbSize(1024 * 1024 * 10).setUseScores(useScore).setDbName('fullproofTests');
  var analyzer = (useScore ? new fullproof.ScoringAnalyzer() : new fullproof.StandardAnalyzer());
  var idx = new fullproof.IndexRequest(indexName, caps, false);
  store.open(caps, [idx], fullproof.make_callback(callback, store), fullproof.make_callback(callback, false));
};


