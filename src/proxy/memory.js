/*
 * Memory proxy shell
 */

/*jslint node: true */
"use strict";

var messages = require("../errorMessages");

var memoryCore = require("./memoryCore");

module.exports = memoryCore({
	messages: messages
});