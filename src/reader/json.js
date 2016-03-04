/*jslint node: true */
"use strict";

module.exports = function createReader(config) {

	if (!config) {
		throw "JSON READER: please provide a config object";
	}

	var recordProp  = config.record;
	var root		= config.root;
	var totalProp	= config.total;
	var successProp = config.success;
	var messageProp = config.message;
	var outProp		= config.out;

	function read(response) {
		
		var rootData = !root ? response : response[root];

		var data = {};

		if (outProp) {
			data[outProp] = recordProp ? rootData[recordProp] : rootData;
		} else {
			data = recordProp ? rootData[recordProp] : rootData;
		}

		if (totalProp) {
			data.count = response[totalProp];
		}

		if (successProp) {
			data.success = response[successProp];
		}

		if (messageProp) {
			data.message = response[messageProp];
		}

		//ERR
		return data;
	}

	return Object.freeze({
		read: read
	});
};