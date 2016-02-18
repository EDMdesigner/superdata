/*jslint node: true */
"use strict";

var request = require("superagent");

var timeout = 10000;

var messages = require("../errorMessages");

var testConfig = {
	read: {
		route: "nagytetenyimaffia.com",
		method: "GET",
		queries: {
			token: "34oirfgdsnTOKENawern4o",
			user: "Lali"
		}
	},
	createOne: {
		route: "nagytetenyimaffia.com",
		method: "POST",
		queries: {
			token: "34oirfgdsnTOKENawern4o",
			user: "Lali"
		}
	},
	readOneById: {
		route: "nagytetenyimaffia.com/:id",
		method: "GET",
		queries: {
			token: "34oirfgdsnTOKENawern4o",
			user: "Lali"
		},
	},
	updateOneById: {
		route: "nagytetenyimaffia.com/:id",
		method: "PUT",
		queries: {
			token: "34oirfgdsnTOKENawern4o",
			user: "Lali"
		}
	},
	destroyOneById: {
		route: "nagytetenyimaffia.com/:id",
		method: "DELETE",
		queries: {
			token: "34oirfgdsnTOKENawern4o",
			user: "Lali"
		}
	},
};
module.exports = function createAjaxProxy(config) {
	config = config || {};

	var idProperty = config.idProperty || "id";
	var generateId = config.generateId || (function() {
		var nextId = 0;
		return function() {
			return nextId++;
		};
	}());

	checkConfig(config);

	function createOne(data, callback) {
		checkCallback(callback);
		var config = config.createOne;
		config.data = data;
		dispatchAjax(config, callback);
	}
	
	function read(options, callback) {
		checkCallback(callback);
		var config = config.read;

		if (options.find) {
			config.queries.find = JSON.stringify(options.find);
		}
		if (options.sort) {
			config.queries.sort = JSON.stringify(options.sort);
		}

		dispatchAjax(config, callback);
	}

	function readOneById(id, callback) {
		checkCallback(callback);
		var config = config.readOneById;
		config.route = config.route.replace(/:id/g, id);
		dispatchAjax(config, callback);
	}
	
	function updateOneById(id, newData, callback) {
		checkCallback(callback);
		var config = config.updateOneById;
		config.data = newData;
		config.route = config.route.replace(/:id/g, id);
		dispatchAjax(config, callback);
	}
	
	function destroyOneById(id, callback) {
		checkCallback(callback);
		var config = config.destroyOneById;
		config.route = config.route.replace(/:id/g, id);
		dispatchAjax(config, callback);
	}

	function dispatchAjax(config, callback) {
		request
			[config.method](config.route)
			.query(config.queries)
			.send(config.data)
			.type(config.type)
			.accept(config.accept)
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, result.body);
			});
	}

	function checkConfig(config) {
		for (var prop in Object.keys(config)) {
			assert(config[prop], prop + " should be configured");
			assert(config[prop].route, prop + " route should be configured");
			assert(config[prop].method, prop + " method should be configured");
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


		read: read,

		createOne: createOne,

		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	});
};