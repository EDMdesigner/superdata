var prop = require("../../src/model/prop");
var superData = require("../../src/superData");

describe("Test prop should be function....", function() {
	it("function should be defined", function() {
		expect(typeof prop).toBe("function");
	});
});

describe("Test prop value....", function() {

	var kalacs = {};

	prop(kalacs, "testProp", {
		value: 10
	});

	it("function shuojasmineld be defined", function() {
		expect(kalacs.testProp).toBe(10);
	});
});