/*jslint node: true */
"use strict";

var memoryProxy = require("./proxy/memory");
var store = require("./store/store");
var model = require("./model/model");

module.exports = {
	proxy: {
		memory: memoryProxy
	},
	model: model,
	store: {
		store: store
	}
};
