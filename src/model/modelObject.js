/*jslint node: true */
"use strict";

var createProp = require("./prop");

module.exports = function createModelObject(options) {
	var fields = options.model.fields;
	var idField = options.model.idField;
	var proxy = options.model.proxy;
	var model = options.model;

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

			var field = fields[propName];

			if (field.beforeChange) {
				if (typeof field.beforeChange === "function") {

				}
			}
		};
	}

	function createAfterChangeFunction(propName) {
		return function afterChange(values) {
			//call the onChange listeners
		};
	}


	function validate(propName, values) {
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
		proxy.destroyOneById(id, function(err, result) {
			if (err) {
				return callback(err);
			}

			callback(null, obj);
		});
	}

	return obj;
};
