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

	it("config with operations", function() {
		expect(function() {
			ajaxProxy({
				operations: {}
			});
		}).toThrowError("config.idProperty is mandatory!");
	});

	/*
	var proxy = ajaxProxy({
		idProperty: "id",
		operations: {
			read: {
				route: "http://localhost:7357/user",
				method: "GET"
			},
			createOne: {
				route: "http://localhost:7357/user",
				method: "POST"
			},
			readOneById: {
				route: "http://localhost:7357/user/:id",
				method: "GET"
			},
			updateOneById: {
				route: "http://localhost:7357/user/:id",
				method: "PUT"
			},
			destroyOneById: {
				route: "http://localhost:7357/user/:id",
				method: "DELETE"
			}
		}
	});

	proxyBehaviour("ajax", proxy);
	*/
});
