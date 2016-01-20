/*jslint node: true */
"use strict";

var ko = require("knockout");

module.exports = function createList(config) {
	var elements = ko.observableArray([]);
	var loading = ko.observable(false);
	var error = ko.observable(false);

	//config.rowVm should be applied on all of the elements!

	return {
		elements: elements,

		loading: loading,
		error: error
	};
};
