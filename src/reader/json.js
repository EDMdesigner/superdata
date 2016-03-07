/*jslint node: true */
"use strict";

module.exports = function createReader(config) {

	if (!config) {
		throw "JSON READER: please provide a config object";
	}

	if ((config && (config.success || config.message || config.count) && !(config.root || config.record))) {
		throw "JSON READER: If success, message, or count present, root or record must be specified!";
	}

	var recordProp  = config.record;
	var root		= config.root;
	var countProp	= config.count;
	var successProp = config.success;
	var messageProp = config.message;
	var errProp     = config.err || "err";
	var outProp		= config.out;

	function read(response) {

		var rootData = !root ? response : response[root];

		var data = {};

		if (outProp) {
			data[outProp] = recordProp ? rootData[recordProp] : rootData;
		} else {
			data = recordProp ? rootData[recordProp] : rootData;
		}

		if (countProp) {
			data.count = response[countProp];
		}

		if (successProp) {
			data.success = response[successProp];
		}

		if (messageProp) {
			data.message = response[messageProp];
		}

		if (errProp) {
			if (response[errProp]) {
				data.err = response[errProp];
			}
		}

		return data;
	}

	return Object.freeze({
		read: read
	});
};
