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

	window.utils = {
		object: _object
	};
})();
