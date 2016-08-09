/*jslint node: true */
"use strict";

var memoryProxy = require("./proxy/memory");
var localStorageProxy = require("./proxy/localStorage");
var restProxy = require("./proxy/rest");
var ajaxProxy = require("./proxy/ajax");
var delayedMemoryProxy = require("./proxy/delayedMemory");
var store = require("./store/store");
var model = require("./model/model");
var jsonReader = require("./reader/json");

module.exports = {
	proxy: {
		memory: memoryProxy,
		localStorage: localStorageProxy,
		rest: restProxy,
		ajax: ajaxProxy,
		delayedMemory: delayedMemoryProxy
	},
	model: {
		model: model
	},
	store: {
		store: store
	},
	reader: {
		json: jsonReader
	}
};
