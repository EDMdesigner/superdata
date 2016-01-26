/*jslint node: true */
"use strict";

var ko = require("knockout");
var createSorter = require("./sorter");

module.exports = function createSortersHandler(config) {
	var sorters = {};

	//filtersHandler can be implemented in a very similar way

	for (var prop in config.sorters) {
		sorters[prop] = createSorter({
			sortBy: prop,
			direction: config.sorters[prop],
			callback: setOthersToZero
		});
	}


	function setOthersToZero(sortBy, direction) {
		for (var prop in sorters) {
			if (prop === sortBy || prop === "sortComputed") {
				continue;
			}

			sorters[prop].direction(0);
		}
	}

	//enek kívülre kéne kerülnie, a listbe...
	// a sorterst kell it publikálni.
	var sortComputed = ko.computed(function() {
		var sortersObj = {};
		for (var prop in sorters) {
			if (prop === "sortComputed") {
				continue;
			}
			
			var actDir = sorters[prop].direction();

			if (actDir !== 0) {
				sortersObj[prop] = actDir;
			}
		}

		return sortersObj;
	}).extend({throttle: 1});

	sorters.sortComputed = sortComputed;

	return sorters;
};
