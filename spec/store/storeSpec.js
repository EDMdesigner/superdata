var createStore = require("../../src/store/store");

describe("store", function() {
	var mockModel;
	var store;

	beforeEach(function() {
		mockModel = {
			list: function(query, callback) {
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
});
