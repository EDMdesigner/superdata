var superData = require("../../src/superData");

//var proxyBehaviour = require("./proxyBehaviour");
//var memoryProxy = require("../../src/proxy/memory");
var memoryProxyCore = require("../../src/proxy/memoryCore");


describe("memory proxy", function() {

	var messages;
	var createMemoryProxy;

	beforeEach(function() {

		messages = {
			errorMessages: {
				NOT_FOUND: "not found error message"
			}
		};

		createMemoryProxy = memoryProxyCore({
			messages: messages
		});

	});

	describe("included in superData", function() {

		it("creator function should be defined", function() {
			expect(typeof superData.proxy.memory).toBe("function");
		});

	});

	describe("with missing dependencies", function() {

		it("should throw error if dependencies is missing", function() {
			expect(memoryProxyCore).toThrowError("dependencies is mandatory!");
		});

		it("should throw error if dependencies.messages is missing", function() {
			expect(function() {
				memoryProxyCore({});
			}).toThrowError("dependencies.messages is mandatory!");
		});

	});

	describe("with invalid config", function() {

		it("config empty", function() {
			expect(function() {
				createMemoryProxy();
			}).toThrowError("config.idProperty is mandatory!");
		});

		it("config with idType", function() {
			expect(function() {
				createMemoryProxy({
					idType: "number"
				});
			}).toThrowError("config.idProperty is mandatory!");
		});

		it("config with idProperty", function() {
			expect(function() {
				createMemoryProxy({
					idProperty: "id",
				});
			}).toThrowError("config.idType is mandatory!");
		});

	});

	describe("with valid config", function() {

		var memoryProxy;
		var callback;

		beforeEach(function() {
			memoryProxy = createMemoryProxy({
				idProperty: "id",
				idType: "string"
			});
			memoryProxy.createOne({
				id: "id1",
				prop: "some value"
			}, function() {});
			callback = jasmine.createSpy("callback");
		});

		it("should throw error if given callback is not a function", function() {

			expect(function() {
				memoryProxy.read({
					options: {},
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.createOne({
					data: {},
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.readOneById({
					id: "1",
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.updateOneById({
					id: "1",
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.destroyOneById({
					id: "1",
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

		});

		/* it("should throw error if it can't cast given id to number if given idType is number", function() {

			memoryProxy = createMemoryProxy({
				idProperty: "id",
				idType: "number"
			});

			expect(function() {
				memoryProxy.readOneById("notANumber", callback);
			}).toThrowError("Id notANumber could not be parsed as number");

		}); */

		describe("createOne", function() {

		});

	});

	/* var proxy = createMemoryProxy({
		idProperty: "id",
		idType: "number"
	});

	proxyBehaviour("memory", proxy); */
});



