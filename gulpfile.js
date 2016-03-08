var gulp = require("gulp");
var jscs = require("gulp-jscs");
var jshint = require("gulp-jshint");
var stylish = require("gulp-jscs-stylish");
var jasmine = require("gulp-jasmine");
var jsonlint = require("gulp-jsonlint");
var browserify = require("browserify");
var partialify = require("partialify");
var source = require("vinyl-source-stream");

var jsFiles = [
	"./**/*.js",
	"!node_modules/**/*",
	"!examples/**/node_modules/**/*",
	"!*/**/*.json",
	"!./**/*.built.js"
];

var jsonFiles = [
	".jshintrc",
	".jscsrc",
	"!node_modules/**/*",
	"./**/*.json"
];

var jasmineFiles = [
	"spec/**/*.js"
];

gulp.task("jsonlint", function() {
	return gulp.src(jsonFiles)
		.pipe(jsonlint())
		.pipe(jsonlint.failOnError());
});


// JS Hint
// ==================================================
gulp.task("jshint", function() {
	return gulp.src(jsFiles)
		.pipe(jshint(".jshintrc"))
		.pipe(jshint.reporter("jshint-stylish"))
		.pipe(jshint.reporter("fail"));
});


// JS CodeStyle
// ==================================================
gulp.task("jscs", function() {
	return gulp.src(jsFiles)
		.pipe(jscs({
			configPath: ".jscsrc",
			fix: true
		}))
		.pipe(stylish())
		.pipe(jscs.reporter("fail"));
});


gulp.task("jasmine", function() {
	return gulp.src(jasmineFiles)
	.pipe(jasmine({
		verbose: true
	}));
});


function createBrowserifyTask(config) {
	return function() {
		var bundleMethod = browserify;//global.isWatching ? watchify : browserify;

		var bundler = bundleMethod({
			// Specify the entry point of your app
			debug: true,
			entries: config.entries
		});

		var bundle = function() {
			return bundler
				.transform(partialify)
				// Enable source maps!
				.bundle()
				// Use vinyl-source-stream to make the
				// stream gulp compatible. Specifiy the
				// desired output filename here.
				.pipe(source(config.outputFileName))
				// Specify the output destination
				.pipe(gulp.dest(config.destFolder));
		};

		return bundle();
	};
}


// Watch
// ==================================================
function createWatchTask(config) {
	var taskToRun = config.taskToRun;
	return function () {
		gulp.watch([
			"./src/**/*.js",
			"./examples/**/*.js",
			"./src/**/*.html",
			"./examples/**/*.html",
			"./src/**/*.json"
		],
		[taskToRun])
		.on("change", function (event) {
			log(event);
		});
	};
}


function log (event) {
	console.log("File " + event.path + " was " + event.type + ", running tasks...");
}

var examplesConfigs = {
	infiniteLoader: {
		entries: ["./examples/infiniteLoader.js"],
		outputFileName: "infiniteLoader.built.js",
		destFolder: "./examples"
	},
	pagination: {
		entries: ["./examples/pagination.js"],
		outputFileName: "pagination.built.js",
		destFolder: "./examples"
	},
	serverWithMemoryProxy: {
		entries: ["./examples/ServerWithMemoryProxy/public/main.js"],
		outputFileName: "main.built.js",
		destFolder: "./examples/ServerWithMemoryProxy/public"
	},
	knob: {
		entries: ["./src/knob/components.js"],
		outputFileName: "components.built.js",
		destFolder: "./src/knob"
	}
};

for (var prop in examplesConfigs) {
	var actConfig = examplesConfigs[prop];
	var actBrowserifyTaskName = "browserify-examples-" + prop;
	gulp.task(actBrowserifyTaskName, ["jsonlint"], createBrowserifyTask(actConfig));
	gulp.task("watch-examples-" + prop, createWatchTask({taskToRun: actBrowserifyTaskName}));
}

gulp.task("watch:js", function() {
	gulp.watch(jsFiles, ["jshint", "jscs"]);
});

gulp.task("watch-test", function() {
	gulp.watch(jsFiles, ["jasmine"]);
});

gulp.task("test", ["jsonlint", "jshint", "jscs", "jasmine"]);