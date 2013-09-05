// ------------------------------------------------------------------------- //
// -- window.game
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the overall game logic is encapsulated in this anonymous function.  
// This is then stored in the window.game property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.Block
//		- window.PreviewWindow
//		- window.gameWindow
//		- window.input
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->game.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _GAME_AREA_SIZE_RATIO = 0.76; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_SIZE_RATIO = 0.08; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_OUTER_MARGIN_RATIO = 0.02; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_INNER_MARGIN_RATIO = (1 - (_GAME_AREA_SIZE_RATIO + 
			((_PREVIEW_WINDOW_SIZE_RATIO + _PREVIEW_WINDOW_OUTER_MARGIN_RATIO) * 2))) / 2; // a ratio of overall canvas size

	var _START_OF_GAME_INITIAL_COOL_DOWN_PERIOD = 800; // millis
	var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME = 30000; // in millis
	var _PREVIEW_WINDOW_COOL_DOWN_TIME_GROWTH_RATE = -0.10; // linear // TODO: test/tweak this

	var _INITIAL_BLOCK_FALL_SPEED = 0.001; // in squares per millis
	var _BLOCK_FALL_SPEED_GROWTH_RATE = 0.50; // linear // TODO: test/tweak this

	var _INITIAL_CENTER_SQUARE_COLOR_PERIOD = 9000; // millis per color
	var _CENTER_SQUARE_COLOR_PERIOD_GROWTH_RATE = -0.10;

	var _INITIAL_COLLAPSE_DELAY = 500; // millis
	var _COLLAPSE_DELAY_GROWTH_RATE = -0.10;

	var _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL = 3; // TODO: test/tweak this
	var _LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE = 0.334; // TODO: test/tweak this

	var _BASE_SCORE_PER_SQUARE = 10;
	var _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED = 0.02; // TODO: test/tweak this
	var _SCORE_GROWTH_RATE_PER_RECENT_LAYER = 0.50; // TODO: test/tweak this

	var _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD = _INITIAL_COLLAPSE_DELAY + 200;

	var _POINTS_FOR_BONUS = 8000; // TODO: test/tweak this

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

	// ----------------------------------------------------------------- //
	// -- Private members

	var _previewWindowSizePixels = 0; // in pixels
	var _previewWindowOuterMarginPixels = 0; // in pixels
	var _previewWindowInnerMarginPixels = 0; // in pixels

	var _canvas = null;
	var _context = null;
	var _levelDisplay = null;
	var _scoreDisplay = null;
	var _onGameEnd = null;

	var _isLooping = false;

	var _prevTime = 0;
	var _previewWindows = null;

	var _score = 0;
	var _level = 1;
	var _gameTime = 0; // active (unpaused) time since start of game
	var _layersCollapsedCount = 0;
	var _squaresCollapsedCount = 0;
	var _bonusesUsedCount = 0;

	var _currentBlockFallSpeed = _INITIAL_BLOCK_FALL_SPEED; // squares per millis
	var _currentCenterSquareColorPeriod = _INITIAL_CENTER_SQUARE_COLOR_PERIOD; // millis per color

	var _currentPreviewWindowCoolDownTime = _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME; // in millis

	var _layerCountForNextLevel = _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL;
	var _layersCollapsedSinceLastLevel = 0;

	var _recentCollapsesCount = 0;
	var _prevCollapseTime = 0;

	var _pointsForPrevBonus = 0;

	// The game loop drives the progression of frames and game logic
	function _gameLoop() {
		_isLooping = true;

		// Get the timing of the current frame
		var currTime = Date.now();
		var deltaTime = currTime - _prevTime;

		// Check whether the game is unpaused
		if (!game.isPaused && !game.isEnded) {
			// Update the game state for the current frame
			_update(deltaTime);
			_draw();

			_myRequestAnimationFrame(_gameLoop);
		} else {
			_isLooping = false;
		}

		// Go to the next frame
		_prevTime = currTime;
	}

	// Update each of the game entities with the current time.
	function _update(deltaTime) {
		_gameTime += deltaTime;

		var i;

		gameWindow.update(deltaTime);

		// Update the preview windows
		for (i = 0; i < 4; ++i) {
			_previewWindows[i].update(deltaTime);

			// If the preview window has finished its cool down, then add 
			// its block to the game area and start a new block in preview 
			// window
			if (_previewWindows[i].isCoolDownFinished()) {
				_setupNextBlock(_previewWindows[i]);
			}
		}

		// Loop through each square in the game area and possibly animate 
		// it with a shimmer
		// TODO: 
	}

	function _draw() {
		// Clear the canvas
		_context.clearRect(0, 0, _canvas.width, _canvas.height);

		var i;

		// Draw the preview windows
		for (i = 0; i < 4; ++i) {
			_previewWindows[i].draw(_context);
		}

		// Draw the game window
		gameWindow.draw(_context);
	}

	// Set up a new game
	function _reset() {
		log.d("-->game._reset");

		_score = 0;
		_gameTime = 0;
		game.isPaused = true;
		game.isEnded = true;
		_prevTime = 0;

		gameWindow.reset();

		_setLevel(game.startingLevel);

		_layersCollapsedCount = 0;
		_squaresCollapsedCount = 0;
		_bonusesUsedCount = 0;

		var deltaCoolDown = _currentPreviewWindowCoolDownTime / 4;

		// Start each of the preview windows
		for (var i = 0, coolDown = _START_OF_GAME_INITIAL_COOL_DOWN_PERIOD; 
				i < 4; 
				++i, coolDown += deltaCoolDown) {
			_previewWindows[i].startNewBlock(coolDown);
		}

		_recentCollapsesCount = 0;
		_prevCollapseTime = 0;

		log.d("<--game._reset");
	}

	function _setLevel(level) {
		_level = level;

		// Increase the block fall speed
		_currentBlockFallSpeed = utils.getLinGrowthValue(
				_INITIAL_BLOCK_FALL_SPEED, 
				_BLOCK_FALL_SPEED_GROWTH_RATE, 
				_level - 1);
		Block.prototype.setFallSpeed(_currentBlockFallSpeed);

		// Increase the rate of the center square color changes
		_currentCenterSquareColorPeriod = utils.getLinGrowthValue(
				_INITIAL_CENTER_SQUARE_COLOR_PERIOD, 
				_CENTER_SQUARE_COLOR_PERIOD_GROWTH_RATE, 
				_level - 1);
		gameWindow.setCenterSquareColorPeriod(_currentCenterSquareColorPeriod);

		// Decrease the preview window cooldown time
		_currentPreviewWindowCoolDownTime = utils.getLinGrowthValue(
				_INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME, 
				_PREVIEW_WINDOW_COOL_DOWN_TIME_GROWTH_RATE, 
				_level - 1);
		for (var i = 0; i < 4; ++i) {
			_previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
		}

		// Decrease the layer collapse delay
		var layerCollapseDelay = utils.getLinGrowthValue(
				_INITIAL_COLLAPSE_DELAY, 
				_COLLAPSE_DELAY_GROWTH_RATE, 
				_level - 1);
		gameWindow.setLayerCollapseDelay(layerCollapseDelay);

		// Get how many layers need to be collapsed to progress to the 
		// next level
		_layerCountForNextLevel = utils.getLinGrowthValue(
				game.mode2On ? _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL : _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL * 4, 
				_LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE, 
				_level - 1);
		_layersCollapsedSinceLastLevel = 0;

		_levelDisplay.innerHTML = _level;
	}

	function _computeDimensions() {
		gameWindow.gameWindowPixelSize = _canvas.width * _GAME_AREA_SIZE_RATIO;
		_previewWindowSizePixels = _canvas.width * _PREVIEW_WINDOW_SIZE_RATIO;
		_previewWindowOuterMarginPixels = _canvas.width * _PREVIEW_WINDOW_OUTER_MARGIN_RATIO;
		_previewWindowInnerMarginPixels = _canvas.width * _PREVIEW_WINDOW_INNER_MARGIN_RATIO;
		gameWindow.gameWindowPosition.x = _previewWindowSizePixels + _previewWindowOuterMarginPixels + _previewWindowInnerMarginPixels;
		gameWindow.gameWindowPosition.y = gameWindow.gameWindowPosition.x;
	}

	function _setUpPreviewWindows() {
		var size = _previewWindowSizePixels;

		// This is the horizontal distance (in pixels) from the left side 
		// of the canvas to the left side of the top-side preview window
		var tmp1 = (_previewWindowSizePixels / 2) + 
					_previewWindowOuterMarginPixels + 
					_previewWindowInnerMarginPixels + 
					(gameWindow.gameWindowPixelSize / 2);

		// This is the horizontal distance (in pixels) from the left side 
		// of the canvas to the left side of the right-side preview window
		var tmp2 = _previewWindowSizePixels + 
					_previewWindowOuterMarginPixels + 
					(_previewWindowInnerMarginPixels * 2) + 
					gameWindow.gameWindowPixelSize;

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

		_previewWindows = [previewWindow1, previewWindow2, previewWindow3, previewWindow4];
	}

	function _play() {
		// Reset game state if a game is not currently in progress
		if (game.isEnded) {
			_reset();
			game.isEnded = false;
		}

		if (game.isPaused || game.isEnded) {
			_prevTime = Date.now();
		}

		game.isPaused = false;

		// If the game loop is not already running, then start it
		if (!_isLooping) {
			_gameLoop();
		}
	}

	function _pause() {
		game.isPaused = true;
	}

	function _endGame() {
		game.isEnded = true;
		_onGameEnd();
	}

	function _addCollapseToScore(squaresCollapsedCount) {
		_squaresCollapsedCount += squaresCollapsedCount;
		++_layersCollapsedCount;
		++_layersCollapsedSinceLastLevel;

		// Give a slight exponential score increase for the number of 
		// blocks in the current layer collapse
		var score = utils.getExpGrowthValue(
				_BASE_SCORE_PER_SQUARE, 
				game.mode2On ? _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED : _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED / 4, 
				squaresCollapsedCount) * squaresCollapsedCount;

		// Give a large exponential score increase if the previous layer 
		// collapse occurred very recently
		var currentCollapseTime = Date.now();
		_recentCollapsesCount = currentCollapseTime - _prevCollapseTime < _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD ? _recentCollapsesCount + 1 : 0;
		_prevCollapseTime = currentCollapseTime;
		score = utils.getExpGrowthValue(
				score, 
				game.mode2On ? _SCORE_GROWTH_RATE_PER_RECENT_LAYER : _SCORE_GROWTH_RATE_PER_RECENT_LAYER / 4, 
				_recentCollapsesCount);

		_score += Math.floor(score);

		_scoreDisplay.innerHTML = _score;

		// Check whether the player has collapsed enough layers to move on 
		// to the next level
		if (_layersCollapsedSinceLastLevel >= _layerCountForNextLevel) {
			_setLevel(_level + 1);

			createjs.Sound.play("level");
		}

		// Check whether the player has earned anything with the new score
		if (_score > _pointsForPrevBonus + _POINTS_FOR_BONUS) {
			// TODO: give the player the bonus

			_pointsForPrevBonus += _POINTS_FOR_BONUS;

			createjs.Sound.play("earnedBonus");
		}
	}

	function _setupNextBlock(previewWindow) {
		var block = previewWindow.getCurrentBlock();

		// If there is a square on the game area in the way the 
		// new block from being added, then the game is over and 
		// the player has lost
		if (block.checkIsOverTopSquare(gameWindow.squaresOnGameWindow)) {
			game.endGame();
			return;
		}

		gameWindow.blocksOnGameWindow.push(block);
		previewWindow.startNewBlock();

		createjs.Sound.play("newBlock");
	}

	function _forceNextBlock() {
		// Determine which preview window is next
		var nextPreviewWindow = _previewWindows[0];
		var longestTime = _previewWindows[0].getTimeSinceLastBlock();
		var currentTime;
		var i;
		for (i = 0; i < 4; ++i) {
			currentTime = _previewWindows[i].getTimeSinceLastBlock();
			if (currentTime > longestTime) {
				longestTime = currentTime;
				nextPreviewWindow = _previewWindows[i];
			}
		}

		// Force the next preview window to release its block now
		_setupNextBlock(nextPreviewWindow);
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

	function _getLayersCollapsed() {
		return _layersCollapsedCount;
	}

	function _getSquaresCollapsed() {
		return _squaresCollapsedCount;
	}

	function _getBonusesUsed() {
		return _bonusesUsedCount;
	}

	function _setDOMElements(canvas, levelDisplay, scoreDisplay, onGameEnd) {
		_canvas = canvas;
		_context = _canvas.getContext("2d");
		_levelDisplay = levelDisplay;
		_scoreDisplay = scoreDisplay;
		_onGameEnd = onGameEnd;

		_computeDimensions();
		_setUpPreviewWindows();

		gameWindow.init();
	}

	// Make Game available to the rest of the program
	window.game = {
		draw: _draw,
		update: _update,
		reset: _reset,
		play: _play,
		pause: _pause,
		endGame: _endGame,

		getScore: _getScore,
		getLevel: _getLevel,
		getTime: _getTime,
		getLayersCollapsed: _getLayersCollapsed,
		getSquaresCollapsed: _getSquaresCollapsed,
		getBonusesUsed: _getBonusesUsed,

		addCollapseToScore: _addCollapseToScore,

		setDOMElements: _setDOMElements,

		forceNextBlock: _forceNextBlock,

		isPaused: true,
		isEnded: true,
		mode1On: false,
		mode2On: true,
		mode3On: true,
		mode4On: false,
		mode5On: false,
		mode6On: false,
		mode7On: false,
		startingLevel: 1
	};

	log.i("<--game.LOADING_MODULE");
})();
