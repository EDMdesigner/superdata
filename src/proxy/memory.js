/*jslint node: true */
"use strict";

var messages = require("../errorMessages");

module.exports = function createMemoryProxy(config) {
	config = config || {};
	var idProperty = config.idField || "id";
	var idType = config.idType.toLowerCase() || "string";
	var generateId = config.generateId || (function() {
		var nextId = 0;
		return function() {
			return nextId++;
		};
	}());

	var db = [];

	function findIndexById(originalId) {
		var id = castId(config.idType, originalId);
		for (var idx = 0; idx < db.length; idx += 1) {
			var act = db[idx];
			if (act[idProperty] === id) {
				return idx;
			}
		}

		return -1;
	}

	function castId(type, id) {
		if (type === undefined || id === undefined) {
			return console.log("Missing cast parameters");
		}

		var castedId = id;
		switch(type) {
			case "string":
				if (typeof castedId !== "string") {
					castedId = castedId.toString();
					if (typeof castedId !== "string") {
						throw("Id " + id + " could not be parsed as " + type);
					}
				}
				break;
			case "number":
				if (typeof castedId !== "number") {
					castedId = parseInt(castedId);
					if (isNaN(castedId)) {
						throw("Id " + id + " could not be parsed as " + type);
					}
				}
				break;
			default:
				return console.log("Unrecognized id type", type);
		}
		return castedId;
	}

	function checkCallback(callback) {
		assert(typeof callback === "function", "callback should be a function");
	}

	function assert(condition, message) {
		if (!condition) {
			message = message || "Assertion failed";
			if (typeof Error !== "undefined") {
				throw new Error(message);
			}
			throw message; // Fallback
		}
	}

	function read(options, callback) {
		checkCallback(callback);

		if (!options) {
			options = {};
		}
		
		var find = options.find;
		var sort = options.sort;

		var skip = options.skip;
		var limit = options.limit;

		var elements = db;

		if (find && typeof find === "object") {
			elements = elements.filter(function(item) {
				for (var prop in find) {
					var act = find[prop];

					var regExp = new RegExp(act, "i");

					if (!regExp.test(item[prop])) {
						return false;
					}
				}
				return true;
			});
		}

		if (sort && typeof sort === "object") {
			elements = elements.sort(function(item1, item2) {
				for (var prop in sort) {
					var act1 = item1[prop];
					var act2 = item2[prop];

					var actRelation = sort[prop];

					if(actRelation === 1) {
						if (act1 < act2) {
							return -1;
						} else if (act1 > act2) {
							return 1;
						}
					} else {
						if (act1 > act2) {
							return -1;
						} else if (act1 < act2) {
							return 1;
						}
					}
				}
				return 0;
			});
		}

		if (typeof skip !== "number" || skip < 0) {
			skip = 0;
		}

		if (typeof limit !== "number" || limit < 0) {
			limit = db.length;
		}



		var response = {
			items: elements.slice(skip, skip + limit),
			count: elements.length
		};

		callback(null, response);
	}

	function createOne(data, callback) {
		checkCallback(callback);

		if (typeof data[idProperty] === "undefined") {
			data[idProperty] = generateId();
		}

		var dataIdx = findIndexById(data[idProperty]);

		if (dataIdx === -1) { //this way this is an upsert actually...
			db.push(data);
		} else {
			db[dataIdx] = data;
		}

		callback(null, data);
	}

	function readOneById(id, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById(id);
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}
		callback(null, db[dataIdx]);
	}

	function updateOneById(id, newData, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById(id);
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}

		newData[idProperty] = id;
		db[dataIdx] = newData;
		
		callback(null, newData);
	}

	function destroyOneById(id, callback) {
		var dataIdx = findIndexById(id);

		var data = db.splice(dataIdx, 1);

		callback(null, data);
	}

	return Object.freeze({
		idProperty: idProperty,
		generateId: generateId,


		read: read,

		createOne: createOne,

		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	});
};
