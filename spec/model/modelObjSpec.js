var createModelObject = require("../../src/model/modelObject");

describe("modelObject", function() {
	var mockProxy;
	var mockModel;
	var mockData;

	var modelObject;

	beforeEach(function() {
		mockProxy = {
			readOneById: function(id, filters, callback) {
				setTimeout(function() {
					callback(null, {
						id: id,
						str: "test",
						projectID: 2
					});
				}, 1);
			},
			updateOneById: function(id, data, filters, callback) {
				setTimeout(function() {
					data.id = id;
					callback(null, data);
				}, 1);
			},
			destroyOneById: function(id, filters, callback) {
				setTimeout(function() {
					callback(null, {
						id: id,
						str: "test",
						projectID: 2
					});
				}, 1);
			}
		};

		spyOn(mockProxy, "readOneById").and.callThrough();
		spyOn(mockProxy, "updateOneById").and.callThrough();
		spyOn(mockProxy, "destroyOneById").and.callThrough();
		
		mockModel = {
			fields: {
				id: {
					type: "number"
				},
				projectID: {
					type: "number"
				}
			},
			idField: "id",
			proxy: mockProxy
		};

		mockData = {
			id: 1,
			str: "test",
			projectID: 2
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
				data: {}
			});
		}).toThrowError("options.data has to have a property with same name as value of options.model.idField!");

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

		expect(function() {
			createModelObject({
				model: {
					fields: mockModel.fields,
					idField: mockModel.idField,
					proxy: mockProxy,
					belongsTo: ["notElementOfFields"]
				},
				data: {
					id: 2,
					str: "x"
				}
			});
		}).toThrowError("options.model.belongsTo has to contain field names!");

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

	describe("defaultValue", function() {

		it("has to set default value given in model's 'fields' config option", function() {
			mockModel.fields = {
				id: {
					type: "number"
				},
				projectID: {
					type: "number"
				},
				name: {
					type: "string",
					defaultValue: "Default Name"
				}
			};
			modelObject = createModelObject({
				model: mockModel,
				data: {
					id: 2,
					projectID: 1
				}
			});
			expect(modelObject.data.name).toBe("Default Name");
		});

	});

	describe("belongsTo", function() {

		describe("with invalid config", function() {
			it("should throw error if options.model.belongsTo is not array", function() {
				expect(function() {
					mockModel.belongsTo = "notAnArray";
					createModelObject({
						model: mockModel,
						data: {
							id: 1
						}
					});
				}).toThrowError("options.model.belongsTo has to be an array!");
			});
			it("should throw error if data has no property of each element in belongsTo array", function() {
				expect(function() {
					mockModel.belongsTo = ["projectID"];
					createModelObject({
						model: mockModel,
						data: {
							id: 1
						}
					});
				}).toThrowError("data has to have properties for references given in belongsTo");
			});
		});

		describe("with valid config", function() {

			beforeEach(function() {
				mockModel.belongsTo = ["projectID"];
				modelObject = createModelObject({
					model: mockModel,
					data: {
						id: 1,
						projectID: 1,
						name: "somebody"
					}
				});
			});

			it("should pass belongsToValues as parameter to proxy's functions", function() {
				modelObject.save(function() {});
				expect(mockProxy.updateOneById).toHaveBeenCalledTimes(1);
				expect(mockProxy.updateOneById.calls.argsFor(0)[2]).toEqual({
					projectID: 1
				});
				modelObject.destroy(function() {});
				expect(mockProxy.destroyOneById).toHaveBeenCalledTimes(1);
				expect(mockProxy.destroyOneById.calls.argsFor(0)[1]).toEqual({
					projectID: 1
				});
			});

		});

	});

});
