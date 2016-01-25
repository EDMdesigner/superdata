/*jslint node: true */
"use strict";

var ko = require("knockout");

module.exports = function createSorter(config) {
	var sortBy = config.sortBy;
	var direction = ko.observable(config.direction || 0);

	var callback = config.callback;


	function asc() {
		direction(1);
		callback(sortBy, direction());
	}

	function desc() {
		direction(-1);
		callback(sortBy, direction());
	}

	function reset() {
		direction(0);
		callback(sortBy, direction());
	}

	return Object.freeze({
		sortBy: sortBy,

		direction: direction,

		asc: asc,
		desc: desc,

		reset: reset
	});
};
