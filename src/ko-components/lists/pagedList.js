/*jslint node: true */
"use strict";

var ko = require("knockout");
var createList = require("./list");
var createPagination = require("./pagination");

module.exports = function createPagedList(config) {
	config = config || {};
	config.pagination = config.pagination || {};
	config.pagination.currentPage = config.pagination.currentPage || 0;
	config.pagination.itemsPerPage = config.pagination.itemsPerPage || 0;

	var store = config.store;


	var list = createList(config);
	var pagination = createPagination(config.pagination);
	list.pagination = pagination;

	ko.computed(function() {
		var currentPage = pagination.currentPage();
		var itemsPerPage = pagination.itemsPerPage();
		list.skip(currentPage * itemsPerPage);
	});

	ko.computed(function() {
		var count = list.count();
		list.pagination.numOfItems(count);
	});

	function beforeLoad() {
		list.items([]);
	}

	store.load.before.add(beforeLoad);

	return list;
};
