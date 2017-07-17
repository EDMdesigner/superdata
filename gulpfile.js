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
				{ files: ["./examples/*.html"], dest: "./dist/examples" },
				{
					files: [
						"./node_modules/knob-js/dist/knob.js",
						"./node_modules/knob-js/dist/knob.min.css",
						"./node_modules/normalize.css/normalize.css",
						"./node_modules/knockout/build/output/knockout-latest.debug.js"
					],
					dest: "./dist/lib"
				}
			]
		},
		js: {
			common: [
				{ entries: "./src/superData.js", outputFileName: "superdata.js" }
			],
			dev: [
				{
					entries: ["./examples/localStorageTest.js"],
					outputFileName: "localStorageTest.js",
					destFolder: "./dist/examples"
				},
				{
					entries: ["./examples/test.js"],
					outputFileName: "test.js",
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