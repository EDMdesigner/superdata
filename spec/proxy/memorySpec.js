var superData = require("../../src/superData");

var proxyBehaviour = require("./proxyBehaviour");
var memoryProxy = require("../../src/proxy/memory");


describe("memory proxy", function() {
	it("creator function should be defined", function() {
		expect(typeof superData.proxy.memory).toBe("function");
	});

	var proxy = memoryProxy({
		idProperty: "id",
		idType: "string"
	});

	proxyBehaviour("memory", proxy);
});



