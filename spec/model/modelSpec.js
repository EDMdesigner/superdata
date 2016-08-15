var createModel = require("../../src/model/model");

describe("model", function() {
	var mockProxy;
	var model;

	beforeEach(function() {
		mockProxy = {
			read: function(options, belongsToValues, callback) {
				setTimeout(function() {
					callback(null, {
						items: [],
						count: 0
					});
				}, 1);
			},
			readOneById: function(id, callback) {
				setTimeout(function() {
					callback(null, {
						id: id,
						str: "test"
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
			fields: [],
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
				fields: []
			});
		}).toThrowError("options.proxy is mandatory!");
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
});
