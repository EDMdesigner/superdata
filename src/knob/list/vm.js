/*jslint node: true */
"use strict";

var ko = require("knockout");



module.exports = function createList(config) {
	var store = config.store;

	var fields = config.fields;

	var search = ko.observable("");
	var sort = ko.observable({});

	//config.sorters
	// - label
	// - prop
	var sortOptions = [
		{
			label: "name asc",
			value: {name: 1}
		},
		{
			label: "name desc",
			value: {name: -1}
		},
		{
			label: "email asc",
			value: {email: 1}
		},
		{
			label: "email desc",
			value: {email: -1}
		}
	];

	var skip = ko.observable(0);
	var limit = ko.observable(10);


	var items = ko.observableArray([]);

	var count = ko.observable(0); //should be read-only

	var loading = ko.observable(false); //should be read-only
	var error = ko.observable(false); //should be read-only?



	ko.computed(function() {
		var skipVal = skip();
		var limitVal = limit();

		store.skip = skipVal;
		store.limit = limitVal;
	}).extend({throttle: 0});

	function beforeLoad() {
		if (loading()) {
			console.log("List is already loading..."); //this might be problematic if there are no good timeout settings.
		}

		loading(true);
	}

	function afterLoad(err) {
		loading(false);
		if (err) {
			return error(err);
		}
		error(null);

		store.items.forEach(function(item) { //store === this
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

		sortOptions: sortOptions,

		skip: skip,
		limit: limit,

		items: items,
		count: readOnlyComputed(count),

		loading: readOnlyComputed(loading),
		error: readOnlyComputed(error)
	};
};
