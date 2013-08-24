// ------------------------------------------------------------------------- //
// -- window.Game
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
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

		var _mode1On = true;
		var _mode2On = true;
		var _mode3On = false;
		var _centerSquareSize = 6;
		var _startingLevel = 1;

		var _score = 0;
		var _level = _startingLevel;
		var _gameTime = 0;

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
		var _reset = function() {
			_score = 0;
			_level = _startingLevel;
			_gameTime = 0;
			_isPaused = true;
			_isEnded = true;
			_blocksOnMap = // TODO: ;
			_prevTime = // TODO: ;
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
			return _score;
		};

		var _getLevel = function() {
			return _level;
		};

		var _getTime = function() {
			return _gameTime;
		};

		var _setMode1 = function(isEnabled) {
			_mode1On = isEnabled;
		};

		var _setMode2 = function(isEnabled) {
			_mode2On = isEnabled;
		};

		var _setMode3 = function(isEnabled) {
			_mode3On = isEnabled;
		};

		var _setCenterSquareSize = function(size) {
			_centerSquareSize = size;
		};

		var _setStartingLevel = function(level) {
			_startingLevel = level;
		};

		// ----------------------------------------------------------------- //
		// -- Privileged members

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
		this.setMode1 = _setMode1;
		this.setMode2 = _setMode2;
		this.setMode3 = _setMode3;
		this.setCenterSquareSize = _setCenterSquareSize;
		this.setStartingLevel = _setStartingLevel;

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
