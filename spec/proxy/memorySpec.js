var superData = require("../../src/superData");

var proxyBehaviour = require("./proxyBehaviour");
//var memoryProxy = require("../../src/proxy/memory");
var memoryProxyCore = require("../../src/proxy/memoryCore");


describe("memory proxy", function() {

	var messages;
	var createMemoryProxy;

	beforeEach(function() {

		messages = {
			errorMessages: {
				NOT_FOUND: "not found error message",
				DUPLICATE_KEY: "duplicate key error message"
			}
		};

		createMemoryProxy = memoryProxyCore({
			messages: messages
		});

	});

	describe("included in superData", function() {

		it("creator function should be defined", function() {
			expect(typeof superData.proxy.memory).toBe("function");
		});

	});

	describe("with missing dependencies", function() {

		it("should throw error if dependencies is missing", function() {
			expect(memoryProxyCore).toThrowError("dependencies is mandatory!");
		});

		it("should throw error if dependencies.messages is missing", function() {
			expect(function() {
				memoryProxyCore({});
			}).toThrowError("dependencies.messages is mandatory!");
		});

	});

	describe("with invalid config", function() {

		it("config empty", function() {
			expect(function() {
				createMemoryProxy();
			}).toThrowError("config.idProperty is mandatory!");
		});

		it("config with idType", function() {
			expect(function() {
				createMemoryProxy({
					idType: "number"
				});
			}).toThrowError("config.idProperty is mandatory!");
		});

		it("config with idProperty", function() {
			expect(function() {
				createMemoryProxy({
					idProperty: "id",
				});
			}).toThrowError("config.idType is mandatory!");
		});

	});

	describe("with valid config", function() {

		var memoryProxy;
		var callback;

		beforeEach(function() {
			memoryProxy = createMemoryProxy({
				idProperty: "id",
				idType: "string"
			});
			memoryProxy.createOne({
				id: "id1",
				prop: "some value"
			}, function() {});
			callback = jasmine.createSpy("callback");
		});

		it("should throw error if given callback is not a function", function() {

			expect(function() {
				memoryProxy.read({}, "notAFunction");
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.createOne({
					data: {},
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.readOneById({
					id: "1",
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.updateOneById({
					id: "1",
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

			expect(function() {
				memoryProxy.destroyOneById({
					id: "1",
					callback: "notAFunction"
				});
			}).toThrowError("callback should be a function");

		});

		it("should throw error if it can't cast given id to number if given idType is number", function() {

			memoryProxy = createMemoryProxy({
				idProperty: "id",
				idType: "number"
			});

			expect(function() {
				memoryProxy.readOneById("notANumber", callback);
			}).toThrowError("Id notANumber could not be parsed as number");

		});

		describe("read", function() {

			//full read test is in proxyBehaviour.js
			it("should read data even if options parameter is falsy", function() {
				memoryProxy.read(null, function(err, response) {
					expect(response.items.length).toBe(1);
					expect(response.count).toBe(1);
					expect(response.items[0]).toEqual({ id: "id1", prop: "some value" });
				});
			});

		});

		describe("createOne", function() {

			it("should generate Id if data[idProperty] is undefined", function() {
				var data = {
					notIdProperty: "some value"
				};

				memoryProxy.createOne(data, callback);
				expect(data.id).toBe(1);

			});

			it("should call callback function", function() {
				memoryProxy.createOne({}, callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});

			it("should push data to it's db array and call callback with data", function() {
				var data = {
					id: "1",
					prop1: "some value"
				};
				memoryProxy.createOne(data, function(err, createData) {
					expect(createData).toEqual(data);
				});
				memoryProxy.readOneById(1, function(err, readData) {
					expect(readData).toBe(data);
				});
				
			});

			it("should call callback with duplicate key error if id exists", function() {
				var data = {
					id: "1",
					prop: "some value"
				};
				var data2 = {
					id: "1",
					prop: "some other value"
				};
				memoryProxy.createOne(data, callback);
				memoryProxy.createOne(data2, function(err) {
					expect(err).toBe("duplicate key error message");
				});
				memoryProxy.readOneById(1, function(err, readData) {
					expect(readData).toEqual(data);
				});

			});

		});

		describe("readOneById", function() {

			it("should call callback with read data", function() {
				memoryProxy.readOneById("id1", function(err, data) {
					expect(data).toEqual({
						id: "id1",
						prop: "some value"
					});
				});
			});

			it("should call callback function", function() {
				memoryProxy.readOneById("", callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});

			it("should call callback with not found error if id doesn't exist", function() {
				memoryProxy.readOneById("", function(err) {
					expect(err).toBe("not found error message");
				});
			});

		});

		describe("updateOneById", function() {

			it("should call callback with new data", function() {
				var data = {
					id: "id1",
					prop: "some new value"
				};
				memoryProxy.updateOneById("id1", data, function(err, newData) {
					expect(newData).toEqual(data);
				});
			});

			it("should call callback function", function() {
				memoryProxy.updateOneById("", {}, callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});

			it("should not change original id", function() {
				var data = {
					id: "newId",
					prop: "some new value"
				};
				memoryProxy.updateOneById("id1", data, function(err, newData) {
					expect(newData.id).toBe("id1");
				});
				memoryProxy.readOneById("newId", function(err) {
					expect(err).toBe("not found error message");
				});
			});

			it("should call callback with not found error if id doesn't exist", function() {
				memoryProxy.updateOneById("", {}, function(err) {
					expect(err).toBe("not found error message");
				});
			});

		});

		describe("destroyOneById", function() {

			it("should call callback with deleted data", function() {
				memoryProxy.destroyOneById("id1", function(err, deletedData) {
					expect(deletedData).toEqual({
						id: "id1",
						prop: "some value"
					});
				});
			});

			it("should call callback function", function() {
				memoryProxy.destroyOneById("", callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});

			it("should delete element", function() {
				memoryProxy.destroyOneById("id1", callback);
				memoryProxy.readOneById("id1", function(err) {
					expect(err).toBe("not found error message");
				});
			});

			it("should call callback with not found error if id doesn't exist", function() {
				memoryProxy.destroyOneById("", function(err) {
					expect(err).toBe("not found error message");
				});
			});

		});

		describe("proxy behaviour", function() {
			describe("should complete proxyBehaviour tests", function() {
				var messages = {
					errorMessages: {
						NOT_FOUND: "NOT_FOUND",
						DUPLICATE_KEY: "duplicate key error message"
					}
				};

				var createMemoryProxy = memoryProxyCore({
					messages: messages
				});

				var memoryProxy = createMemoryProxy({
					idProperty: "id",
					idType: "number"
				});

				proxyBehaviour("memory", memoryProxy);
			});
		});

		describe("with filters", function() {

			var data;
			var notMatchingFilterObjects;
			var matchingFilterObject;

			beforeEach(function() {
				data = {
					id: "id2",
					prop1: "some value",
					prop2: "some value2"
				};
				notMatchingFilterObjects = [
					{
						prop1: "some other value"
					},
					{
						prop1: "some other value",
						prop2: "some other value2"
					},
					{
						prop1: "some value",
						prop2: "some other value2"
					}
				];
				matchingFilterObject = {
					prop1: "some value",
					prop2: "some value2"
				};
				memoryProxy.createOne(data, callback);
			});

			it("read should check filter parameters", function() {
				memoryProxy.createOne({
					id: "id3",
					prop1: "some value",
					prop2: "some value2",
					prop3: "some value3"
				}, callback);
				var responseCallback = function(err, response) {
					expect(response).toEqual({
						items: [],
						count: 0
					});
				};
				for(var i = 0; i < notMatchingFilterObjects.length; i += 1) {
					memoryProxy.read({}, notMatchingFilterObjects[i], responseCallback);
				}
				memoryProxy.read({}, matchingFilterObject, function(err, response) {
					expect(response).toEqual({
						items: [
							{
								id: "id2",
								prop1: "some value",
								prop2: "some value2"
							},
							{
								id: "id3",
								prop1: "some value",
								prop2: "some value2",
								prop3: "some value3"
							}
						],
						count: 2
					});
				});
			});

			it("readOneById should check filter parameters", function() {
				var responseCallback = function(err) {
					expect(err).toBe("not found error message");
				};
				for(var i = 0; i < notMatchingFilterObjects.length; i += 1) {
					memoryProxy.readOneById("id2", notMatchingFilterObjects[i], responseCallback);
				}
				memoryProxy.readOneById("id2", matchingFilterObject, function(err, readData) {
					expect(readData).toBe(data);
				});
			});

			it("updateOneById should check filter parameters", function() {
				var responseCallback = function(err) {
					expect(err).toBe("not found error message");
				};
				for(var i = 0; i < notMatchingFilterObjects.length; i += 1) {
					memoryProxy.updateOneById("id2", data, notMatchingFilterObjects[i], responseCallback);
				}
				memoryProxy.updateOneById("id2", data, matchingFilterObject, function(err, readData) {
					expect(readData).toBe(data);
				});
			});

			it("destroyOneById should check filter parameters", function() {
				var responseCallback = function(err) {
					expect(err).toBe("not found error message");
				};
				for(var i = 0; i < notMatchingFilterObjects.length; i += 1) {
					memoryProxy.destroyOneById("id2", notMatchingFilterObjects[i], responseCallback);
				}
				memoryProxy.destroyOneById("id2", matchingFilterObject, function(err, readData) {
					expect(readData).toBe(data);
				});
			});

		});

		describe("with find in array", function() {

			var data;
			var data2;
			var data3;
			var data4;

			beforeEach(function() {

				data = {
					id: "id2",
					findField: "tag1 tag2 tag3"
				};
				data2 = {
					id: "id3",
					findField: "tag3 tag2 tag1"
				};
				data3 = {
					id: "id4",
					findField: "tag2 tag4"
				};
				data4 = {
					id: "id5",
					findField: "tag5 tag6 tag7 tag8"
				};

				memoryProxy.createOne(data, callback);
				memoryProxy.createOne(data2, callback);
				memoryProxy.createOne(data3, callback);
				memoryProxy.createOne(data4, callback);
				
			});

			it("has to return elements containing find string", function() {
				memoryProxy.read({
					find: {
						findField: "tag1"
					}
				},
				{},
				function(err, response) {
					expect(Array.isArray(response.items)).toBe(true);
					expect(response.items.length).toBe(2);
					expect(response.count).toBe(2);
					expect(response.items[0]).toEqual({ id: "id2", findField: "tag1 tag2 tag3"});
					expect(response.items[1]).toEqual({ id: "id3", findField: "tag3 tag2 tag1"});
				});

				memoryProxy.read({
					find: {
						findField: "ag1"
					}
				},
				{},
				function(err, response) {
					expect(Array.isArray(response.items)).toBe(true);
					expect(response.items.length).toBe(2);
					expect(response.count).toBe(2);
					expect(response.items[0]).toEqual({ id: "id2", findField: "tag1 tag2 tag3"});
					expect(response.items[1]).toEqual({ id: "id3", findField: "tag3 tag2 tag1"});
				});
			});

			it("has to return elements matching find regexp", function() {
				memoryProxy.read({
					find: {
						findField: "/t[a-z]+g2/i"
					}
				},
				{},
				function(err, response) {
					expect(Array.isArray(response.items)).toBe(true);
					expect(response.items.length).toBe(3);
					expect(response.count).toBe(3);
					expect(response.items[0]).toEqual({ id: "id2", findField: "tag1 tag2 tag3"});
					expect(response.items[1]).toEqual({ id: "id3", findField: "tag3 tag2 tag1"});
					expect(response.items[2]).toEqual({ id: "id4", findField: "tag2 tag4"});
				});
				
			});

			it("has to return elements matching find string array", function() {
				memoryProxy.read({
					find: {
						findField: ["tag1", "tag3"]
					}
				},
				{},
				function(err, response) {
					expect(Array.isArray(response.items)).toBe(true);
					expect(response.items.length).toBe(2);
					expect(response.count).toBe(2);
					expect(response.items[0]).toEqual({ id: "id2", findField: "tag1 tag2 tag3"});
					expect(response.items[1]).toEqual({ id: "id3", findField: "tag3 tag2 tag1"});
				});
				
			});

			it("has to return elements matching find regexp array", function() {
				memoryProxy.read({
					find: {
						findField: ["/t[a-z]+g1/i", "/t[a-z]+g3/i"]
					}
				},
				{},
				function(err, response) {
					expect(Array.isArray(response.items)).toBe(true);
					expect(response.items.length).toBe(2);
					expect(response.count).toBe(2);
					expect(response.items[0]).toEqual({ id: "id2", findField: "tag1 tag2 tag3"});
					expect(response.items[1]).toEqual({ id: "id3", findField: "tag3 tag2 tag1"});
				});
				
			});

		});

	});

});
