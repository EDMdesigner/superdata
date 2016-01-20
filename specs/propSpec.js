describe("prop", function() {
	it("should be possible to create it", function() {
		var validator = function(val) {
			return typeof val === "string";
		};
		var prop = window.superData.prop({
			value: "test",
			onChangeListeners: {
				modelObject: function(oldVal, newVal) {

				}
			}
		});
	});
});
