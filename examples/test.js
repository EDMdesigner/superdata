var superData = require("../src/superData.js");
//var ko = require("knockout");

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


/* function paginationVm(config) {
	var store = config.store;


	var itemsPerPage = ko.observable(config.itemsPerPage || 10);
	var actPage = ko.observable(config.actPage || 0);

	var numOfItems = ko.observable(0);
	var numOfPages = ko.computed(function() {
		return Math.ceil(numOfItems() / itemsPerPage());
	});



	var elements = ko.observableArray([]);
	var loading = ko.observable(true);

	ko.computed(function() {
		//var itemsPerPageVal = itemsPerPage();
		//var actPageVal = actPage();

		//TODO filter
		//TODO sort
		store.load(); //TODO
	});

	return {
		actPage: actPage,
		itemsPerPage: itemsPerPage,

		numOfItems: numOfItems,
		numOfPages: numOfPages,

		elements: elements,

		loading: loading
	};
}

function sortBuilderVm(config) {

}

function findBuilderVm(config) {

}

//??? how exactly?
function createVm() {

}

//??? how exactly?
function editVm() {

}

//??? how exactly?
function viewVm() {

}

//??? how exactly?
function confirmDelete() {

}

function paginationPageSelector(config) {
	var paginationVm = config.paginationVm;

	function next() {
		var actPage = paginationVm.actPage();
		var numOfPages = paginationVm.numOfPages();

		actPage %= numOfPages;

		paginationVm.actPage(actPage);
	}

	function prev() {
		var actPage = paginationVm.actPage();

		if (actPage < 0) {
			actPage = 0;
		}

		paginationVm.actPage(actPage);
	}

	return {
		next: next,
		prev: prev
	};
} */


function createPager() {
	var itemsPerPage = 10;
	var actPage = 0;

	var elementsTable = document.getElementById("elements");
	var prevDiv = document.getElementById("prev");
	var nextDiv = document.getElementById("next");

	showActPage();

	prevDiv.onclick = function() {
		actPage += -1;
		showActPage();
	};

	nextDiv.onclick = function() {
		actPage += 1;
		showActPage();
	};

	function textContentElement(nodeType, content) {
		var td = document.createElement("td");
		td.appendChild(document.createTextNode(content));
		return td;
	}

	function addRow(data) {
		var tr = document.createElement("tr");

		for (var prop in data) {
			tr.appendChild(textContentElement("td", data[prop]));
		}
		
		elementsTable.appendChild(tr);
	}

	function showActPage() {
		while (elementsTable.firstChild) {
			elementsTable.removeChild(elementsTable.firstChild);
		}

		var header = document.createElement("tr");

		Object.keys(model.fields).forEach(function(item) {
			header.appendChild(textContentElement("th", item));
		});
		
		elementsTable.appendChild(header);

		store.load({find: {}, sort: {id: 1}, skip: actPage * itemsPerPage, limit: itemsPerPage}, function(err, result) {
			result.forEach(function(item) {
				addRow(item.data);
			});
		});
	}
}

createPager();

/*
setTimeout(function() {
	location.reload();
}, 10000);
*/