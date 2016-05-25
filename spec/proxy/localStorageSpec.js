var localStorageProxyCore = require("../../src/proxy/localStorageCore");

describe("localStorage proxy", function() {

	describe("with missing dependecies", function() {

		it("should throw error if dependencies.createMemoryProxy is missing", function() {
			expect(function() {
				localStorageProxyCore({
					storage: {}
				});
			}).toThrowError("dependencies.createMemoryProxy is mandatory!");
		});

		it("should throw error if dependencies.storage is missing", function() {
			expect(function() {
				localStorageProxyCore({
					createMemoryProxy: {}
				});
			}).toThrowError("dependencies.storage is mandatory!");
		});
	});

	describe("creator function", function() {
		var createLocalStorageProxy;
		var localStorageProxy;

		var proxyConf = {
			idProperty: "id",
			idType: "number",
			proxyName: "testName",
			generateId: (function() {
				var nextId = 0;

				return function() {
					return nextId += 1;
				};
			}())
		};

		var mockMemoryInterface = {
			idProperty: "id",
			generateId: function() {},
			read: function(options, cb) {
				cb(null, {});
			},
			createOne: function() {},
			readOneById: function() {},
			updateOneById: function() {},
			destroyOneById: function() {}
		};

		var mockStorageInterface = {
			getItem: function() {
				return JSON.stringify({
					items: []
				});
			},
			setItem: function() {}
		};

		beforeEach(function() {

			spyOn(mockMemoryInterface, "generateId").and.callThrough();
			spyOn(mockMemoryInterface, "read").and.callThrough();
			spyOn(mockMemoryInterface, "createOne").and.callThrough();
			spyOn(mockMemoryInterface, "readOneById").and.callThrough();
			spyOn(mockMemoryInterface, "updateOneById").and.callThrough();
			spyOn(mockMemoryInterface, "destroyOneById").and.callThrough();

			spyOn(mockStorageInterface, "getItem").and.callThrough();
			spyOn(mockStorageInterface, "setItem").and.callThrough();

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
				storage: {
					getItem: mockStorageInterface.getItem,
					setItem: mockStorageInterface.setItem
				}
			};

			createLocalStorageProxy = localStorageProxyCore(dependencies);
			localStorageProxy = createLocalStorageProxy(proxyConf);
		});

		it("interface", function() {
			expect(typeof localStorageProxy.idProperty).toBe("string");
			expect(typeof localStorageProxy.generateId).toBe("function");
			expect(typeof localStorageProxy.read).toBe("function");
			expect(typeof localStorageProxy.createOne).toBe("function");
			expect(typeof localStorageProxy.readOneById).toBe("function");
			expect(typeof localStorageProxy.updateOneById).toBe("function");
			expect(typeof localStorageProxy.destroyOneById).toBe("function");
		});

		it("read", function() {
			localStorageProxy.read({}, function() {});
			expect(mockMemoryInterface.read).toHaveBeenCalled();
		});

		it("createOne", function() {
			localStorageProxy.createOne();
			expect(mockMemoryInterface.createOne).toHaveBeenCalled();
			expect(mockMemoryInterface.read).toHaveBeenCalled();
			expect(mockStorageInterface.setItem).toHaveBeenCalled();

			expect(mockMemoryInterface.readOneById).not.toHaveBeenCalled();
			expect(mockMemoryInterface.updateOneById).not.toHaveBeenCalled();
			expect(mockMemoryInterface.destroyOneById).not.toHaveBeenCalled();
		});

		it("readOneById", function() {
			localStorageProxy.readOneById();
			expect(mockMemoryInterface.readOneById).toHaveBeenCalled();

			expect(mockMemoryInterface.read).not.toHaveBeenCalled();
			expect(mockMemoryInterface.createOne).not.toHaveBeenCalled();
			expect(mockMemoryInterface.updateOneById).not.toHaveBeenCalled();
			expect(mockMemoryInterface.destroyOneById).not.toHaveBeenCalled();

			expect(mockStorageInterface.setItem).not.toHaveBeenCalled();
		});

		it("updateOneById", function() {
			localStorageProxy.updateOneById();
			expect(mockMemoryInterface.updateOneById).toHaveBeenCalled();
			expect(mockMemoryInterface.read).toHaveBeenCalled();
			expect(mockStorageInterface.setItem).toHaveBeenCalled();

			expect(mockMemoryInterface.readOneById).not.toHaveBeenCalled();
			expect(mockMemoryInterface.createOne).not.toHaveBeenCalled();
			expect(mockMemoryInterface.destroyOneById).not.toHaveBeenCalled();
		});

		it("destroyOneById", function() {
			localStorageProxy.destroyOneById();
			expect(mockMemoryInterface.destroyOneById).toHaveBeenCalled();
			expect(mockMemoryInterface.read).toHaveBeenCalled();
			expect(mockStorageInterface.setItem).toHaveBeenCalled();

			expect(mockMemoryInterface.readOneById).not.toHaveBeenCalled();
			expect(mockMemoryInterface.updateOneById).not.toHaveBeenCalled();
			expect(mockMemoryInterface.createOne).not.toHaveBeenCalled();
		});
	});
});
