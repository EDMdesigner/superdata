describe("intValidator", function() {
	var validator;
	beforeEach(function() {
		validator = superData.validators.intValidator();
	});

	it("should accept integer values", function() {
		expect(validator(1)).toBe(true);
		expect(validator(42)).toBe(true);
		expect(validator(0)).toBe(true);
		expect(validator(-3)).toBe(true);
		expect(validator(Number(3))).toBe(true);
	});

	it("should not accept float numbers", function() {
		expect(validator(3.14)).toBe(false);
		expect(validator(-24.4)).toBe(false);
		expect(validator(Number(4.3))).toBe(false);
	});

	it("should not accept strings", function() {
		expect(validator("adsf")).toBe(false);
		expect(validator("4")).toBe(false);
	});

	it("should not accept booleans", function() {
		expect(validator(true)).toBe(false);
		expect(validator(false)).toBe(false);
	});

	it("should not accept objects or functions", function() {
		expect(validator({})).toBe(false);
		expect(validator(function() {})).toBe(false);
	});
});
