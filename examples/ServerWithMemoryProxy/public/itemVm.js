/*jslint node: true */
"use strict";

//var ko = require("knockout");

function createItemVm(config) {
	config.alert = function() {
		alert("yo");
	};

	return config;
}

module.exports = createItemVm;