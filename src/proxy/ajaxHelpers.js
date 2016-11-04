/*
 * AjaxHelper core
 */

/*jslint node: true */
"use strict";

var defaultTimeout = 3000;

module.exports = function(dependencies) {

	if (!dependencies.request) {
		throw new Error("dependencies.request is mandatory!");
	}

	if (!dependencies.createReader) {
		throw new Error("dependencies.createReader is mandatory!");
	}

	var request = dependencies.request;
	var createReader = dependencies.createReader;
	
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

		newConfig.id = id;

		return newConfig;
	}

	function dispatchAjax (actConfig, filters, callback) {
		if (typeof actConfig.route === "string") {
			actConfig.route = [actConfig.route];
		}
		if(!callback) {
			callback = filters;
			filters = undefined;
		}
		var timeout = actConfig.timeout || defaultTimeout;
		var idProperty = actConfig.idProperty;

		var actRouteIdx = 0;
		var actRoute = actConfig.route[actRouteIdx];

		function dispatch(retries) {

			if(filters) {
				for (var filter in filters) {
					var regex = new RegExp(":" + filter, "g");
					actRoute = actRoute.replace(regex, filters[filter]);
				}
			}
			var idRegex = /:id/g;

			if (idRegex.test(actRoute)) {
				actRoute = actRoute.replace(idRegex, actConfig.id);
			} else if (actConfig.id) {
				actConfig.data[idProperty] = actConfig.id;
			}

			try {
				var req = request
					[actConfig.method](actRoute)
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
							if (retries + 1 < actConfig.route.length) {
								actRouteIdx += 1;
								actRouteIdx %= actConfig.route.length;
								actRoute = actConfig.route[actRouteIdx];
								return dispatch(retries + 1);
							}
							return callback(err);
						}
						var body = actConfig.reader.read(result.body) || {};
						callback(body.err, body);
					});
			} catch (e) {
			}
		}
		dispatch(0);
	}

	//var defaultReader = createReader({});

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
			act.reader = createReader(act.reader);
		}
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

	return {
		createOperationConfig: createOperationConfig,
		dispatchAjax: dispatchAjax,
		prepareOperationsConfig: prepareOperationsConfig,
		assert: assert

	};
};