var ko = require("knockout");

var sortersHandler = require("../sortersHandler.js");

module.exports = function infiniteLoaderVm(config) {
	var store = config.store;

	store.load.before = function(err, result) {
		console.log("before load");
	};

	store.load.after = function(err, result) {
		console.log("after load");

		if (err) {
			return error(err);
		}
		error(null);
		//TODO apply row vm!
		elements([]);

		result.forEach(function(item) {
			elements.push(item);
		});
		numOfItems = skip + numOfItemsToLoad;
		loading(false);
	};


	var find = config.find;

	var fields = config.fields;
	var labels = config.labels;

	var filters = null; //filtersHandler(config);
	var sorters = sortersHandler(config);

	var pagination = null;

	//store.on("load", function(...) {...});

	var numOfItems = config.numOfItems || 10;
	var numOfItemsToLoad = config.numOfItemsToLoad || 10;

	var skip = 0;

	var elements = ko.observableArray([]);

	var loading = ko.observable(true);
	var error = ko.observable(null);

	load(0, numOfItems);

	function load(skip, limit) {
		loading(true);

		store.skip = skip;
		store.limit = limit;
	}

	function loadMore() {
		load(numOfItems, numOfItemsToLoad);
	}


	var obj = {
		fields: fields,
		labels: labels,

		filters: filters,
		sorters: sorters,

		pagination: pagination,

		elements: elements,
		loading: loading,
		error: error
	};

	if (!config.infiniteScrolling) {
		obj.loadMore = loadMore;
	}

	return obj;
};
