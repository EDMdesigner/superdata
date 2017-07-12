"use strict";

var ko = require("knockout");
var knob = require("knob-js");
var superData = require("../src/superData.js");

var theme = {
	theme: "default",
	colors: {
		primary: "#666",
		secondary: "#f4f4f4",

		info: {
			background: "#25aaf2"
		},
		success: {
			background: "#54c059"
		},
		warning: {
			background: "#f5a500"
		},
		error: {
			background: "#ee483b"
		},

		white: "#fff",

		lightGray: "#e6e6e6",
		mediumGray: "#cacaca",
		darkGray: "#8a8a8a",

		black: "#000",
		transparent: "transparent"
	}
};

knob.init(theme);

var memoryProxy = superData.proxy.memory({
	idProperty: "id",
	idType: "number",
	generateId: (function() {
		var nextId = 0;
		return function() {
			return nextId += 1;
		};
	}())
});

var callback = function (err, result) {
	console.log(err, result);
};

for (var idx = 0; idx < 1000; idx += 1) {
	var rand = Math.random();
	memoryProxy.createOne({
		num: rand,
		str: (rand < 0.5 ? "str" : "yo")
	}, callback);
}

var model = superData.model.model({
	fields: {
		id: {
			type: "number"
		},
		num: {
			type: "number",
			validators: [
				function(value) {
					return value === 1 || value === 2 || value === 3;
				}
			]
		},
		str: {
			type: "string"
		}
	},

	idField: "id",

	proxy: memoryProxy
});

model.create({
	num: 4,
	str: "asdf"
}, function(err, instance) {
	instance.data.num = 9;
	instance.save(function() {
		console.log("yo");
	});
});


var store = superData.store.store({
	model: model,
	proxy: memoryProxy
});

store.load({skip: 34, limit: 10}, function(err, result) {
	console.log(err, result);
});

ko.applyBindings({
	store: store
});
