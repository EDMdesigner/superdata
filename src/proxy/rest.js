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
	//TODO checkConfig
	//checkqueries

	var route = config.route;

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
				route: route + "/:id",
				method: "GET",
				queries: readOneByIdQuery
			},
			updateOneById: {
				route: route + "/:id",
				method: "PUT",
				queries: updateOneByIdQuery
			},
			destroyOneById: {
				route: route + "/:id",
				method: "DELETE",
				queries: destroyOneByIdQuery
			}
		}
	});

	return restProxy;
};
