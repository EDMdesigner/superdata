var createAjaxProxy = require("./ajax");

module.exports = function createRestProxy(config) {

	if (!config) {
		throw new Error("config is mandatory");
	}

	if (!config.route) {
		throw new Error("config.route is mandatory");
	}

	var queries = config.queries || {};

	var readQuery = queries.read || {};
	var createOneQuery = queries.createOne || {};
	var readOneByIdQuery = queries.readOneById || {};
	var updateOneByIdQuery = queries.updateOneById || {};
	var destroyOneByIdQuery = queries.destroyOneById || {};

	var route = config.route;

	function addId(route) {
		var newRoute;

		if (typeof route === "string") {
			newRoute = [route];
		} else {
			newRoute = route.slice(0);
		}

		for (var i = 0; i < newRoute.length; i+=1) {
			newRoute[i] += "/:id";
		}

		return newRoute;
	}

	var restProxy = createAjaxProxy({
		idProperty: config.idProperty,
		operations: {
			read: {
				route: route,
				method: "GET",
				reader: config.reader,
				queries: readQuery
			},
			createOne: {
				route: route,
				method: "POST",
				queries: createOneQuery
			},
			readOneById: {
				route: addId(route),
				method: "GET",
				queries: readOneByIdQuery
			},
			updateOneById: {
				route: addId(route),
				method: "PUT",
				queries: updateOneByIdQuery
			},
			destroyOneById: {
				route: addId(route),
				method: "DELETE",
				queries: destroyOneByIdQuery
			}
		}
	});

	return restProxy;
};
