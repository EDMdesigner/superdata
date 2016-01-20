(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint node: true */
"use strict";

var createProxy = require("../src/proxy/memory");
var createModel = require("../src/model/model");
var createStore = require("../src/store/store");


var proxy = createProxy({
	idProperty: "id",
	generateId: (function() {
		var nextId = 0;
		return function() {
			return nextId++;
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

},{"../src/model/model":4,"../src/proxy/memory":7,"../src/store/store":8}],2:[function(require,module,exports){
/*jslint node: true */
"use strict";

var ko = (window.ko);
var exampleDataLayer = require("./exampleDataLayer");

var store = exampleDataLayer.store;


var infiniteLoader = infiniteLoaderVm({
	store: store,
	numOfItems: 100,
	numOfItemsToLoad: 50
});

/*
setInterval(function() {
	var windowHeight = window.innerHeight;
	var scrollY = window.scrollY;
	var documentHeight = document.body.offsetHeight;

	console.log(windowHeight, scrollY, documentHeight);

	if (windowHeight + scrollY > documentHeight / 2) {
		infiniteLoader.loadMore();
		console.log("loading more...");
	}
}, 500);
*/
ko.applyBindings(infiniteLoader);

function infiniteLoaderVm(config) {
	var store = config.store;


	var numOfItems = config.numOfItems || 10;
	var numOfItemsToLoad = config.numOfItemsToLoad || 10;

	var elements = ko.observableArray([]);

	var loading = ko.observable(true);

	load(0, numOfItems);

	function load(skip, limit) {
		//sort, filter...

		loading(true);
		store.load(function(err, result) {
			//TODO apply row vm!
			result.forEach(function(item) {
				elements.push(item);
			});
			numOfItems = skip + limit;
			loading(false);
		});
	}


	function loadMore() {
		load(numOfItems, numOfItemsToLoad);
	}


	return {
		elements: elements,

		loading: loading,

		loadMore: loadMore
	};
}
},{"./exampleDataLayer":1}],3:[function(require,module,exports){
/*jslint node: true */
"use strict";

module.exports = {
	errorMessages: {
		NOT_FOUND: "NOT_FOUND"
	},
	exceptionMessages: {
		NOT_A_FUNCTION: "NOT_A_FUNCTION"
	}
};

},{}],4:[function(require,module,exports){
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
},{"./modelObject":5}],5:[function(require,module,exports){
/*jslint node: true */
"use strict";

var createProp = require("./prop");

module.exports = function createModelObject(options) {
	var fields = options.fields;
	var idField = options.idField;
	var proxy = options.proxy;

	var data = {};

	for (var prop in fields) {
		var actField = fields[prop];
		var actValue = options.data.hasOwnProperty(prop) ? options.data[prop] : actField.defaultValue;

		createProp(data, prop, {
			value: actValue,
			beforeChange: createBeforeChangeFunction(prop),
			afterChange: createAfterChangeFunction(prop)
		});
	}

	var obj = {
		data: data,

		save: save,
		destroy: destroy
	};

	function createBeforeChangeFunction(propName) {
		return function beforeChange(values) {
			validate(propName, values);

			var field = fields[propName];

			if (field.beforeChange) {
				if (typeof field.beforeChange === "function") {

				}
			}
		};
	}

	function createAfterChangeFunction(propName) {
		return function afterChange(values) {
			//call the onChange listeners
		};
	}


	function validate(propName, values) {
		var field = fields[propName];

		if (!field) {
			return;
		}

		if (!field.validators) {
			return;
		}
	}


	function save(callback) {
		var id = data[idField];
		proxy.updateOneById(id, data, function(err, result) {
			if (err) {
				return callback(err);
			}

			for (var prop in result) {
				data[prop] = result[prop];
			}

			callback(null, obj);
		});
	}

	//deleted flag?
	function destroy(callback) {
		var id = fields[idField].get();
		proxy.destroyOneById(id, data, function(err, result) {
			if (err) {
				return callback(err);
			}

			callback(null, obj);
		});
	}

	return obj;
};

},{"./prop":6}],6:[function(require,module,exports){
/*jslint node: true */
"use strict";

module.exports = function createProp(obj, name, config) {
	//should be called field
	config = config || {};

	var initialValue = config.value;
	var value = initialValue;
	var lastValue = value;

	Object.defineProperty(obj, name, {
		enumerable: true,
		configurable: false,

		set: set,
		get: get
	});

	function set(newVal) {
		if (newVal === value) {
			return;
		}

		if (typeof config.beforeChange === "function") {
			config.beforeChange({lastValue: lastValue, value: value, newValue: newVal, initialValue: initialValue});
		}

		lastValue = value;
		value = newVal;

		if (typeof config.afterChange === "function") {
			config.afterChange({lastValue: lastValue, value: value, newValue: newVal, initialValue: initialValue});
		}
	}

	function get() {
		return value;
	}

	return obj;
};

},{}],7:[function(require,module,exports){
/*jslint node: true */
"use strict";

var messages = require("../errorMessages");

module.exports = function createMemoryProxy(config) {
	config = config || {};
	var idProperty = config.idProperty || "id";
	var generateId = config.generateId || (function() {
		var nextId = 0;
		return function() {
			return nextId++;
		};
	}());

	var db = [];

	function findIndexById(id) {
		return db.findIndex(function(item) {
			return item[idProperty] === id;
		});
	}

	function checkCallback(callback) {
		assert(typeof callback === "function", "callback should be a function");
	}

	function assert(condition, message) {
		if (!condition) {
			message = message || "Assertion failed";
			if (typeof Error !== "undefined") {
				throw new Error(message);
			}
			throw message; // Fallback
		}
	}

	function read(options, callback) {
		checkCallback(callback);

		if (!options) {
			options = {};
		}
		
		var find = options.find;
		var sort = options.sort;

		var skip = options.skip;
		var limit = options.limit;

		var elements = db;

		if (find && typeof find === "object") {
			elements = elements.filter(function(item) {
				for (var prop in find) {
					var act = find[prop];

					if (act instanceof RegExp) {
						if (!act.test(item[prop])) {
							return false;
						}
					} else {
						if (act !== item[prop]) {
							return false;
						}
					}
				}
				return true;
			});
		}

		if (sort && typeof sort === "object") {
			elements = elements.sort(function(item1, item2) {
				for (var prop in sort) {
					var act1 = item1[prop];
					var act2 = item2[prop];

					var actRelation = sort[prop];

					if(actRelation === 1) {
						if (act1 < act2) {
							return -1;
						} else if (act1 > act2) {
							return 1;
						}
					} else {
						if (act1 > act2) {
							return -1;
						} else if (act1 < act2) {
							return 1;
						}
					}
				}
				return 0;
			});
		}

		if (typeof skip !== "number" || skip < 0) {
			skip = 0;
		}

		if (typeof limit !== "number" || limit < 0) {
			limit = db.length;
		}

		callback(null, elements.slice(skip, skip + limit));
	}

	function createOne(data, callback) {
		checkCallback(callback);

		if (typeof data[idProperty] === "undefined") {
			data[idProperty] = generateId();
		}

		var dataIdx = findIndexById(data[idProperty]);

		if (dataIdx === -1) { //this way this is an upsert actually...
			db.push(data);
		} else {
			db[dataIdx] = data;
		}

		callback(null, data);
	}

	function readOneById(id, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById();
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}
		callback(null, db[dataIdx]);
	}

	function updateOneById(id, newData, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById(id);
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}

		newData[idProperty] = id;
		db[dataIdx] = newData;
		
		callback(null, newData);
	}

	function destroyOneById(id, callback) {
		var dataIdx = findIndexById(id);

		var data = db.splice(dataIdx, 1);

		callback(null, data);
	}

	return Object.freeze({
		idProperty: idProperty,
		generateId: generateId,


		read: read,

		createOne: createOne,

		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	});
};

},{"../errorMessages":3}],8:[function(require,module,exports){
/*jslint node: true */
"use strict";

module.exports = function createStore(options) {
	var model = options.model;
	var proxy = model.proxy;

	var autoLoad;
	var autoSync;

	var find = {};
	var sort = {id: 1};
	var group = "?good question?";

	var buffered;

	var listeners = {
		load: []
	};

	function notifyListeners(event) {
		var actListeners = listeners[event];

		actListeners.forEach(function(listener) {
			listener();
		});
	}

	//var remoteFilter;
	//var remoteGroup;
	//var remoteSort;


	var actPage = options.actPage || 0;
	var numOfItems = 0;
	var numOfPages = 0;

	//model instances should be stored somewhere by id as well.
	//in the data array, there should be references to those instances... although it would be complicated when loaded from localStorage.
	//maybe we should store only the id-s of the elements in the data array...
	var prefetchedData = {
		"{sorters: {id: 1}, filters: {}": [{skip: 0, ids: []}]
	};
	var prefetchedDataStorage = [];

	function getData() {
		return prefetchedData[currentPage].data;
	}
	//should be reorganized when pagesize changes
	//should be dropped when sorter or filter changes

	var pageSize = 0;
	var currentPage = 0;
	var loadCount = "read-only";



	function load(callback) {
		var options = {
			find: find,
			sort: sort
		};

		notifyListeners("beforeLoad");

		model.list(options, function() {
			notifyListeners("load");
		});
	}

	function loadPage(pageNum, callback) {

	}

	function loadRange() {
		
	}

	function loadNextPage() {

	}

	function loadPrevPage() {

	}


	function prefetch() {

	}

	function prefetchRange() {

	}

	function prefetchPage() {

	}


	function add() {

	}


	return Object.freeze({
		//data: data,
		model: model,
		proxy: proxy,

		load: load,
		add: add
	});
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9leGFtcGxlRGF0YUxheWVyLmpzIiwiZXhhbXBsZXMvaW5maW5pdGVMb2FkZXIuanMiLCJzcmMvZXJyb3JNZXNzYWdlcy5qcyIsInNyYy9tb2RlbC9tb2RlbC5qcyIsInNyYy9tb2RlbC9tb2RlbE9iamVjdC5qcyIsInNyYy9tb2RlbC9wcm9wLmpzIiwic3JjL3Byb3h5L21lbW9yeS5qcyIsInNyYy9zdG9yZS9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGNyZWF0ZVByb3h5ID0gcmVxdWlyZShcIi4uL3NyYy9wcm94eS9tZW1vcnlcIik7XG52YXIgY3JlYXRlTW9kZWwgPSByZXF1aXJlKFwiLi4vc3JjL21vZGVsL21vZGVsXCIpO1xudmFyIGNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIi4uL3NyYy9zdG9yZS9zdG9yZVwiKTtcblxuXG52YXIgcHJveHkgPSBjcmVhdGVQcm94eSh7XG5cdGlkUHJvcGVydHk6IFwiaWRcIixcblx0Z2VuZXJhdGVJZDogKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBuZXh0SWQgPSAwO1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBuZXh0SWQrKztcblx0XHR9O1xuXHR9KCkpXG59KTtcblxuZnVuY3Rpb24gY3JlYXRlT25lU3VjY2VzcygpIHtcblx0Ly9jb25zb2xlLmxvZyhlcnIsIHJlc3VsdCk7XG59XG5mb3IgKHZhciBpZHggPSAwOyBpZHggPCAxMDAwOyBpZHggKz0gMSkge1xuXHR2YXIgcmFuZCA9IE1hdGgucmFuZG9tKCk7XG5cdHByb3h5LmNyZWF0ZU9uZSh7XG5cdFx0bnVtOiByYW5kLFxuXHRcdHN0cjogKHJhbmQgPCAwLjUgPyBcInN0clwiIDogXCJ5b1wiKVxuXHR9LCBjcmVhdGVPbmVTdWNjZXNzKTtcbn1cblxudmFyIG1vZGVsID0gY3JlYXRlTW9kZWwoe1xuXHRmaWVsZHM6IHtcblx0XHRpZDoge1xuXHRcdFx0dHlwZTogXCJudW1iZXJcIlxuXHRcdH0sXG5cdFx0bnVtOiB7XG5cdFx0XHR0eXBlOiBcIm51bWJlclwiLFxuXHRcdFx0dmFsaWRhdG9yczogW1xuXHRcdFx0XHRmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gMiB8fCB2YWx1ZSA9PT0gMztcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cdFx0c3RyOiB7XG5cdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0fVxuXHR9LFxuXG5cdGlkRmllbGQ6IFwiaWRcIixcblxuXHRwcm94eTogcHJveHlcbn0pO1xuXG52YXIgc3RvcmUgPSBjcmVhdGVTdG9yZSh7XG5cdG1vZGVsOiBtb2RlbCxcblx0cHJveHk6IHByb3h5XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHByb3h5OiBwcm94eSxcblx0bW9kZWw6IG1vZGVsLFxuXHRzdG9yZTogc3RvcmVcbn07XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGtvID0gKHdpbmRvdy5rbyk7XG52YXIgZXhhbXBsZURhdGFMYXllciA9IHJlcXVpcmUoXCIuL2V4YW1wbGVEYXRhTGF5ZXJcIik7XG5cbnZhciBzdG9yZSA9IGV4YW1wbGVEYXRhTGF5ZXIuc3RvcmU7XG5cblxudmFyIGluZmluaXRlTG9hZGVyID0gaW5maW5pdGVMb2FkZXJWbSh7XG5cdHN0b3JlOiBzdG9yZSxcblx0bnVtT2ZJdGVtczogMTAwLFxuXHRudW1PZkl0ZW1zVG9Mb2FkOiA1MFxufSk7XG5cbi8qXG5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0dmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0dmFyIHNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWTtcblx0dmFyIGRvY3VtZW50SGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQ7XG5cblx0Y29uc29sZS5sb2cod2luZG93SGVpZ2h0LCBzY3JvbGxZLCBkb2N1bWVudEhlaWdodCk7XG5cblx0aWYgKHdpbmRvd0hlaWdodCArIHNjcm9sbFkgPiBkb2N1bWVudEhlaWdodCAvIDIpIHtcblx0XHRpbmZpbml0ZUxvYWRlci5sb2FkTW9yZSgpO1xuXHRcdGNvbnNvbGUubG9nKFwibG9hZGluZyBtb3JlLi4uXCIpO1xuXHR9XG59LCA1MDApO1xuKi9cbmtvLmFwcGx5QmluZGluZ3MoaW5maW5pdGVMb2FkZXIpO1xuXG5mdW5jdGlvbiBpbmZpbml0ZUxvYWRlclZtKGNvbmZpZykge1xuXHR2YXIgc3RvcmUgPSBjb25maWcuc3RvcmU7XG5cblxuXHR2YXIgbnVtT2ZJdGVtcyA9IGNvbmZpZy5udW1PZkl0ZW1zIHx8IDEwO1xuXHR2YXIgbnVtT2ZJdGVtc1RvTG9hZCA9IGNvbmZpZy5udW1PZkl0ZW1zVG9Mb2FkIHx8IDEwO1xuXG5cdHZhciBlbGVtZW50cyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cblx0dmFyIGxvYWRpbmcgPSBrby5vYnNlcnZhYmxlKHRydWUpO1xuXG5cdGxvYWQoMCwgbnVtT2ZJdGVtcyk7XG5cblx0ZnVuY3Rpb24gbG9hZChza2lwLCBsaW1pdCkge1xuXHRcdC8vc29ydCwgZmlsdGVyLi4uXG5cblx0XHRsb2FkaW5nKHRydWUpO1xuXHRcdHN0b3JlLmxvYWQoZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdC8vVE9ETyBhcHBseSByb3cgdm0hXG5cdFx0XHRyZXN1bHQuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdGVsZW1lbnRzLnB1c2goaXRlbSk7XG5cdFx0XHR9KTtcblx0XHRcdG51bU9mSXRlbXMgPSBza2lwICsgbGltaXQ7XG5cdFx0XHRsb2FkaW5nKGZhbHNlKTtcblx0XHR9KTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gbG9hZE1vcmUoKSB7XG5cdFx0bG9hZChudW1PZkl0ZW1zLCBudW1PZkl0ZW1zVG9Mb2FkKTtcblx0fVxuXG5cblx0cmV0dXJuIHtcblx0XHRlbGVtZW50czogZWxlbWVudHMsXG5cblx0XHRsb2FkaW5nOiBsb2FkaW5nLFxuXG5cdFx0bG9hZE1vcmU6IGxvYWRNb3JlXG5cdH07XG59IiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRlcnJvck1lc3NhZ2VzOiB7XG5cdFx0Tk9UX0ZPVU5EOiBcIk5PVF9GT1VORFwiXG5cdH0sXG5cdGV4Y2VwdGlvbk1lc3NhZ2VzOiB7XG5cdFx0Tk9UX0FfRlVOQ1RJT046IFwiTk9UX0FfRlVOQ1RJT05cIlxuXHR9XG59O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjcmVhdGVNb2RlbE9iamVjdCA9IHJlcXVpcmUoXCIuL21vZGVsT2JqZWN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU1vZGVsKG9wdGlvbnMpIHtcblx0dmFyIGZpZWxkcyA9IG9wdGlvbnMuZmllbGRzO1xuXG5cdC8vb3B0aW9ucy5maWVsZHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHNcblx0Ly90aGUgb2JqZWN0cyBzaG91bGQgZGVzY3JpYmUgdGhlIGZpZWxkczpcblx0Ly8gLSBuYW1lXG5cdC8vIC0gdHlwZVxuXHQvLyAtIHZhbGlkYXRvcnNcblx0Ly8gLSBtYXBwaW5nXG5cdC8vIC0gZGVmYXVsdFZhbHVlXG5cdC8vIC0gYmVmb3JlQ2hhbmdlXG5cdC8vIC0gYWZ0ZXJDaGFuZ2VcblxuXHR2YXIgcHJveHkgPSBvcHRpb25zLnByb3h5O1xuXHR2YXIgaWRGaWVsZCA9IG9wdGlvbnMuaWRGaWVsZDtcblxuXHRmdW5jdGlvbiBsaXN0KG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdFx0cHJveHkucmVhZChvcHRpb25zLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGRhdGEgPSBbXTtcblxuXHRcdFx0cmVzdWx0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRkYXRhLnB1c2goY3JlYXRlTW9kZWxPYmplY3Qoe1xuXHRcdFx0XHRcdGZpZWxkczogZmllbGRzLFxuXHRcdFx0XHRcdHByb3h5OiBwcm94eSxcblx0XHRcdFx0XHRpZEZpZWxkOiBpZEZpZWxkLFxuXG5cdFx0XHRcdFx0ZGF0YTogaXRlbVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgZGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBsb2FkKGlkLCBjYWxsYmFjaykge1xuXHRcdHByb3h5LnJlYWRPbmVCeUlkKGlkLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG1vZGVsT2JqZWN0ID0gY3JlYXRlTW9kZWxPYmplY3Qoe1xuXHRcdFx0XHRmaWVsZHM6IGZpZWxkcyxcblx0XHRcdFx0cHJveHk6IHByb3h5LFxuXHRcdFx0XHRpZEZpZWxkOiBpZEZpZWxkLFxuXG5cdFx0XHRcdGRhdGE6IHJlc3VsdFxuXHRcdFx0fSk7XG5cdFx0XHRjYWxsYmFjayhudWxsLCBtb2RlbE9iamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGUobW9kZWxWYWx1ZXMsIGNhbGxiYWNrKSB7XG5cdFx0cHJveHkuY3JlYXRlT25lKG1vZGVsVmFsdWVzLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgY3JlYXRlTW9kZWxPYmplY3Qoe1xuXHRcdFx0XHRmaWVsZHM6IGZpZWxkcyxcblx0XHRcdFx0cHJveHk6IHByb3h5LFxuXHRcdFx0XHRpZEZpZWxkOiBpZEZpZWxkLFxuXG5cdFx0XHRcdGRhdGE6IHJlc3VsdFxuXHRcdFx0fSkpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5mcmVlemUoe1xuXHRcdGZpZWxkczogZmllbGRzLFxuXHRcdHByb3h5OiBwcm94eSxcblx0XHRpZEZpZWxkOiBpZEZpZWxkLFxuXG5cdFx0bGlzdDogbGlzdCxcblx0XHRsb2FkOiBsb2FkLFxuXHRcdGNyZWF0ZTogY3JlYXRlXG5cdH0pO1xufTsiLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGNyZWF0ZVByb3AgPSByZXF1aXJlKFwiLi9wcm9wXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU1vZGVsT2JqZWN0KG9wdGlvbnMpIHtcblx0dmFyIGZpZWxkcyA9IG9wdGlvbnMuZmllbGRzO1xuXHR2YXIgaWRGaWVsZCA9IG9wdGlvbnMuaWRGaWVsZDtcblx0dmFyIHByb3h5ID0gb3B0aW9ucy5wcm94eTtcblxuXHR2YXIgZGF0YSA9IHt9O1xuXG5cdGZvciAodmFyIHByb3AgaW4gZmllbGRzKSB7XG5cdFx0dmFyIGFjdEZpZWxkID0gZmllbGRzW3Byb3BdO1xuXHRcdHZhciBhY3RWYWx1ZSA9IG9wdGlvbnMuZGF0YS5oYXNPd25Qcm9wZXJ0eShwcm9wKSA/IG9wdGlvbnMuZGF0YVtwcm9wXSA6IGFjdEZpZWxkLmRlZmF1bHRWYWx1ZTtcblxuXHRcdGNyZWF0ZVByb3AoZGF0YSwgcHJvcCwge1xuXHRcdFx0dmFsdWU6IGFjdFZhbHVlLFxuXHRcdFx0YmVmb3JlQ2hhbmdlOiBjcmVhdGVCZWZvcmVDaGFuZ2VGdW5jdGlvbihwcm9wKSxcblx0XHRcdGFmdGVyQ2hhbmdlOiBjcmVhdGVBZnRlckNoYW5nZUZ1bmN0aW9uKHByb3ApXG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgb2JqID0ge1xuXHRcdGRhdGE6IGRhdGEsXG5cblx0XHRzYXZlOiBzYXZlLFxuXHRcdGRlc3Ryb3k6IGRlc3Ryb3lcblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVCZWZvcmVDaGFuZ2VGdW5jdGlvbihwcm9wTmFtZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiBiZWZvcmVDaGFuZ2UodmFsdWVzKSB7XG5cdFx0XHR2YWxpZGF0ZShwcm9wTmFtZSwgdmFsdWVzKTtcblxuXHRcdFx0dmFyIGZpZWxkID0gZmllbGRzW3Byb3BOYW1lXTtcblxuXHRcdFx0aWYgKGZpZWxkLmJlZm9yZUNoYW5nZSkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpZWxkLmJlZm9yZUNoYW5nZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVBZnRlckNoYW5nZUZ1bmN0aW9uKHByb3BOYW1lKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIGFmdGVyQ2hhbmdlKHZhbHVlcykge1xuXHRcdFx0Ly9jYWxsIHRoZSBvbkNoYW5nZSBsaXN0ZW5lcnNcblx0XHR9O1xuXHR9XG5cblxuXHRmdW5jdGlvbiB2YWxpZGF0ZShwcm9wTmFtZSwgdmFsdWVzKSB7XG5cdFx0dmFyIGZpZWxkID0gZmllbGRzW3Byb3BOYW1lXTtcblxuXHRcdGlmICghZmllbGQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIWZpZWxkLnZhbGlkYXRvcnMpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIHNhdmUoY2FsbGJhY2spIHtcblx0XHR2YXIgaWQgPSBkYXRhW2lkRmllbGRdO1xuXHRcdHByb3h5LnVwZGF0ZU9uZUJ5SWQoaWQsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKHZhciBwcm9wIGluIHJlc3VsdCkge1xuXHRcdFx0XHRkYXRhW3Byb3BdID0gcmVzdWx0W3Byb3BdO1xuXHRcdFx0fVxuXG5cdFx0XHRjYWxsYmFjayhudWxsLCBvYmopO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly9kZWxldGVkIGZsYWc/XG5cdGZ1bmN0aW9uIGRlc3Ryb3koY2FsbGJhY2spIHtcblx0XHR2YXIgaWQgPSBmaWVsZHNbaWRGaWVsZF0uZ2V0KCk7XG5cdFx0cHJveHkuZGVzdHJveU9uZUJ5SWQoaWQsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjYWxsYmFjayhudWxsLCBvYmopO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIG9iajtcbn07XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVQcm9wKG9iaiwgbmFtZSwgY29uZmlnKSB7XG5cdC8vc2hvdWxkIGJlIGNhbGxlZCBmaWVsZFxuXHRjb25maWcgPSBjb25maWcgfHwge307XG5cblx0dmFyIGluaXRpYWxWYWx1ZSA9IGNvbmZpZy52YWx1ZTtcblx0dmFyIHZhbHVlID0gaW5pdGlhbFZhbHVlO1xuXHR2YXIgbGFzdFZhbHVlID0gdmFsdWU7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcblxuXHRcdHNldDogc2V0LFxuXHRcdGdldDogZ2V0XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHNldChuZXdWYWwpIHtcblx0XHRpZiAobmV3VmFsID09PSB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgY29uZmlnLmJlZm9yZUNoYW5nZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRjb25maWcuYmVmb3JlQ2hhbmdlKHtsYXN0VmFsdWU6IGxhc3RWYWx1ZSwgdmFsdWU6IHZhbHVlLCBuZXdWYWx1ZTogbmV3VmFsLCBpbml0aWFsVmFsdWU6IGluaXRpYWxWYWx1ZX0pO1xuXHRcdH1cblxuXHRcdGxhc3RWYWx1ZSA9IHZhbHVlO1xuXHRcdHZhbHVlID0gbmV3VmFsO1xuXG5cdFx0aWYgKHR5cGVvZiBjb25maWcuYWZ0ZXJDaGFuZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0Y29uZmlnLmFmdGVyQ2hhbmdlKHtsYXN0VmFsdWU6IGxhc3RWYWx1ZSwgdmFsdWU6IHZhbHVlLCBuZXdWYWx1ZTogbmV3VmFsLCBpbml0aWFsVmFsdWU6IGluaXRpYWxWYWx1ZX0pO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdldCgpIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRyZXR1cm4gb2JqO1xufTtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVzc2FnZXMgPSByZXF1aXJlKFwiLi4vZXJyb3JNZXNzYWdlc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVNZW1vcnlQcm94eShjb25maWcpIHtcblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHR2YXIgaWRQcm9wZXJ0eSA9IGNvbmZpZy5pZFByb3BlcnR5IHx8IFwiaWRcIjtcblx0dmFyIGdlbmVyYXRlSWQgPSBjb25maWcuZ2VuZXJhdGVJZCB8fCAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5leHRJZCA9IDA7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIG5leHRJZCsrO1xuXHRcdH07XG5cdH0oKSk7XG5cblx0dmFyIGRiID0gW107XG5cblx0ZnVuY3Rpb24gZmluZEluZGV4QnlJZChpZCkge1xuXHRcdHJldHVybiBkYi5maW5kSW5kZXgoZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0cmV0dXJuIGl0ZW1baWRQcm9wZXJ0eV0gPT09IGlkO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2hlY2tDYWxsYmFjayhjYWxsYmFjaykge1xuXHRcdGFzc2VydCh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIiwgXCJjYWxsYmFjayBzaG91bGQgYmUgYSBmdW5jdGlvblwiKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcblx0XHRpZiAoIWNvbmRpdGlvbikge1xuXHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UgfHwgXCJBc3NlcnRpb24gZmFpbGVkXCI7XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdHRocm93IG1lc3NhZ2U7IC8vIEZhbGxiYWNrXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZChvcHRpb25zLCBjYWxsYmFjaykge1xuXHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0ge307XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBmaW5kID0gb3B0aW9ucy5maW5kO1xuXHRcdHZhciBzb3J0ID0gb3B0aW9ucy5zb3J0O1xuXG5cdFx0dmFyIHNraXAgPSBvcHRpb25zLnNraXA7XG5cdFx0dmFyIGxpbWl0ID0gb3B0aW9ucy5saW1pdDtcblxuXHRcdHZhciBlbGVtZW50cyA9IGRiO1xuXG5cdFx0aWYgKGZpbmQgJiYgdHlwZW9mIGZpbmQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGVsZW1lbnRzID0gZWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBmaW5kKSB7XG5cdFx0XHRcdFx0dmFyIGFjdCA9IGZpbmRbcHJvcF07XG5cblx0XHRcdFx0XHRpZiAoYWN0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWFjdC50ZXN0KGl0ZW1bcHJvcF0pKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKGFjdCAhPT0gaXRlbVtwcm9wXSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHNvcnQgJiYgdHlwZW9mIHNvcnQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGVsZW1lbnRzID0gZWxlbWVudHMuc29ydChmdW5jdGlvbihpdGVtMSwgaXRlbTIpIHtcblx0XHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBzb3J0KSB7XG5cdFx0XHRcdFx0dmFyIGFjdDEgPSBpdGVtMVtwcm9wXTtcblx0XHRcdFx0XHR2YXIgYWN0MiA9IGl0ZW0yW3Byb3BdO1xuXG5cdFx0XHRcdFx0dmFyIGFjdFJlbGF0aW9uID0gc29ydFtwcm9wXTtcblxuXHRcdFx0XHRcdGlmKGFjdFJlbGF0aW9uID09PSAxKSB7XG5cdFx0XHRcdFx0XHRpZiAoYWN0MSA8IGFjdDIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhY3QxID4gYWN0Mikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKGFjdDEgPiBhY3QyKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYWN0MSA8IGFjdDIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBza2lwICE9PSBcIm51bWJlclwiIHx8IHNraXAgPCAwKSB7XG5cdFx0XHRza2lwID0gMDtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGxpbWl0ICE9PSBcIm51bWJlclwiIHx8IGxpbWl0IDwgMCkge1xuXHRcdFx0bGltaXQgPSBkYi5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2sobnVsbCwgZWxlbWVudHMuc2xpY2Uoc2tpcCwgc2tpcCArIGxpbWl0KSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVPbmUoZGF0YSwgY2FsbGJhY2spIHtcblx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuXHRcdGlmICh0eXBlb2YgZGF0YVtpZFByb3BlcnR5XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0ZGF0YVtpZFByb3BlcnR5XSA9IGdlbmVyYXRlSWQoKTtcblx0XHR9XG5cblx0XHR2YXIgZGF0YUlkeCA9IGZpbmRJbmRleEJ5SWQoZGF0YVtpZFByb3BlcnR5XSk7XG5cblx0XHRpZiAoZGF0YUlkeCA9PT0gLTEpIHsgLy90aGlzIHdheSB0aGlzIGlzIGFuIHVwc2VydCBhY3R1YWxseS4uLlxuXHRcdFx0ZGIucHVzaChkYXRhKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGJbZGF0YUlkeF0gPSBkYXRhO1xuXHRcdH1cblxuXHRcdGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZE9uZUJ5SWQoaWQsIGNhbGxiYWNrKSB7XG5cdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cblx0XHR2YXIgZGF0YUlkeCA9IGZpbmRJbmRleEJ5SWQoKTtcblx0XHRpZiAoZGF0YUlkeCA9PT0gLTEpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhtZXNzYWdlcy5lcnJvck1lc3NhZ2VzLk5PVF9GT1VORCk7XG5cdFx0fVxuXHRcdGNhbGxiYWNrKG51bGwsIGRiW2RhdGFJZHhdKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHVwZGF0ZU9uZUJ5SWQoaWQsIG5ld0RhdGEsIGNhbGxiYWNrKSB7XG5cdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cblx0XHR2YXIgZGF0YUlkeCA9IGZpbmRJbmRleEJ5SWQoaWQpO1xuXHRcdGlmIChkYXRhSWR4ID09PSAtMSkge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG1lc3NhZ2VzLmVycm9yTWVzc2FnZXMuTk9UX0ZPVU5EKTtcblx0XHR9XG5cblx0XHRuZXdEYXRhW2lkUHJvcGVydHldID0gaWQ7XG5cdFx0ZGJbZGF0YUlkeF0gPSBuZXdEYXRhO1xuXHRcdFxuXHRcdGNhbGxiYWNrKG51bGwsIG5ld0RhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVzdHJveU9uZUJ5SWQoaWQsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGRhdGFJZHggPSBmaW5kSW5kZXhCeUlkKGlkKTtcblxuXHRcdHZhciBkYXRhID0gZGIuc3BsaWNlKGRhdGFJZHgsIDEpO1xuXG5cdFx0Y2FsbGJhY2sobnVsbCwgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG5cdFx0aWRQcm9wZXJ0eTogaWRQcm9wZXJ0eSxcblx0XHRnZW5lcmF0ZUlkOiBnZW5lcmF0ZUlkLFxuXG5cblx0XHRyZWFkOiByZWFkLFxuXG5cdFx0Y3JlYXRlT25lOiBjcmVhdGVPbmUsXG5cblx0XHRyZWFkT25lQnlJZDogcmVhZE9uZUJ5SWQsXG5cdFx0dXBkYXRlT25lQnlJZDogdXBkYXRlT25lQnlJZCxcblx0XHRkZXN0cm95T25lQnlJZDogZGVzdHJveU9uZUJ5SWRcblx0fSk7XG59O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlU3RvcmUob3B0aW9ucykge1xuXHR2YXIgbW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXHR2YXIgcHJveHkgPSBtb2RlbC5wcm94eTtcblxuXHR2YXIgYXV0b0xvYWQ7XG5cdHZhciBhdXRvU3luYztcblxuXHR2YXIgZmluZCA9IHt9O1xuXHR2YXIgc29ydCA9IHtpZDogMX07XG5cdHZhciBncm91cCA9IFwiP2dvb2QgcXVlc3Rpb24/XCI7XG5cblx0dmFyIGJ1ZmZlcmVkO1xuXG5cdHZhciBsaXN0ZW5lcnMgPSB7XG5cdFx0bG9hZDogW11cblx0fTtcblxuXHRmdW5jdGlvbiBub3RpZnlMaXN0ZW5lcnMoZXZlbnQpIHtcblx0XHR2YXIgYWN0TGlzdGVuZXJzID0gbGlzdGVuZXJzW2V2ZW50XTtcblxuXHRcdGFjdExpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG5cdFx0XHRsaXN0ZW5lcigpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly92YXIgcmVtb3RlRmlsdGVyO1xuXHQvL3ZhciByZW1vdGVHcm91cDtcblx0Ly92YXIgcmVtb3RlU29ydDtcblxuXG5cdHZhciBhY3RQYWdlID0gb3B0aW9ucy5hY3RQYWdlIHx8IDA7XG5cdHZhciBudW1PZkl0ZW1zID0gMDtcblx0dmFyIG51bU9mUGFnZXMgPSAwO1xuXG5cdC8vbW9kZWwgaW5zdGFuY2VzIHNob3VsZCBiZSBzdG9yZWQgc29tZXdoZXJlIGJ5IGlkIGFzIHdlbGwuXG5cdC8vaW4gdGhlIGRhdGEgYXJyYXksIHRoZXJlIHNob3VsZCBiZSByZWZlcmVuY2VzIHRvIHRob3NlIGluc3RhbmNlcy4uLiBhbHRob3VnaCBpdCB3b3VsZCBiZSBjb21wbGljYXRlZCB3aGVuIGxvYWRlZCBmcm9tIGxvY2FsU3RvcmFnZS5cblx0Ly9tYXliZSB3ZSBzaG91bGQgc3RvcmUgb25seSB0aGUgaWQtcyBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGRhdGEgYXJyYXkuLi5cblx0dmFyIHByZWZldGNoZWREYXRhID0ge1xuXHRcdFwie3NvcnRlcnM6IHtpZDogMX0sIGZpbHRlcnM6IHt9XCI6IFt7c2tpcDogMCwgaWRzOiBbXX1dXG5cdH07XG5cdHZhciBwcmVmZXRjaGVkRGF0YVN0b3JhZ2UgPSBbXTtcblxuXHRmdW5jdGlvbiBnZXREYXRhKCkge1xuXHRcdHJldHVybiBwcmVmZXRjaGVkRGF0YVtjdXJyZW50UGFnZV0uZGF0YTtcblx0fVxuXHQvL3Nob3VsZCBiZSByZW9yZ2FuaXplZCB3aGVuIHBhZ2VzaXplIGNoYW5nZXNcblx0Ly9zaG91bGQgYmUgZHJvcHBlZCB3aGVuIHNvcnRlciBvciBmaWx0ZXIgY2hhbmdlc1xuXG5cdHZhciBwYWdlU2l6ZSA9IDA7XG5cdHZhciBjdXJyZW50UGFnZSA9IDA7XG5cdHZhciBsb2FkQ291bnQgPSBcInJlYWQtb25seVwiO1xuXG5cblxuXHRmdW5jdGlvbiBsb2FkKGNhbGxiYWNrKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB7XG5cdFx0XHRmaW5kOiBmaW5kLFxuXHRcdFx0c29ydDogc29ydFxuXHRcdH07XG5cblx0XHRub3RpZnlMaXN0ZW5lcnMoXCJiZWZvcmVMb2FkXCIpO1xuXG5cdFx0bW9kZWwubGlzdChvcHRpb25zLCBmdW5jdGlvbigpIHtcblx0XHRcdG5vdGlmeUxpc3RlbmVycyhcImxvYWRcIik7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBsb2FkUGFnZShwYWdlTnVtLCBjYWxsYmFjaykge1xuXG5cdH1cblxuXHRmdW5jdGlvbiBsb2FkUmFuZ2UoKSB7XG5cdFx0XG5cdH1cblxuXHRmdW5jdGlvbiBsb2FkTmV4dFBhZ2UoKSB7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGxvYWRQcmV2UGFnZSgpIHtcblxuXHR9XG5cblxuXHRmdW5jdGlvbiBwcmVmZXRjaCgpIHtcblxuXHR9XG5cblx0ZnVuY3Rpb24gcHJlZmV0Y2hSYW5nZSgpIHtcblxuXHR9XG5cblx0ZnVuY3Rpb24gcHJlZmV0Y2hQYWdlKCkge1xuXG5cdH1cblxuXG5cdGZ1bmN0aW9uIGFkZCgpIHtcblxuXHR9XG5cblxuXHRyZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG5cdFx0Ly9kYXRhOiBkYXRhLFxuXHRcdG1vZGVsOiBtb2RlbCxcblx0XHRwcm94eTogcHJveHksXG5cblx0XHRsb2FkOiBsb2FkLFxuXHRcdGFkZDogYWRkXG5cdH0pO1xufTtcbiJdfQ==
