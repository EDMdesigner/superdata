var createModel = require("../../src/model/model");

describe("model", function() {
	var mockProxy;
	var model;

	beforeEach(function() {
		mockProxy = {
			read: function(options, filters, callback) {
				setTimeout(function() {
					callback(null, {
						items: [],
						count: 0
					});
				}, 1);
			},
			readOneById: function(id, filters, callback) {
				setTimeout(function() {
					callback(null, {
						id: id,
						str: "test",
						projectID: 2
					});
				}, 1);
			},
			createOne: function(data, callback) {
				data.id = 1;
				setTimeout(function() {
					callback(null, data);
				}, 1);
			}
		};

		spyOn(mockProxy, "read").and.callThrough();
		spyOn(mockProxy, "readOneById").and.callThrough();
		spyOn(mockProxy, "createOne").and.callThrough();


		model = createModel({
			fields: {},
			proxy: mockProxy,
			idField: "id"
		});
	});

	it("config", function() {
		expect(function() {
			createModel();
		}).toThrowError("options.idField is mandatory!");

		expect(function() {
			createModel({
				idField: "id"
			});
		}).toThrowError("options.fields is mandatory!");

		expect(function() {
			createModel({
				idField: "id",
				fields: {}
			});
		}).toThrowError("options.proxy is mandatory!");

		expect(function() {
			createModel({
				idField: "id",
				fields: {},
				proxy: mockProxy,
				belongsTo: ["projectID"]
			});
		}).toThrowError("options.belongsTo has to contain field names!");
	});

	it("list", function(done) {
		model.list({}, function() {
			expect(mockProxy.read).toHaveBeenCalled();
			done();
		});
	});

	it("load", function(done) {
		model.load(1, function() {
			expect(mockProxy.readOneById).toHaveBeenCalled();
			done();
		});
	});

	it("create", function(done) {
		model.create({str: "test"}, function() {
			expect(mockProxy.createOne).toHaveBeenCalled();
			done();
		});
	});

	describe("belongsTo", function() {

		describe("with invalid config", function() {
			it("should throw an error if options.belongsTo is not array", function() {
				expect(function() {
					createModel({
						idField: "id",
						fields: {},
						proxy: mockProxy,
						belongsTo: "notAnArray"
					});
				}).toThrowError("options.belongsTo has to be an array!");
			});

		});
		
		describe("with valid config", function() {

			beforeEach(function() {
				model = createModel({
					idField: "id",
					fields: {
						id: {
							type: "number"
						},
						projectID: {
							type: "number"
						},
						name: {
							type: "string"
						}
					},
					proxy: mockProxy,
					belongsTo: ["projectID"]
				});

			});

			it("should call callback with error if no projectID is given", function() {
				model.list({}, {}, function(err) {
					expect(err).toBe("belongsToValues has to have properties for references given in belongsTo");
				});
				model.load({}, {}, function(err) {
					expect(err).toBe("belongsToValues has to have properties for references given in belongsTo");
				});
				model.create({}, function(err) {
					expect(err).toBe("modelValues has to have properties for references given in belongsTo");
				});
			});

			it("should pass belongsToValues as parameter to proxy's functions", function() {
				model.list({}, {
					projectID: 2
				}, function() {});
				expect(mockProxy.read).toHaveBeenCalledTimes(1);
				expect(mockProxy.read.calls.argsFor(0)[1]).toEqual({
					projectID: 2
				});
				model.load({}, {
					projectID: 2
				}, function() {});
				expect(mockProxy.readOneById).toHaveBeenCalledTimes(1);
				expect(mockProxy.readOneById.calls.argsFor(0)[1]).toEqual({
					projectID: 2
				});
			});

			it("should pass only properties of belongsTo from belongsToValues", function() {
				model.list({}, {
					projectID: 2,
					name: "somebody"
				}, function() {});
				expect(mockProxy.read).toHaveBeenCalledTimes(1);
				expect(mockProxy.read.calls.argsFor(0)[1]).toEqual({
					projectID: 2
				});
				model.load({}, {
					projectID: 2,
					name: "somebody"
				}, function() {});
				expect(mockProxy.readOneById).toHaveBeenCalledTimes(1);
				expect(mockProxy.readOneById.calls.argsFor(0)[1]).toEqual({
					projectID: 2
				});
			});
		});
	});

});
