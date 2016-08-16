/*jslint node: true */
"use strict";

var createModelObject = require("./modelObject");

module.exports = function createModel(options) {
	if (!options) {
		options = {};
	}

	if (!options.idField) {
		throw new Error("options.idField is mandatory!");
	}

	if (!options.fields) {
		throw new Error("options.fields is mandatory!");
	}

	if (!options.proxy) {
		throw new Error("options.proxy is mandatory!");
	}

	if(options.belongsTo && !Array.isArray(options.belongsTo)) {
		throw new Error("options.belongsTo has to be an array!");
	}
	
	if(Array.isArray(options.belongsTo)) {
		for(var i=0; i<options.belongsTo.length; i += 1) {
			if(!options.fields[options.belongsTo[i]]) {
				throw new Error("options.belongsTo has to contain field names!");
			}
		}
	}
	
	var idField = options.idField;
	var fields = options.fields;

	var proxy = options.proxy;

	var belongsTo = options.belongsTo || [];

	//options.fields should be an array of objects
	//the objects should describe the fields:
	// - name
	// - type
	// - validators
	// - mapping
	// - defaultValue
	// - beforeChange
	// - afterChange

	function checkReferences(belongsToValues) {
		for(var i = 0; i < belongsTo.length; i += 1) {
			if(!belongsToValues[belongsTo[i]]) {
				return false;
			}
		}
		return true;
	}

	function checkReferenceTypes(belongsToValues) {
		for(var i = 0; i < belongsTo.length; i += 1) {
			if(typeof belongsToValues[belongsTo[i]] !== fields[belongsTo[i]].type) {
				return false;
			}
		}
		return true;
	}

	function list(options, belongsToValues, callback) {
		if(!callback) {
			callback = belongsToValues;
			belongsToValues = undefined;
		}
		if(!checkReferences(belongsToValues)) {
			return callback("belongsToValues has to have properties for references given in belongsTo");
		}
		if(!checkReferenceTypes(belongsToValues)) {
			return callback("Each property of belongsToValues has to match type with corresponding property of options.fields");
		}
		var filters = {};
		for(var i=0; i<belongsTo.length; i += 1) {
			filters[belongsTo[i]] = belongsToValues[belongsTo[i]];
		}
		proxy.read(options, filters, function(err, result) {
			if (err) {
				return callback(err);
			}

			var data = [];

			result.items.forEach(function(item) {
				data.push(createModelObject({
					model: model,

					data: item
				}));
			});

			var resultObj = {
				items: data,
				count: result.count
			};

			callback(null, resultObj);
		});
	}

	function load(id, belongsToValues, callback) {
		if(!callback) {
			callback = belongsToValues;
			belongsToValues = undefined;
		}
		if(!checkReferences(belongsToValues)) {
			return callback("belongsToValues has to have properties for references given in belongsTo");
		}
		if(!checkReferenceTypes(belongsToValues)) {
			return callback("Each property of belongsToValues has to match type with corresponding property of options.fields");
		}
		var filters = {};
		for(var i=0; i<belongsTo.length; i += 1) {
			filters[belongsTo[i]] = belongsToValues[belongsTo[i]];
		}
		proxy.readOneById(id, filters, function(err, result) {
			if (err) {
				return callback(err);
			}

			var modelObject = createModelObject({
				model: model,

				data: result
			});
			callback(null, modelObject);
		});
	}

	function create(modelValues, callback) {
		if(!checkReferences(modelValues)) {
			return callback("modelValues has to have properties for references given in belongsTo");
		}
		if(!checkReferenceTypes(modelValues)) {
			return callback("Each property of modelValues contained by belongsTo has to match type with corresponding property of options.fields");
		}
		proxy.createOne(modelValues, function(err, result) {
			if (err) {
				return callback(err);
			}

			callback(null, createModelObject({
				model: model,

				data: result
			}));
		});
	}

	var model = Object.freeze({
		fields: fields,
		proxy: proxy,
		idField: idField,
		belongsTo: belongsTo,

		list: list,
		load: load,
		create: create
	});

	return model;
};