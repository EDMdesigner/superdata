/*jslint node: true */
"use strict";

var createProp = require("../model/prop");

module.exports = function createStore(options) {
	if (!options) {
		options = {};
	}

	if (!options.model) {
		throw new Error("options.model is mandatory!");
	}

	var model = options.model;
	var proxy = model.proxy;

	//var autoLoad;
	//var autoSync;


	var store = {
		//data: data,
		model: model,
		proxy: proxy,

		items: [],
		count: 0,

		load: load,
		add: add
	};

	var triggerQueryChanged = (function() {
		var queryChanged = null;
		return function triggerQueryChanged() {
			if (queryChanged) {
				return;
			}

			queryChanged = setTimeout(function() {
				queryChanged = null;
				load();
			}, 0);
		};
	}());

	//maybe these should be on a separate query object.
	createProp(store, "find", {
		//lastValue, value, newValue, initialValue
		value: options.find || {},
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	//also, find and sort properties are not very good as simple props... They should be "propObjects" or something...
	//that way their fields' changes would be triggered as well.
	createProp(store, "sort", {
		value: options.sort || {id: -1},
		beforeChange: function() {
		},
		afterChange: triggerQueryChanged
	});

	createProp(store, "skip", {
		value: options.skip || 0,
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	createProp(store, "limit", {
		value: options.limit || 10,
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	createProp(store, "belongsToValues", {
		value: options.belongsToValues || {},
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	createProp(store, "select", {
		value: options.select || {},
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	//var group = "?good question?";

	//var buffered;

	//var remoteFilter;
	//var remoteGroup;
	//var remoteSort;


	//var actPage = options.actPage || 0;
	//var numOfItems = 0;
	//var numOfPages = 0;

	//model instances should be stored somewhere by id as well.
	//in the data array, there should be references to those instances... although it would be complicated when loaded from localStorage.
	//maybe we should store only the id-s of the elements in the data array...
	//var prefetchedData = {
	//	"{sorters: {id: 1}, filters: {}": [{skip: 0, ids: []}]
	//};
	//var prefetchedDataStorage = [];

	//function getData() {
	//	return prefetchedData[currentPage].data;
	//}


	//skip and limit should be properties as well
	//if skip, limit, find or sort changes, then the load method should be called automatically.


	//every load call should have an id.
	//this way we can set up

	function load() {
		var queryObj = {
			find: store.find,
			sort: store.sort,
			skip: store.skip,
			limit: store.limit,
			select: store.select
		};

		load.before(queryObj);

		model.list(queryObj, store.belongsToValues, function(err, result) {
			if (err) {
				return load.after(err);
			}

			store.items.splice(0, store.items.length);
			for (var idx = 0; idx < result.items.length; idx += 1) {
				store.items.push(result.items[idx]);
			}
			store.count = result.count;

			load.after(null, result);
		});
	}

	load.before = createCallbackArrayCaller(store, []); //later we can add default callbacks
	load.after = createCallbackArrayCaller(store, []);

	function createCallbackArrayCaller(thisArg, array) {
		function callbackArrayCaller(err) {
			array.forEach(function(actFunction) {
				actFunction.call(thisArg, err);
			});
		}

		callbackArrayCaller.add = function(func) {
			if (typeof func !== "function") {
				return;
			}

			array.push(func);
		};

		callbackArrayCaller.remove = function(func) {
			var idx = array.indexOf(func);

			if (idx > -1) {
				array.splice(idx, 1);
			}
		};

		return callbackArrayCaller;
	}


	function add(data, callback) {
		model.create(data, callback);
	}




	return store;
};