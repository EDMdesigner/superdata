var superData = require("../../src/superData");

// var readerBehaviour = require("./readerBehaviour");
var createJsonReader = require("../../src/reader/json");

var response = {
	"count": 122,
	"offset": 0,
	"users": [
		{
			"id": "nacho-libre-1",
			"value": 1,
			"user": {
				"id": 1,
				"name": "Nacho Libre",
				"email": "nacholibre@wvo.com"
			}
		},
		{
			"id": "John-Cena-1",
			"value": 2,
			"user": {
				"id": 2,
				"name": "John Cena",
				"email": "johncena@wvo.com"
			}
		}
	]
};

var config = {
	root: "users",
	record: "user",
	count: "count",
	message: "message",
	success: "success",
	err: "err",
	out: "out"
};

var jsrBase = createJsonReader({
});

var jsrRoot = createJsonReader({
	root: config.root
});

var jsrRecord = createJsonReader({
	root: config.record
});

var jsrRootAndRecord = createJsonReader({
	root: config.root,
	record: config.record
});

var jsrProp = createJsonReader({
	root: "users",

	count: config.count,
	message: config.message,
	success: config.success
});

var jsrError = createJsonReader({
	err: config.err
});

var jsrOut = createJsonReader({
	out: config.out
});

describe("json reader", function() {
	it("should have a creator function", function() {
		expect(typeof superData.reader.json).toBe("function");
	});

	it("config: {} returns response", function() {
		expect(jsrBase.read(response)).toBe(response);
	});

	it("config: {root: root} should return response[root]", function() {
		expect(jsrRoot.read(response)).toBe(response[config.root]);
	});

	it("config: {record: record} should return response[record]", function() {
		expect(jsrRecord.read(response)).toBe(response[config.record]);
	});

	it("config: {root: root, record: record} should return response[root][record]", function() {
		expect(jsrRootAndRecord.read(response)).toBe(response[config.root][config.record]);
	});

	it("return props if root or record present", function() {
		expect(jsrProp.read(response).count).toBe(response[config.count]);
		expect(jsrProp.read(response).message).toBe(response[config.message]);
		expect(jsrProp.read(response).success).toBe(response[config.success]);
	});

	it("throw exception if message, count or success defined, but root or record not", function() {
		expect(function() {
			createJsonReader({
				count: config.count,
				message: config.message,
				success: config.success
			});
		}).toThrow();
	});

	it("return err", function() {
		expect(jsrError.read(response).err).toBe(response[config.err]);
	});

	it("should return response in out field if defined", function() {
		expect(jsrOut.read(response)[config.out]).toBe(response);
	});
});


