// ------------------------------------------------------------------------- //
// -- window.Sprite
// ------------------------------------------------------------------------- //
// For use with the Squared web app.
// 
// All of the Sprite logic is encapsulated in this anonymous function.  This is 
// then stored in the window.Sprite property.  This has the effect of minimizing 
// side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	// Constructor
	function Sprite() {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _url = null;
		var _sourceRect = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};

		var _setURL = function(url) {
			_url = url;
		}

		var _setSourceRect = function(x, y, width, height) {
			_sourceRect.x = x;
			_sourceRect.y = y;
			_sourceRect.width = width;
			_sourceRect.height = height;
		}

		var _drawFromSource = function(context, x, y) {
			context.drawImage(resources.get(_url), 
					_sourceRect.x, _sourceRect.y, 
					_sourceRect.width, _sourceRect.height, 
					x, y);
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.setURL = _setURL;
		this.setSourceRect = _setSourceRect;
		this.drawFromSource = _drawFromSource;
	};

	Sprite.prototype = {
		// TODO: 
	};

	// Make Sprite available to the rest of the program
	window.Sprite = Sprite;
})();
