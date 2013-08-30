// ------------------------------------------------------------------------- //
// -- window.CenterSquare
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	log.d("-->centersquare.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _STROKE_WIDTH = 2; // pixels

	var _FILL_COLORS = [
		{ r: 178,	g: 22,	b: 44 },	// Red
		{ r: 55,	g: 178,	b: 22 },	// Green
		{ r: 132,	g: 22,	b: 178 },	// Purple
		{ r: 178,	g: 172,	b: 22 },	// Yellow
		{ r: 22,	g: 99,	b: 178 },	// Blue
		{ r: 178,	g: 99,	b: 22 },	// Orange
		{ r: 100,	g: 100,	b: 100 }	// Grey
	];

	var _STROKE_COLORS = [
		{ r: 243,	g: 157,	b: 169 },	// Red
		{ r: 175,	g: 243,	b: 157 },	// Green
		{ r: 218,	g: 157,	b: 243 },	// Purple
		{ r: 243,	g: 240,	b: 157 },	// Yellow
		{ r: 157,	g: 199,	b: 243 },	// Blue
		{ r: 243,	g: 199,	b: 157 },	// Orange
		{ r: 200,	g: 200,	b: 200 }	// Grey
	];

	var _DARKER_COLORS = [
		{ r:61 ,	g: 7,	b: 15 },	// Red
		{ r: 18,	g: 61,	b: 7 },		// Green
		{ r: 45,	g: 7,	b: 61 },	// Purple
		{ r: 61,	g: 58,	b: 7 },		// Yellow
		{ r: 7,		g: 33,	b: 61 },	// Blue
		{ r: 61,	g: 34,	b: 7 },		// Orange
		{ r: 34,	g: 34,	b: 34 }		// Grey
	];

	var _INITIAL_COLOR_PERIOD = 5000; // millis / color

	function _interpolateColors(prevColorRGB, nextColorRGB, progressThroughCurrentColors) {
		var oneMinusProgress = 1 - progressThroughCurrentColors;

		var r = prevColorRGB.r * oneMinusProgress + nextColorRGB.r * progressThroughCurrentColors;
		r = Math.min(r, 255);
		r = r.toString(16);

		var g = prevColorRGB.g * oneMinusProgress + nextColorRGB.g * progressThroughCurrentColors;
		g = Math.min(g, 255);
		g = g.toString(16);

		var b = prevColorRGB.b * oneMinusProgress + nextColorRGB.b * progressThroughCurrentColors;
		b = Math.min(b, 255);
		b = b.toString(16);

		return "#" + r + g + b;
	}

	function CenterSquare() {
		log.d("-->centersquare.CenterSquare");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _x = 0; // in pixels
		var _size = 0; // in pixels

		var _timeSinceLastColor = 0;

		var _prevColorIndex = 0;
		var _nextColorIndex = 0;

		var _currentColorPeriod = _INITIAL_COLOR_PERIOD;
		var _currentFillColor = "#000000";
		var _currentStrokeColor = "#000000";

		function _update(deltaTime) {
			_timeSinceLastColor += deltaTime;

			if (_timeSinceLastColor > _currentColorPeriod) {
				_timeSinceLastColor %= _currentColorPeriod;

				_prevColorIndex = _nextColorIndex;
				_nextColorIndex = Math.floor(Math.random() * 7);
			}

			var progressThroughCurrentColors = _timeSinceLastColor / _currentColorPeriod;

			_currentFillColor = _interpolateColors(_FILL_COLORS[_prevColorIndex], _FILL_COLORS[_nextColorIndex], progressThroughCurrentColors);
			_currentStrokeColor = _interpolateColors(_STROKE_COLORS[_prevColorIndex], _STROKE_COLORS[_nextColorIndex], progressThroughCurrentColors);
		}

		// Draw the square in the center of the game area.  Also, slowly cycle 
		// through the colors.
		function _draw(context) {
			// Draw the background and the border
			context.beginPath();
			context.lineWidth = _STROKE_WIDTH;
			context.fillStyle = _currentFillColor;
			context.strokeStyle = _currentStrokeColor;
			context.rect(_x, _x, _size, _size);
			context.fill();
			context.stroke();
		}

		function _setLevel(level) {
			// TODO: change how quickly the colors cycle
			//_currentColorPeriod = ;
		}

		function _setDimensions(x, size) {
			_x = x;
			_size = size;
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.update = _update;
		this.draw = _draw;
		this.setLevel = _setLevel;
		this.setDimensions = _setDimensions;

		log.d("<--centersquare.CenterSquare");
	};

	// Make CenterSquare available to the rest of the program
	window.CenterSquare = CenterSquare;

	log.d("<--centersquare.LOADING_MODULE");
})();
