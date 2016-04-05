var express = require("express");
var bodyParser = require("body-parser");

var createCrudRouter = function createCRUDRouter(config) {
	config = config || {};

	if (!config.proxy) {
		throw new Error("config.proxy is mandatory");
	}

	var proxy = config.proxy;

	if (typeof proxy.read !== "function") {
		throw new Error("config.proxy.read must be a function");
	}

	if (typeof proxy.createOne !== "function") {
		throw new Error("config.proxy.createOne must be a function");
	}

	if (typeof proxy.readOneById !== "function") {
		throw new Error("config.proxy.readOneById must be a function");
	}

	if (typeof proxy.updateOneById !== "function") {
		throw new Error("config.proxy.updateOneById must be a function");
	}

	if (typeof proxy.destroyOneById !== "function") {
		throw new Error("config.proxy.destroyOneById must be a function");
	}


	var router = config.router || express.Router();

	function createResponseHandler(res) {
		return function handleResponse(err, result) {
			if (err) {
				return res.json({err: err});
			}

			res.json(result);
		};
	}

	function intify(value, defaultValue) {
		value = parseInt(value, 10);
		if (isNaN(value)) {
			value = defaultValue;
		}
		return value;
	}

	function objectify(value) {
		if (typeof value === "object") {
			return value;
		}

		try {
			return JSON.parse(value);
		} catch (e) {
			return {};
		}
	}

	router.get("/", function(req, res) {
		var query = {}; //TODO sophisticate this!

		if (req.query) {
			query = req.query;
		}

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		proxy.read(query, createResponseHandler(res));
	});

	router.post("/", function(req, res) {
		proxy.createOne(req.body, createResponseHandler(res));
	});

	router.get("/:id", function(req, res) {
		var id = req.params.id;
		proxy.readOneById(id, createResponseHandler(res));
	});

	router.put("/:id", function(req, res) {
		proxy.updateOneById(req.params.id, req.body, createResponseHandler(res));
	});

	router.delete("/:id", function(req, res) {
		proxy.destroyOneById(req.params.id, createResponseHandler(res));
	});

	return router;
};
// var createCrudRouter = require("superdata-server");
// var createCrudRouter = superdataServer.crudRouter;

var createRestProxy = require("../../src/proxy/rest");

describe("Rest proxy", function() {
	describe("Invalid config", function() {
		it("missing config", function() {
			expect(createRestProxy).toThrowError("config is mandatory");
		});

		it("missing config.route", function() {
			expect(function() {
				createRestProxy({});
			}).toThrowError("config.route is mandatory");
		});
	});

	describe("valid config", function() {

		var port = 7357;

		var restProxy = createRestProxy({
			idProperty: "id",
			route: "http://localhost:" + port + "/user",
			reader: {
				root: "items",
				count: "count"
			}
		});


		function createMockServer(config) {

			var app;

			app = express();
			app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
			app.use(bodyParser.json({limit: "2mb"}));

			var userRouter = express.Router();

			createCrudRouter({
				router: userRouter,
				proxy: config.mockProxy
			});

			app.use("/user", userRouter);

			var server = app.listen(config.port, function() {
				config.serverStarted();
			});

			return {
				stop: function(callback) {
					server.close(function() {
						callback();
					});
				}
			};

		}

		it("routes should be working", function(done) {
			var mockProxy = {
				read: function(query, callback) {
					// console.log("read");
					callback();
				},
				createOne: function(data, callback) {
					// console.log("createOne");
					callback();
				},
				readOneById: function(id, callback) {
					// console.log("readOneById");
					callback();
				},
				updateOneById: function(id, data, callback) {
					// console.log("updateOneById");
					callback();
				},
				destroyOneById: function(id, callback) {
					// console.log("destroyOneById");
					callback();
				}
			};

			spyOn(mockProxy, "read").and.callThrough();
			spyOn(mockProxy, "createOne").and.callThrough();
			spyOn(mockProxy, "readOneById").and.callThrough();
			spyOn(mockProxy, "updateOneById").and.callThrough();
			spyOn(mockProxy, "destroyOneById").and.callThrough();

			var mockServer = createMockServer({
				mockProxy: mockProxy,
				serverStarted: function() {
					//All kneel and praise the pyramid of doom!
					restProxy.read({}, function() {
						expect(mockProxy.read).toHaveBeenCalled();
						expect(mockProxy.createOne).not.toHaveBeenCalled();
						expect(mockProxy.readOneById).not.toHaveBeenCalled();
						expect(mockProxy.updateOneById).not.toHaveBeenCalled();
						expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
						restProxy.createOne({}, function() {
							expect(mockProxy.read).toHaveBeenCalled();
							expect(mockProxy.createOne).toHaveBeenCalled();
							expect(mockProxy.readOneById).not.toHaveBeenCalled();
							expect(mockProxy.updateOneById).not.toHaveBeenCalled();
							expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
							restProxy.readOneById("1", function() {
								expect(mockProxy.read).toHaveBeenCalled();
								expect(mockProxy.createOne).toHaveBeenCalled();
								expect(mockProxy.readOneById).toHaveBeenCalled();
								expect(mockProxy.updateOneById).not.toHaveBeenCalled();
								expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
								restProxy.updateOneById("1", {}, function() {
									expect(mockProxy.read).toHaveBeenCalled();
									expect(mockProxy.createOne).toHaveBeenCalled();
									expect(mockProxy.readOneById).toHaveBeenCalled();
									expect(mockProxy.updateOneById).toHaveBeenCalled();
									expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
									restProxy.destroyOneById("1", function() {
										expect(mockProxy.read).toHaveBeenCalled();
										expect(mockProxy.createOne).toHaveBeenCalled();
										expect(mockProxy.readOneById).toHaveBeenCalled();
										expect(mockProxy.updateOneById).toHaveBeenCalled();
										expect(mockProxy.destroyOneById).toHaveBeenCalled();

										mockServer.stop(function() {
											done();
										});
									});
								});
							});
						});
					});
				},
				port: port
			});
		});
	});
});
