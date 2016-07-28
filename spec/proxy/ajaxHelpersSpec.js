
var createAjaxHelpers = require("../../src/proxy/ajaxHelpers");

describe("ajax helpers", function() {

	var request;
	var createReader;
	var ajaxHelpers;

	function createMockRequest(config) {
		var endError = config.endError || false;
		var obj = {
			get: get,
			put: put,
			post: post,
			del: del,
			query: query,
			accept: accept,
			timeout: timeout,
			type: type,
			send: send,
			end: end
		};
		function get() {
			return obj;
		}
		function put() {
			return obj;
		}
		function post() {
			return obj;
		}
		function del() {
			return obj;
		}
		function query() {
			return obj;
		}
		function accept() {
			return obj;
		}
		function timeout() {
			return obj;
		}
		function type() {
			return obj;
		}
		function send() {
			return obj;
		}
		function end(callback) {
			setTimeout(function() {
				if(endError) {
					callback("some error message", "");
				} else {
					callback("", {
						body: "body of result"
					});
				}
				
			}, 0);
			return obj;
		}

		spyOn(obj,"get").and.callThrough();
		spyOn(obj,"put").and.callThrough();
		spyOn(obj,"post").and.callThrough();
		spyOn(obj,"del").and.callThrough();
		spyOn(obj,"query").and.callThrough();
		spyOn(obj,"accept").and.callThrough();
		spyOn(obj,"timeout").and.callThrough();
		spyOn(obj,"type").and.callThrough();
		spyOn(obj,"send").and.callThrough();
		spyOn(obj,"end").and.callThrough();

		return obj;
	}

	beforeEach(function() {

		request = createMockRequest({
			endError: false
		});
		createReader = jasmine.createSpy("mockCreateReader");

		ajaxHelpers = createAjaxHelpers({
			request: request,
			createReader: createReader
		});

	});

	describe("with missing dependencies", function() {

		it("should throw error if dependencies.createReader is missing", function() {
			expect(function() {
				createAjaxHelpers({
					request: request
				});
			}).toThrowError("dependencies.createReader is mandatory!");
		});

		it("should throw error if dependencies.request is missing", function() {
			expect(function() {
				createAjaxHelpers({
					createReader: createReader
				});
			}).toThrowError("dependencies.request is mandatory!");
		});

	});

	describe("with valid config", function() {

		describe("createOperationConfig", function() {

			it("should return a common object with properties of id, data and every property of config", function() {

				var config = {
					prop1: "prop1",
					prop2: "prop2"
				};
				var data = "data";
				var id = "id";
				var operationConfig = ajaxHelpers.createOperationConfig(config, id, data);

				expect(operationConfig.prop1).toBe(config.prop1);
				expect(operationConfig.prop2).toBe(config.prop2);
				expect(operationConfig.data).toBe(data);
				expect(operationConfig.id).toBe(id);

			});

			it("should return a common object with properties of id, every property of config and a data property containing an empty object", function() {

				var config = {
					prop1: "prop1",
					prop2: "prop2"
				};
				var data;
				var id = "id";
				var operationConfig = ajaxHelpers.createOperationConfig(config, id, data);

				expect(operationConfig.prop1).toBe(config.prop1);
				expect(operationConfig.prop2).toBe(config.prop2);
				expect(operationConfig.data).toEqual({});
				expect(operationConfig.id).toBe(id);

			});

		});

		describe("dispatchAjax", function() {
			
			var actConfig;
			var callback;
			var manyRoutes;
			var read;

			beforeEach(function() {

				read = function() {
					return {
						err: ""
					};
				};
				actConfig = {
					route: "some route",
					timeout: 2000,
					idProperty: "id",
					method: "get",
					reader: {
						read: read
					}
				};
				spyOn(actConfig.reader, "read").and.callThrough();
				callback = jasmine.createSpy("callback");
				manyRoutes = [
					"some route 1",
					"some route 2",
					"some route 3"
				];

			});

			describe("without filters", function() {

				describe("with one route", function() {

					it("has to call mocked request functions", function(done) {

						ajaxHelpers.dispatchAjax(actConfig, callback);

						expect(request.get).toHaveBeenCalledTimes(1);
						expect(request.query).toHaveBeenCalledTimes(1);
						expect(request.accept).toHaveBeenCalledTimes(1);
						expect(request.timeout).toHaveBeenCalledTimes(1);
						expect(request.type).toHaveBeenCalledTimes(1);
						expect(request.send).toHaveBeenCalledTimes(1);
						expect(request.end).toHaveBeenCalledTimes(1);
						setTimeout(function() {
							expect(actConfig.reader.read).toHaveBeenCalledTimes(1);
							expect(callback).toHaveBeenCalledTimes(1);
							done();
						}, 100);
						
					});

				});

				describe("with several methods", function() {

					it("has to call request.post when actConfig.method is post and has to call callback function", function(done) {

						actConfig.method = "post";
						ajaxHelpers.dispatchAjax(actConfig, callback);

						expect(request.post).toHaveBeenCalledTimes(1);
						setTimeout(function() {
							expect(callback).toHaveBeenCalledTimes(1);
							done();
						}, 100);

					});


					it("has to call request.put when actConfig.method is put and has to call callback function", function(done) {

						actConfig.method = "put";
						ajaxHelpers.dispatchAjax(actConfig, callback);
						
						expect(request.put).toHaveBeenCalledTimes(1);
						setTimeout(function() {
							expect(callback).toHaveBeenCalledTimes(1);
							done();
						}, 100);

					});


					it("has to call request.del when actConfig.method is del and has to call callback function", function(done) {

						actConfig.method = "del";
						ajaxHelpers.dispatchAjax(actConfig, callback);
						
						expect(request.del).toHaveBeenCalledTimes(1);
						setTimeout(function() {
							expect(callback).toHaveBeenCalledTimes(1);
							done();
						}, 100);

					});

				});

				describe("with many routes", function() {

					it("has to call request's methods 3 times", function(done) {

						request = createMockRequest({
							endError: true
						});
						ajaxHelpers = createAjaxHelpers({
							request: request,
							createReader: createReader
						});
						actConfig.route = manyRoutes;
						ajaxHelpers.dispatchAjax(actConfig, callback);

						setTimeout(function() {
							expect(request.get).toHaveBeenCalledTimes(3);
							expect(request.query).toHaveBeenCalledTimes(3);
							expect(request.accept).toHaveBeenCalledTimes(3);
							expect(request.timeout).toHaveBeenCalledTimes(3);
							expect(request.type).toHaveBeenCalledTimes(3);
							expect(request.send).toHaveBeenCalledTimes(3);
							expect(request.end).toHaveBeenCalledTimes(3);
							expect(actConfig.reader.read).not.toHaveBeenCalled();
							expect(callback).toHaveBeenCalledTimes(1);
							expect(callback.calls.argsFor(0)[0]).toBe("some error message");
							done();
						}, 300);

					});

				});

			});
			
			describe("with filters", function() {

				it("has to replace filter values in actRoute", function() {

					var filters = {
						"projectID": "2",
						"userID": "7"
					};
					actConfig.route = "/some/path/to/request/projectID/:projectID/userID/:userID";
					ajaxHelpers.dispatchAjax(actConfig, filters, callback);
					expect(request.get.calls.argsFor(0)[0]).toBe("/some/path/to/request/projectID/2/userID/7");

				});
			});

		});

		describe("prepareOperationsConfig", function() {

			describe("with invalid config", function() {

				it("should throw an error when config parameter is not an object", function() {
					expect(function() {
						ajaxHelpers.prepareOperationsConfig();
					}).toThrowError("config.operations should be a config object");
					expect(function() {
						ajaxHelpers.prepareOperationsConfig("notAnObject");
					}).toThrowError("config.operations should be a config object");
				});

				it("should throw an error when one property's value of config is undefined", function() {
					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: undefined
						});
					}).toThrowError("prop should be configured");
					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: null
						});
					}).toThrowError("prop should be configured");
				});

				it("should throw an error when one of config's properties hasn't property route and method with given truthy value", function() {

					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: {
								notRouteProperty: "some value"
							}
						});
					}).toThrowError("prop route should be configured");

					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: {
								route: undefined
							}
						});
					}).toThrowError("prop route should be configured");

					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: {
								route: null
							}
						});
					}).toThrowError("prop route should be configured");

					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: {
								route: "some value",
								notMethodProperty: "some other value"
							}
						});
					}).toThrowError("prop method should be configured");

					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: {
								route: "some value",
								method: undefined
							}
						});
					}).toThrowError("prop method should be configured");

					expect(function() {
						ajaxHelpers.prepareOperationsConfig({
							prop: {
								route: "some value",
								method: null
							}
						});
					}).toThrowError("prop method should be configured");
				});

			});

			describe("with valid config", function() {

				it("should have properties 'queries', 'accept', 'type', 'reader' of each property of config object after calling function prepareOperationsConfig", function() {

					var config = {
						prop1: {
							route: "some route",
							method: "some method"
						},
						prop2: {
							route: "some other route",
							method: "some other method with CAPITAL LETTERS",
							queries: "some queries",
							accept: "some accept",
							type: "some type",
							reader: "some reader"
						},
						read: {
							route: "read route",
							method: "read method"
						}
					};
					ajaxHelpers.prepareOperationsConfig(config);

					expect(createReader).toHaveBeenCalled();
					expect(createReader).toHaveBeenCalledTimes(3);
					expect(typeof config.prop1.queries).toBe("object");
					expect(config.prop1.queries).toEqual({});
					expect(config.prop1.accept).toBe("application/json");
					expect(config.prop1.type).toBe("application/json");
					expect(config.prop1.hasOwnProperty("reader")).toBe(true);
					expect(config.prop2.queries).toBe("some queries");
					expect(config.prop2.accept).toBe("some accept");
					expect(config.prop2.type).toBe("some type");
					expect(config.prop2.reader).toBe(undefined);
					expect(typeof config.read.queries).toBe("object");
					expect(config.read.queries).toEqual({});
					expect(config.read.accept).toBe("application/json");
					expect(config.read.type).toBe("application/json");
					expect(config.read.hasOwnProperty("reader")).toBe(true);

				});

			});

		});

		describe("assert", function() {

			it("should throw error when condition is not given", function() {

				expect(function() {
					ajaxHelpers.assert();
				}).toThrowError("Assertion failed");

				expect(function() {
					ajaxHelpers.assert(undefined,"Some error message");
				}).toThrowError("Some error message");

				expect(function() {
					ajaxHelpers.assert(null,"Custom error message");
				}).toThrowError("Custom error message");

				expect(function() {
					ajaxHelpers.assert("","Empty string message");
				}).toThrowError("Empty string message");

				expect(function() {
					ajaxHelpers.assert(false,"Condition false message");
				}).toThrowError("Condition false message");

				expect(function() {
					ajaxHelpers.assert(true,"Condition true message");
				}).not.toThrowError("Condition true message");

			});

		});

	});

});