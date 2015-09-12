/*
 * Copyright 2012 Rodrigo Reyes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('fullproof.normalizer');
goog.require('net.kornr.unicode');


//
// Normalizing functions take a word and return another word.
// If the word is cancelled by a function, it gets replaced
// by the boolean value false, otherwise it returns and/or
// sends forward the callback chain the new normalized form
// for the word (or the unchanged form, if the normalizer
// doesn't perform any transformation).
//


/**
 * Converts a word into a canonical Unicode decomposed and lowercased form.
 * @param {string} word a token to transform.
 * @return {string} the result of the callback function, or the converted word is there is no callback.
 */
fullproof.normalizer.to_lowercase_decomp = function(word) {
  return word ? net.kornr.unicode.lowercase.normalize(word) : word;
};


/**
 * Convertes a word to lowercase and remove all its diacritical marks.
 * @param {string} word a token to transform.
 * @return {string} the result of the callback function, or the converted word is there is no callback.
 */
fullproof.normalizer.to_lowercase_nomark = function(word) {
  return word ? net.kornr.unicode.lowercase_nomark.normalize(word) : word;
};

/**
 * Remove all the duplicate letters in a word. For instance TESSTT is converted to TEST, CHEESE is converted to CHESE.
 * @param word a token to transform.
 * @param callback a function called with the converted word (optional).
 * @return the result of the callback function, or the converted word is there is no callback.
 */
fullproof.normalizer.remove_duplicate_letters = function(word, callback) {
  var res = word ? '' : false;
  var last = false;
  if (word) {
    for (var i = 0, max = word.length; i < max; ++i) {
      if (last) {
        if (last != word[i]) {
          res += last;
        }
      }
      last = word[i];
    }
    res += last ? last : '';
  }
  return callback ? callback(res) : res;
};


/**
 *
 * @param {string} key
 * @param {Object} array
 * @return {string}
 * @deprecated
 */
fullproof.normalizer.filter_in_object = function(key, array) {
  if (array[key]) {
    return callback ? callback(false) : false;
  }
  return callback ? callback(key) : key;
};
