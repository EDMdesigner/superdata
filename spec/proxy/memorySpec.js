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

	/* var proxy = createMemoryProxy({
		idProperty: "id",
		idType: "number"
	});

	proxyBehaviour("memory", proxy); */
});



