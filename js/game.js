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
//		- window.log
//		- window.Sprite
//		- window.Block
//		- window.PreviewWindow
//		- window.GameWindow
//		- window.utils
// ------------------------------------------------------------------------- //

if (DEBUG) {
	log.d("--> game.js: LOADING");
}

(function() {
	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _GAME_AREA_SIZE_RATIO = 0.85; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_SIZE_RATIO = 0.10; // a ratio of overall canvas size

	var _PREVIEW_WINDOW_INITIAL_BORDER_WIDTH = 3; // in pixels

	var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME = 30000; // in millis
	var _PREVIEW_WINDOW_COOL_DOWN_TIME_DECREASE_RATE = 0.9; // ratio
	var _INITIAL_BLOCK_FALL_SPEED = 1; // in squares per millis
	var _BLOCK_FALL_SPEED_INCREASE_RATE = 1.1; // ratio

	var _gameAreaSizePixels = 0; // in pixels
	var _previewWindowSizePixels = 0; // in pixels
	var _previewWindowMarginPixels = 0; // in pixels
	var _gameAreaPosition = { x: 0, y: 0 }; // in pixels

	function Game(canvas, levelDisplay, scoreDisplay, onGameEnd) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _canvas = canvas;
		var _context = _canvas.getContext("2d");
		var _levelDisplay = levelDisplay;
		var _scoreDisplay = scoreDisplay;
		var _onGameEnd = onGameEnd;

		var _prevTime = 0;
		var _blocksOnGameArea = new Array(); // the moving, four-square pieces
		var _squaresOnGameArea = new Array(); // the stationary, single-square pieces
		var _previewWindows = null;

		var _isPaused = true;
		var _isEnded = true;

		var _mode1On = true;
		var _mode2On = true;
		var _mode3On = false;
		var _mode4On = false;
		var _gameAreaSize = 100; // in number of squares
		var _centerSquareSize = 6; // in number of squares
		var _startingLevel = 1;

		var _squareSizePixels = 0; // in pixels

		var _score = 0;
		var _level = _startingLevel;
		var _gameTime = 0; // active (unpaused) time since start of game

		var _currentPreviewWindowCoolDownTime = 30000; // in millis
		var _currentBlockFallSpeed = 1; // squares / millis

		_computeDimensions();
		_setUpPreviewWindows();

		// The game loop drives the progression of frames and game logic
		var _gameLoop = function() {
			// Get the timing of the current frame
			var currTime = Date.now();
			var deltaTime = currTime - _prevTime;

			// Check whether the game is unpaused
			if (!_isPaused && !_isEnded) {
				// Update the game state for the current frame
				_update(deltaTime);
				_draw();

				window.utils.myRequestAnimationFrame(_gameLoop);
			}

			// Go to the next frame
			_prevTime = currTime;
		};

		// Update each of the game entities with the current time.
		var _update = function(deltaTime) {
			_gameTime += deltaTime;

			// Update the blocks
			for (var i = 0; i < _blocksOnGameArea.length; ++i) {
				_blocksOnGameArea[i].update(deltaTime, _squaresOnGameArea, _blocksOnGameArea);

				// If the block has reached the edge of the game area and is 
				// trying to fall out, then the game is over and the player 
				// has lost
				if (_blocksOnGameArea[i].getHasCollidedWithEdgeOfArea()) {
					_endGame();
				}

				// If the block has reached a stationary square and cannot 
				// fall, then add it's squares to the game area and delete the 
				// block object
				if (_blocksOnGameArea[i].getHasCollidedWithSquare()) {
					_blocksOnGameArea[i].addSquaresToGameArea(_squaresOnGameArea);
					_blocksOnGameArea.splice(i, 1);
				}
			}

			// Update the preview windows
			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].update(deltaTime);

				// If the preview window has finished its cool down, then add 
				// its block to the game area and start a new block in preview 
				// window
				if (_previewWindows[i].isCoolDownFinished()) {
					var block = _previewWindows[i].getCurrentBlock();

					// If there is a square on the game area in the way the 
					// new block from being added, then the game is over and 
					// the player has lost
					if (false) { // TODO: 
						_endGame();
					}

					_blocksOnGameArea.push(block);
					_previewWindows[i].startNewBlock();
				}
			}

			// Loop through each square in the game area and possibly animate 
			// it with a shimmer
			// TODO: 

			// Update the gradually shifting color of the big center square
			// TODO: 

			_levelDisplay.innerHtml = level;
			_scoreDisplay.innerHtml = score;
		};

		function _draw() {
			// Clear the canvas
			context.clearRect(_canvas.width, _canvas.height);

			// ---- Draw the preview windows ---- //

			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].draw(context);
			}

			// ---- Draw the main play area ---- //

			context.save();
			context.translate(_gameAreaPosition.x, _gameAreaPosition.y);

			// Draw each of the falling blocks
			for (var i = 0; i < _blocksOnGameArea.length; ++i) {
				_blocksOnGameArea[i].draw(context);
			}

			// Draw each of the stationary squares
			for (var i = 0; i < _squaresOnGameArea.length; ++i) {
				window.Block._drawSquare(context, _squaresOnGameArea[i], 
										 i % _gameAreaSize, i / _gameAreaSize);
			}

			// Check whether a block is selected
			if (true) {// TODO: 
				// Draw horizontal and vertical guide lines
				// TODO: 

				// Draw an enlarged version of the selected block
				// TODO: (this should include a light-neon-blue border (i.e., a slightly larger programmatical rectangle rendered behind each of the block's foreground squares))
			}

			// Check whether there are currently any disintigrating sections
			if (true) {// TODO: 
				// Draw the disintigrating sections
				// TODO: ?????
			}

			context.restore();
		};

		// Set up a new game
		var _reset = function() {
			_score = 0;
			_gameTime = 0;
			_isPaused = true;
			_isEnded = true;
			_blocksOnGameArea = new Array();
			_squaresOnGameArea = window.utils._initializeArray(
									_setGameAreaSize * _setGameAreaSize, -1);
			_prevTime = 0;

			_setLevel(_startingLevel);

			// Start each of the preview windows
			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].startNewBlock();
			}
		};

		var _setLevel = function(level) {
			_level = level;
			_currentPreviewWindowCoolDownTime = _getPreviewWindowCoolDownTime(level);
			_currentBlockFallSpeed = _getBlockFallSpeed(level);
			Block.setFallSpeed(_currentBlockFallSpeed);

			// Set the base cool down period for each of the preview windows
			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
			}
		}

		var _getPreviewWindowCoolDownTime = function(level) {
			return _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME / 
					Math.pow(_PREVIEW_WINDOW_COOL_DOWN_TIME_DECREASE_RATE, level);// TODO: tweak/replace this
		};

		var _getBlockFallSpeed = function(level) {
			return _INITIAL_BLOCK_FALL_SPEED * 
					Math.pow(_BLOCK_FALL_SPEED_INCREASE_RATE, level);// TODO: tweak/replace this
		};

		var _computeDimensions = function() {
			_gameAreaSizePixels = canvas.width * _GAME_AREA_SIZE_RATIO;
			_previewWindowSizePixels = canvas.width * _PREVIEW_WINDOW_SIZE_RATIO;
			_previewWindowMarginPixels = canvas.width * (1 - (_GAME_AREA_SIZE_RATIO + _PREVIEW_WINDOW_SIZE_RATIO));
			_gameAreaPosition.x = _previewWindowSizePixels + _previewWindowMarginPixels;
			_gameAreaPosition.y = _gameAreaPosition.x;
		};

		var _setUpPreviewWindows = function() {
			var size = _previewWindowSizePixels;

			// This is the horizantal distance (in pixels) from the left side 
			// of the canvas to the left side of the top-side preview window
			var tmp1 = (_previewWindowSizePixels / 2) + 
						_previewWindowMarginPixels + (_gameAreaSizePixels / 2);

			// This is the horizontal distance (in pixels) from the left side 
			// of the canvas to the left side of the right-side preview window
			var tmp2 = _previewWindowSizePixels + _gameAreaSizePixels + 
						(_previewWindowMarginPixels * 2);

			var x1 = tmp1;
			var y1 = 0;
			var x2 = tmp2;
			var y2 = tmp1;
			var x3 = tmp1;
			var y3 = tmp2;
			var x4 = 0;
			var y4 = tmp1;

			var previewWindow1 = new PreviewWindow(x1, y1, size);
			var previewWindow2 = new PreviewWindow(x2, y2, size);
			var previewWindow3 = new PreviewWindow(x3, y3, size);
			var previewWindow4 = new PreviewWindow(x4, y4, size);

			_previewWindows = [previewWindow1, previewWindow2, previewWindow3, previewWindow4];
		};

		var _play = function() {
			// Reset game state if a game is not currently in progress
			if (_isEnded) {
				_reset();
				_prevTime = Date.now();
				_isEnded = false;
			}

			_isPaused = false;
		};

		var _pause = function() {
			_isPaused = true;
		};

		var _endGame = function() {
			_isEnded = true;
			_onGameEnd();
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

		var _setMode4 = function(isEnabled) {
			_mode4On = isEnabled;
		};

		var _setGameAreaSize = function(gameAreaSize) {
			_gameAreaSize = gameAreaSize;
			_squareSizePixels = _gameAreaSizePixels / _gameAreaSize;

			window.Block.setSquareSize(_squareSizePixels);
			window.Block.setGameAreaIndexSize(_gameAreaSize);
			window.PreviewWindow.setGameAreaSize(_gameAreaSize);
		};

		var _setCenterSquareSize = function(centerSquareSize) {
			_centerSquareSize = centerSquareSize;
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
		this.getIsPaused = _getIsPaused;
		this.getIsEnded = _getIsEnded;
		this.getScore = _getScore;
		this.getLevel = _getLevel;
		this.getTime = _getTime;
		this.setMode1 = _setMode1;
		this.setMode2 = _setMode2;
		this.setMode3 = _setMode3;
		this.setMode4 = _setMode4;
		this.setGameAreaSize = _setGameAreaSize;
		this.setCenterSquareSize = _setCenterSquareSize;
		this.setStartingLevel = _setStartingLevel;
	};

	Game.prototype = {
		// TODO: 
	};

	// Make Game available to the rest of the program
	window.Game = Game;
})();

if (DEBUG) {
	log.d("<-- game.js: LOADING");
}
