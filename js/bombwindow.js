// ------------------------------------------------------------------------- //
// -- window.BombWindow
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the BombWindow logic is encapsulated in this anonymous function.  
// This is then stored in the window.BombWindow property.  This has the 
// effect of minimizing side-effects and problems when linking multiple script 
// files.
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.Block
//		- utils
// ------------------------------------------------------------------------- //


(function() {
	"use strict";

	log.d("-->bombwindow.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _NORMAL_STROKE_WIDTH = 1; // in pixels
	var _PRIMED_STROKE_WIDTH = 6; // in pixels

	var _COOL_DOWN_SIZE_INCREASE = 0.4; // ratio

	var _PRIMED_SIZE_RATIO = 1.75;

	function BombWindow(x, y, w, h, bombType, bombCount) {
		log.d("-->bombwindow.BombWindow");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _rect = { x: x, y: y, w: w, h: h }; // in pixels

		var _fontString = "bold " + Math.floor(h / 2) + "px monospace";

		var _ellapsedTime = 0;

		var _bombCount = bombCount;

		var _bombType = bombType;

		var _isPrimed = false;

		function _update(deltaTime) {
			_ellapsedTime += deltaTime;
		}

		// The window, its current cool-down progress, and the next block.  
		// The size of the window increases as the cool down progresses.
		function _draw(context) {
			if (game.bombsOn) {
				var x;
				var y;
				var w;
				var h;
				var strokeWidth;
				var fill;
				var stroke;
				var squareX;
				var squareY;

				if (_isPrimed) {
					w = _rect.w * _PRIMED_SIZE_RATIO;
					h = _rect.h * _PRIMED_SIZE_RATIO;
					x = _rect.x - (w - _rect.w) / 2;
					y = _rect.y - (h - _rect.h) / 2;
					strokeWidth = _PRIMED_STROKE_WIDTH;
					fill = game.MEDIUM_COLORS[2].str;
					stroke = game.LIGHT_COLORS[2].str;
				} else {
					x = _rect.x;
					y = _rect.y;
					w = _rect.w;
					h = _rect.h;
					strokeWidth = _NORMAL_STROKE_WIDTH;
					fill = game.DEFAULT_FILL.str;
					stroke = game.DEFAULT_STROKE.str;
				}

				// Draw the background and the border
				context.beginPath();
				context.lineWidth = strokeWidth;
				context.fillStyle = fill;
				context.strokeStyle = stroke;
				context.rect(x, y, w, h);
				context.fill();
				context.stroke();

				// Draw the square representing the bomb
				squareX = x + w * 0.45 - gameWindow.squarePixelSize;
				squareY = y + h * 0.5 - gameWindow.squarePixelSize * 0.5;
				Block.prototype.drawSquare(context, 7 + _bombType, squareX, squareY);

				// Draw the text representing how many bombs are left
				x = x + w * 0.5;
				y = squareY + gameWindow.squarePixelSize;
				context.fillStyle = "white";
				context.font = _fontString;
				context.fillText("x" + _bombCount, x, y);
			}
		}

		function _isPointOverWindow(point) {
			return point.x >= _rect.x && 
				point.x <= _rect.x + _rect.w && 
				point.y >= _rect.y && 
				point.y <= _rect.y + _rect.h;
		}

		// Return true if there are any bombs to prime
		function _primeBomb() {
			if (_bombCount > 0) {
				game.primedWindowIndex = game.keyboardControlOn ? 0 : 4;
				game.primedBombType = _bombType;
				_isPrimed = true;
				return true;
			} else {
				return false;
			}
		}

		function _releaseBomb() {
			game.previewWindows[game.primedWindowIndex].releaseBomb();
			--_bombCount;
			_isPrimed = false;
			game.primedWindowIndex = -1;
			game.primedBombType = -1;
		}

		function _addBomb() {
			++_bombCount;
		}

		function _getBombCount() {
			return _bombCount;
		}

		function _getIsPrimed() {
			return _isPrimed;
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.update = _update;
		this.draw = _draw;
		this.isPointOverWindow = _isPointOverWindow;
		this.primeBomb = _primeBomb;
		this.releaseBomb = _releaseBomb;
		this.addBomb = _addBomb;
		this.getBombCount = _getBombCount;
		this.getIsPrimed = _getIsPrimed;

		log.d("<--bombwindow.BombWindow");
	}

	// Make BombWindow available to the rest of the program
	window.BombWindow = BombWindow;

	BombWindow.prototype.COLLAPSE_BOMB_RADIUS = 5;

	BombWindow.prototype.COLLAPSE_BOMB = 0;
	BombWindow.prototype.SETTLE_BOMB = 1;

	log.i("<--bombwindow.LOADING_MODULE");
}());