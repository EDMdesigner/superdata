"use strict";

var ko = require("knockout");
var knob = require("knob-js");
var superData = require("../../../src/superData");

// var createProxy = superData.proxy.ajax;
var createRestProxy = superData.proxy.rest;
var createModel = superData.model.model;
var createStore = superData.store.store;

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

var proxy = createRestProxy({
	idProperty: "id",
	route: "http://localhost:7357/user",
	reader: {
		root: "items",
		count: "count"
	}
});

var model = createModel({
	fields: {
		id: {
			type: "number"
		},
		email: {
			type: "string"
		},
		name: {
			type: "string"
		},
		title: {
			type: "string"
		}
	},
	idField: "id",
	proxy: proxy
});
var store = createStore({
	model: model
});

//*
//seed
//atom

store.load.after.add(function() {
	//Createone OK
	// console.log(store.items);
	//read OK
	// store.model.list({},function (err, data) {
	// 	console.log("(read):");
	// 	console.log(err, data);
	// });

	//readOneById
	store.proxy.readOneById(0, function(err, res) {
		console.log("(readOneById)");
		console.log(err, res);
	});

	//updateOneById OK
	// console.log("Items 0:");
	// console.log(store.items[1]);
	// store.items[1].data.email = "asdfsadf";
	// console.log("Items 0 after change:");
	// store.items[1].save(function(err, data) {
	// 	console.log("(updateOneById):");
	// 	console.log(err, data);
	// });
	// console.log(store.items[1]);

	//destroyOneById
	store.items[3].destroy(function(err, res) {
		console.log("(destroy)");
		console.log(err, res);
		store.proxy.readOneById(res.data.id, function(err, res) {
			console.log("(readOneById)");
			console.log(err, res);
		});
	});
});


var seed = true;
function handleResponse() {
	// console.log(err, result);
}
if (seed) {
	var names = ["Bob", "Rob", "Olga", "Helga"];
	var titles = ["CEO", "CTO", "Ninja"];
	for (var idx = 0; idx < 100; idx += 1) {
		var actName = names[idx % 4];
		store.add({
			id: idx,
			email: actName.toLowerCase() + "_" + idx + "@supercorp.com",
			name: actName,
			title: titles[idx % 3]
		}, handleResponse);
	}
}

store.limit = 100;

var pagedListConfig = {
	store: store,

	fields: ["id", "email", "name", "title"],

	labels: {
		email: "E-mail",
		name: "Name",
		title: "Very title"
	},

	filters: {
		name: "regex"
	},

	sorters: {
		id: 1,
		email: 0
	},

	pagination: {
		currentPage: 0,
		itemsPerPage: 5,

		afterHead: 1,
		beforeTail: 1,
		afterCurrent: 1,
		beforeCurrent: 1
	}
};

ko.applyBindings(pagedListConfig);
