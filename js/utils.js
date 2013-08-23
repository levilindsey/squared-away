// ------------------------------------------------------------------------- //
// -- window.utils
// ------------------------------------------------------------------------- //
// For use with the Squared web app.
// 
// Dependencies:
//		- <none>
// ------------------------------------------------------------------------- //

(function() {
	// Return a new object which whose prototype is the given old object.
	function _object(o) {
		function F() {}
		F.prototype = o;
		return new F();
	}

	function _getWindowWidth() {
		return window.innerWidth || // for good browsers
			document.documentElement.clientWidth || // for IE
			document.body.clientWidth; // for IE
	}

	function _getWindowHeight() {
		return window.innerHeight || // for good browsers
			document.documentElement.clientHeight || // for IE
			document.body.clientHeight; // for IE
	}

	window.utils = {
		object: _object,
		getWindowWidth: _getWindowWidth,
		getWindowWidth: _getWindowWidth
	};
})();
