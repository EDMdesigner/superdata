var localStorageProxy = require("../../src/proxy/localStorageCore");

describe("localStorage proxy", function() {

	describe("with missing dependecies", function() {

		it("should throw error if dependencies.createMemoryProxy is missing", function() {
			expect(function() {
				localStorageProxy({
					storage: {}
				});
			}).toThrowError("dependencies.createMemoryProxy is mandatory!");
		});

		it("should throw error if dependencies.storage is missing", function() {
			expect(function() {
				localStorageProxy({
					createMemoryProxy: {}
				});
			}).toThrowError("dependencies.storage is mandatory!");
		});
	});

	describe("creator function", function() {
		var createLocalStorageProxy;

		beforeAll(function() {

			var mockMemoryInterface = {
				idProperty: "id",
				generateId: function() {},
				read: function() {},
				createOne: function() {},
				readOneById: function() {},
				updateOneById: function() {},
				destroyOneById: function() {}
			};

			spyOn(mockMemoryInterface, "generateId");
			spyOn(mockMemoryInterface, "read");
			spyOn(mockMemoryInterface, "createOne");
			spyOn(mockMemoryInterface, "readOneById");
			spyOn(mockMemoryInterface, "updateOneById");
			spyOn(mockMemoryInterface, "destroyOneById");

			var dependencies = {
				createMemoryProxy: function() {
					return {
						idProperty: mockMemoryInterface.idProperty,
						generateId: mockMemoryInterface.generateId,
						read: mockMemoryInterface.read,
						createOne: mockMemoryInterface.createOne,
						readOneById: mockMemoryInterface.readOneById,
						updateOneById: mockMemoryInterface.updateOneById,
						destroyOneById: mockMemoryInterface.destroyOneById
					};
				},
				storage: {}
			};

			createLocalStorageProxy = localStorageProxy(dependencies);
		});

		it("interface", function() {
			
		});

		it("Server calls", function() {
			
		});
	});
});
