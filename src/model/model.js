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
	
	var idField = options.idField;
	var fields = options.fields;

	var proxy = options.proxy;

	//options.fields should be an array of objects
	//the objects should describe the fields:
	// - name
	// - type
	// - validators
	// - mapping
	// - defaultValue
	// - beforeChange
	// - afterChange

	function list(options, callback) {
		proxy.read(options, function(err, result) {
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

	function load(id, callback) {
		proxy.readOneById(id, function(err, result) {
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

		list: list,
		load: load,
		create: create
	});

	return model;
};