var gulp = require("gulp");
var browserify = require("browserify");
var brfs = require("gulp-brfs");
var stringify = require("stringify");
var source = require("vinyl-source-stream");
var partialify = require("partialify");
var jsonlint	= require("gulp-jsonlint");

gulp.task("jsonlint", function() {
	return gulp.src(["src/featureConfigDefaults/**/*.json", "src/modules/**/*.json"])
		.pipe(jsonlint())
		.pipe(jsonlint.failOnError());
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

function createWatchTask(config) {
	var taskToRun = config.taskToRun;
	return function () {
		gulp.watch(["./src/**/*.js", "./examples/**/*.js", "./src/**/*.html", "./examples/**/*.html", "./src/**/*.json"], [taskToRun])
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
