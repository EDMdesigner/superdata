/*
 * LocalStorage proxy core
 */

 /*jslint node: true */
 "use strict";

module.exports = function(dependencies) {

	if (!dependencies.createMemoryProxy) {
		throw new Error("dependencies.createMemoryProxy is mandatory!");
	}

	if (!(typeof dependencies.storage === "object" || typeof dependencies.storage === "boolean")) {
		throw new Error("dependencies.storage is mandatory!");
	}

	var createMemoryProxy = dependencies.createMemoryProxy;
	var storage = dependencies.storage;

	return function createLocalStorageProxy(config) {
		var memoryProxy = createMemoryProxy(config);
		var proxyName = config.name || "lsProxy";

		if (storage) {
			var localData = JSON.parse(storage.getItem(proxyName));

			if (localData) {
				localData.items.forEach(function(item) {
					memoryProxy.createOne(item, function() {});
				});
			}
		}

		function createWrapperFunction(prop) {
			return function saveToLocalStorageWrapper() {
				memoryProxy[prop].apply(this, arguments);

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
			patchOneById: createWrapperFunction("patchOneById"),
			destroyOneById: createWrapperFunction("destroyOneById")
		});
	};
};
