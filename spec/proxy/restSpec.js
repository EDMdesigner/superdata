var express = require("express");
var bodyParser = require("body-parser");
var superData = require("../../src/superData");
var createRestProxy = superData.proxy.rest;


var async = require("async");






function createMockServer(config) {
	var app = express();
	app.use(bodyParser.urlencoded({limit: "2mb", extended: true}));
	app.use(bodyParser.json({limit: "2mb"}));

	for (var prop in config.operations) {
		var act = config.operations[prop];

		var method = act.method.toLowerCase();

		app[method](act.route, act.callback);
	}

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

		it("config.route must be string or array", function() {
			expect(function() {
				createRestProxy({
					route: 1
				});
			}).toThrowError("config.route must be either string or array");
		});
	});

	describe("valid config", function() {

		var port = 7357;

		var proxy = createRestProxy({
			idProperty: "id",
			route: ["Failover", "http://localhost:" + port + "/user"],
			reader: {
				root: "items",
				count: "count"
			}
		});


		it("routes should be working", function(done) {
			var options = {
				find: /test/gi,
				limit: 10
			};

			var callbacks = {
				read: function(req, res) {
					// expect(req.query).toEqual(options);
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

			var mockServer = createMockServer({
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
					var formData = new FormData();

					formData.append("title", "text");


					async.series([
						function(callback) {
							proxy.read(options, function() {
								expect(callbacks.read).toHaveBeenCalled();
								callback(null);
							});
						},
						function(callback) {
							proxy.createOne({}, function() {
								expect(callbacks.createOne).toHaveBeenCalled();
								callback(null);
							});
						},
						function(callback) {
							proxy.readOneById(1, function() {
								expect(callbacks.readOneById).toHaveBeenCalled();
								callback(null);
							});
						},
						function(callback) {
							proxy.updateOneById(1, {}, function() {
								expect(callbacks.updateOneById).toHaveBeenCalled();
								callback(null);
							});
						},
						function(callback) {
							proxy.destroyOneById(1, function() {
								expect(callbacks.destroyOneById).toHaveBeenCalled();
								callback(null);
							});
						}],
					function() {
						mockServer.stop(function() {
							done();
						});
					});
				},
				port: 7357
			});
		});
	});
});
