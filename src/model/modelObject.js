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

	if(!options.data[options.model.idField]) {
		throw new Error("options.data has to have a property with same name as value of options.model.idField!");
	}

	if (!options.model.proxy) {
		throw new Error("options.model.proxy is mandatory!");
	}

	if(options.model.belongsTo && !Array.isArray(options.model.belongsTo)) {
		throw new Error("options.model.belongsTo has to be an array!");
	}

	if(Array.isArray(options.model.belongsTo)) {
		for(var i=0; i<options.model.belongsTo.length; i += 1) {
			if(!options.model.fields[options.model.belongsTo[i]]) {
				throw new Error("options.model.belongsTo has to contain field names!");
			}
		}
	}
	
	var model = options.model;

	var fields = options.model.fields;
	var idField = options.model.idField;
	var proxy = options.model.proxy;
	var belongsTo = options.model.belongsTo || [];


	var data = {};
	var belongsToValues = {};

	writeData(options.data);

	for(var i=0; i<belongsTo.length; i += 1) {
		if(!data[belongsTo[i]]) {
			throw new Error("data has to have properties for references given in belongsTo");
		}
	}

	var obj = {
		data: data,
		model: model,

		save: save,
		destroy: destroy
	};

	function writeData(dataToWrite) {

		data = {};
		belongsToValues = {};
		for (var prop in fields) {
			var actField = fields[prop];
			var actValue = dataToWrite.hasOwnProperty(prop) ? dataToWrite[prop] : actField.defaultValue;

			createProp(data, prop, {
				value: actValue,
				beforeChange: createBeforeChangeFunction(prop),
				afterChange: createAfterChangeFunction(prop)
			});
		}
		for(var i=0; i<belongsTo.length; i += 1) {
			belongsToValues[belongsTo[i]]=data[belongsTo[i]];
		}

	}

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

	function save(callback) {

		var id = data[idField];
		proxy.updateOneById(id, data, belongsToValues, function(err, result) {
			if (err) {
				return callback(err);
			}

			writeData(result);

			callback(null, obj);
		});
	}

	//deleted flag?
	function destroy(callback) {

		var id = data[idField];
		proxy.destroyOneById(id, belongsToValues, function(err) {
			if (err) {
				return callback(err);
			}

			callback(null, obj);
		});
	}

	return obj;
};
