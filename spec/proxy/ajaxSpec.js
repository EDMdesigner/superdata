var formData = require("form-data");

var superData = require("../../src/superData");

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
			FormData: formData
		});
	
	});

	describe("included in superData", function() {

		it("creator function should be defined", function() {
			expect(typeof superData.proxy.ajax).toBe("function");
		});

	});

	describe("with missing dependecies", function() {

		it("should throw error if dependencies is missing", function() {
			expect(ajaxProxyCore).toThrowError("dependencies is mandatory!");
		});

		it("should throw error if dependencies.ajaxHelpers is missing", function() {
			expect(function() {
				ajaxProxyCore({
					FormData: formData
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
				operations: {},
				timeout: 4000
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
					expect(ajaxHelpers.createOperationConfig.calls.argsFor(0)[1]).toBe(4000);
					expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.dispatchAjax.calls.argsFor(0)[0]).toEqual({
						queries: {
							option1: "some value",
							option2: "other value",
							select: "undefined"
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
				expect(ajaxHelpers.createOperationConfig.calls.argsFor(0)[1]).toBe(4000);
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
					expect(ajaxHelpers.createOperationConfig.calls.argsFor(0)[1]).toBe(4000);
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
					expect(ajaxHelpers.createOperationConfig.calls.argsFor(0)[1]).toBe(4000);
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

		describe("patchOneById", function() {
			
			describe("without filters", function() {

				it("should call ajaxHelpers.assert, ajaxHelpers.createOperationConfig, ajaxHelpers.dispatchAjax and callback", function() {

					ajaxProxy.patchOneById(id, data, callback);

					expect(ajaxHelpers.assert).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.createOperationConfig).toHaveBeenCalledTimes(1);
					expect(ajaxHelpers.createOperationConfig.calls.argsFor(0)[1]).toBe(4000);
					expect(ajaxHelpers.dispatchAjax).toHaveBeenCalledTimes(1);
					expect(callback).toHaveBeenCalledTimes(1);

				});

			});

			describe("with filters", function() {

				it("should call ajaxHelpers.dispatchAjax with pass filters as parameter", function() {

					ajaxProxy.patchOneById(id, data, filters, callback);
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
					expect(ajaxHelpers.createOperationConfig.calls.argsFor(0)[1]).toBe(4000);
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

	});
});
