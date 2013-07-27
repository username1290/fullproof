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


goog.require('fullproof.IndexUnit');
goog.provide('fullproof.AbstractEngine');



/**
 * @constructor
 */
fullproof.AbstractEngine = function(storeDescriptors) {
  this.storeManager = new fullproof.StoreManager(storeDescriptors);
  this.indexes = [];
  this.indexesByName = {};
};


/**
 * @param {fullproof.Capabilities} capabilities
 * @param analyzer
 * @return {boolean}
 */
fullproof.AbstractEngine.prototype.checkCapabilities = function(capabilities, analyzer) {
    return true;
};

/**
 * Adds an array of index units
 * @param indexes an array of fullproof.IndexUnit instances.
 * @param callback the function to call when all the indexes are added.
 * @private
 * @static
 */
fullproof.AbstractEngine.addIndexes = function(engine, indexes, callback) {
    var starter = false;
    while (indexes.length > 0) {
        var data = indexes.pop();
        starter = (function(next, data) {
            return function() {
                fullproof.AbstractEngine.addIndex(engine, data.name, data.analyzer, data.capabilities, data.initializer, next !== false ? next : callback);
            };
        })(starter, data);
    }
    if (starter !== false) {
        starter();
    }
    return this;
};

/**
 * Adds un index to the engine. It is not possible to add an index after the engine was opened.
 * @param name the name of the engine.
 * @param the analyzer used to parse the text.
 * @param capabilities a fullproof.Capabilities instance describing the requirements for the index.
 * @param initializer a function called when the index is created. This function can be used to populate the index.
 * @param completionCallback a function on completion, with true if the index was successfully added, false otherwise.
 * @return this instance.
 * @private
 * @static
 */
fullproof.AbstractEngine.addIndex = function(engine, name, analyzer, capabilities, initializer, completionCallback) {
	var self = engine;
	var indexData = new fullproof.IndexUnit(name, capabilities, analyzer);

	if (!engine.checkCapabilities(capabilities, analyzer)) {
		return completionCallback(false);
	}

	var indexRequest = new fullproof.IndexRequest(name, capabilities, function(index, callback) {
		var injector = new fullproof.TextInjector(index, indexData.analyzer);
		initializer(injector, callback);
	});

	if (engine.storeManager.addIndex(indexRequest)) {
		if (engine.indexes === undefined) {
            engine.indexes = [];
		}
        engine.indexes.push(indexData);
        engine.indexesByName[name] = indexData;
		if (completionCallback) {
			completionCallback(true);
		}
		return true;
	} else {
		if (completionCallback) {
			completionCallback(false);
		}
		return false;
	}
};

/**
 * Opens the engine: this function opens all the indexes at once, makes the initialization if needed,
 *  and makes this engine ready for use. Do not use any function of an engine, except addIndex, before
 *  having opened it.
 *  @param indexArray an array of index descriptors. Each descriptor is an object that defines the name, analyzer, capabilities, and initializer properties.
 *  @param callback function called when the engine is properly opened.
 *  @param errorCallback function called if for some reason the engine cannot open some index.
 */
fullproof.AbstractEngine.prototype.open = function(indexArray, callback, errorCallback) {
    var self = this;
    indexArray = (indexArray.constructor !== Array) ? [indexArray] : indexArray; // Makes it an Array if it's not
    fullproof.AbstractEngine.addIndexes(self, indexArray);

    this.storeManager.openIndexes(function(storesArray) {
        self.storeManager.forEach(function(name, index) {
            self.indexesByName[name].index = index;
        });
        callback(self);
    }, errorCallback);
    return this;
};

/**
 * Inject a text document into all the indexes managed by the engine.
 * @param text some text to be parsed and indexed.
 * @param value the primary value (number or string) associated to this object.
 * @param callback the function called when the text injection is done.
 */
fullproof.AbstractEngine.prototype.injectDocument = function(text, value, callback) {
	var synchro = fullproof.make_synchro_point(function(data) {
		callback();
	});

	this.forEach(function(name, index, parser) {
		if (name) {
			parser.parse(text, function(word) {
				if (word) {
					index.inject(word, value, synchro); // the line number is the value stored
				} else {
					synchro(false);
				}
			});
		}
	}, false);
	return this;
};

/**
 * Clears all the indexes managed by this engine. Do not call this function
 * before the engine was open()'ed.
 * @param callback a function called when all the indexes are cleared.
 */
fullproof.AbstractEngine.prototype.clear = function(callback) {
    'use strict';
    if (this.getIndexCount() === 0) {
        return callback();
    }
	var synchro = fullproof.make_synchro_point(callback, this.getIndexCount());
	this.forEach(function(name, index, parser) {
		if (name) {
			index.clear(synchro);
		} else {
			synchro(false);
		}
	});
};



/**
 * Returns an index by its name
 * @param name the index name.
 * @return a store index.
 */
fullproof.AbstractEngine.prototype.getIndex = function(name) {
    return this.indexesByName[name].index;
};

/**
 * Returns an array with all the fullproof.IndexUnit managed by the engine,
 * in the same order they were added. The returned array is a shallow copy than
 * can be modified.
 * @return an array, possibly empty, of fullproof.IndexUnit objects.
 */
fullproof.AbstractEngine.prototype.getIndexUnits = function() {
    return [].concat(this.indexes);
};

/**
 * Iterates over the indexes, in order, and calls the callback function with 3 parameters:
 * the name of the index, the index instance itself, and the analyzer associated to this index.
 * @param callback the callback function(name,index,analyzer) {}
 * @return this engine instance.
 */
fullproof.AbstractEngine.prototype.forEach = function(callback) {
    for (var i = 0, max = this.indexes.length; i < max; ++i) {
        callback(this.indexes[i].name, this.indexes[i].index, this.indexes[i].analyzer);
    }
    for (var i = 1; i < arguments.length; ++i) {
        callback(arguments[i]);
    }
    return this;
};

fullproof.AbstractEngine.prototype.getIndexCount = function() {
    return this.indexes.length;
};
