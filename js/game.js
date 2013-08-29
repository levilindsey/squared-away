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

(function() {
	log.d("-->game.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _GAME_AREA_SIZE_RATIO = 0.85; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_SIZE_RATIO = 0.05; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_OUTER_MARGIN_RATIO = 0.01; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_INNER_MARGIN_RATIO = (1 - (_GAME_AREA_SIZE_RATIO + 
			((_PREVIEW_WINDOW_SIZE_RATIO + _PREVIEW_WINDOW_OUTER_MARGIN_RATIO) * 2))) / 2; // a ratio of overall canvas size

	var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME = 30000; // in millis
	var _PREVIEW_WINDOW_COOL_DOWN_TIME_DECREASE_RATE = 0.9; // ratio
	var _INITIAL_BLOCK_FALL_SPEED = 1; // in squares per millis
	var _BLOCK_FALL_SPEED_INCREASE_RATE = 1.1; // ratio
	
	var _INITIAL_COOL_DOWN_PERIOD = 800; // millis

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

	function Game(canvas, levelDisplay, scoreDisplay, onGameEnd) {
		log.d("-->game.Game");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _gameAreaSizePixels = 0; // in pixels
		var _previewWindowSizePixels = 0; // in pixels
		var _previewWindowOuterMarginPixels = 0; // in pixels
		var _previewWindowInnerMarginPixels = 0; // in pixels
		var _gameAreaPosition = { x: 0, y: 0 }; // in pixels

		var _canvas = canvas;
		var _context = _canvas.getContext("2d");
		var _levelDisplay = levelDisplay;
		var _scoreDisplay = scoreDisplay;
		var _onGameEnd = onGameEnd;

		var _prevTime = 0;
		var _blocksOnGameArea = null; // the moving, four-square pieces
		var _squaresOnGameArea = null; // the stationary, single-square pieces
		var _previewWindows = null;

		var _isPaused = true;
		var _isEnded = true;
		var _isLooping = false;

		var _mode1On = false;
		var _mode2On = true;
		var _mode3On = true;
		var _mode4On = false;
		var _mode5On = false;
		var _gameAreaSize = 100; // in number of squares
		var _centerSquareSize = 6; // in number of squares
		var _startingLevel = 1;

		var _squareSizePixels = 0; // in pixels

		var _score = 0;
		var _level = _startingLevel;
		var _gameTime = 0; // active (unpaused) time since start of game

		var _currentPreviewWindowCoolDownTime = 30000; // in millis
		var _currentBlockFallSpeed = 1; // squares / millis

		// The game loop drives the progression of frames and game logic
		function _gameLoop() {
			log.d("-->game._gameLoop");

			_isLooping = true;

			// Get the timing of the current frame
			var currTime = Date.now();
			var deltaTime = currTime - _prevTime;

			// Check whether the game is unpaused
			if (!_isPaused && !_isEnded) {
				// Update the game state for the current frame
				_update(deltaTime);
				_draw();

				_myRequestAnimationFrame(_gameLoop);
			} else {
				_isLooping = false;
			}

			// Go to the next frame
			_prevTime = currTime;

			log.d("<--game._gameLoop");
		}

		// Update each of the game entities with the current time.
		function _update(deltaTime) {
			log.d("-->game._update");

			_gameTime += deltaTime;

			// Update the blocks
			for (var i = 0; i < _blocksOnGameArea.length; ++i) {log.d("---game._update:11");/////TODO/////
				_blocksOnGameArea[i].update(deltaTime, _squaresOnGameArea, _blocksOnGameArea);log.d("---game._update:12");/////TODO/////

				// If the block has reached the edge of the game area and is 
				// trying to fall out, then the game is over and the player 
				// has lost
				if (_blocksOnGameArea[i].getHasCollidedWithEdgeOfArea()) {
					_endGame();
					return;
				}log.d("---game._update:13");/////TODO/////

				// If the block has reached a stationary square and cannot 
				// fall, then add it's squares to the game area and delete the 
				// block object
				if (_blocksOnGameArea[i].getHasCollidedWithSquare()) {
					_blocksOnGameArea[i].addSquaresToGameArea(_squaresOnGameArea);
					_blocksOnGameArea.splice(i, 1);
				}log.d("---game._update:14");/////TODO/////
			}

			// Update the preview windows
			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].update(deltaTime);

				// If the preview window has finished its cool down, then add 
				// its block to the game area and start a new block in preview 
				// window
				if (_previewWindows[i].isCoolDownFinished()) {log.d("---game._update:1");/////TODO/////
					var block = _previewWindows[i].getCurrentBlock();log.d("---game._update:2");/////TODO/////

					// If there is a square on the game area in the way the 
					// new block from being added, then the game is over and 
					// the player has lost
					if (false) { // TODO: 
						_endGame();
						return;
					}

					_blocksOnGameArea.push(block);log.d("---game._update:3");/////TODO/////
					_previewWindows[i].startNewBlock();log.d("---game._update:4");/////TODO/////
				}
			}

			// Loop through each square in the game area and possibly animate 
			// it with a shimmer
			// TODO: 

			// Update the gradually shifting color of the big center square
			// TODO: 

			_levelDisplay.innerHTML = _level;
			_scoreDisplay.innerHTML = _score;

			log.d("<--game._update");
		}

		function _draw() {
			log.d("-->game._draw");

			// Clear the canvas
			_context.clearRect(0, 0, _canvas.width, _canvas.height);

			// ---- Draw the preview windows ---- //

			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].draw(_context);
			}

			// ---- Draw the main play area ---- //

			_context.save();
			_context.translate(_gameAreaPosition.x, _gameAreaPosition.y);

			// Draw each of the falling blocks
			for (var i = 0; i < _blocksOnGameArea.length; ++i) {
				_blocksOnGameArea[i].draw(_context);
			}

			// Draw each of the stationary squares
			for (var i = 0; i < _squaresOnGameArea.length; ++i) {
				window.Block.prototype._drawSquare(
										_context, _squaresOnGameArea[i], 
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

			_context.restore();

			log.d("<--game._draw");
		}

		// Set up a new game
		function _reset() {
			log.d("-->game._reset");

			_score = 0;
			_gameTime = 0;
			_isPaused = true;
			_isEnded = true;
			_blocksOnGameArea = new Array();
			_squaresOnGameArea = window.utils.initializeArray(
									_setGameAreaSize * _setGameAreaSize, -1);
			_prevTime = 0;

			_setLevel(_startingLevel);

			var deltaCoolDown = _currentPreviewWindowCoolDownTime / 3;

			// Start each of the preview windows
			for (var i = 0, coolDown = _INITIAL_COOL_DOWN_PERIOD; 
					i < 4; 
					++i, coolDown += deltaCoolDown) {
				_previewWindows[i].startNewBlock(coolDown);
			}

			log.d("<--game._reset");
		}

		function _setLevel(level) {
			_level = level;
			_currentPreviewWindowCoolDownTime = _getPreviewWindowCoolDownTime(level);
			_currentBlockFallSpeed = _getBlockFallSpeed(level);
			window.Block.prototype.setFallSpeed(_currentBlockFallSpeed);

			// Set the base cool down period for each of the preview windows
			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
			}
		}

		function _getPreviewWindowCoolDownTime(level) {
			return _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME / 
					Math.pow(_PREVIEW_WINDOW_COOL_DOWN_TIME_DECREASE_RATE, level);// TODO: tweak/replace this
		}

		function _getBlockFallSpeed(level) {
			return _INITIAL_BLOCK_FALL_SPEED * 
					Math.pow(_BLOCK_FALL_SPEED_INCREASE_RATE, level);// TODO: tweak/replace this
		}

		function _computeDimensions() {
			_gameAreaSizePixels = _canvas.width * _GAME_AREA_SIZE_RATIO;
			_previewWindowSizePixels = _canvas.width * _PREVIEW_WINDOW_SIZE_RATIO;
			_previewWindowOuterMarginPixels = _canvas.width * _PREVIEW_WINDOW_OUTER_MARGIN_RATIO;
			_previewWindowInnerMarginPixels = _canvas.width * _PREVIEW_WINDOW_INNER_MARGIN_RATIO;
			_gameAreaPosition.x = _previewWindowSizePixels + _previewWindowOuterMarginPixels + _previewWindowInnerMarginPixels;
			_gameAreaPosition.y = _gameAreaPosition.x;
		}

		function _setUpPreviewWindows() {
			var size = _previewWindowSizePixels;

			// This is the horizontal distance (in pixels) from the left side 
			// of the canvas to the left side of the top-side preview window
			var tmp1 = (_previewWindowSizePixels / 2) + 
					   _previewWindowOuterMarginPixels + 
					   _previewWindowInnerMarginPixels + 
					   (_gameAreaSizePixels / 2);

			// This is the horizontal distance (in pixels) from the left side 
			// of the canvas to the left side of the right-side preview window
			var tmp2 = _previewWindowSizePixels + 
					   _previewWindowOuterMarginPixels + 
					   (_previewWindowInnerMarginPixels * 2) + 
					   _gameAreaSizePixels;

			var x1 = tmp1;
			var y1 = _previewWindowInnerMarginPixels;
			var x2 = tmp2;
			var y2 = tmp1;
			var x3 = tmp1;
			var y3 = tmp2;
			var x4 = _previewWindowInnerMarginPixels;
			var y4 = tmp1;

			var previewWindow1 = new PreviewWindow(x1, y1, size, 0);
			var previewWindow2 = new PreviewWindow(x2, y2, size, 1);
			var previewWindow3 = new PreviewWindow(x3, y3, size, 2);
			var previewWindow4 = new PreviewWindow(x4, y4, size, 3);

			log.d("??_canvas.width="+_canvas.width);/////TODO/////
			log.d("??_gameAreaSizePixels="+_gameAreaSizePixels);/////TODO/////
			log.d("??_previewWindowSizePixels="+_previewWindowSizePixels);/////TODO/////
			log.d("??_previewWindowOuterMarginPixels="+_previewWindowOuterMarginPixels);/////TODO/////
			log.d("??_previewWindowInnerMarginPixels="+_previewWindowInnerMarginPixels);/////TODO/////
			log.d("??_gameAreaPosition.x="+_gameAreaPosition.x);/////TODO/////
			log.d("??tmp1="+tmp1);/////TODO/////
			log.d("??tmp2="+tmp2);/////TODO/////

			_previewWindows = [previewWindow1, previewWindow2, previewWindow3, previewWindow4];
		}

		function _play() {
			// Reset game state if a game is not currently in progress
			if (_isEnded) {
				_reset();
				_prevTime = Date.now();
				_isEnded = false;
			}

			_isPaused = false;

			// If the game loop is not already running, then start it
			if (!_isLooping) {
				_gameLoop();
			}
		}

		function _pause() {
			_isPaused = true;
		}

		function _endGame() {
			_isEnded = true;
			_onGameEnd();
		}

		function _getIsPaused() {
			return _isPaused;
		}

		function _getIsEnded() {
			return _isEnded;
		}

		function _getScore() {
			return _score;
		}

		function _getLevel() {
			return _level;
		}

		function _getTime() {
			return _gameTime;
		}

		function _setMode1(isEnabled) {
			_mode1On = isEnabled;
		}

		function _setMode2(isEnabled) {
			_mode2On = isEnabled;
		}

		function _setMode3(isEnabled) {
			_mode3On = isEnabled;
		}

		function _setMode4(isEnabled) {
			_mode4On = isEnabled;
		}

		function _setMode5(isEnabled) {
			_mode5On = isEnabled;
		}

		function _setGameAreaSize(gameAreaSize) {
			_gameAreaSize = gameAreaSize;
			_squareSizePixels = _gameAreaSizePixels / _gameAreaSize;

			window.Block.prototype.setSquareSize(_squareSizePixels);
			window.Block.prototype.setGameAreaIndexSize(_gameAreaSize);
			window.PreviewWindow.prototype.setGameAreaSize(_gameAreaSize);
		}

		function _setCenterSquareSize(centerSquareSize) {
			_centerSquareSize = centerSquareSize;
		}

		function _setStartingLevel(level) {
			_startingLevel = level;
		}

		_computeDimensions();
		_setUpPreviewWindows();

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
		this.setMode5 = _setMode5;
		this.setGameAreaSize = _setGameAreaSize;
		this.setCenterSquareSize = _setCenterSquareSize;
		this.setStartingLevel = _setStartingLevel;

		log.d("<--game.Game");
	};

	// Make Game available to the rest of the program
	window.Game = Game;

	log.d("<--game.LOADING_MODULE");
})();
