/*jslint node: true */
"use strict";

var memoryProxy = require("./proxy/memory");
var restProxy =   require("./proxy/rest");
var ajaxProxy =   require("./proxy/ajax");
var store = require("./store/store");
var model = require("./model/model");

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
	}
};
