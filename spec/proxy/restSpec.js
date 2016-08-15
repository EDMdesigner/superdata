var superData = require("../../src/superData");
var restProxyCore = require("../../src/proxy/restCore");

describe("Rest proxy", function() {
	
	var createRestProxy;
	var mockedAjaxProxy;

	beforeEach(function() {

		function createMockedAjaxProxy() {
			var obj = {
				read: read,
				createOne: createOne,
				readOneById: readOneById,
				updateOneById: updateOneById,
				destroyOneById: destroyOneById
			};

			function read() {

			}
			function createOne() {
				
			}
			function readOneById() {
				
			}
			function updateOneById() {
				
			}
			function destroyOneById() {
				
			}

			spyOn(obj,"read");
			spyOn(obj,"createOne");
			spyOn(obj,"readOneById");
			spyOn(obj,"updateOneById");
			spyOn(obj,"destroyOneById");

			mockedAjaxProxy = obj;

			return obj;
		}

		createRestProxy = restProxyCore({
			createAjaxProxy: createMockedAjaxProxy
		});

	});

	describe("included in superData", function() {

		it("creator function should be defined", function() {
			expect(typeof superData.proxy.rest).toBe("function");
		});

	});

	describe("with missing dependencies", function() {

		it("should throw error if dependencies is missing", function() {
			expect(restProxyCore).toThrowError("dependencies is mandatory!");
		});

		it("should throw error if dependencies.createAjaxProxy is missing", function() {
			expect(function() {
				restProxyCore({});
			}).toThrowError("dependencies.createAjaxProxy is mandatory!");
		});

	});

	describe("with invalid config", function() {

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

	describe("with valid config", function() {

		var restProxy;

		beforeEach(function() {
			restProxy = createRestProxy({
				route: "some route"
			});
		});

		it("has to call createAjaxProxy with corresponding parameters", function() {
			var spiedCreateAjaxProxy = jasmine.createSpy("mockedAjaxProxy");
			var createRestProxy = restProxyCore({
				createAjaxProxy: spiedCreateAjaxProxy
			});
			restProxy = createRestProxy({
				route: "some route"
			});
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.read.route).toBe("some route");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.read.method).toBe("GET");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.read.queries).toEqual({});
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.createOne.route).toBe("some route");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.createOne.method).toBe("POST");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.createOne.queries).toEqual({});
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.readOneById.route).toEqual(["some route/:id"]);
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.readOneById.method).toBe("GET");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.readOneById.queries).toEqual({});
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.updateOneById.route).toEqual(["some route/:id"]);
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.updateOneById.method).toBe("PUT");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.updateOneById.queries).toEqual({});
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.destroyOneById.route).toEqual(["some route/:id"]);
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.destroyOneById.method).toBe("DELETE");
			expect(spiedCreateAjaxProxy.calls.argsFor(0)[0].operations.destroyOneById.queries).toEqual({});
			
		});

		it("has to call mockedAjaxProxy's read function when calling read", function() {
			
			restProxy.read();
			expect(mockedAjaxProxy.read).toHaveBeenCalledTimes(1);
			expect(mockedAjaxProxy.createOne).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.readOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.updateOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.destroyOneById).not.toHaveBeenCalled();

		});

		it("has to call mockedAjaxProxy's createOne function when calling createOne", function() {
			
			restProxy.createOne();
			expect(mockedAjaxProxy.read).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.createOne).toHaveBeenCalledTimes(1);
			expect(mockedAjaxProxy.readOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.updateOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.destroyOneById).not.toHaveBeenCalled();

		});

		it("has to call mockedAjaxProxy's readOneById function when calling read", function() {
			
			restProxy.readOneById();
			expect(mockedAjaxProxy.read).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.createOne).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.readOneById).toHaveBeenCalledTimes(1);
			expect(mockedAjaxProxy.updateOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.destroyOneById).not.toHaveBeenCalled();

		});

		it("has to call mockedAjaxProxy's updateOneById function when calling read", function() {
			
			restProxy.updateOneById();
			expect(mockedAjaxProxy.read).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.createOne).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.readOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.updateOneById).toHaveBeenCalledTimes(1);
			expect(mockedAjaxProxy.destroyOneById).not.toHaveBeenCalled();

		});

		it("has to call mockedAjaxProxy's destroyOneById function when calling read", function() {
			
			restProxy.destroyOneById();
			expect(mockedAjaxProxy.read).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.createOne).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.readOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.updateOneById).not.toHaveBeenCalled();
			expect(mockedAjaxProxy.destroyOneById).toHaveBeenCalledTimes(1);

		});

	});
});
