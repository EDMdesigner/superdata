/*jslint node: true */
"use strict";

var createProp = require("./prop");

module.exports = function createModelObject(options) {
	if (!options) {
		options = {};
	}

	if (!options.data) {
		throw new Error("options.data is mandatory!");
	}

	if (!options.model) {
		throw new Error("options.model is mandatory!");
	}

	if (!options.model.fields) {
		throw new Error("options.model.fields is mandatory!");
	}

	if (!options.model.idField) {
		throw new Error("options.model.idField is mandatory!");
	}

	if (!options.model.proxy) {
		throw new Error("options.model.proxy is mandatory!");
	}

	if(options.model.references && !Array.isArray(options.model.references)) {
		throw new Error("options.model.references has to be an array!");
	}
	
	var model = options.model;

	var fields = options.model.fields;
	var idField = options.model.idField;
	var proxy = options.model.proxy;
	//var references = options.model.references || [];


	var data = {};

	for (var prop in fields) {
		var actField = fields[prop];
		var actValue = options.data.hasOwnProperty(prop) ? options.data[prop] : actField.defaultValue;

		createProp(data, prop, {
			value: actValue,
			beforeChange: createBeforeChangeFunction(prop),
			afterChange: createAfterChangeFunction(prop)
		});
	}

	var obj = {
		data: data,
		model: model,

		read: read,
		save: save,
		destroy: destroy
	};

	function createBeforeChangeFunction(propName) {
		return function beforeChange(values) {
			validate(propName, values);

			//var field = fields[propName];

/*
			if (field.beforeChange) {
				if (typeof field.beforeChange === "function") {

				}
			}
*/
		};
	}

	function createAfterChangeFunction() {
		return function afterChange() {
			//call the onChange listeners
		};
	}


	function validate(propName) {
		var field = fields[propName];

		if (!field) {
			return;
		}

		if (!field.validators) {
			return;
		}
	}

	function read(callback) {
		var id = data[idField];
		proxy.readOneById(id, function(err, result) {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	}

	function save(callback) {
		var id = data[idField];
		proxy.updateOneById(id, data, function(err, result) {
			if (err) {
				return callback(err);
			}

			for (var prop in result) {
				data[prop] = result[prop];
			}

			callback(null, obj);
		});
	}

	//deleted flag?
	function destroy(callback) {
		var id = data[idField];
		proxy.destroyOneById(id, function(err) {
			if (err) {
				return callback(err);
			}

			callback(null, obj);
		});
	}

	return obj;
};
