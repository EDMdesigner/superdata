var createAjaxProxy = require("./ajax");

module.exports = function createRestProxy(config) {

	if (!config) {
		throw new Error("config is mandatory");
	}

	if (!config.route) {
		throw new Error("config.route is mandatory");
	}

	if (!config.idProperty) {
		throw new Error("config.idProperty is mandatory!");
	}

	var queries = config.queries || {};

	var readQuery = queries.read || {};
	var createOneQuery = queries.createOne || {};
	var readOneByIdQuery = queries.readOneById || {};
	var updateOneByIdQuery = queries.updateOneById || {};
	var destroyOneByIdQuery = queries.destroyOneById || {};

	var route = config.route;

	function addId(route) {
		var routeWithId;

		if (typeof route === "string") {
			routeWithId = [route];
		} else {
			routeWithId = route.slice(0);
		}

		for (var i = 0; i < routeWithId.length; i += 1) {
			routeWithId[i] = routeWithId[i] + "/:id";
		}

		return routeWithId;
	}



	var restProxy = createAjaxProxy({
		idProperty: config.idProperty,
		idType: config.idType,
		timeout: config.timeout,
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
