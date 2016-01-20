/*jslint node: true */
"use strict";

var createModelObject = require("./modelObject");

module.exports = function createModel(options) {
	var fields = options.fields;

	//options.fields should be an array of objects
	//the objects should describe the fields:
	// - name
	// - type
	// - validators
	// - mapping
	// - defaultValue
	// - beforeChange
	// - afterChange

	var proxy = options.proxy;
	var idField = options.idField;

	function list(options, callback) {
		proxy.read(options, function(err, result) {
			if (err) {
				return callback(err);
			}

			var data = [];

			result.forEach(function(item) {
				data.push(createModelObject({
					fields: fields,
					proxy: proxy,
					idField: idField,

					data: item
				}));
			});

			callback(null, data);
		});
	}

	function load(id, callback) {
		proxy.readOneById(id, function(err, result) {
			if (err) {
				return callback(err);
			}

			var modelObject = createModelObject({
				fields: fields,
				proxy: proxy,
				idField: idField,

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
				fields: fields,
				proxy: proxy,
				idField: idField,

				data: result
			}));
		});
	}

	return Object.freeze({
		fields: fields,
		proxy: proxy,
		idField: idField,

		list: list,
		load: load,
		create: create
	});
};