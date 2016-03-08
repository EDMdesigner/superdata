var superData = require("../../src/superData");

//var proxyBehaviour = require("./proxyBehaviour");
var ajaxProxy = require("../../src/proxy/ajax");


describe("ajax proxy", function() {
	it("creator function should be defined", function() {
		expect(typeof superData.proxy.ajax).toBe("function");
	});

	it("config empty", function() {
		expect(function() {
			ajaxProxy();
		}).toThrowError("config.idProperty is mandatory!");
	});

	it("config with idProperty", function() {
		expect(function() {
			ajaxProxy({
				idProperty: "id"
			});
		}).toThrowError("config.operations is mandatory!");
	});

	/*
	var proxy = ajaxProxy({
		idProperty: "id",
		// operations: ???
	});

	proxyBehaviour("ajax", proxy);
	*/
});
