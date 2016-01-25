/*jslint node: true */
"use strict";

var ko = require("knockout");

var createList = require("./list");

module.exports = function createInfiniteList(config) {
	var store = config.store;
	var numOfItems = config.numOfItems || 10;
	var numOfItemsToLoad = config.numOfItemsToLoad || 10;
	var skip = 0;


	var list = createList(config);
	//+sorters & filters

	var loadMoreCalled = false;

	store.load.before.add(function(err, result) {
		if (!loadMoreCalled) {
			//empty element array
		}

		loadMoreCalled = false;
	});

	//this should be in list.js
	store.load.after.add(function(err, result) {
		if (err) {
			return list.error(err);
		}
		list.error(null);

		result.items.forEach(function(item) {
			list.elements.push(item);
		});
		numOfItems += numOfItemsToLoad;
		list.loading(false);
	});

	load(0, numOfItems);
	function load(skip, limit) {
		list.loading(true);

		store.skip = skip;
		store.limit = limit;
	}

	function loadMore() {
		loadMoreCalled = true;
		load(numOfItems, numOfItemsToLoad);
	}

	list.loadMore = loadMore;

	return list;
};
