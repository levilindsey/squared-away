// ------------------------------------------------------------------------- //
// -- window.Game
// ------------------------------------------------------------------------- //
// For use with the Squared web app.
// 
// All of the overall Game logic is encapsulated in this anonymous function.  
// This is then stored in the window.Game property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.Sprite
//		- window.Block
//		- window.PreviewWindow
//		- window.GameWindow
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	function Game(canvas) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _canvas = canvas;
		var _context = _canvas.getContext("2d");

		var _prevTime = // TODO; ;
		var _blocksOnMap = // TODO: ;

		var _isPaused = true;
		var _isEnded = true;

		// Finishing setting up game logic
		var _init = function() {
			// TODO: 
		};

		// The game loop drives the progression of frames and game logic
		var _gameLoop = function() {
			// Get the timing of the current frame
			var currTime = Date.now();
			var deltaTime = currTime - _prevTime;

			// Update the game state for the current frame
			_update(deltaTime);
			_draw();

			// Go to the next frame
			_prevTime = currTime;
			window.utils.myRequestAnimationFrame(_gameLoop);
		};

		// TODO: 
		var _update = function() {
			// TODO: 
		};

		// TODO: 
		function _draw() {
			// Clean the canvas
			context.clearRect(_canvas.width, _canvas.height);

			// Draw each of the falling blocks
			// TODO: 

			// Draw each of the stationary squares
			// TODO: 

			// Check whether a block is selected
			if () {
				// Draw horizontal and vertical guide lines
				// TODO: 

				// Draw an enlarged version of the selected block
				// TODO: (this should include a light-neon-blue border (i.e., a slightly larger programmatical rectangle rendered behind each of the block's foreground squares))
			}

			// Check whether there are currently any disintigrating sections
			if () {
				// Draw the disintigrating sections
				// TODO: ?????
			}
		};

		// Set up a new game
		var _reset = function(squareMode, canSwitchDirections, startingLevel) {
			// TODO: 
		};

		var _play = function() {
			// Reset game state if a game is not currently in progress
			if (_isEnded) {
				_reset();
				_isEnded = false;
			}

			// TODO: unpause basically
		};

		var _pause = function() {
			_isPaused = true;
			// TODO: 
		};

		var _unpause = function() {
			_isPaused = false;
			// TODO: 
		};

		var _getIsPaused() {
			return _isPaused;
		};

		var _getIsEnded() {
			return _isEnded;
		};

		var _getScore = function() {
			// TODO: 
		};

		var _getLevel = function() {
			// TODO: 
		};

		var _getTime = function() {
			// TODO: 
		};

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.init = _init;
		this.draw = _draw;
		this.update = _update;
		this.reset = _reset;
		this.play = _play;
		this.pause = _pause;
		this.unpause = _unpause;
		this.getIsPaused = _getIsPaused;
		this.getIsEnded = _getIsEnded;
		this.getScore = _getScore;
		this.getLevel = _getLevel;
		this.getTime = _getTime;

		// TODO: 
		//		- set up each of the preview windows (create initial blocks, set up their cooldowns, etc.)
		//		- 
	};

	Game.prototype = {
		// TODO: 
	};

	// Make Game available to the rest of the program
	window.Game = Game;
})();
