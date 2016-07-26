var FormData = require("form-data");

var superData = require("../../src/superData");

//var async = require("async");

//var request = require("superagent");

//var createReader = require("../../src/reader/json");

//var proxyBehaviour = require("./proxyBehaviour");
//var ajaxProxy = require("../../src/proxy/ajax");


//var express = require("express");
//var bodyParser = require("body-parser");

var ajaxProxyCore = require("../../src/proxy/ajaxCore");


describe("ajax proxy", function() {

	var ajaxHelpers;
	var createAjaxProxy;

	beforeEach(function() {
		
		function createMockAjaxHelpers() {
			var obj = {
				createOperationConfig: createOperationConfig,
				dispatchAjax: dispatchAjax,
				prepareOperationsConfig: prepareOperationsConfig,
				assert: assert	
			};

			function createOperationConfig() {
				return {
					queries: {},
					method: "GET"
				};
			}
			function dispatchAjax(actConfig, filters, callback) {
				if(!callback) {
					callback = filters;
					filters = undefined;
				}
				if(typeof callback === "function") {
					callback();
				}
			}
			function prepareOperationsConfig() {

			}
			function assert() {

			}

			spyOn(obj,"createOperationConfig").and.callThrough();
			spyOn(obj,"dispatchAjax").and.callThrough();
			spyOn(obj,"prepareOperationsConfig");
			spyOn(obj,"assert");

			return obj;
		}

		ajaxHelpers = createMockAjaxHelpers();

		createAjaxProxy = ajaxProxyCore({
			ajaxHelpers: ajaxHelpers,
			FormData: FormData
		});
	
	});

	describe("included in superData", function() {

		it("creator function should be defined", function() {
			expect(typeof superData.proxy.ajax).toBe("function");
		});

	});

	describe("with missing dependecies", function() {

		it("should throw error if dependencies.ajaxHelpers is missing", function() {
			expect(function() {
				ajaxProxyCore({
					FormData: FormData
				});
			}).toThrowError("dependencies.ajaxHelpers is mandatory!");
		});

		it("should throw error if dependencies.FormData is missing", function() {
			expect(function() {
				ajaxProxyCore({
					ajaxHelpers: ajaxHelpers
				});
			}).toThrowError("dependencies.FormData is mandatory!");
		});
		
	});

	describe("with invalid config", function() {

		it("should throw error if config empty", function() {
			expect(function() {
				createAjaxProxy();
			}).toThrowError("config.idProperty is mandatory!");
		});

		it("should throw an error if config.idProperty is missing", function() {
			expect(function() {
				createAjaxProxy({
					operations: {}
				});
			}).toThrowError("config.idProperty is mandatory!");
		});

		it("should throw error if config.operations is missing", function() {
			expect(function() {
				createAjaxProxy({
					idProperty: "id"
				});
			}).toThrowError("config.operations is mandatory!");
		});

		it("should throw error if config.fieldsToBeExcluded is given but it's not an array", function() {
			expect(function() {
				createAjaxProxy({
					idProperty: "id",
					operations: {},
					fieldsToBeExcluded: "notAnArray"
				});
			}).toThrowError("config.fieldsToBeExcluded should be an array!");
		});

	});
	
	describe("with valid config", function() {

		var ajaxProxy;
		var data;
		var callback;
		var id;
		var filters;
		var options;

		beforeEach(function() {

			var config = {
				idProperty: "id",
				operations: {}
			};
			ajaxProxy = createAjaxProxy(config);
			data = {

			};
			callback = jasmine.createSpy("callback");
			id = 7;
			filters = {
				projectID: 2,
				userID: 7
			};
			options = {
				option1: "some value",
				option2: "other value"
			};

		});

		describe("read", function() {

			describe("without filters", function() {

				it("should call ajaxHelpers.assert, ajaxHelpers.createOperationConfig, ajaxHelpers.dispatchAjax (with expectations to actConfig parameter) and callback", function() {

					ajaxProxy.read(options, callback);

					expect(ajaxHelpers.assert).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.createOperationConfig).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.dispatchAjax.calls.argsFor(0)[0]).toEqual({
						queries: {
							option1: "some value",
							option2: "other value"
						},
						method: "get"
					});
					expect(callback).toHaveBeenCalledTimes(1);

				});

			});

			describe("with filters", function() {

				it("should call ajaxHelpers.dispatchAjax with pass filters as parameter", function() {

					ajaxProxy.read(options, filters, callback);
					expect(ajaxHelpers.dispatchAjax.calls.argsFor(0)[1]).toBe(filters);
					
				});

			});

		});

		describe("createOne", function() {

			it("should call ajaxHelpers.assert, ajaxHelpers.createOperationConfig, ajaxHelpers.dispatchAjax and callback", function() {

				ajaxProxy.createOne(data, callback);

				expect(ajaxHelpers.assert).toHaveBeenCalledTimes(1);
				expect(ajaxHelpers.createOperationConfig).toHaveBeenCalledTimes(1);
				expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
				expect(callback).toHaveBeenCalledTimes(1);

			});

		});

		describe("readOneById", function() {
			
			describe("without filters", function() {

				it("should call ajaxHelpers.assert, ajaxHelpers.createOperationConfig, ajaxHelpers.dispatchAjax and callback", function() {

					ajaxProxy.readOneById(id, callback);

					expect(ajaxHelpers.assert).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.createOperationConfig).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
					expect(callback).toHaveBeenCalledTimes(1);

				});

			});

			describe("with filters", function() {

				it("should call ajaxHelpers.dispatchAjax with pass filters as parameter", function() {

					ajaxProxy.readOneById(id, filters, callback);
					expect(ajaxHelpers.dispatchAjax.calls.argsFor(0)[1]).toBe(filters);

				});

			});

		});

		describe("updateOneById", function() {
			
			describe("without filters", function() {

				it("should call ajaxHelpers.assert, ajaxHelpers.createOperationConfig, ajaxHelpers.dispatchAjax and callback", function() {

					ajaxProxy.updateOneById(id, data, callback);

					expect(ajaxHelpers.assert).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.createOperationConfig).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
					expect(callback).toHaveBeenCalledTimes(1);

				});

			});

			describe("with filters", function() {

				it("should call ajaxHelpers.dispatchAjax with pass filters as parameter", function() {

					ajaxProxy.updateOneById(id, data, filters, callback);
					expect(ajaxHelpers.dispatchAjax.calls.argsFor(0)[1]).toBe(filters);
					
				});

			});

		});

		describe("destroyOneById", function() {
			
			describe("without filters", function() {

				it("should call ajaxHelpers.assert, ajaxHelpers.createOperationConfig, ajaxHelpers.dispatchAjax and callback", function() {

					ajaxProxy.destroyOneById(id, callback);

					expect(ajaxHelpers.assert).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.createOperationConfig).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
					expect(callback).toHaveBeenCalledTimes(1);

				});

			});

			describe("with filters", function() {

				it("should call ajaxHelpers.dispatchAjax with pass filters as parameter", function() {

					ajaxProxy.destroyOneById(id, filters, callback);
					expect(ajaxHelpers.dispatchAjax.calls.argsFor(0)[1]).toBe(filters);
					
				});

			});

		});

		/* var proxy;
		beforeEach(function () {
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

			proxy = ajaxProxy({
				idProperty: "id",
				timeout: 3000,
				operations: {
					read: {
						route: ["FailOverHost", "http://localhost:7357/user"],
						method: "GET"
					},
					createOne: {
						route: ["FailOverHost", "http://localhost:7357/user"],
						method: "POST"
					},
					readOneById: {
						route: ["FailOverHost", "http://localhost:7357/user/:id"],
						method: "GET"
					},
					updateOneById: {
						route: ["FailOverHost", "http://localhost:7357/user/:id"],
						method: "PUT"
					},
					destroyOneById: {
						route: ["FailOverHost", "http://localhost:7357/user/:id"],
						method: "DELETE"
					}
				},
				queryMapping: queryMapping
			});
		}); */

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

		/* it("server calls & query mapping", function(done) {
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
		}); */
	});
});
