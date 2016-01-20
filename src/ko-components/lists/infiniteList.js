/*jslint node: true */
"use strict";

var ko = require("knockout");

var createList = require("./list");

module.exports = function createInfiniteList(config) {
	var store = config.store;
	var numOfItems = config.numOfItems || 10;
	var numOfItemsToLoad = config.numOfItemsToLoad || 10;
	var skip = 0;

	//TODO: Find out a nice way to pass a callback which is responsible for automatically loading more data.

	var list = createList(config);

	store.load.before = function(err, result) {
	};

	store.load.after = function(err, result) {
		if (err) {
			return list.error(err);
		}
		list.error(null);

		result.forEach(function(item) {
			list.elements.push(item);
		});
		numOfItems += numOfItemsToLoad;
		list.loading(false);
	};

	load(0, numOfItems);
	function load(skip, limit) {
		list.loading(true);

		store.skip = skip;
		store.limit = limit;
	}

	function loadMore() {
		load(numOfItems, numOfItemsToLoad);
	}

	list.loadMore = loadMore;

	return list;
};
