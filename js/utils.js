// ------------------------------------------------------------------------- //
// -- window.utils
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// Dependencies:
//		- <none>
// ------------------------------------------------------------------------- //

(function() {
	log.d("-->utils.LOADING_MODULE");

	// Return a new object which whose prototype is the given old object.
	function _object(o) {
		function F() {}
		F.prototype = o;
		return new F();
	}

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

	function _translateKeyCode(keyCode) {
        var key;

        switch(keyCode) {
        case 32: key = "SPACE"; break;
        case 37: key = "LEFT"; break;
        case 38: key = "UP"; break;
        case 39: key = "RIGHT"; break;
        case 40: key = "DOWN"; break;
        case  8: key = "BACKSPACE"; break;
        case  9: key = "TAB"; break;
        case 13: key = "ENTER"; break;
        case 16: key = "SHIFT"; break;
        case 17: key = "CTRL"; break;
        case 18: key = "ALT"; break;
        case 27: key = "ESCAPE"; break;
        case 46: key = "DELETE"; break;
        default: key = String.fromCharCode(keyCode).toUpperCase(); break;
        }

		return key;
	}

	function _initializeArray(length, initialValue) {
		var array = new Array();

		for (var i = 0; i < length; ++i) {
			array[i] = initalValue;
		}

		return array;
	}

	window.utils = {
		object: _object,
		initializeArray: _initializeArray,
		myRequestAnimationFrame: _myRequestAnimationFrame,
		getWindowWidth: _getWindowWidth,
		getWindowHeight: _getWindowHeight,
		translateKeyCode: _translateKeyCode
	};

	log.d("<--utils.LOADING_MODULE");
})();
