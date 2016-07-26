/*
 * Rest proxy shell
 */

/*jslint node: true */
"use strict";


var createAjaxProxy = require("./ajax");

var restCore = require("./restCore");

module.exports = restCore({
	createAjaxProxy: createAjaxProxy
});
