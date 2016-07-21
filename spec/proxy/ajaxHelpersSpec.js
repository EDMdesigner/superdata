
var createAjaxHelpers = require("../../src/proxy/ajaxHelpers");

describe("ajax helpers", function() {
	var request;
	var createReader;
	var ajaxHelpers;

	beforeEach(function() {
		function createMockRequest() {
			var obj = {
				get: get,
				put: put,
				post: post,
				del: del,
				query: query,
				accept: accept,
				timeout: timeout
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

			spyOn(obj,"get");
			spyOn(obj,"put");
			spyOn(obj,"post");
			spyOn(obj,"del");
			spyOn(obj,"query");
			spyOn(obj,"accept");
			spyOn(obj,"timeout");

			return obj;
		}

		function mockCreateReader() {
			//return "";
		}

		request = createMockRequest();
		createReader = mockCreateReader;

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

		});

		describe("prepareOperationsConfig", function() {

		});

		describe("assert", function() {

		});

	});
});