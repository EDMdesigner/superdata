# superdata

Superdata is a data layer, motivated by Extjs' data layer. It consists of three main parts: the **store**, the **model** and the **proxy**. You need one instance of these three elements to make the data layer work. Basically the store needs one model because it's dependent on its functions and the model needs one proxy, because it uses the proxy's functions.

The biggest advantage is that you can easily change the proxy implementations so you can change the way of storing your data.

This lib can easily work together with any client side frameworks.

## Store

The store should be used by other modules which are related to listing somehow. Think about paged lists (lists with paginations), infinite scrolling, lists with filtering and sorting.

You can add new entries to your store or you can trigger the store to load by setting one of (or all of) its following properties:
 - find
 - sort
 - skip
 - limit

It will load the elements into the items array. If you change them at the same time, it won't trigger the loading many times. You can hook to the store's load functionality in the following way.

```javascript
var store = superData.store.store({
	model: model //let's assume we have a model already
});

store.load.before.add(function() {
	console.log("pre hook");
});

store.load.after.add(function() {
	console.log(store.items);
});
```

If you throw an exception in the before hook, then you can prevent the store from loading.

## Model

When the store is being loaded, then it invokes the models list function (which will use the proxy's read function). This list function will create **modelObjects** based on the data and the description in the model. (So the modelObjects are created on the basis of the model.) You can create a new modelObject by calling the model's create function, wich will use the proxy's createOne function.

The model is responsible for data validation, although it's not yet implemented in superdata.

function name | params
---|---
list | options[, belongsToValues], callback
load | id[, belongsToValues], callback
create | modelValues, callback

You can change the data fields on the modelObject and when you want to save it, you just have to call its **save** function. (It will use the proxy's updateOneById function.) Also, you can delete a modelObject by calling its **destroy** function. Be careful, the reference of the modelObject will still remain in the memory, it only removes the resource via the proxy.

You can set default values for fields by giving it as 'defaultValue' property in the field descriptor object.

```javascript
var model = createModel({
	fields: {
		id: {
			type: "number"
		},
		email: {
			type: "string",
			defaultValue: "default@example.com"
		},
		name: {
			type: "string",
			defaultValue: "My name is Nobody"
		},
		title: {
			type: "string"
		}
	},
	idField: "id",
	proxy: proxy
});
```

### Using 'belongsTo' in order to ensure references

You can set required filter parameters for proxy by giving an array as 'belongsTo' property of createModel's config object. This way CRUD and listing operations will check these field names and their values and they will execute only on matching items. E.g. you can make a model which can list users associated to a project only or users can be deleted only if correct projectID is given (which is the one user is belonging to) this way.

This feature is suitable for ensuring access restrictions. In the mentioned example, a server can accept requests with correct projectID and complete them only if user has convenient permissions to that operation on project - feature helps implement this restriction client-side. Important: it doesn't replace server-side checking!

```javascript
var model = createModel({
	fields: {
		id: {
			type: "number"
		},
		name: {
			type: "string"
		},
		projectID: {
			type: "number"
		}
	},
	idField: "id",
	belongsTo: ["projectID"],
	proxy: proxy
});

model.create({
	id: 1,
	name: "somebody",
	projectID: 1
}, function() {});

model.create({
	id: 2,
	name: "somebody 2"
	projectID: 1
}, function() {});

model.create({
	id: 3,
	name: "somebody 3"
	projectID: 2
}, function() {});

model.list(
	{},
	{
		projectID: 1
	},
	function(err, result) {
		console.log(result);
	}
);
```

## Proxy
Proxies are responsible for reading and writing data. You could ask where they write and from where they read. Well, it's totally dependent on the proxy, it can send the data to a server or just read it from the memory. It's dependent on the implemantation of the actual prody. The common thing in proxies that they implement the following functions:

function name | params
---|---
read | options[, filters], callback
createOne | data, callback
readOneById | id[, filters], callback
updateOneById | id[, filters], data, callback
destroyOneById | id[, filters], callback

As you can see, these functions are responsible for CRUD operations, their functionality is quite self-explanatory. These proxy's functions receive the options paramter in a way, that sorting and finding is possible on composed objects aswell just like in MongoDB, as the following example shows.

```javascript
var proxy = superdata.proxy.memory({...});
proxy.read({
	sort: {
		"user.name": 1,
		"user.email": -1
	}
});

proxy.read({
	find: {
		"user.name": "pattern"
	}
});
```

 The callback functions will be passed two parameters on every invocation, the first is an error string or object, the second is the returned data. The id is always the identifier of the resource and the data is a json object. (Although there will be proxies later where it can be multipart data...)

### Memory proxy

The memory proxy simply stores everything in the memory. You can use it on both the server and the client side.

```javascript
var proxy = superData.proxy.memory({
	idProperty: "id",
	idType: "number",
	generateId: (function() {
		var nextId = 0;
		return function() {
			return nextId+=1;
		};
	}())
});
```

### Ajax proxy

The ajax proxy makes HTTP calls to certain urls based on its configuration. You can define query mappings, namely you can define the way how the find, sort, skip and limit properties should be mapped to the query string of the request. You can also define custom query string properties, which will be added to the query string of all of the HTTP calls.

```javascript
var proxy = superData.proxy.ajax({
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
	},
	fieldsToBeExcluded: [ 	//fields given here won't be sent to the database
		"example_property"	//in case of the createOne and updateOneById functions
	]
});
```
The ajax proxy has a failover mechanism to it
. You can pass arrays as route parameters. If arrays are given, on error, the proxy tries to iterate through the given routes, before returning with the error.

```javascript
var proxy = superData.proxy.ajax({
	operations: {
		read: {
			route: ["FailingHost", "http://localhost:7357/user"],
			method: "GET"
		}
		...
		...
		...
```

### REST proxy

With the rest proxy you can easily define a CRUD proxy by giving a base route, and optionally queries and/or a reader. It is based upon the ajax proxy.

```javascript
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
```

### Using 'filters' parameter for proxies

CRUD operations has an optional parameter called 'filters', which ensures that operations will be executed only items matching to the filter conditions.

This parameter is an object. Its properties are field names of data to filter, and values of this properties are the filtering values.

In case of ajax and rest proxy, filtering is implemented as URL filtering. The request URL will be changed: each occurence of a ":" concatenated to a filter field name will replaced to the filtering value.

In case of memory proxy, items have to contain every property of filters object with their values.

```javascript
var userProxy = superData.proxy.memory({
	idProperty: "id",
	idType: "number"
});
userProxy.createOne(
	{
		id: 1,
		project: 2,
		team: 3
	},
	function() {}
);
userProxy.createOne(
	{
		id: 2,
		project: 2,
		team: 4
	},
	function() {}
);
userProxy.read(
	{

	},
	{
		project: 2
	},
	function(err, response) {
		console.log(response);
	}
);
userProxy.read(
	{

	},
	{
		project: 2,
		team: 3
	},
	function(err, response) {
		console.log(response);
	}
);
```

## Example

```javascript
var superData = require("superdata");

var createProxy = superData.proxy.ajax;
var createModel = superData.model.model;
var createStore = superData.store.store;

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

//* seed
store.load.after.add(function() {
	console.log(store.items);
});

var seed = true;
function handleResponse() {
	console.log(err, result);
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

store.find = {email: /bob/gi};
store.sort = {name: -1};
store.skip = 0;
store.limit = 10; //by setting this, you will trigger a load on the store.
```

For easier testing, you can change the proxy in the example above to a memory proxy, so you won't need any server side code. That is one of the coolest things in superdata's that you can change the proxy any time, since proxies give the very same interface to you.



## Further developments
 - cached store (caches in memory), cached store (in localStorage)
 - model validation
 - localStorage proxy
 - server side:
 	- mongodb proxy
 	- file proxy
 	- s3 proxy
 	- azure proxy
 	- rest route generator for nodejs.
 - model unification for client & server
