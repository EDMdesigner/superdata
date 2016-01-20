describe("proxy", function() {
	it("creator function should be defined", function() {
		expect(typeof window.superData.proxy.memory).toBe("function");
	});

	var proxy;

	beforeEach(function() {
		proxy = window.superData.proxy.memory();
	});

	it("prody should have the following functions", function() {
		expect(typeof proxy.read).toBe("function");
		expect(typeof proxy.createOne).toBe("function");
		expect(typeof proxy.readOneById).toBe("function");
		expect(typeof proxy.updateOneById).toBe("function");
		expect(typeof proxy.destroyOneById).toBe("function");
	});


	it("proxy.createOne should create an object and you should be able to read it", function(done) {
		proxy.createOne({atom: "anti"}, function(err, result) {
			proxy.readOneById(0, function(err, result) {
				expect(result.atom).toBe("anti");
				done();
			});
		});
	});

	it("proxy.readOneById should return a NOT_FOUND error message when the searched element is non existent", function(done) {
		proxy.readOneById(4, function(err, result) {
			expect(err).toBe("NOT_FOUND");
			expect(result).toBeUndefined();
			done();
		});
	});

	it("proxy.read should return an empty array when nothing was inserted", function(done) {
		proxy.read(null, function(err, result) {
			expect(err).toBeNull();
			expect(result instanceof Array).toBe(true);
			done();
		});
	});

	it("proxy.updateOneById should return NOT_FOUND when we try to update a non-existing element", function(done) {
		proxy.updateOneById("adf", {yo: 1}, function(err, result) {

			done();
		});
	});
});
