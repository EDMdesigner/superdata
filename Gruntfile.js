
module.exports = function(grunt) {

	grunt.initConfig({
		jasmine: {
			test: {
				src: "src/**/*.js",
				options: {
					specs: "specs/*Spec.js",
					keepRunner: true
				}
			}
		},
		jshint: {
			all: ["./src", "./specs"],
			options: {
				curly: true
			}
		},
		watch: {
			files: ["./src/**/*.js", "./specs/**/*.js"],
			tasks: ["default"]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jasmine");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["jshint", "jasmine"]);
};