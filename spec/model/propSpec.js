var prop = require("../../src/model/prop");

describe("Test prop should be function....", function() {
	it("function should be defined", function() {
		expect(typeof prop).toBe("function");
	});
});

describe("Test prop value....", function() {

	var propCheck;
	var change;

	beforeEach(function () {
		change = {
			before: function() {

			},

			after: function() {

			}
		};

		spyOn(change, "before");
		spyOn(change, "after");

		propCheck = {};

		prop(propCheck, "testProp", {
			value: "test1",
			beforeChange: change.before,
			afterChange: change.after
		});
	});

	it("prop set get", function() {
		expect(propCheck.testProp).toBe("test1");

		propCheck.testProp = "test2";
		expect(propCheck.testProp).toBe("test2");
	});

	it("before after callback", function () {
		propCheck.testProp = "test3";
		expect(change.before).toHaveBeenCalled();
		expect(change.after).toHaveBeenCalled();
	});

	it("before after sholud not be called", function () {
		propCheck.testProp = "test1";

		expect(change.before.calls.count()).toBe(0);
		expect(change.after.calls.count()).toBe(0);
	});
});
