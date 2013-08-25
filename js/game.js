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
	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _SOURCE_SQUARE_SIZE = 16; // in pixels

	var _GAME_AREA_SIZE_RATIO = 0.85; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_SIZE_RATIO = 0.10; // a ratio of overall canvas size

	var _PREVIEW_WINDOW_INITIAL_BORDER_WIDTH = 3; // in pixels

	var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME = 30000; // in millis
	var _INITIAL_BLOCK_FALL_SPEED = 1; // in squares per millis

	var _gameAreaSizePixels = 0; // in pixels
	var _previewWindowSizePixels = 0; // in pixels
	var _previewWindowMarginPixels = 0; // in pixels
	var _gameAreaPosition = { x: 0, y: 0 }; // in pixels

	function Game(canvas, levelDisplay, scoreDisplay) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _canvas = canvas;
		var _context = _canvas.getContext("2d");
		var _levelDisplay = levelDisplay;
		var _scoreDisplay = scoreDisplay;

		var _prevTime = 0;
		var _blocksOnMap = new Array(); // the moving, four-square pieces
		var _squaresOnMap = new Array(); // the stationary, single-square pieces
		var _previewWindows = null;

		var _isPaused = true;
		var _isEnded = true;

		var _mode1On = true;
		var _mode2On = true;
		var _mode3On = false;
		var _gameAreaSize = 100; // in number of squares
		var _centerSquareSize = 6; // in number of squares
		var _startingLevel = 1;

		var _squareSizePixels = 0; // in pixels

		var _score = 0;
		var _level = _startingLevel;
		var _gameTime = 0; // active (unpaused) time since start of game
		
		var _currentPreviewWindowCoolDownTime = 30000; // in millis
		var _currentBlockFallSpeed = 1; // in squares per millis

		_computeDimensions();
		_setUpPreviewWindows();

		// The game loop drives the progression of frames and game logic
		var _gameLoop = function() {
			// Get the timing of the current frame
			var currTime = Date.now();
			var deltaTime = currTime - _prevTime;

			// Check whether the game is unpaused
			if (!_isPaused) {
				// Update the game state for the current frame
				_update(deltaTime);
				_draw();
			}

			// Go to the next frame
			_prevTime = currTime;
			window.utils.myRequestAnimationFrame(_gameLoop);
		};

		// TODO: 
		var _update = function(deltaTime) {
			_gameTime += deltaTime;

			for (int i = 0; i < 4; ++i) {
				_previewWindows[i].update(deltaTime);
			}

			for (int i = 0; i < _blocksOnMap.length; ++i) {
				_blocksOnMap[i].update(deltaTime);
			}

			// If any preview window has finished its cool down, then add its 
			// block to the play area and start a new block in preview window
			for (int i = 0; i < 4; ++i) {
				if (_previewWindows[i].isCoolDownFinished()) {
					var block = _previewWindows[i].getCurrentBlock();
					_blocksOnMap.push(block);
					_previewWindows[i].startNewBlock();
				}
			}

			// If any block is at a stationary square and cannot move down, 
			// then add it's squares to the map and delete the block object
			for (int i = 0; i < _blocksOnMap.length; ++i) {
				if (_blocksOnMap[i].checkForCollision(_squaresOnMap)) {
					_blocksOnMap[i].addSquaresToMap(_squaresOnMap);
					_blocksOnMap.splice(i, 1);
				}
			}

			// Loop through each square in the map and possibly animate it 
			// with a shimmer
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

			for (int i = 0; i < 4; ++i) {
				_previewWindows[i].draw(context);
			}

			// ---- Draw the main play area ---- //

			context.save();
			context.translate(_gameAreaPosition.x, _gameAreaPosition.y);

			// Draw each of the falling blocks
			for (int i = 0; i < _blocksOnMap.length; ++i) {
				_blocksOnMap[i].draw(context);
			}

			// Draw each of the stationary squares
			for (int i = 0; i < _squaresOnMap.length; ++i) {
				_drawSquare(context, _squaresOnMap[i], 
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

		var _drawSquare = function(context, squareType, x, y) {
			if (squareType >= 0) {
				var sourceY = squareType * _SOURCE_SQUARE_SIZE;

				context.drawImage(resources.get("img/sprites.png"), 
						0, sourceY, 
						_SOURCE_SQUARE_SIZE, _SOURCE_SQUARE_SIZE, 
						x, y);
			}
		}

		// Set up a new game
		var _reset = function() {
			_score = 0;
			_gameTime = 0;
			_isPaused = true;
			_isEnded = true;
			_blocksOnMap = new Array();
			_squaresOnMap = new Array();
			_prevTime = 0;

			_setLevel(_startingLevel);

			// Start each of the preview windows
			for (int i = 0; i < 4; ++i) {
				_previewWindows[i].startNewBlock();
			}
		};

		var _setLevel = function(level) {
			_level = level;
			_currentPreviewWindowCoolDownTime = _getPreviewWindowCoolDownTime(level);
			_currentBlockFallSpeed = _getBlockFallSpeed(level);

			// Set the base cool down period for each of the preview windows
			for (int i = 0; i < 4; ++i) {
				_previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
			}
		}

		var _getPreviewWindowCoolDownTime = function(level) {
			return _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME / level;// TODO: ****
		};

		var _getBlockFallSpeed = function(level) {
			return _INITIAL_BLOCK_FALL_SPEED;// TODO: ****
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

		var _setGameAreaSize = function(gameAreaSize) {
			_gameAreaSize = gameAreaSize;
			_squareSizePixels = _gameAreaSizePixels / _gameAreaSize;
			window.Block.setSquareSize(_squareSizePixels);
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
