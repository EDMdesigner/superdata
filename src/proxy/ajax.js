/*
 * Ajax proxy shell
 */

/*jslint node: true */
"use strict";

var createReader = require("../reader/json");

var ajaxCore = require("./ajaxCore");

var request = require("superagent");

// var isNode = new Function("try {return this===global;}catch(e){return false;}");
var environment;

try {
	environment = window ? window : global;
} catch (e) {
	environment = global;
}

var formData = environment.FormData;
if (!formData) {
	formData = require("form-data");
}

var ajaxHelpers = require("./ajaxHelpers")({
	request: request,
	createReader: createReader
});

module.exports = ajaxCore({
	ajaxHelpers: ajaxHelpers,
	FormData: formData
});