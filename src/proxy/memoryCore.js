/*
 * Memory proxy core
 */

/*jslint node: true */
"use strict";

module.exports = function(dependencies) {

	if(!dependencies) {
		throw new Error("dependencies is mandatory!");
	}

	if(!dependencies.messages) {
		throw new Error("dependencies.messages is mandatory!");
	}

	var messages = dependencies.messages;

	return function createMemoryProxy(config) {
		if (!config) {
			config = {};
		}

		if (!config.idProperty) {
			throw new Error("config.idProperty is mandatory!");
		}

		if (!config.idType) {
			throw new Error("config.idType is mandatory!");
		}

		var idProperty = config.idProperty;
		var idType = config.idType.toLowerCase();

		var generateId = config.generateId || (function() {
			var nextId = 0;
			function defaultGenerateId() {
				nextId += 1;
				if (findIndexById(nextId) === -1) {
					return nextId;
				}
				return defaultGenerateId();
			}
			return defaultGenerateId;
		}());

		var db = [];

		function findIndexById(originalId, filters) {
			var id = castId(idType, originalId);
			for (var idx = 0; idx < db.length; idx += 1) {
				var act = db[idx];
				if (act[idProperty] === id) {
					if(typeof filters === "object") {
						for (var filter in filters) {
							if(!act[filter]) {
								return -1;
							}
							if(act[filter] !== filters[filter]) {
								return -1;
							}
						}
					}
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
				case "string": {
					if (typeof castedId !== "string") {
						castedId = castedId.toString();
						if (typeof castedId !== "string") {
							throw new Error ("Id " + id + " could not be parsed as " + type);
						}
					}
					break;
				}
				case "number": {
					if (typeof castedId !== "number") {
						castedId = parseInt(castedId);
						if (isNaN(castedId)) {
							throw new Error ("Id " + id + " could not be parsed as " + type);
						}
					}
					break;
				}
				default: {
					return console.log("Unrecognized id type", type);
				}
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

		function accessProp(item, prop) {
			var propSplit = prop.split(".");

			for(var idx = 0; idx < propSplit.length; idx += 1) {
				if(typeof item[propSplit[idx]] !== "undefined") {
					item = item[propSplit[idx]];
				} else {
					return item;
				}
			}

			return item;
		}

		function stringToRegExp(str) {
			var stringSplit = str.split("/");
			if(stringSplit.length === 1) {
				return new RegExp(str, "i");
			}

			stringSplit.splice(0, 1);

			var regexpOptions = stringSplit.splice(stringSplit.length - 1, 1);
			var pattern = stringSplit.join("/");

			return new RegExp(pattern, regexpOptions);
		}

		function read(options, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);

			if (!options) {
				options = {};
			}

			var find = options.find;
			var sort = options.sort;

			var skip = options.skip;
			var limit = options.limit;

			var elements = db;

			if(typeof filters === "object") {
				elements = elements.filter(function(item) {
					for (var filter in filters) {
						if(!item[filter]) {
							return false;
						}
						if(item[filter] !== filters[filter]) {
							return false;
						}
					}
					return true;
				});
			}

			if (find && typeof find === "object") {
				elements = elements.filter(function(item) {
					function convertToRegExp(actItem) {
						return (typeof actItem === "string") ? stringToRegExp(actItem) : actItem;
					}

					function testRegExp(previous, current) {
						return previous && current.test(item);
					}

					for (var prop in find) {
						var act = find[prop];

						item = accessProp(item, prop);

						if (typeof act === "string") {
							act = stringToRegExp(act);
						}

						if (act instanceof RegExp) {
							if (!act.test(item)) {
								return false;
							}
						} else if (Array.isArray(act)) {
							var regExpArray = act.map(convertToRegExp);

							var result = regExpArray.reduce(testRegExp, true);

							return result;
						} else if (act !== item) {
							return false;
						}
					}
					return true;
				});
			}

			if (sort && typeof sort === "object") {
				elements = elements.sort(function(item1, item2) {
					for (var prop in sort) {

						var act1 = accessProp(item1, prop);
						var act2 = accessProp(item2, prop);

						var actRelation = sort[prop];

						if(actRelation === 1) {
							if (act1 < act2) {
								return -1;
							}
							if (act1 > act2) {
								return 1;
							}
						}
						if (act1 > act2) {
							return -1;
						}
						if (act1 < act2) {
							return 1;
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

		function createOne(data, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			
			checkCallback(callback);

			if (typeof data[idProperty] === "undefined") {
				data[idProperty] = generateId();
			}

			var dataIdx = findIndexById(data[idProperty]);

			if (dataIdx === -1) { //this way this is an upsert actually...
				db.push(data);
			} else {
				//db[dataIdx] = data;
				return callback(messages.errorMessages.DUPLICATE_KEY);
			}

			callback(null, data);
		}

		function readOneById(id, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);

			var dataIdx = findIndexById(id, filters);
			if (dataIdx === -1) {
				return callback(messages.errorMessages.NOT_FOUND);
			}
			callback(null, db[dataIdx]);
		}

		function updateOneById(id, newData, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);

			var dataIdx = findIndexById(id, filters);
			if (dataIdx === -1) {
				return callback(messages.errorMessages.NOT_FOUND);
			}

			newData[idProperty] = id;
			db[dataIdx] = newData;

			callback(null, newData);
		}

		function patchOneById(id, updateData, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);

			var dataIdx = findIndexById(id, filters);
			if (dataIdx === -1) {
				return callback(messages.errorMessages.NOT_FOUND);
			}

			for (var prop in updateData) {
				if (prop === idProperty) {
					continue;
				}

				if (updateData.hasOwnProperty(prop)) {
					db[dataIdx][prop] = updateData[prop];
				}
			}

			callback(null, db[dataIdx]);
		}

		function destroyOneById(id, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);

			var dataIdx = findIndexById(id, filters);
			if (dataIdx === -1) {
				return callback(messages.errorMessages.NOT_FOUND);
			}

			var data = db.splice(dataIdx, 1);

			callback(null, data[0]);
		}

		return Object.freeze({
			idProperty: idProperty,
			generateId: generateId,


			read: read,

			createOne: createOne,

			readOneById: readOneById,
			updateOneById: updateOneById,
			patchOneById: patchOneById,
			destroyOneById: destroyOneById
		});
	};
};
