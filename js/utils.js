// ------------------------------------------------------------------------- //
// -- window.utils
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// Dependencies:
//		- <none>
// ------------------------------------------------------------------------- //

(function() {
	// Return a new object which whose prototype is the given old object.
	var _object = function(o) {
		function F() {}
		F.prototype = o;
		return new F();
	};

	// A cross-browser compatible requestAnimationFrame. From
	// https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
	var _myRequestAnimationFrame = 
		window.requestAnimationFrame || // the standard
		window.webkitRequestAnimationFrame || // chrome/safari
		window.mozRequestAnimationFrame || // firefox
		window.oRequestAnimationFrame || // opera
		window.msRequestAnimationFrame || // ie
		function(callback) { // default
			window.setTimeout(callback, 16); // 60fps
		};

	var _getWindowWidth = function() {
		return window.innerWidth || // for good browsers
			document.documentElement.clientWidth || // for IE
			document.body.clientWidth; // for IE
	};

	var _getWindowHeight = function() {
		return window.innerHeight || // for good browsers
			document.documentElement.clientHeight || // for IE
			document.body.clientHeight; // for IE
	};

	window.utils = {
		object: _object,
		myRequestAnimationFrame: _myRequestAnimationFrame,
		getWindowWidth: _getWindowWidth,
		getWindowHeight: _getWindowHeight
	};
})();
