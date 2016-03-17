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
			},
			updateOneById: function(id, data, callback) {
				setTimeout(function() {
					data.id = id;
					callback(null, data);
				}, 1);
			},
			destroyOneById: function(id, callback) {
				setTimeout(function() {
					callback(null, {
						id: id,
						str: "test"
					});
				}, 1);
			}
		};

		spyOn(mockProxy, "readOneById").and.callThrough();
		spyOn(mockProxy, "updateOneById").and.callThrough();
		spyOn(mockProxy, "destroyOneById").and.callThrough();
		
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

	it("config", function() {
		expect(function() {
			createModelObject();
		}).toThrowError("options.data is mandatory!");

		expect(function() {
			createModelObject({
				model: mockModel
			});
		}).toThrowError("options.data is mandatory!");

		expect(function() {
			createModelObject({
				data: {
					id: 2,
					str: "x"
				}
			});
		}).toThrowError("options.model is mandatory!");

		expect(function() {
			createModelObject({
				model: {
				},
				data: {
					id: 2,
					str: "x"
				}
			});
		}).toThrowError("options.model.fields is mandatory!");

		expect(function() {
			createModelObject({
				model: {
					fields: mockModel.fields
				},
				data: {
					id: 2,
					str: "x"
				}
			});
		}).toThrowError("options.model.idField is mandatory!");

		expect(function() {
			createModelObject({
				model: {
					fields: mockModel.fields,
					idField: mockModel.idField
				},
				data: {
					id: 2,
					str: "x"
				}
			});
		}).toThrowError("options.model.proxy is mandatory!");
	});

	it("read", function(done) {
		modelObject.read(function() {
			expect(mockProxy.readOneById).toHaveBeenCalled();
			done();
		});
	});

	it("save", function(done) {
		modelObject.save(function() {
			expect(mockProxy.updateOneById).toHaveBeenCalled();
			done();
		});
	});

	it("destroy", function(done) {
		modelObject.destroy(function() {
			expect(mockProxy.destroyOneById).toHaveBeenCalled();
			done();
		});
	});
});
