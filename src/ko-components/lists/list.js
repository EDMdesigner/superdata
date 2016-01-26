/*jslint node: true */
"use strict";

var ko = require("knockout");

var sortersHandler = require("./sortersHandler.js");


module.exports = function createList(config) {
	var store = config.store;

	var fields = config.fields;
	var labels = config.labels;

	var filters = null;
	var sorters = sortersHandler(config);

	var skip = ko.observable(0);
	var limit = ko.observable(10);


	var items = ko.observableArray([]);
	var itemVm = config.itemVm;

	var count = ko.observable(0); //should be read-only

	var loading = ko.observable(false); //should be read-only
	var error = ko.observable(false); //should be read-only?



	ko.computed(function() {
		//var filtersVal = filters();
		var sortersVal = sorters();
		var skipVal = skip();
		var limitVal = limit();

		//store.find = filtersVal;
		store.sort = sortersVal;
		store.skip = skipVal;
		store.limit = limitVal;
	}).extend({throttle: 1});

	function beforeLoad() {
		if (loading()) {
			throw "List is already loading..."; //this might be problematic if there are no good timeout settings.
		}

		loading(true);
	}

	function afterLoad(err) {
		loading(false);
		if (err) {
			return error(err);
		}
		error(null);

		//paginatedList should remove all of the items before every load
		//infiniteList should remove them only when sorters or finders have been changed.
		store.items.forEach(function(item) { //store === this
			if (typeof itemVm === "function") {
				item = itemVm(item);
			}
			items.push(item);
		});

		count(store.count);
	}

	function readOnlyComputed(observable) {
		return ko.computed({
			read: function() {
				return observable();
			},
			write: function() {
				throw "This computed variable should not be written.";
			}
		});
	}


	store.load.before.add(beforeLoad);
	store.load.after.add(afterLoad);

	return {
		fields: fields, //should filter to the fields. (select)
		labels: labels,

		filters: filters,
		sorters: sorters,
		skip: skip,
		limit: limit,

		items: items,
		count: readOnlyComputed(count),

		loading: readOnlyComputed(loading),
		error: readOnlyComputed(error)
	};
};
