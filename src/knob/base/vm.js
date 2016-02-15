/*jslint node: true */
"use strict";

var ko = require("knockout");

function createBaseVm(config) {
	var component = config.component;
	var state = ko.observable(config.state || "default");
	var variation = config.variation || "default";

	var style = config.style;
	
	var cssClassComputed = ko.computed(function() {
		return "knob-" + component + " state-" + state() + " variation-" + variation;
	});
	var styleComputed = ko.computed(function() {
		var stateVal = state();
		return style[variation][stateVal];
	});

	var previousState;
	function mouseOver() {
		var actState = state();

		if (actState !== "hover") {
			previousState = actState;
		}

		state("hover");
	}

	function mouseOut() {
		state(previousState);
	}

	function mouseDown() {
		state("active");
	}

	function mouseUp() {
		state("hover");
	}

	return {
		variation: variation,
		state: state,	

		cssClass: cssClassComputed,
		style: styleComputed,

		mouseOver: mouseOver,
		mouseOut: mouseOut,
		mouseDown: mouseDown,
		mouseUp: mouseUp
	};
}

module.exports = createBaseVm;
