/*jslint node: true */
"use strict";

var request = require("superagent");

var timeout = 10000;

//var messages = require("../errorMessages");

module.exports = function createAjaxProxy(config) {
	config = config || {};
	var idProperty = config.idProperty;
	var generateId = config.generateId;

	checkOperationsConfig(config.operations);

	function createOne(data, callback) {
		checkCallback(callback);
		var actConfig = createOperationConfig(config.operations.createOne, null, data);

		dispatchAjax(actConfig, callback);
	}

	function read(options, callback) {
		checkCallback(callback);
		var actConfig = createOperationConfig(config.operations.read);

		actConfig.method = actConfig.method.toLowerCase();

		var settings = {};

		if (options.find) {
			settings.find = options.find;
		}
		if (options.sort) {
			settings.sort = options.sort;
		}
		if (options.skip) {
			settings.skip = options.skip;
		}
		if (options.limit) {
			settings.limit = options.limit;
		}
		// delete settings.find; //TODO
		function RegExpreplacer(name, val) {
			if ( val && val.constructor === RegExp ) {
				return val.toString();
			}

			return val;

		}
		actConfig.queries.settings = JSON.stringify(settings, RegExpreplacer);

		dispatchAjax(actConfig, callback);
	}

	function createOperationConfig(config, id, data) {
		var newConfig = {};

		for (var prop in config) {
			newConfig[prop] = config[prop];
		}

		if (data) {
			newConfig.data = data;
		} else {
			newConfig.data = {};
		}

		var idRegex = /:id/g;
		if (idRegex.test(newConfig.route)) {
			newConfig.route = newConfig.route.replace(idRegex, id);
		} else if (id) {
			newConfig.data[idProperty] = id;
		}

		return newConfig;
	}

	function readOneById(id, callback) {
		checkCallback(callback);
		var actConfig = createOperationConfig(config.operations.readOneById, id);
		dispatchAjax(actConfig, callback);
	}

	function updateOneById(id, newData, callback) {
		checkCallback(callback);
		var actConfig = createOperationConfig(config.operations.updateOneById, id, newData);
		dispatchAjax(actConfig, callback);
	}

	function destroyOneById(id, callback) {
		checkCallback(callback);
		var actConfig = createOperationConfig(config.operations.destroyOneById, id);
		dispatchAjax(actConfig, callback);
	}

	function dispatchAjax(actConfig, callback) {
		request
			[actConfig.method](actConfig.route)
			.query(actConfig.queries)
			.send(actConfig.data)
			.type(actConfig.type)
			.accept(actConfig.accept)
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				if (result.body.totalCount !== undefined) {
					result.body.count = result.body.totalCount;
				}
				if (result.body.result !== undefined) {
					result.body.items = result.body.result;
				}
				callback(null, result.body);
			});
	}

	function checkOperationsConfig(config) {
		assert(typeof config === "object", "config.operations should be a config object");
		for (var prop in config) {
			var act = config[prop];
			assert(act, prop + " should be configured");
			assert(act.route, prop + " route should be configured");
			assert(act.method, prop + " method should be configured");
			act.method = act.method.toLowerCase();
			act.queries = act.queries || {};
			act.type = act.type || "application/json";
			act.accept = act.accept || "application/json";
		}
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

	return Object.freeze({
		idProperty: idProperty,
		generateId: generateId,
		config: config,

		read: read,

		createOne: createOne,

		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	});
};
