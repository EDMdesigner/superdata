/*jslint node: true */
"use strict";

var ko = require("knockout");

module.exports = function createSorter(config) {
	var filterBy = config.filterBy;
	var filterType = config.filterType;
	var value = ko.observable(config.value || "");

	var callback = config.callback;


	ko.computed(function() {
		callback(filterBy, filterType, value());
	});


	return Object.freeze({
		filterBy: filterBy,
		filterType: filterType,

		value: value
	});
};
