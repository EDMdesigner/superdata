/*jslint node: true */
"use strict";

var request = require("superagent");

var timeout = 10000;

var messages = require("../errorMessages");

module.exports = function createAjaxProxy(config) {
	config = config || {};
	var idProperty = config.idProperty;
	var generateId = config.generateId;

	checkConfig(config);

	function createOne(data, callback) {
		checkCallback(callback);
		var actConfig = config.createOne;
		actConfig.data = data;
		actConfig.method = actConfig.method.toLowerCase();
		dispatchAjax(actConfig, callback);
	}
	
	function read(options, callback) {
		checkCallback(callback);
		var actConfig = config.read;
		actConfig.method = actConfig.method.toLowerCase();

		if (options.find) {
			actConfig.queries.find = JSON.stringify(options.find);
		}
		if (options.sort) {
			actConfig.queries.sort = JSON.stringify(options.sort);
		}
		if (options.skip) {
			actConfig.queries.skip = JSON.stringify(options.skip);
		}
		if (options.limit) {
			actConfig.queries.limit = JSON.stringify(options.limit);
		}

		dispatchAjax(actConfig, callback);
	}

	function readOneById(id, callback) {
		checkCallback(callback);
		var actConfig = config.readOneById;
		actConfig.route = actConfig.route.replace(/:id/g, id);
		actConfig.method = actConfig.method.toLowerCase();
		dispatchAjax(actConfig, callback);
	}
	
	function updateOneById(id, newData, callback) {
		checkCallback(callback);
		var actConfig = config.updateOneById;
		actConfig.data = newData;
		actConfig.route = actConfig.route.replace(/:id/g, id);
		actConfig.method = actConfig.method.toLowerCase();
		dispatchAjax(actConfig, callback);
	}
	
	function destroyOneById(id, callback) {
		checkCallback(callback);
		var actConfig = config.destroyOneById;
		actConfig.route = actConfig.route.replace(/:id/g, id);
		actConfig.method = actConfig.method.toLowerCase();
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
				callback(null, result.body);
			});
	}

	function checkConfig(config) {
		for (var prop in config) {
			if (prop === "idProperty" || prop === "generateId") {
				continue;
			}
			assert(config[prop], prop + " should be configured");
			assert(config[prop].route, prop + " route should be configured");
			assert(config[prop].method, prop + " method should be configured");
			config[prop].queries = config[prop].queries || {};
			config[prop].type = config[prop].type || "application/json";
			config[prop].accept = config[prop].accept || "application/json";
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