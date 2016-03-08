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

	it("queryMapping", function(done) {
		var options = {
			find: /tit/gi, 
			limit: 10
		};

		var callbacks = {
			read: function(req, res) {
				console.log(req.query);
				expect(req.query).toEqual(queryMapping(options));
				res.send({});
			}
		};


		// spyOn(callbacks, "read").and.callThrough();

		var mockServer = createMockServer({
			operations: {
				read: {
					route: "/user",
					method: "GET",
					callback: callbacks.read
				}
			},
			serverStarted: function() {
				proxy.read(options, function() {
					// mockServer.stop();
					done();
				});
			},
			port: 7357
		});
	});
});
