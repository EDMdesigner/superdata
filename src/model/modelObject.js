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

	if (typeof options.data[options.model.idField] === "undefined") {
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

	var writeOutput = writeData(options.data);
	var belongsToValues = writeOutput.belongsToValues;

	var obj = {
		data: writeOutput.data,
		model: model,

		save: save,
		patch: patch,
		destroy: destroy
	};

	for(var i=0; i<belongsTo.length; i += 1) {
		if(!obj.data[belongsTo[i]]) {
			throw new Error("data has to have properties for references given in belongsTo");
		}
	}

	var lastDataValue = JSON.parse(JSON.stringify(obj.data));

	function writeData(dataToWrite) {

		var data = {};
		var belongsToValues = {};
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

		return {
			data: data,
			belongsToValues: belongsToValues
		};
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

	function createDiff() {
		var diff = {};
		for (var prop in obj.data) {
			if (obj.data.hasOwnProperty(prop)) {
				if (JSON.stringify(obj.data[prop]) !== JSON.stringify(lastDataValue[prop])) {
					diff[prop] = obj.data[prop];
				}
			}
		}
		return diff;
	}

	function save(callback) {
		var diff = createDiff();

 		if (Object.keys(diff).length === 0) {
			return callback(null, obj);
		} 

		var id = obj.data[idField];
		proxy.updateOneById(id, obj.data, belongsToValues, function(err, result) {
			if (err) {
				return callback(err);
			}

			var writeOutput = writeData(result);
			belongsToValues = writeOutput.belongsToValues;
			obj.data = writeOutput.data;
			lastDataValue = JSON.parse(JSON.stringify(writeOutput.data));

			callback(null, obj);
		});
	}

	function patch(callback) {
		var diff = createDiff();

 		if (Object.keys(diff).length === 0) {
			return callback(null, obj);
		}

		var id = obj.data[idField];
		proxy.patchOneById(id, diff, belongsToValues, function(err, result) {
			if (err) {
				return callback(err);
			}

			var writeOutput = writeData(result);
			belongsToValues = writeOutput.belongsToValues;
			obj.data = writeOutput.data;
			lastDataValue = JSON.parse(JSON.stringify(writeOutput.data));

			callback(null, obj);
		});
	}

	//deleted flag?
	function destroy(callback) {

		var id = obj.data[idField];
		proxy.destroyOneById(id, belongsToValues, function(err) {
			if (err) {
				return callback(err);
			}

			callback(null, obj);
		});
	}

	return obj;
};
