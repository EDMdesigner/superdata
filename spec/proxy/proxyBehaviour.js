module.exports = function proxyBehaviour(name, proxy) {
	describe(name + " proxy", function() {
		var numOfItems = 100;

		it("prody should have the following functions", function() {
			expect(typeof proxy.read).toBe("function");
			expect(typeof proxy.createOne).toBe("function");
			expect(typeof proxy.readOneById).toBe("function");
			expect(typeof proxy.updateOneById).toBe("function");
			expect(typeof proxy.destroyOneById).toBe("function");
		});

		it("createOne", function(done) {
			var createdNum = 0;


			var createOneCallback = function() {
				createdNum += 1;

				if (createdNum >= numOfItems) {
					done();
				}
			};

			for (var idx = 0; idx < numOfItems; idx += 1) {
				proxy.createOne({
					id: idx,
					str: "str" + idx //we could generate different strings, so it would be easier to test find
				}, createOneCallback);
			}
		});



		/**
			read tests
			 - limit
			 - skip
			 - sort
			 - find
		*/

		function createReadTest(config) {
			var find = config.find;
			var sort = config.sort;
			var skip = config.skip;
			var limit = config.limit;

			var expectedNum = config.expectedNum;
			var expectedIds = config.expectedIds;

			var findStr = {};
			if (find) {
				for (var prop in find) {
					var act = find[prop];
					if (act instanceof RegExp) {
						act = act.toString();
					}
					findStr[prop] = act;
				}
			}

			it("find: " + findStr + ", sort: " + JSON.stringify(sort) + ", skip: " + skip + ", limit: " + limit, function(done) {
				skip = skip || 0;
				limit = limit || 10;

				if (skip < 0) {
					skip = 0;
				}

				if (limit < 1) {
					limit = 10;
				}

				proxy.read({
					find: find,
					sort: sort,
					skip: skip,
					limit: limit
				}, function(err, result) {
					expect(err).toBeNull();

					var numOfItems = limit < expectedNum ? limit : expectedNum;

					expect(result.items.length).toBe(numOfItems);
					expect(result.count).toBe(expectedNum);

					for (var idx = 0; idx < numOfItems; idx += 1) {
						expect(result.items[idx].id).toBe(expectedIds[idx]);
					}
					done();
				});
			});
		}

		describe("read", function() {
			//limit
			createReadTest({
				skip: 0,
				limit: 10,

				expectedNum: 100,
				expectedIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

				proxy: proxy
			});

			createReadTest({
				skip: 0,
				limit: 7,

				expectedNum: 100,
				expectedIds: [0, 1, 2, 3, 4, 5, 6],

				proxy: proxy
			});

			//skip
			createReadTest({
				skip: 3,
				limit: 13,

				expectedNum: 100,
				expectedIds: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],

				proxy: proxy
			});

			//sort
			createReadTest({
				sort: {
					id: 1
				},
				expectedNum: 100,
				expectedIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

				proxy: proxy
			});

			createReadTest({
				sort: {
					id: -1
				},
				expectedNum: 100,
				expectedIds: [99, 98, 97, 96, 95, 94, 93, 92, 91, 90],

				proxy: proxy
			});

			createReadTest({
				sort: {
					str: 1
				},
				expectedNum: 100,
				expectedIds: [0, 1, 10, 11, 12, 13, 14, 15, 16, 17],

				proxy: proxy
			});

			createReadTest({
				sort: {
					str: -1
				},
				expectedNum: 100,
				expectedIds: [99, 98, 97, 96, 95, 94, 93, 92, 91, 90],

				proxy: proxy
			});

			//find
			createReadTest({
				find: {
					id: 16
				},
				sort: {
					id: 1
				},
				expectedNum: 1,
				expectedIds: [16],

				proxy: proxy
			});

			createReadTest({
				find: {
					str: /0/
				},
				sort: {
					id: 1
				},
				expectedNum: 10,
				expectedIds: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],

				proxy: proxy
			});

			createReadTest({
				find: {
					str: /1/
				},
				sort: {
					id: 1
				},
				limit: 3,

				expectedNum: 19,
				expectedIds: [1, 10, 11],

				proxy: proxy
			});
		});

		describe("read - defaults & invalid config", function() {
			createReadTest({
				expectedNum: 100,
				expectedIds: [99, 98, 97, 96, 95, 94, 93, 92, 91, 90],

				proxy: proxy
			});

			createReadTest({
				skip: -3,
				limit: -10,
				expectedNum: 100,
				expectedIds: [99, 98, 97, 96, 95, 94, 93, 92, 91, 90],

				proxy: proxy
			});
		});

		describe("readOneById", function() {
			it("with valid id", function(done) {
				proxy.readOneById(18, function(err, result) {
					expect(err).toBeNull();

					expect(result.id).toBe(18);
					expect(result.str).toBe("str18");

					done();
				});
			});

			it("with invalid id", function(done) {
				proxy.readOneById(108, function(err) {
					expect(err).toBe("NOT_FOUND");

					done();
				});
			});
		});

		describe("updateOneById", function() {
			it("with valid id", function(done) {
				proxy.updateOneById(18, {str: "str18 - modified"}, function(err, result) {
					expect(err).toBeNull();

					expect(result.id).toBe(18);
					expect(result.str).toBe("str18 - modified");

					proxy.readOneById(18, function(err, result) {
						expect(err).toBeNull();

						expect(result.id).toBe(18);
						expect(result.str).toBe("str18 - modified");

						done();
					});
				});
			});

			it("with invalid id", function(done) {
				proxy.updateOneById(108, {str: "won't work"}, function(err) {
					expect(err).toBe("NOT_FOUND");

					done();
				});
			});
		});

		describe("destroyOneById", function() {
			it("with valid id", function(done) {
				proxy.destroyOneById(18, function(err, result) {
					expect(err).toBeNull();

					expect(result.id).toBe(18);
					expect(result.str).toBe("str18 - modified");

					proxy.readOneById(18, function(err) {
						expect(err).toBe("NOT_FOUND");

						done();
					});
				});
			});

			it("with invalid id", function(done) {
				proxy.destroyOneById(108, function(err) {
					expect(err).toBe("NOT_FOUND");

					done();
				});
			});
		});
	});
};
