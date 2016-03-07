var createModelObject = require("../../src/model/modelObject");

describe("modelObject", function() {
	var mockProxy;
	var mockModel;
	var mockData;

	var modelObject;

	beforeEach(function() {
		mockProxy = {
			readOneById: function(id, callback) {
				setTimeout(function() {
					callback(null, {
						id: id,
						str: "test"
					});
				}, 1);
			}
		};

		spyOn(mockProxy, "readOneById").and.callThrough();
		
		mockModel = {
			fields: [],
			idField: "id",
			proxy: mockProxy
		};

		mockData = {
			id: 1,
			str: "test"
		};

		modelObject = createModelObject({
			model: mockModel,
			data: mockData
		});
	});


	//read
	it("read", function(done) {
		modelObject.read(function() {
			expect(mockProxy.readOneById).toHaveBeenCalled();
			done();
		});
	});

	//save

	//destroy
});
