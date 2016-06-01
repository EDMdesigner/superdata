var superData = require("../src/superData.js");

var createProxy = superData.proxy.localStorage;
var createModel = superData.model.model;
var createStore = superData.store.store;

console.log("nanu");

var proxy = createProxy({
	idProperty: "id",
	idType: "number",
	generateId: (function() {
		var nextId = 0;
		return function() {
			return nextId+=1;
		};
	}())
});

function createOneSuccess() {
	//console.log(err, result);
}
for (var idx = 0; idx < 1000; idx += 1) {
	var rand = Math.random();
	proxy.createOne({
		num: rand,
		str: (rand < 0.5 ? "str" : "yo")
	}, createOneSuccess);
}

var model = createModel({
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

	proxy: proxy
});

var store = createStore({
	model: model,
	proxy: proxy
});

module.exports = {
	proxy: proxy,
	model: model,
	store: store
};

setTimeout(function() {
	proxy.updateOneById(1, {num: 10, str: "XXX"}, function (err, data) {
		console.log(err, data);
		proxy.readOneById(1, function(err, data) {
			console.log("Updated: ",err, data);
			proxy.destroyOneById(1, function(err, data) {
				console.log(err, data);
				proxy.readOneById(1, function(err,data) {
					console.log("Destroyed: ",err, data);
					store.load();
					console.log(store.items);
				});
			});
		});
	});
}, 100);
