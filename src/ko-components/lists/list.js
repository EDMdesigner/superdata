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

	var loading = ko.observable(false);
	var error = ko.observable(false);



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

		//paginatedList should remove all of the items before every load
		//infiniteList should remove them only when sorters or finders have been changed.
		store.items.forEach(function(item) {
			if (typeof itemVm === "function") {
				item = itemVm(item);
			}
			items.push(item);
		});
	}


	store.before.add(beforeLoad);
	store.after.add(afterLoad);

	return {
		fields: fields, //should filter to the fields. (select)
		labels: labels,

		filters: filters,
		sorters: sorters,

		skip: skip,
		limit: limit,

		items: items,

		loading: loading,
		error: error
	};
};
