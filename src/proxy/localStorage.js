// /*
//  * LocalStorage proxy shell
//  */

//  /*jslint node: true */
//  "use strict";

var createMemoryProxy = require("./memory");
var localStorageCore = require("./localStorageCore");
var storage = (function() {
		try {
			// var testDate = new Date();
			var testDate = "adsfj";

			localStorage.setItem(testDate, testDate);
			var isSame = localStorage.getItem(testDate) === testDate;
			localStorage.removeItem(testDate);
			return isSame && localStorage;
		} catch(e) {
			return false;
		}
	}());

module.exports = localStorageCore({
	createMemoryProxy: createMemoryProxy,
	storage: storage
});
