/*jslint node: true */
"use strict";

var ko = require("knockout");

var createFilter = require("./filter");

module.exports = function createFiltersHandler(config) {
	var filters = {};

	//filtersHandler can be implemented in a very similar way

	for (var prop in config.filters) {
		filters[prop] = createFilter({
			filterBy: prop,
			filterType: "regex",
			callback: setOthersToZero
		});
	}


	function setOthersToZero(filterBy, direction) {
		for (var prop in filters) {
			if (prop === filterBy || prop === "filterComputed") {
				continue;
			}

			filters[prop].value("");
		}
	}

	var filterComputed = ko.computed(function() {
		var filtersObj = {};
		for (var prop in filters) {
			if (prop === "filterComputed") {
				continue;
			}

			var actValue = filters[prop].value();

			if (actValue !== 0) {
				filtersObj[prop] = actValue;
			}
		}

		console.log(filtersObj);

		return filtersObj;
	}).extend({throttle: 500});

	filters.filterComputed = filterComputed;

	return filters;
};
