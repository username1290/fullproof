
goog.provide('fullproof.ScoredEntry');
goog.provide('fullproof.ScoredEntry');



/**
 * An object that associates a value and a numerical score
 * @param {string} key usually a word.
 * @param {string} store_name store name where original value reside.
 * @param {IDBKey} p_key primary key.
 * @param {number=} opt_score score.
 * @constructor
 */
fullproof.ScoredEntry = function(key, store_name, p_key, opt_score) {
  /**
   * @type {string}
   */
  this.key = key;
  /**
   * @type {string}
   */
  this.store_name = store_name;
  /**
   * @type {IDBKey}
   */
  this.primary_key = p_key;
  /**
   * @type {number}
   */
  this.score = goog.isDef(opt_score) ? opt_score : 1.0;
};


/**
 * @return {string}
 */
fullproof.ScoredEntry.prototype.getStoreName = function () {
  return this.store_name;
};


/**
 * @return {IDBKey}
 */
fullproof.ScoredEntry.prototype.getPrimaryKey = function () {
  return this.primary_key;
};


/**
 * @return {number}
 */
fullproof.ScoredEntry.prototype.getScore = function () {
  return this.score;
};


/**
 * Rescale the score.
 * @param {number} scale scale value to multiply the score.
 */
fullproof.ScoredEntry.prototype.rescale = function(scale) {
  if (!isNaN(scale)) {
    this.score *= scale;
  }
};

fullproof.ScoredEntry.comparatorObject = {
  lower_than: function(a,b) {
    return a.value<b.value;
  },
  equals: function(a,b) {
    return a.value==b.value;
  }
};
fullproof.ScoredEntry.prototype.comparatorObject = fullproof.ScoredEntry.comparatorObject;


/**
 *
 * @param {fullproof.ScoredEntry} a
 * @param {fullproof.ScoredEntry} b
 * @returns {fullproof.ScoredEntry}
 */
fullproof.ScoredEntry.mergeFn = function(a,b) {
  return new fullproof.ScoredEntry(a.value, a.score + b.score);
};


/**
 * @return {string}
 */
fullproof.ScoredEntry.prototype.getKey = function() {
  return this.key;
};


/**
 * @return {!Object}
 */
fullproof.ScoredEntry.prototype.toJson = function() {
  return {
    'store_name': this.store_name,
    'primary_key': this.primary_key,
    'key': this.key,
    'score': this.score
  };
};


/**
 * @param {Object} json
 * @returns {!fullproof.ScoredEntry}
 */
fullproof.ScoredEntry.fromJson = function(json) {
  return new fullproof.ScoredEntry(json['key'], json['store_name'],
      json['primary_key'], json['score']);
};


/**
 * @inheritDoc
 */
fullproof.ScoredEntry.prototype.toString = function () {
  return "[" + this.key + "=" + this.value + "|" + this.score + "]";
};

