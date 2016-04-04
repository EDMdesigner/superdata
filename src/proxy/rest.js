var createAjaxProxy = require("./ajax");

module.exports = function createRestProxy(config) {

	if (!config) {
		throw new Error("config is mandatory");
	}

	if (!config.route) {
		throw new Error("config.route is mandatory");
	}

	var route = config.route;

	var restProxy = createAjaxProxy({
		idProperty: config.idProperty,
		operations: {
			read: {
				route: route,
				method: "GET",
				reader: config.reader,
				queries: config.queries
			},
			createOne: {
				route: route,
				method: "POST",
				queries: config.queries
			},
			readOneById: {
				route: route + "/:id",
				method: "GET",
				queries: config.queries
			},
			updateOneById: {
				route: route + "/:id",
				method: "PUT",
				queries: config.queries
			},
			destroyOneById: {
				route: route + "/:id",
				method: "DELETE",
				queries: config.queries
			}
		}
	});

	return restProxy;
};
