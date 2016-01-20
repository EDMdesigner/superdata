/*jslint node: true */
"use strict";

var createMemoryProxy = require("./memory");

module.exports = function createDelayedMemoryProxy(config) {
	var memoryProxy = createMemoryProxy(config);
	var delay = config.delay || 1000;

	var wrapper = {};

	function addWrapperFunction(name, func) {
		wrapper[name] = function() {
			var args = arguments;
			setTimeout(function() {
				func.apply(this, args);
			}, delay);
		};
	}

	for (var prop in memoryProxy) {
		var actFunction = memoryProxy[prop];

		if (typeof actFunction === "function") {
			addWrapperFunction(prop, actFunction);
		}
	}

	return Object.freeze(wrapper);
};