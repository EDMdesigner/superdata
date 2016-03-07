module.exports = function proxyBehaviour(name, proxy) {
	describe(name + " proxy", function() {
		it("prody should have the following functions", function() {
			expect(typeof proxy.read).toBe("function");
			expect(typeof proxy.createOne).toBe("function");
			expect(typeof proxy.readOneById).toBe("function");
			expect(typeof proxy.updateOneById).toBe("function");
			expect(typeof proxy.destroyOneById).toBe("function");
		});

		it("createOne", function(done) {
			var createdNum = 0;
			var numOfItems = 100;


			var callback = function() {
				createdNum += 1;

				if (createdNum >= numOfItems) {
					done();
				}
			};

			for (var idx = 0; idx < numOfItems; idx += 1) {
				proxy.createOne({
					id: idx,
					str: "str" + idx //we could generate different strings, so it would be easier to test find
				}, callback);
			}
		});

		it("read", function(done) {
			var limit = 10;
			proxy.read({
				find: {},
				sort: {id: 1},
				skip: 0,
				limit: limit
			}, function(err, result) {
				expect(err).toBeNull();

				console.log(result);

				for (var idx = 0; idx < limit; idx += 1) {
					expect(result.items[idx].id).toBe(idx);
				}
				done();
			});

			//more tests for find, sort, skip and limit
		});
	});
};
