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

var createModel = superData.model.model;
var createStore = superData.store.store;


/* AJAX + MEMORY PROXY
var proxy = superData.proxy.localStorage({
	idProperty: "_id",
	idType: "number",
	operations: {
		read: {
			route: "http://localhost:7357/user",
			method: "GET",
			reader: {
				root: "items",
				count: "count"
			}
		},
		createOne: {
			route: "http://localhost:7357/user",
			method: "POST"
		},
		readOneById: {
			route: "http://localhost:7357/user/:id",
			method: "GET"
		},
		updateOneById: {
			route: "http://localhost:7357/user/:id",
			method: "PUT"
		},
		patchOneById: {
			route: "http://localhost:7357/user/:id",
			method: "PATCH"
		},
		destroyOneById: {
			route: "http://localhost:7357/user/:id",
			method: "DELETE"
		}
	},
});
//*/

//* REST PROXY
var proxy = superData.proxy.rest({
	idProperty: "id",
	route: "http://localhost:7357/user",
	reader: {
		root: "items",
		count: "count"
	},
	queries: {
		read: {
			token: "exampleAccessToken"
		}
	}
});
//*/

var model = createModel({
	fields: {
		/*jslint nomen: true*/
		_id: {
		/*jslint nomen: false*/
			type: "number"
		},
		title: {
			type: "string"
		},
		url: {
			type: "string"
		},
		createdAt: {
			type: "date"
		}
	},
	idField: "_id",
	proxy: proxy
});
var store = createStore({
	model: model
});

//* seed


var seed = false;
function handleResponse(err, result) {
	result = result;
	if (err) {
		console.log(err);
	}
}

if (seed) {
	var names = ["Bob", "Rob", "Olga", "Helga"];
	// var titles = ["CEO", "CTO", "Ninja"];
	for (var idx = 0; idx < 1; idx += 1) {
		var actName = names[idx % 4];
		store.add({
			title: idx,
			url: "https://dummyimage.com/" + (10 + idx) + "x250",
			thumbUrl: actName,
			createdAt: Date.now()
		}, handleResponse);
	}
}

// store.find = {email: /bob/gi};
store.sort = {title: -1};
store.skip = 0;
store.limit = 5; //by setting this, you will trigger a load on the store.

store.load.after.add(function() {
	console.log(store.items);
});

store.load();

store.model.load("59b005348897c2366aaa66d1", null, function(err, obj){
	obj.data.url = "updatedert!";
	obj.patch(function(err, result){
		console.log(result);
	});
});

store.model.load("59b00ffa8897c2366aaa66d2", null, function(err, obj){
	obj.data.url = "updaterted!2222";
	obj.save(function(err, result){
		console.log(result);
	});
});

ko.applyBindings({
	store: store
});
