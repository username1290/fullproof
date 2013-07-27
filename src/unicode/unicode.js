
goog.provide('net.kornr.unicode');


/**
 * @const
 * @type {number}
 */
net.kornr.unicode.CONST_GO_LEFT = -1;


/**
 * @const
 * @type {number}
 */
net.kornr.unicode.CONST_GO_RIGHT = -2;


/**
 * Creates a normalizer function for the given data array. The function memorizes the
 * last codepoint converted, so that converting string containing characters from the
 * same codepage is efficient. On the other side, the algorithm is not adapted to
 * string mixing characters from different languages/codepages (another search function
 * should be written for this case)
 * @param {Array.<Array.<string|number>}} data
 * @constructor
 */
net.kornr.unicode.Normalizer = function(data) {

  this.data = data;

};


/**
 * // Test a codepoint integer value against an index in the data array.
 * // Returns:
 * - A positive integer or an array of integers if the codepoint matches
 * - CONST_GO_RIGHT if the index is too low
 * - CONST_GO_LEFT if the index is too high
 * @param {number} c
 * @param {number} index
 * @return {number}
 */
net.kornr.unicode.Normalizer.prototype.normalizer_element_match = function(c, index) {
  if (index < 0) {
    return net.kornr.unicode.CONST_GO_RIGHT;
  } else if (index >= this.data.length) {
    return net.kornr.unicode.CONST_GO_LEFT;
  }

  var t = this.data[index];
  if (!t) {
    return false;
  }
  if (t.length == 2) {
    if (t[0] == c) {
      return t[1];
    }
  } else {
    if (t[0] <= c && t[1] >= c) {
      if (t[2] == 'R') {
        return c + t[3];
      } else {
        return t[3];
      }
    }
  }
  return t[0] > c ? net.kornr.unicode.CONST_GO_LEFT :
      net.kornr.unicode.CONST_GO_RIGHT;
};


/**
 * @param {string} str
 * @return {string}
 */
net.kornr.unicode.Normalizer.prototype.normalize = function(str) {

  var normalize_char_last_index = 0;
  var me = this;
  /**
   * @protected
   * @param {number} c
   * @return {*}
   */
  var normalize_char = function(c) {
    var index = normalize_char_last_index;
    var r = me.normalizer_element_match(c, index);
    if (r < 0) {
      // Need to search more...
      var direction = r;
      var step = direction == net.kornr.unicode.CONST_GO_RIGHT ? +1 : -1;
      while (r === direction) {
        index += step;
        r = me.normalizer_element_match(c, index);
        if (!(r < 0)) { // a positive integer or an array
          normalize_char_last_index = index; // remember the last successful index for performance
          return r;
        }
      }
      normalize_char_last_index = index; // remember the last successful index for performance
      return c; // if not found, the codepoint is not in the array, so keep the same value
    } else {
      return r;
    }
  };

  var res = '';
  for (var i = 0, max = str.length; i < max; ++i) {
    var a = normalize_char(str.charCodeAt(i));
    if (a instanceof Array) {
      for (var j = 0; j < a.length; ++j) {
        res += String.fromCharCode(a[j]);
      }
    } else {
      res += String.fromCharCode(a);
    }
  }
  return res;
};


/**
 * Search iterator.
 * @param {Array.<Array.<string>|string} data
 * @constructor
 */
net.kornr.unicode.SearchIterator = function (data) {
  this.data = data;
  this.lastindex = 0;
};


/**
 * @param {string} c
 * @return {boolean}
 */
net.kornr.unicode.SearchIterator.prototype.next = function(c) {
  var index = this.lastindex;
  /**
   * @type {Array|string}
   */
  var r = this.data[index];
  var step = 1;
  var direction = 0;

  while (index >= 0 && index < this.data.length) {

    r = this.data[index];

    if (r instanceof Array) {
      if (c < r[0]) {
        step = -1;
      } else if (c > r[1]) {
        step = +1;
      } else {
        this.lastindex = index;
        return true;
      }
    } else {
      if (r == c) {
        this.lastindex = index;
        return true;
      }
      step = c < r ? -1 : +1;
    }

    if (direction == 0) {
      direction = step;
    } else if (direction != step) {
      return false;
    }
    index += step;

    if (index > this.data.length || index < 0) {
      return false;
    }
  }
  return false;
};


/**
 * @param {string|number} str
 * @return {boolean}
 */
net.kornr.unicode.is_letter_number = function(str) {
  var iter = new net.kornr.unicode.SearchIterator(categ_letters_numbers_data);

  if (goog.isNumber(str)) {
    return iter.next(str);
  } else {
    for (var i = 0, max = str.length; i < max; ++i) {
      var a = iter.next(str[i]);
      if (a === false) {
        return false;
      }
    }
    return true;
  }
};


/**
 * @type {net.kornr.unicode.Normalizer}
 */
net.kornr.unicode.lowercase = new net.kornr.unicode.Normalizer(norm_lowercase_data);


/**
 * @type {net.kornr.unicode.Normalizer}
 */
net.kornr.unicode.lowercase_nomark = new net.kornr.unicode.Normalizer(norm_lowercase_nomark_data);
