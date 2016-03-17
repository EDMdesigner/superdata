var superData = require("../../src/superData");

var proxyBehaviour = require("./proxyBehaviour");
var memoryProxy = require("../../src/proxy/memory");


describe("memory proxy", function() {
	it("creator function should be defined", function() {
		expect(typeof superData.proxy.memory).toBe("function");
	});

	it("config empty", function() {
		expect(function() {
			memoryProxy();
		}).toThrowError("config.idProperty is mandatory!");
	});

	it("config with idType", function() {
		expect(function() {
			memoryProxy({
				idType: "number"
			});
		}).toThrowError("config.idProperty is mandatory!");
	});

	it("config with idProperty", function() {
		expect(function() {
			memoryProxy({
				idProperty: "id",
			});
		}).toThrowError("config.idType is mandatory!");
	});

	var proxy = memoryProxy({
		idProperty: "id",
		idType: "number"
	});

	proxyBehaviour("memory", proxy);
});



