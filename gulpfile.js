"use strict";

var gulp = require("gulp");
var createSuperGulp = require("edm-supergulp");

var superGulp = createSuperGulp({
	gulp: gulp
});

var packageJson = require("./package.json");

var jsFiles = [
	"./*.js",
	"./src/**/*.js",
	"./spec/**/*.js",
	"./examples/*.js"
];

var jsonFiles = [
	".jshintrc",
	".jscsrc",
	"./package.json",
	"./src/**/*.json",
	"./spec/**/*.json",
	"./examples/*.json"
];

var specFiles = [
	"spec/**/*Spec.js"
];

var sourceFiles = [
	"src/**/*.js"
];

superGulp.taskTemplates.initFrontendTasks({
	packageJson: packageJson,
	coverage: 70,
	files: {
		js: jsFiles,
		json: jsonFiles,
		spec: specFiles,
		source: sourceFiles
	},
	tasks: {
		copy: {
			dev: [
				{files: ["./examples/*.html", "!./examples/localStorageTest.html"], dest: "./dist/examples"},
				{files: "./node_modules/knockout/build/output/knockout-latest.debug.js", dest: "./dist/lib"}
			]
		},
		js: {
			common: [
				{entries: "./src/superData.js", outputFileName: "superdata.js"}
			],
			dev: [
				{
					entries: ["./examples/infiniteLoader.js"],
					outputFileName: "infiniteLoader.js",
					destFolder: "./dist/examples"
				},
				{
					entries: ["./examples/pagination.js"],
					outputFileName: "pagination.js",
					destFolder: "./dist/examples"
				},
				{
					entries: ["./examples/ServerWithMemoryProxy/public/main.js"],
					outputFileName: "main.built.js",
					destFolder: "./examples/ServerWithMemoryProxy/public/"
				}
			]
		},
		sass: []
	}
});

//
// // Watch
// // ==================================================
// function createWatchTask(config) {
// 	var taskToRun = config.taskToRun;
// 	return function () {
// 		gulp.watch([
// 			"./src/**/*.js",
// 			"./examples/**/*.js",
// 			"./src/**/*.html",
// 			"./examples/**/*.html",
// 			"./src/**/*.json"
// 		],
// 		[taskToRun])
// 		.on("change", function (event) {
// 			log(event);
// 		});
// 	};
// }
//
//
// function log (event) {
// 	console.log("File " + event.path + " was " + event.type + ", running tasks...");
// }
//
// var examplesConfigs = {
// 	infiniteLoader: {
// 		entries: ["./examples/infiniteLoader.js"],
// 		outputFileName: "infiniteLoader.built.js",
// 		destFolder: "./examples"
// 	},
// 	pagination: {
// 		entries: ["./examples/pagination.js"],
// 		outputFileName: "pagination.built.js",
// 		destFolder: "./examples"
// 	},
// 	serverWithMemoryProxy: {
// 		entries: ["./examples/ServerWithMemoryProxy/public/main.js"],
// 		outputFileName: "main.built.js",
// 		destFolder: "./examples/ServerWithMemoryProxy/public"
// 	},
// 	knob: {
// 		entries: ["./src/knob/components.js"],
// 		outputFileName: "components.built.js",
// 		destFolder: "./src/knob"
// 	}
// };
//
// for (var prop in examplesConfigs) {
// 	var actConfig = examplesConfigs[prop];
// 	var actBrowserifyTaskName = "browserify-examples-" + prop;
// 	gulp.task(actBrowserifyTaskName, ["jsonlint"], createBrowserifyTask(actConfig));
// 	gulp.task("watch-examples-" + prop, createWatchTask({taskToRun: actBrowserifyTaskName}));
// }
//
// gulp.task("watch:js", function() {
// 	gulp.watch(jsFiles, ["jshint", "jscs"]);
// });
//
// gulp.task("watch-test", function() {
// 	gulp.watch(jsFiles, ["jasmine"]);
// });
//
// gulp.task("test", ["jsonlint", "jshint", "jscs", "istanbul"]);
