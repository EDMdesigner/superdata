/*jslint node: true */
"use strict";

var memoryProxy = require("./proxy/memory");
var restProxy =   require("./proxy/rest");
var ajaxProxy =   require("./proxy/ajax");
var store = require("./store/store");
var model = require("./model/model");
var jsonReader = require("./reader/json");

module.exports = {
	proxy: {
		memory: memoryProxy,
		rest: restProxy,
		ajax: ajaxProxy
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
