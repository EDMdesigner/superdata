/*jslint node: true */
"use strict";

var storage = (function() {
	try {
		var testDate = new Date();
		localStorage.setItem(testDate, testDate);
		var isSame = localStorage.getItem(testDate) === testDate;
		localStorage.removeItem(testDate);
		return isSame && localStorage;
	} catch(e) {
		return false;
	}
}());

var createMemoryProxy = require("./memory");

module.exports = function(config) {
	var memoryProxy = createMemoryProxy(config);
	var proxyName = config.name || "lsProxy";

	if (storage) {
		JSON.parse(storage.getItem(proxyName)).forEach(function(item) {
			memoryProxy.createOne(item, function() {});
		});
	}

	function createWrapperFunction(prop) {
		return function saveToLocalStorageWrapper() {
			memoryProxy[prop](arguments);

			memoryProxy.read({}, function(err, result) {
				if (err) {
					return console.log(err);
				}

				if (storage) {
					storage.setItem(proxyName, JSON.stringify(result));
				}
			});
		};
	}


	return Object.freeze({
		idProperty: memoryProxy.idProperty,
		generateId: memoryProxy.generateId,


		read: memoryProxy.read,

		createOne: createWrapperFunction("createOne"),

		readOneById: memoryProxy.readOneById,
		updateOneById: createWrapperFunction("updateOneById"),
		destroyOneById: createWrapperFunction("destroyOneById")
	});
};
