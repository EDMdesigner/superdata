var express	= require("express");
var logger = require("express-logger");
var bodyParser = require("body-parser");
var createProxy = require("../../src/proxy/memory");
var createCRUDRouter = require("./crudRouter");

var config = require("./config.json");


var app = express();
var port = config.port || 7357;
//var testDelay = config.testDelay || 2000;

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

app.use(logger({path: "logs.txt"}));
app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
app.use(bodyParser.json({limit: "2mb"}));

app.use("/user", createCRUDRouter({
	proxy: proxy
}));

app.use(express.static("./public"));


app.listen(port, function() {
	console.log("Express server listening on port " + port);

	console.log("Routes:");
	console.log(app.router.stack);
});
