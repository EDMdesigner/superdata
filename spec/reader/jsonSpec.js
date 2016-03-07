var superData = require("../../src/superData");

var readerBehaviour = require("./readerBehaviour");
var createJsonRreader = require("../../src/reader/json");

var response = {
	"total": 122,
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
	total: "total",
	message: "message",
	success: "success",
	err: "error",
	out: "out"
};

var jsrBase = createJsonRreader({
});

var jsrRoot = createJsonRreader({
	root: config.root
});

var jsrRootAndRecord = createJsonRreader({
	root: config.root,
	record: config.record
});

var jsrProp = createJsonRreader({
	total: config.total,
	message: config.message,
	success: config.success,
	error: config.error
});

var jsrOut = createJsonRreader({
	out: config.out
});

describe("json reader", function() {
	it("should have a creator function", function() {
		expect(typeof superData.reader.json).toBe("function");
	});

	it("jsrBase should return response", function() {
		expect(jsrBase.read(response)).toBe(response);
	});

	it("jsrRoot should return response[root]", function() {
		expect(jsrRoot.read(response)).toBe(response[config.root]);
	});

	it("jsrRootAndRecord should return response[root][record]", function() {
		expect(jsrRootAndRecord.read(response)).toBe(response[config.root][config.record]);
	});

	it("jsrProp should return props", function() {
		expect(jsrProp.read(response).total).toBe(response[config.total]);
		expect(jsrProp.read(response).message).toBe(response[config.message]);
		expect(jsrProp.read(response).success).toBe(response[config.success]);
		expect(jsrProp.read(response).err).toBe(response[config.error]);
	});

	it("jsrOut should return response in out field", function() {
		expect(jsrOut.read(response)[config.out]).toBe(response);
	});
});


