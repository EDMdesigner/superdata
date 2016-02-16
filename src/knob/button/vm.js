/*jslint node: true */
"use strict";

var ko = require("knockout");

var base = require("../base/vm");

function createButton(config) {
	config.component = "button";

	var vm = base(config);

	vm.icon = ko.observable(config.icon);
	vm.label = ko.observable(ko.unwrap(config.label));
	vm.click = config.click || function() {};

	return vm;
}

module.exports = createButton;
