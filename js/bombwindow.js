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
// COLORS:
//		- Top:		blue
//		- Right:	yellow
//		- Bottom:	green
//		- Left:		red
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

	function BombWindow(x, y, w, h, bombType, bombCount) {
		log.d("-->bombwindow.BombWindow");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _rect = { x: x, y: y, w: w, h: h }; // in pixels

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
			// TODO: ****
		}

		function _primeBomb() {
			// TODO: ****COLLAPSE BOMB:
			//		- highlight and enlarge the first preview window, and overlay a phantom image of a single block in its center
			//		- add code to catch the mouse clicks and directional button presses in order to first select other preview windows, and then to release the bomb
			//		- in the event of keyboard input, highlight only the one selected window
			//		- in the event of mouse input, highlight ALL preview windows

			// TODO: ****SETTLE BOMB:
			//		- highlight the collapse bomb area (which will be on the bottom left)
			//		- add code to catch the mouse clicks and directional button presses in order to release the bomb
			_isPrimed = true;
		}

		function _releaseBomb() {
			// TODO: ****COLLAPSE BOMB:
			//		- replace the block in the currently selected preview window with a new, single-block collapse bomb
			//		- in addition, set it to have a really short cooldown time (the same as the initial top preview window)
			//		- in fact, lets make all single-square blocks be collapse bombs, which means:
			//			- re-set all block square-size parameter ranges to start at 2, not 1
			//			- whenever deciding on a new block type, give a random chance of picking a collapse bomb; to do so, simply roll a random die before doing the rest of the start-new-block function
			//			- but give these random bombs the normal cooldown time

			// TODO: ****SETTLE BOMB:
			//		- animate the center square so that it vibrates and bounces around briefly
			//		- settle ALL blocks on the map
			//		- I will need to figure out how to determine which direction(s) to settle blocks that are in the diagonal areas
			--_bombCount;
			_isPrimed = false;
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
		this.primeBomb = _primeBomb;
		this.releaseBomb = _releaseBomb;
		this.addBomb = _addBomb;
		this.getBombCount = _getBombCount;
		this.getIsPrimed = _getIsPrimed;

		log.d("<--bombwindow.BombWindow");
	}

	// Make BombWindow available to the rest of the program
	window.BombWindow = BombWindow;

	BombWindow.prototype.COLLAPSE_BOMB = 0;
	BombWindow.prototype.SETTLE_BOMB = 1;

	log.i("<--bombwindow.LOADING_MODULE");
}());
