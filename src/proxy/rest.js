var request = require("superagent");

var timeout = 10000;

module.exports = function createRestProxy(config) {
	var idProperty = config.idProperty;
	var generateId = config.generateId;
	var route = config.route;

	function read(options, callback) {
		if (options.find) {
			options.find = JSON.stringify(options.find);
		}
		if (options.sort) {
			options.sort = JSON.stringify(options.sort);
		}
		if (options.skip) {
			options.skip = JSON.stringify(options.skip);
		}
		if (options.limit) {
			options.limit = JSON.stringify(options.limit);
		}
		request
			.get(route)
			.query(options)
			.type("application/json")
			.accept("application/json")
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, result.body);
			});
	}

	function createOne(data, callback) {
		request
			.post(route)
			.send(data)
			.type("application/json")
			.accept("application/json")
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, result.body);
			});
	}

	function readOneById(id, callback) {
		request
			.get(route + id)
			.type("application/json")
			.accept("application/json")
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, result.body);
			});
	}

	function updateOneById(id, newData, callback) {
		request
			.put(route + id)
			.send(newData)
			.type("application/json")
			.accept("application/json")
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, result.body);
			});
	}

	function destroyOneById(id, callback) {
		request
			.del(route + id)
			.type("application/json")
			.accept("application/json")
			.timeout(timeout)
			.end(function(err, result) {
				if (err) {
					return callback(err);
				}
				callback(null, result.body);
			});
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
