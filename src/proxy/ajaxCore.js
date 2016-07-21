/*
 * Ajax proxy core
 */

/*jslint node: true */
"use strict";

module.exports = function(dependencies) {

	if (!dependencies.ajaxHelpers) {
		throw new Error("dependencies.ajaxHelpers is mandatory!");
	}

	if (!dependencies.FormData) {
		throw new Error("dependencies.FormData is mandatory!");
	}

	var ajaxHelpers = dependencies.ajaxHelpers;
	var createOperationConfig = ajaxHelpers.createOperationConfig;
	var dispatchAjax = ajaxHelpers.dispatchAjax;
	var prepareOperationsConfig = ajaxHelpers.prepareOperationsConfig;
	var assert = ajaxHelpers.assert;
	var FormData = dependencies.FormData;
	
	return function createAjaxProxy(config) {
		if (!config) {
			config = {};
		}

		if (!config.idProperty) {
			throw new Error("config.idProperty is mandatory!");
		}

		if (!config.operations) {
			throw new Error("config.operations is mandatory!");
		}

		if(config.fieldsToBeExcluded) {
			if(!(config.fieldsToBeExcluded instanceof "Array")) {
				throw Error("config.fieldsToBeExcluded should be an array");
			}
		}

		var idProperty = config.idProperty;

		var generateId = config.generateId || (function() {
			var nextId = 0;

			return function() {
				return nextId += 1;
			};
		}());

		var queryMapping = config.queryMapping;

		var fieldsToBeExcluded = config.fieldsToBeExcluded;

		function removeFields(object, fields) {
			if(!fields){
				return;
			}

			for(var i = 0; i < fields.length; i += 1){
				for(var prop in object){
					if(fields[i] === prop){
						delete object[prop];
					}
				}
			}
		}

		prepareOperationsConfig(config.operations);

		function createOne(data, callback) {
			removeFields(data, fieldsToBeExcluded);

			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.createOne, null, data);

			if (data.constructor === FormData) {
				actConfig.formData = true;
			}

			actConfig.timeout = config.timeout;
			actConfig.idProperty = idProperty;

			dispatchAjax(actConfig, callback);
		}

		function read(options, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);
			if (typeof queryMapping === "function") {
				options = queryMapping(options);
			}
			var actConfig = createOperationConfig(config.operations.read);

			for (var prop in options) {
				actConfig.queries[prop] = options[prop];
			}
			actConfig.method = actConfig.method.toLowerCase();
			dispatchAjax(actConfig, filters, callback);
		}

		function readOneById(id, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.readOneById, id);
			dispatchAjax(actConfig, filters, callback);
		}

		function updateOneById(id, newData, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			removeFields(newData, fieldsToBeExcluded);

			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.updateOneById, id, newData);
			dispatchAjax(actConfig, filters, callback);
		}

		function destroyOneById(id, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.destroyOneById, id);
			dispatchAjax(actConfig, filters, callback);
		}

		function checkCallback(callback) {
			assert(typeof callback === "function", "callback should be a function");
		}

		return Object.freeze({
			idProperty: idProperty,
			generateId: generateId,
			config: config,

			read: read,

			createOne: createOne,

			readOneById: readOneById,
			updateOneById: updateOneById,
			destroyOneById: destroyOneById
		});
	};
};