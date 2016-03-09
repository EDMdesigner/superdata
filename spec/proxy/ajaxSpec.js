var superData = require("../../src/superData");

//var proxyBehaviour = require("./proxyBehaviour");
var ajaxProxy = require("../../src/proxy/ajax");


var express = require("express");
var bodyParser = require("body-parser");


function createMockServer(config) {
	var app = express();
	app.use(bodyParser.urlencoded({limit: "2mb", extended: true}));
	app.use(bodyParser.json({limit: "2mb"}));

	for (var prop in config.operations) {
		var act = config.operations[prop];

		var method = act.method.toLowerCase();

		app[method](act.route, act.callback);
	}

	app.listen(config.port, function() {
		config.serverStarted();
	});

	return {
		stop: function() {
			//app.close();
		}
	};
}


describe("ajax proxy", function() {
	it("creator function should be defined", function() {
		expect(typeof superData.proxy.ajax).toBe("function");
	});

	it("config empty", function() {
		expect(function() {
			ajaxProxy();
		}).toThrowError("config.idProperty is mandatory!");
	});

	it("config with idProperty", function() {
		expect(function() {
			ajaxProxy({
				idProperty: "id"
			});
		}).toThrowError("config.operations is mandatory!");
	});

	it("config with operations", function() {
		expect(function() {
			ajaxProxy({
				operations: {}
			});
		}).toThrowError("config.idProperty is mandatory!");
	});

	function queryMapping(options) {
		var queries = {
			settings: {}
		};

		if (options.find) {
			queries.settings.find = options.find;
		}
		if (options.sort) {
			queries.settings.sort = options.sort;
		}
		if (options.skip) {
			queries.settings.skip = options.skip;
		}
		if (options.limit) {
			queries.settings.limit = options.limit;
		}

		function RegExpreplacer(name, val) {
			if (val && val.constructor === RegExp) {
				return val.toString();
			}
			return val;
		}

		queries.settings = JSON.stringify(queries.settings, RegExpreplacer);

		return queries;
	}

	var proxy = ajaxProxy({
		idProperty: "id",
		operations: {
			read: {
				route: "http://localhost:7357/user",
				method: "GET"
			},
			createOne: {
				route: "http://localhost:7357/user",
				method: "POST"
			},
			readOneById: {
				route: "http://localhost:7357/user/:id",
				method: "GET"
			},
			updateOneById: {
				route: "http://localhost:7357/user/:id",
				method: "PUT"
			},
			destroyOneById: {
				route: "http://localhost:7357/user/:id",
				method: "DELETE"
			}
		},
		queryMapping: queryMapping
	});

	// it("read", function(done) {
	// 	var callbacks = {
	// 		read: function(req, res) {
	// 			res.send({
	// 				items: [],
	// 				count: 0
	// 			});
	// 		}
	// 	};

	// 	spyOn(callbacks, "read").and.callThrough();

	// 	var mockServer = createMockServer({
	// 		operations: {
	// 			read: {
	// 				route: "/user",
	// 				method: "GET",
	// 				callback: callbacks.read
	// 			}
	// 		},
	// 		serverStarted: function() {
	// 			proxy.read({}, function() {
	// 				expect(callbacks.read).toHaveBeenCalled();
	// 				mockServer.stop();
	// 				done();
	// 			});
	// 		},
	// 		port: 7357
	// 	});
	// });

	it("server calls & query mapping", function(done) {
		var options = {
			find: /test/gi, 
			limit: 10
		};

		var callbacks = {
			read: function(req, res) {
				expect(req.query).toEqual(queryMapping(options));
				res.send({});
			},
			createOne: function(req, res) {
				res.send({});
			},
			readOneById: function(req, res) {
				expect(req.params.id).toBe("1");
				res.send({});
			},
			updateOneById: function(req, res) {
				expect(req.params.id).toBe("1");
				res.send({});
			},
			destroyOneById: function(req, res) {
				expect(req.params.id).toBe("1");
				res.send({});
			}
		};


		spyOn(callbacks, "read").and.callThrough();
		spyOn(callbacks, "createOne").and.callThrough();
		spyOn(callbacks, "readOneById").and.callThrough();
		spyOn(callbacks, "updateOneById").and.callThrough();
		spyOn(callbacks, "destroyOneById").and.callThrough();

		createMockServer({
			operations: {
				read: {
					route: "/user",
					method: "GET",
					callback: callbacks.read
				},
				createOne: {
					route: "/user",
					method: "POST",
					callback: callbacks.createOne
				},
				readOneById: {
					route: "/user/:id",
					method: "GET",
					callback: callbacks.readOneById
				},
				updateOneById: {
					route: "/user/:id",
					method: "PUT",
					callback: callbacks.updateOneById
				},
				destroyOneById: {
					route: "/user/:id",
					method: "DELETE",
					callback: callbacks.destroyOneById
				}
			},
			serverStarted: function() {
				//All kneel and praise the pyramid of doom!
				proxy.read(options, function() {
					expect(callbacks.read).toHaveBeenCalled();
					proxy.createOne({}, function() {
						expect(callbacks.createOne).toHaveBeenCalled();
						proxy.readOneById(1, function() {
							expect(callbacks.readOneById).toHaveBeenCalled();
							proxy.updateOneById(1, {}, function() {
								expect(callbacks.updateOneById).toHaveBeenCalled();
								proxy.destroyOneById(1, function() {
									expect(callbacks.destroyOneById).toHaveBeenCalled();
									done();
								});
							});
						});
					});
				});
			},
			port: 7357
		});
	});
});
