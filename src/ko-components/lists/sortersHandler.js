var createSorter = require("./sorter");

module.exports = function createSortersHandler(config) {
	var sorters = {};

	//filtersHandler can be implemented in a very similar way

	for (var prop in config.sorters) {
		sorters[prop] = sorter({
			store: store,
			sortBy: prop,
			direction: config.sorters[prop],
			callback: setOthersToZero
		});
	}



	function setOthersToZero(sortBy, direction) {
		for (var prop in sorters) {
			if (prop === sortBy) {
				continue;
			}
			sorters[prop].direction(0);
		}
	}

	var sortersComputed = ko.computed(function() {
		var sortersObj = {};
		for (var prop in sorters) {
			var actDir = sorters[prop].direction();

			if (actDir !== 0) {
				sortersObj[prop] = actDir;
			}
		}

		return sortersObj;
	}).extend({throttle: 1});

	return sortersComputed;
};
