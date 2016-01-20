/*jslint node: true */
"use strict";

var ko = require("knockout");

module.exports = function createPagination(config) {
	var numOfItems = ko.observable(0);
	var itemsPerPage = ko.observable(0);

	var numOfPages = ko.computed(function() {
		return Math.ceil(numOfItems() / itemsPerPage());
	});

	var currentPage = (function() {
		var currentPage = ko.observable(0);

		return ko.computed({
			read: function() {
				return currentPage();
			},
			write: function(value) {
				if (value < 0) {
					value = 0;
				}

				value %= numOfPages;

				currentPage(value);
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
				if (idx < afterHead || idx > numOfPagesVal - beforeTail || idx > currentPageVal - beforeCurrent || idx < currentPageVal + afterCurrent) {
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
