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

	function _getElementWidth(element) {
		if (typeof element.clip !== "undefined") {
			return element.clip.width;
		} else if (element.style.pixelWidth) {
			return element.style.pixelWidth;
		} else {
			return element.offsetWidth;
		}
	}

	function _getElementHeight(element) {
		if (typeof element.clip !== "undefined") {
			return element.clip.height;
		} else if (element.style.pixelHeight) {
			return element.style.pixelHeight;
		} else {
			return element.offsetHeight;
		}
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

	function _getHourMinSecTime(millis) {
		var hours = Math.floor(millis / (1000 * 60 * 60));
		hours = hours.toString();
		if (hours.length < 2) {
			hours = "0" + hours;
		}

		var minutes = Math.floor(millis / (1000 * 60)) % 60;
		minutes = minutes.toString();
		if (minutes.length < 2) {
			minutes = "0" + minutes;
		}

		var seconds = Math.floor(millis / 1000) % 60;
		seconds = seconds.toString();
		if (seconds.length < 2) {
			seconds = "0" + seconds;
		}

		var millis = millis % 1000;
		millis = hours.toString();
		while (millis.length < 3) {
			millis = "0" + millis;
		}

		return hours + ":" + minutes + ":" + seconds;
	}

	window.utils = {
		object: _object,
		initializeArray: _initializeArray,
		getWindowWidth: _getWindowWidth,
		getWindowHeight: _getWindowHeight,
		getElementWidth: _getElementWidth,
		getElementHeight: _getElementHeight,
		translateKeyCode: _translateKeyCode,
		getHourMinSecTime: _getHourMinSecTime
	};

	log.d("<--utils.LOADING_MODULE");
})();
