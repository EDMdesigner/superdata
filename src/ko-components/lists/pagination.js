/*jslint node: true */
"use strict";

var ko = require("knockout");

module.exports = function createPagination(config) {
	config = config || {};
	var numOfItems = ko.observable(config.numOfItems || 0);
	var itemsPerPage = ko.observable(config.itemsPerPage || 10);

	var numOfPages = ko.computed(function() {
		var numOfItemsVal = numOfItems();
		var itemsPerPageVal = itemsPerPage();

		if (!itemsPerPageVal) {
			return 0;
		}

		return Math.ceil(numOfItemsVal / itemsPerPageVal);
	});

	var currentPage = (function() {
		var currentPage = ko.observable(/*normalize*/(config.currentPage || 0)); //normalization might be problematic when we want to load the nth page right after loading.

		function normalize(value) {
			if (value < 0) {
				value = 0;
			}

			var pagesNum = numOfPages();
			if (value >= pagesNum) {
				value = pagesNum - 1;
			}

			return value;
		}

		return ko.computed({
			read: function() {
				return currentPage();
			},
			write: function(value) {
				currentPage(normalize(value));
			}
		});
	}());


	function next() {
		currentPage(currentPage() + 1);
	}

	function prev() {
		currentPage(currentPage() - 1);
	}


	var pageSelectors = (function(config) {
		var afterHead = config.afterHead || 2;
		var beforeTail = config.beforeTail || 2;
		var beforeCurrent = config.beforeCurrent || 2;
		var afterCurrent = config.afterCurrent || 2;

		function createPageSelector(idx, isCurrentPage) {
			return {
				label: idx + 1,
				selectPage: function() {
					currentPage(idx);
				}
			};
		}

		function createNonClickableSelector(label) {
			return {
				label: label,
				selectPage: function() {}
			};
		}

		return ko.computed(function() {
			var elements = [];

			var numOfPagesVal = numOfPages();
			var currentPageVal = currentPage();

			var nonClickableInserted = false;
			for (var idx = 0; idx < numOfPagesVal; idx += 1) {
				if (idx <= afterHead || idx >= numOfPagesVal - beforeTail -1 || (idx >= currentPageVal - beforeCurrent && idx <= currentPageVal + afterCurrent)) {
					var pageSelector;

					if (idx === currentPageVal) {
						pageSelector = createNonClickableSelector(idx + 1);
					} else {
						pageSelector = createPageSelector(idx);
					}

					elements.push(pageSelector);
					nonClickableInserted = false;
				} else {
					if (!nonClickableInserted) {
						elements.push(createNonClickableSelector("..."));
					}
					nonClickableInserted = true;
				}
			}

			return elements;
		});
	}(config));

	return {
		pageSelectors: pageSelectors,

		next: next,
		prev: prev,

		currentPage: currentPage,

		numOfItems: numOfItems,
		itemsPerPage: itemsPerPage,
		numOfPages: numOfPages
	};
};
