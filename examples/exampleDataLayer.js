/*jslint node: true */
"use strict";

var createProxy = require("../src/proxy/memory");
var createModel = require("../src/model/model");
var createStore = require("../src/store/store");


var proxy = createProxy({
	idProperty: "id",
	generateId: (function() {
		var nextId = 0;
		return function() {
			return nextId++;
		};
	}())
});

function createOneSuccess() {
	//console.log(err, result);
}
for (var idx = 0; idx < 1000; idx += 1) {
	var rand = Math.random();
	proxy.createOne({
		num: rand,
		str: (rand < 0.5 ? "str" : "yo")
	}, createOneSuccess);
}

var model = createModel({
	fields: {
		id: {
			type: "number"
		},
		num: {
			type: "number",
			validators: [
				function(value) {
					return value === 1 || value === 2 || value === 3;
				}
			]
		},
		str: {
			type: "string"
		}
	},

	idField: "id",

	proxy: proxy
});

var store = createStore({
	model: model,
	proxy: proxy
});

module.exports = {
	proxy: proxy,
	model: model,
	store: store
};
