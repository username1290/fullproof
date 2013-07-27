
goog.provide('fullproof.ScoredElement');
goog.provide('fullproof.ScoredEntry');



/**
 * An object that associates a value and a numerical score
 * @param {string} value
 * @param {number=} score
 * @constructor
 */
fullproof.ScoredElement = function(value, score) {
  /**
   * @type {string}
   */
  this.value = value;
  /**
   * @type {number}
   */
  this.score = goog.isDef(score) ? score : 1.0;
};


/**
 * @inheritDoc
 */
fullproof.ScoredElement.prototype.toString = function() {
  return "["+this.value+"|"+this.score+"]";
};


/**
 * @return {string}
 */
fullproof.ScoredElement.prototype.getValue = function () {
  return this.value;
};


/**
 * @return {number}
 */
fullproof.ScoredElement.prototype.getScore = function () {
  return this.score;
};

fullproof.ScoredElement.comparatorObject = {
  lower_than: function(a,b) {
    return a.value<b.value;
  },
  equals: function(a,b) {
    return a.value==b.value;
  }
};
fullproof.ScoredElement.prototype.comparatorObject = fullproof.ScoredElement.comparatorObject;


/**
 *
 * @param {fullproof.ScoredElement} a
 * @param {fullproof.ScoredElement} b
 * @returns {fullproof.ScoredElement}
 */
fullproof.ScoredElement.mergeFn = function(a,b) {
  return new fullproof.ScoredElement(a.value, a.score + b.score);
};



/**
 * Associates a key (typically a word), a value, and a score.
 * param {string} key
 * param {string} value
 * @param {number=} score
 * @constructor
 * @extends {fullproof.ScoredElement}
 */
fullproof.ScoredEntry = function (key, value, score) {
  goog.base(this, value, score);
  /**
   * @type {string}
   */
  this.key = key;
};
goog.inherits(fullproof.ScoredEntry, fullproof.ScoredElement);


/**
 * @return {string}
 */
fullproof.ScoredEntry.prototype.getKey = function() {
  return this.key;
};


/**
 * @inheritDoc
 */
fullproof.ScoredEntry.prototype.toString = function () {
  return "[" + this.key + "=" + this.value + "|" + this.score + "]";
};

