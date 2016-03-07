/*jslint node: true */
"use strict";
var ko = require("knockout");

var superdata = require("superdata");

var createProxy = superdata.proxy.ajax;
var createModel = superdata.model.model;
var createStore = superdata.store.store;

// queries: {
// 	token: "34oirfgdsnTOKENawern4o",
// 	user: "Lali"
// }
var proxy = createProxy({
	operations: {
		read: {
			route: "http://localhost:7357/user",
			method: "GET"
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
		destroyOneById: {
			route: "http://localhost:7357/user/:id",
			method: "DELETE"
		}
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
	var titles = ["CEO", "CTO", "Slave"];
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
//*/


// var createItemVm = require("./itemVm");
// ko.components.register("list-item", {
// 	viewModel: {
// 		createViewModel: function(params, componentInfo) {
// 			return createItemVm(params);
// 		}
// 	},
// 	template: require("./itemTemplate.html")
// });

// var createInfiniteLoader = require("../../../src/ko-components/lists/infiniteList.js");
// var createPagedList = require("../../../src/ko-components/lists/pagedList.js");

// ko.components.register("paged-list", {
// 	viewModel: {
// 		createViewModel: function(params, componentInfo) {
// 			return createPagedList(params);
// 		}
// 	},
// 	template: require("../../../src/ko-components/lists/pagedList.html")
// });



/*
var list = createInfiniteLoader({
	store: store,

	fields: ["id", "email", "name", "title"],

	labels: {
		email: "E-mail",
		name: "Név",
		title: "Beosztás"
	},

	sorters: {
		id: 1,
		email: 0,
		name: 0
	},

	numOfItems: 10,
	numOfItemsToLoad: 10
});
//*/

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

/*
var list = createPagedList(pagedListConfig);
//*/


ko.applyBindings(pagedListConfig);