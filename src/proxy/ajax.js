/*jslint node: true */
"use strict";

var request = require("superagent");

var timeout = 10000;

var createReader = require("../reader/json");

// var isNode = new Function("try {return this===global;}catch(e){return false;}");
var environment;

try {
	environment = window ? window : global;
} catch (e) {
	environment = global;
}

if (!environment.FormData) {
	global.FormData = require("form-data");
}

module.exports = function createAjaxProxy(config) {
	if (!config) {
		config = {};
	}

	if (!config.idProperty) {
		throw new Error("config.idProperty is mandatory!");
	}

	if (!config.operations) {
		throw new Error("config.operations is mandatory!");
	}

	var idProperty = config.idProperty;

	var generateId = config.generateId || (function() {
		var nextId = 0;

		return function() {
			return nextId += 1;
		};
	}());

	var defaultReader = createReader({});
	var queryMapping = config.queryMapping;

	prepareOperationsConfig(config.operations);

	function createOne(data, callback) {
		checkCallback(callback);
		var actConfig = createOperationConfig(config.operations.createOne, null, data);


		if (data.constructor === FormData) {
			actConfig.formData = true;
		}


		dispatchAjax(actConfig, callback);
	}

	function read(options, callback) {
		checkCallback(callback);
		if (typeof queryMapping === "function") {
			options = queryMapping(options);
		}
		var actConfig = createOperationConfig(config.operations.read);

		for (var prop in options) {
			actConfig.queries[prop] = options[prop];
		}
		actConfig.method = actConfig.method.toLowerCase();
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
		var req = request
			[actConfig.method](actConfig.route)
			.query(actConfig.queries)
			.accept(actConfig.accept)
			.timeout(timeout);

		if (actConfig.formData !== true) {
			req.type(actConfig.type);
		}
		req
			.send(actConfig.data)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, actConfig.reader.read(result.body));
			});
	}

	function prepareOperationsConfig(config) {
		assert(typeof config === "object", "config.operations should be a config object");
		for (var prop in config) {
			var act = config[prop];
			assert(act, prop + " should be configured");
			assert(act.route, prop + " route should be configured");
			assert(act.method, prop + " method should be configured");
			act.method = act.method.toLowerCase();
			act.queries = act.queries || {};
			act.accept = act.accept || "application/json";
			act.type = act.type || "application/json";
			act.reader = act.reader ? act.reader : {};
			if (prop === "read") {
				act.reader.out = "items";
			}
			act.reader = act.reader !== {} ? createReader(act.reader) : defaultReader;
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
