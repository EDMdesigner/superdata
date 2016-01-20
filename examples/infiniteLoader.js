/*jslint node: true */
"use strict";

var ko = require("knockout");
var exampleDataLayer = require("./exampleDataLayer");

var store = exampleDataLayer.store;


var infiniteLoader = infiniteLoaderVm({
	store: store,
	numOfItems: 100,
	numOfItemsToLoad: 50
});

/*
setInterval(function() {
	var windowHeight = window.innerHeight;
	var scrollY = window.scrollY;
	var documentHeight = document.body.offsetHeight;

	console.log(windowHeight, scrollY, documentHeight);

	if (windowHeight + scrollY > documentHeight / 2) {
		infiniteLoader.loadMore();
		console.log("loading more...");
	}
}, 500);
*/
ko.applyBindings(infiniteLoader);

function infiniteLoaderVm(config) {
	var store = config.store;


	var numOfItems = config.numOfItems || 10;
	var numOfItemsToLoad = config.numOfItemsToLoad || 10;

	var elements = ko.observableArray([]);

	var loading = ko.observable(true);

	load(0, numOfItems);

	function load(skip, limit) {
		//sort, filter...

		loading(true);
		store.load(function(err, result) {
			//TODO apply row vm!
			result.forEach(function(item) {
				elements.push(item);
			});
			numOfItems = skip + limit;
			loading(false);
		});
	}


	function loadMore() {
		load(numOfItems, numOfItemsToLoad);
	}


	return {
		elements: elements,

		loading: loading,

		loadMore: loadMore
	};
}