var createStore = require("../../src/store/store");

describe("store", function() {
	var mockModel;
	var store;

	beforeEach(function() {
		mockModel = {
			create: function(data, callback) {
				setTimeout(function() {
					callback(null, {
						model: mockModel,
						data: data
					});
				}, 1);
			},
			list: function(query, belongsToValues, callback) {
				setTimeout(function() {
					callback(null, {
						items: [
							{
								model: mockModel,
								data: {
									id: 1,
									str: "1"
								}
							},
							{
								model: mockModel,
								data: {
									id: 2,
									str: "2"
								}
							}
						],
						count: 2
					});
				}, 1);
			}
		};

		spyOn(mockModel, "list").and.callThrough();
		spyOn(mockModel, "create").and.callThrough();

		store = createStore({
			model: mockModel
		});
	});

	describe("query changes", function() {
		function createCb(done) {
			var cb = function() {
				setTimeout(function() {
					expect(mockModel.list).toHaveBeenCalledTimes(1);
					store.load.after.remove(cb);
					done();
				}, 10);
			};

			return cb;
		}

		it("find", function(done) {	
			store.load.after.add(createCb(done));
			store.find = {str: /str/};
		});

		it("sort", function(done) {
			store.load.after.add(createCb(done));
			store.sort = {id: -1};
		});

		it("skip", function(done) {
			store.load.after.add(createCb(done));
			store.skip = 99;
		});

		it("limit", function(done) {
			store.load.after.add(createCb(done));
			store.limit = 12;
		});

		it("changing find, sort, skip and limit together... model.list still should be called once only.", function(done) {
			store.load.after.add(createCb(done));
			store.find = {id: 2};
			store.sort = {id: 1};
			store.skip = 1;
			store.limit = 12;
		});
	});

	it("add", function(done) {
		store.add({}, function() {
			expect(mockModel.create).toHaveBeenCalled();
			done();
		});
	});

	it("should call the callbacks before and after load", function(done) {
		var testCallbacks = {
			before1: function() {
				expect(testCallbacks.before1.calls.count()).toEqual(1);
				expect(testCallbacks.before2.calls.count()).toEqual(0);
				expect(testCallbacks.after1.calls.count()).toEqual(0);
				expect(testCallbacks.after2.calls.count()).toEqual(0);
			},
			before2: function() {
				expect(testCallbacks.before1.calls.count()).toEqual(1);
				expect(testCallbacks.before2.calls.count()).toEqual(1);
				expect(testCallbacks.after1.calls.count()).toEqual(0);
				expect(testCallbacks.after2.calls.count()).toEqual(0);
			},
			after1: function() {
				expect(testCallbacks.before1.calls.count()).toEqual(1);
				expect(testCallbacks.before2.calls.count()).toEqual(1);
				expect(testCallbacks.after1.calls.count()).toEqual(1);
				expect(testCallbacks.after2.calls.count()).toEqual(0);
			},
			after2: function() {
				expect(testCallbacks.before1.calls.count()).toEqual(1);
				expect(testCallbacks.before2.calls.count()).toEqual(1);
				expect(testCallbacks.after1.calls.count()).toEqual(1);
				expect(testCallbacks.after2.calls.count()).toEqual(1);
				done();
			}
		};

		spyOn(testCallbacks, "before1").and.callThrough();
		spyOn(testCallbacks, "before2").and.callThrough();
		spyOn(testCallbacks, "after1").and.callThrough();
		spyOn(testCallbacks, "after2").and.callThrough();

		store.load.before.add(testCallbacks.before1);
		store.load.before.add(testCallbacks.before2);

		store.load.after.add(testCallbacks.after1);
		store.load.after.add(testCallbacks.after2);

		store.load();
	});

	it("should stop load execution when a before callback throws an exception", function(done) {
		var testCallbacks = {
			beforeWithException: function() {
				throw new Error("test exception");
			},
			after: function() {
				expect(testCallbacks.after.calls.count()).toEqual(1);
				done();
			}
		};

		spyOn(testCallbacks, "beforeWithException").and.callThrough();
		spyOn(testCallbacks, "after").and.callThrough();

		store.load.before.add(testCallbacks.beforeWithException);
		store.load.after.add(testCallbacks.after);

		expect(function() {
			store.load();
		}).toThrowError("test exception");

		store.load.before.remove(testCallbacks.beforeWithException);

		store.load();
	});

	it("config", function() {
		expect(function() {
			createStore();
		}).toThrowError("options.model is mandatory!");
		expect(function() {
			mockModel.belongsTo = ["projectID"];
			createStore({
				model: mockModel
			});
		}).toThrowError("options.belongsToValues is mandatory if options.model.belongsTo is given!");
		expect(function() {
			mockModel.belongsTo = ["projectID"];
			createStore({
				model: mockModel,
				belongsToValues: {
					notProjectID: "value"
				}
			});
		}).toThrowError("belongsToValues has to have property for each element of options.model.belongsTo!");
	});

	describe("belongsTo", function() {
		beforeEach(function() {
			mockModel.belongsTo = ["projectID"];
			store = createStore({
				model: mockModel,
				belongsToValues: {
					projectID: 1
				}
			});
		});

		it("should pass belongsToValues as parameter to model's list function if load function is called", function() {
			store.load();
			expect(mockModel.list).toHaveBeenCalledTimes(1);
			expect(mockModel.list.calls.argsFor(0)[1]).toEqual({
				projectID: 1
			});
		});

		it("should call load function if store.belongsToValues changed with correct value", function(done) {
			store.belongsToValues = {
				projectID: 2
			};
			setTimeout(function() {
				expect(mockModel.list).toHaveBeenCalledTimes(1);
				expect(mockModel.list.calls.argsFor(0)[1]).toEqual({
					projectID: 2
				});
				done();
			}, 0);
		});

		it("should throw error if store.belongsToValues tried to change with incorrect value", function(done) {
			expect(function() {
				store.belongsToValues = {
					notProjectID: "value"
				};
			}).toThrowError("belongsToValues has to have property for each element of options.model.belongsTo!");
			setTimeout(function() {
				expect(store.belongsToValues).toEqual({
					projectID: 1
				});
				done();
			}, 0);
		});
	});
});
