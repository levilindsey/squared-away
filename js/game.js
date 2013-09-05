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
	"use strict";

	log.d("-->game.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _GAME_AREA_SIZE_RATIO = 0.76; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_SIZE_RATIO = 0.08; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_OUTER_MARGIN_RATIO = 0.02; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_INNER_MARGIN_RATIO = (1 - (_GAME_AREA_SIZE_RATIO + 
			((_PREVIEW_WINDOW_SIZE_RATIO + _PREVIEW_WINDOW_OUTER_MARGIN_RATIO) * 2))) / 2; // a ratio of overall canvas size

	var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME = 30000; // in millis
	var _PREVIEW_WINDOW_COOL_DOWN_TIME_GROWTH_RATE = -0.10; // linear // TODO: test/tweak this

	var _INITIAL_BLOCK_FALL_SPEED = 0.001; // in squares per millis
	var _BLOCK_FALL_SPEED_GROWTH_RATE = 0.50; // linear // TODO: test/tweak this

	var _INITIAL_CENTER_SQUARE_COLOR_PERIOD = 9000; // millis per color
	var _CENTER_SQUARE_COLOR_PERIOD_GROWTH_RATE = -0.10;

	var _START_OF_GAME_INITIAL_COOL_DOWN_PERIOD = 800; // millis

	var _NORMAL_STROKE_WIDTH = 1; // in pixels

	var _NORMAL_STROKE_COLOR = "#5a5a5a";
	var _NORMAL_FILL_COLOR = "#141414";

	// The gesture types
	var _NONE = 1;
	var _ROTATION = 2;
	var _SIDEWAYS_MOVE = 3;
	var _DROP = 4;
	var _DIRECTION_CHANGE = 5;

	var _INVALID_MOVE_FILL_COLOR = "rgba(255,150,150,0.4)"; // TODO: change this to a neon red color, with the stroke lighter than the fill
	var _INVALID_MOVE_STROKE_COLOR = "rgba(255,150,150,0.4)"; // TODO: change this to a neon red color, with the stroke lighter than the fill
	var _VALID_MOVE_FILL_COLOR = "rgba(100,200,255,0.2)"; // TODO: change this to a neon blue color, with the stroke lighter than the fill
	var _VALID_MOVE_STROKE_COLOR = "rgba(100,200,255,0.2)"; // TODO: change this to a neon blue color, with the stroke lighter than the fill
	var _PHANTOM_GUIDE_LINE_STROKE_WIDTH = 1;
	var _PHANTOM_BLOCK_STROKE_WIDTH = 2;
	var _PHANTOM_BLOCK_SIZE_RATIO = 1.2;

	var _blockSelect_SQUARED_DISTANCE_THRESHOLD = 1200; // TODO: test this
	var _TAP_SQUARED_DISTANCE_THRESHOLD = 100; // TODO: test this
	var _TAP_TIME_THRESHOLD = 180; // TODO: test this

	var _INITIAL_COLLAPSE_DELAY = 500; // millis
	var _COLLAPSE_DELAY_GROWTH_RATE = -0.10;

	var _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE = 140; // pixels

	var _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL = 3; // TODO: test/tweak this
	var _LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE = 0.1; // TODO: test/tweak this

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

	function Game(canvas, levelDisplay, scoreDisplay, onGameEnd) {
		log.d("-->game.Game");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _gameAreaCellSizePixels = 0; // in pixels
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
		var _centerSquare = null;

		var _isPaused = true;
		var _isEnded = true;
		var _isLooping = false;

		var _mode1On = false;
		var _mode2On = true;
		var _mode3On = true;
		var _mode4On = false;
		var _mode5On = false;
		var _gameAreaCellSize = 100; // in number of squares
		var _centerSquareCellSize = 6; // in number of squares
		var _centerSquareCellPositionX = 47;
		var _startingLevel = 1;

		var _squareSizePixels = 0; // in pixels

		var _score = 0;
		var _level = _startingLevel;
		var _gameTime = 0; // active (unpaused) time since start of game
		var _layersCollapsedCount = 0;
		var _squaresCollapsedCount = 0;
		var _bonusesUsedCount = 0;

		var _currentPreviewWindowCoolDownTime = _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME; // in millis
		var _currentBlockFallSpeed = _INITIAL_BLOCK_FALL_SPEED; // squares per millis
		var _currentCenterSquareColorPeriod = _INITIAL_CENTER_SQUARE_COLOR_PERIOD; // millis per color

		var _gestureStartTime = 0;
		var _gestureStartPos = { x: 0, y: 0 };
		var _gestureCurrentTime = 0;
		var _gestureCurrentPos = { x: 0, y: 0 };

		var _gestureType = _NONE;
		var _gestureCellPos = { x: 0, y: 0 };

		var _selectedBlock = null;

		var _phantomBlock = null;
		var _phantomBlockPolygon = null;
		var _isPhantomBlockValid = false;
		var _phantomGuideLinePolygon = null;

		var _layerCollapseDelay = _INITIAL_COLLAPSE_DELAY;
		var _ellapsedCollapseTime = _layerCollapseDelay;

		var _layerCountForNextLevel = _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL;
		var _layersCollapsedSinceLastLevel = 0;

		var _recentCollapsesCount = 0;
		var _prevCollapseTime = 0;

		var _pointsForPrevBonus = 0;

		// This array contains objects which each have the properties collapseDelay and layer
		var _layersToCollapse = [];

		// The game loop drives the progression of frames and game logic
		function _gameLoop() {
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
		}

		// Update each of the game entities with the current time.
		function _update(deltaTime) {
			_gameTime += deltaTime;

			// Update the center square
			_centerSquare.update(deltaTime);

			var i;
			var layersWereCollapsed = false;

			// There is a small collapse delay between the time when a layer 
			// is completed and when it is collapsed.  However, if there are 
			// any other layers waiting to be collapsed, then ALL pending 
			// layers need to be collapsed simultaneously.  So we can use a 
			// single timer for any number of pending layers.
			_ellapsedCollapseTime += deltaTime;
			if (_ellapsedCollapseTime >= _layerCollapseDelay) {
				// Sort the completed layers by descending layer number
				_layersToCollapse.sort(function(a, b) {
					if (_mode2On) {
						return b.layer - a.layer;
					} else {
						return b - a;
					}
				});

				// Collapse any pending layers
				while (_layersToCollapse.length > 0) {
					_collapseLayer(_layersToCollapse[0]);
					_layersToCollapse.splice(0, 1);
					layersWereCollapsed = true;

					// Change each of the squares' values in this layer to 
					// represent the appropriate sprite for the current stage of 
					// the collapse animation
					// TODO: *******!!!!!! (if I actually want to represent the animation of collapse with different cell numbers, then I am going to have to refactor each of the places in the code that look at _squaresOnGameArea[i] < 0 and make sure that they also behave correctly with _squaresOnGameArea[i] equal to the weird animating collapse numbers
				}
			}

			if (layersWereCollapsed) {
				// Collapsing layers has the potential to complete additional 
				// layers, so we should check for that now
				_checkForCompleteLayers();

				// TODO: settle stuff?
			}

			// Update the blocks
			for (i = 0; i < _blocksOnGameArea.length; ++i) {
				_blocksOnGameArea[i].update(deltaTime, _squaresOnGameArea, _blocksOnGameArea);

				// If the block has reached the edge of the game area and is 
				// trying to fall out, then the game is over and the player 
				// has lost
				if (_blocksOnGameArea[i].getHasCollidedWithEdgeOfArea()) {
					_endGame();
					return;
				}

				// Check whether the block has reached a stationary square and 
				// can no longer fall
				if (_blocksOnGameArea[i].getHasCollidedWithSquare()) {
					// Add it's squares to the game area and delete the block 
					// object
					var newCellPositions = _blocksOnGameArea[i].addSquaresToGameArea(_squaresOnGameArea);
					_blocksOnGameArea.splice(i, 1);

					// Check whether this landed block causes the collapse of any layers
					var layersWereCompleted = _checkForCompleteLayers(newCellPositions);

					// Check whether this was the last active block
					if (_blocksOnGameArea.length === 0) {
						// Determine which preview window is next
						var nextPreviewWindow = _previewWindows[0];
						var longestTime = _previewWindows[0].getTimeSinceLastBlock();
						var currentTime;
						for (i = 0; i < 4; ++i) {
							currentTime = _previewWindows[i].getTimeSinceLastBlock();
							if (currentTime > longestTime) {
								longestTime = currentTime;
								nextPreviewWindow = _previewWindows[i];
							}
						}

						// Force the next preview window to release its block now
						_getNextBlock(nextPreviewWindow);
					}

					if (layersWereCompleted) {
						createjs.Sound.play("collapse");
						createjs.Sound.play("land");// TODO: check whether I actually do want to play these clips simultaneously
					} else {
						createjs.Sound.play("land");
					}
				}

				// In case the selected block falls without the player 
				// spawning any drag events, the gesture type and phantom 
				// shapes need to be updated
				if (_blocksOnGameArea[i] === _selectedBlock) {
					_dragGesture(_gestureCurrentPos);
				}
			}

			// Update the preview windows
			for (i = 0; i < 4; ++i) {
				_previewWindows[i].update(deltaTime);

				// If the preview window has finished its cool down, then add 
				// its block to the game area and start a new block in preview 
				// window
				if (_previewWindows[i].isCoolDownFinished()) {
					_getNextBlock(_previewWindows[i]);
				}
			}

			// Loop through each square in the game area and possibly animate 
			// it with a shimmer
			// TODO: 
		}

		function _draw() {
			// Clear the canvas
			_context.clearRect(0, 0, _canvas.width, _canvas.height);

			// Draw the background and the border
			_context.beginPath();
			_context.lineWidth = _NORMAL_STROKE_WIDTH;
			_context.fillStyle = _NORMAL_FILL_COLOR;
			_context.strokeStyle = _NORMAL_STROKE_COLOR;
			_context.rect(_gameAreaPosition.x, _gameAreaPosition.y, _gameAreaCellSizePixels, _gameAreaCellSizePixels);
			_context.fill();
			_context.stroke();

			var i;

			// ---- Draw the preview windows ---- //

			for (i = 0; i < 4; ++i) {
				_previewWindows[i].draw(_context);
			}

			// ---- Draw the center square ---- //

			_centerSquare.draw(_context);

			// ---- Draw the main play area ---- //

			_context.save();
			_context.translate(_gameAreaPosition.x, _gameAreaPosition.y);

			// Draw each of the falling blocks
			for (i = 0; i < _blocksOnGameArea.length; ++i) {
				_blocksOnGameArea[i].draw(_context);
			}

			// Draw each of the stationary squares
			for (i = 0; i < _squaresOnGameArea.length; ++i) {
				window.Block.prototype.drawSquare(
										_context, _squaresOnGameArea[i], 
										(i % _gameAreaCellSize) * _squareSizePixels, 
										Math.floor((i / _gameAreaCellSize)) * _squareSizePixels);
			}

			// Check whether there are currently any disintegrating sections
			if (true) {// TODO: 
				// Draw the disintegrating sections
				// TODO: ?????
			}

			// Check whether the player is currently a selecting a block
			if (_selectedBlock && _phantomBlock) {
				// Check whether the phantom block is in a valid location
				if (_isPhantomBlockValid) {
					// Draw the phantom guide lines
					_drawPolygon(_context, _phantomGuideLinePolygon, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

					if (_gestureType === _DIRECTION_CHANGE) {
						// Draw an arc arrow from the selected block's current position to where it would be moving
						_drawArcArrow(_context, _selectedBlock, _phantomBlock, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);
					}

					// Draw the enlarged, phantom, overlay block
					_drawPolygon(_context, _phantomBlockPolygon, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_BLOCK_STROKE_WIDTH);
				} else {
					// Draw an arc arrow from the selected block's current position to where it would be moving
					_drawArcArrow(_context, _selectedBlock, _phantomBlock, _INVALID_MOVE_FILL_COLOR, _INVALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

					// Draw a polygon at the invalid location where the selected block would be moving
					_drawPolygon(_context, _phantomBlockPolygon, _INVALID_MOVE_FILL_COLOR, _INVALID_MOVE_STROKE_COLOR, _PHANTOM_BLOCK_STROKE_WIDTH);
				}
			}

			_context.restore();
		}

		// Set up a new game
		function _reset() {
			log.d("-->game._reset");

			_score = 0;
			_gameTime = 0;
			_isPaused = true;
			_isEnded = true;
			_blocksOnGameArea = [];
			_squaresOnGameArea = window.utils.initializeArray(
									_gameAreaCellSize * _gameAreaCellSize, -1);
			_prevTime = 0;

			_setLevel(_startingLevel);

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
			_currentBlockFallSpeed = window.utils.getLinGrowthValue(
					_INITIAL_BLOCK_FALL_SPEED, 
					_BLOCK_FALL_SPEED_GROWTH_RATE, 
					_level);
			window.Block.prototype.setFallSpeed(_currentBlockFallSpeed);

			// Increase the rate of the center square color changes
			_currentCenterSquareColorPeriod = window.utils.getExpGrowthValue(
					_INITIAL_CENTER_SQUARE_COLOR_PERIOD, 
					_CENTER_SQUARE_COLOR_PERIOD_GROWTH_RATE, 
					_level);
			_centerSquare.setColorPeriod(_currentCenterSquareColorPeriod);

			// Decrease the preview window cooldown time
			_currentPreviewWindowCoolDownTime = window.utils.getLinGrowthValue(
					_INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME, 
					_PREVIEW_WINDOW_COOL_DOWN_TIME_GROWTH_RATE, 
					_level);
			for (var i = 0; i < 4; ++i) {
				_previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
			}

			// Decrease the layer collapse delay
			_layerCollapseDelay = window.utils.getExpGrowthValue(
					_INITIAL_COLLAPSE_DELAY, 
					_COLLAPSE_DELAY_GROWTH_RATE, 
					_level);

			// Get how many layers need to be collapsed to progress to the 
			// next level
			_layerCountForNextLevel = window.utils.getExpGrowthValue(
					_mode2On ? _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL : _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL * 4, 
					_LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE, 
					_level);
			_layersCollapsedSinceLastLevel = 0;

			_levelDisplay.innerHTML = _level;
		}

		function _computeDimensions() {
			_gameAreaCellSizePixels = _canvas.width * _GAME_AREA_SIZE_RATIO;
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
						(_gameAreaCellSizePixels / 2);

			// This is the horizontal distance (in pixels) from the left side 
			// of the canvas to the left side of the right-side preview window
			var tmp2 = _previewWindowSizePixels + 
						_previewWindowOuterMarginPixels + 
						(_previewWindowInnerMarginPixels * 2) + 
						_gameAreaCellSizePixels;

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

		function _setUpCenterSquare() {
			_centerSquare = new CenterSquare();
			_setUpCenterSquareDimensions();
		}

		function _setUpCenterSquareDimensions() {
			var size = _centerSquareCellSize * _squareSizePixels;
			var x = _gameAreaPosition.x + (_gameAreaCellSizePixels - size) / 2;

			_centerSquare.setDimensions(x, size);
		}

		function _play() {
			// Reset game state if a game is not currently in progress
			if (_isEnded) {
				_reset();
				_isEnded = false;
			}

			if (_isPaused || _isEnded) {
				_prevTime = Date.now();
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

		function _startGesture(pos, time) {
			log.d("-->game._startGesture");

			_gestureStartPos = pos;
			_gestureStartTime = time;

			// Find the closest block within a certain distance threshold to 
			// this gesture, if any
			_selectedBlock = _findNearestValidBlock(_gestureStartPos, _blocksOnGameArea);

			if (_selectedBlock) {
				createjs.Sound.play("blockSelect");
			}

			// Clear any phantom objects. These will be set when a drag occurs.
			_phantomBlock = null;
			_phantomBlockPolygon = null;
			_isPhantomBlockValid = false;
			_phantomGuideLinePolygon = null;

			log.d("<--game._startGesture");
		}

		function _finishGesture(pos, time) {
			log.d("-->game._finishGesture");

			_gestureCurrentPos = pos;
			_gestureCurrentTime = time;

			// Check whether the player is currently selecting a block
			if (_selectedBlock) {
				// Extract some features from the gesture
				var gestureTypeAndCellPos = 
						_computeGestureTypeAndCellPos(
								_selectedBlock, 
								_gestureStartPos, _gestureStartTime, 
								_gestureCurrentPos, _gestureCurrentTime, 
								_mode4On, _mode5On, true, false);

				_gestureType = gestureTypeAndCellPos.type;
				_gestureCellPos = gestureTypeAndCellPos.pos;

				var logMsg = 
						": start=("+_gestureStartPos.x+","+_gestureStartPos.y+","+_gestureStartTime+
						");end=("+_gestureCurrentPos.x+","+_gestureCurrentPos.y+","+_gestureCurrentTime+
						");cellPos=("+_gestureCellPos.x+","+_gestureCellPos.y+")";

				// Check whether the gesture was a sideways move, a drop, or a 
				// direction change
				switch (_gestureType) {
				case _NONE:
					log.i("---game._finishGesture: _NONE" + logMsg);
					break;
				case _ROTATION:
					log.i("---game._finishGesture: _ROTATION" + logMsg);

					// Rotate the selected block
					var wasAbleToRotate = _selectedBlock.rotate(_squaresOnGameArea, _blocksOnGameArea, true);

					if (wasAbleToRotate) {
						createjs.Sound.play("rotate");
					} else {
						createjs.Sound.play("unableToMove");
					}
					break;
				case _SIDEWAYS_MOVE:
					log.i("---game._finishGesture: _SIDEWAYS_MOVE" + logMsg);

					_selectedBlock.setCellPosition(_gestureCellPos.x, _gestureCellPos.y);

					createjs.Sound.play("move");
					break;
				case _DROP:
					log.i("---game._finishGesture: _DROP" + logMsg);

					_selectedBlock.setCellPosition(_gestureCellPos.x, _gestureCellPos.y);

					createjs.Sound.play("move");
					break;
				case _DIRECTION_CHANGE:
					log.i("---game._finishGesture: _DIRECTION_CHANGE" + logMsg);

					if (_mode5On) {
						_isPhantomBlockValid = _computeIsPhantomBlockValid(_phantomBlock, _squaresOnGameArea, _blocksOnGameArea);

						if (_isPhantomBlockValid) {
							_switchPhantomToSelected(_selectedBlock, _phantomBlock);
							_selectedBlock.switchFallDirection();

							createjs.Sound.play("changeFallDirection");
						} else {
							createjs.Sound.play("unableToMove");
						}
					} else {
						_selectedBlock.switchFallDirection();

						createjs.Sound.play("changeFallDirection");
					}
					break;
				default:
					return;
				}
			} else {
				log.i("---game._finishGesture: <no selected block>" + logMsg);
			}

			_cancelGesture();

			log.d("<--game._finishGesture");
		}

		function _dragGesture(pos) {
			log.d("-->game._dragGesture");

			_gestureCurrentPos = pos;

			// Check whether the player is currently selecting a block
			if (_selectedBlock) {
				// Extract some features from the gesture
				var gestureTypeAndCellPos = 
						_computeGestureTypeAndCellPos(
								_selectedBlock, 
								_gestureStartPos, -1, 
								_gestureCurrentPos, -1, 
								_mode4On, _mode5On, false, false);

				// Only bother re-computing this stuff if the gesture type or 
				// position has changed since the last frame
				if (_gestureCellPos !== gestureTypeAndCellPos.pos || 
						_gestureType !== gestureTypeAndCellPos.type) {
					_gestureType = gestureTypeAndCellPos.type;
					_gestureCellPos = gestureTypeAndCellPos.pos;

					// Compute the square locations which represent the potential 
					// location the player might be moving the selected block to
					_phantomBlock = _computePhantomBlock(_gestureType, _gestureCellPos, _selectedBlock);

					// Get a slightly enlarged polygon around the area of the 
					// phantom block squares
					_phantomBlockPolygon = _computePhantomBlockPolygon(_phantomBlock);

					// Determine whether the phantom block squares are in a valid 
					// location of the game area
					_isPhantomBlockValid = _gestureType !== _DIRECTION_CHANGE || 
							_computeIsPhantomBlockValid(_phantomBlock, _squaresOnGameArea, _blocksOnGameArea);

					// Compute the dimensions of the polygons for the phantom lines
					_phantomGuideLinePolygon = _computePhantomGuideLinePolygon(_phantomBlock, _squaresOnGameArea, _blocksOnGameArea);
				}
			}

			log.d("<--game._dragGesture");
		}

		function _cancelGesture() {
			_selectedBlock = null;
			_phantomBlock = null;
			_phantomBlockPolygon = null;
			_isPhantomBlockValid = false;
			_phantomGuideLinePolygon = null;
		}

		// This function determines the type of the current gesture in 
		// addition to determining the corresponding position (i.e., the top-
		// left cell) of the selected block.
		// 
		// Mode 4 determines whether the player is allowed to switch the fall directions of blocks.
		// Mode 5 determines whether a block switches to the next quadrant when the player switches its fall direction.
		function _computeGestureTypeAndCellPos(selectedBlock, startPos, 
				startTime, endPos, endTime, mode4On, mode5On, considerTap, 
				chooseShorterDimension) {
			var gestureType = null;
			var gesturePos = { x: -1, y: -1 };

			var duration = endTime - startTime;
			var squaredDistance = _getSquaredDistance(startPos, endPos);

			// Check whether the gesture was brief and short enough to be a tap
			if (considerTap && 
					squaredDistance < _TAP_SQUARED_DISTANCE_THRESHOLD && 
					duration < _TAP_TIME_THRESHOLD) {
				gestureType = _ROTATION;
			} else {
				var blockType = selectedBlock.getType();
				var fallDirection = selectedBlock.getFallDirection();
				var orientation = selectedBlock.getOrientation();
				var oldCellPosition = selectedBlock.getCellPosition();
				var currentBlockCenter = selectedBlock.getPixelCenter();
				var cellOffset = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(blockType, orientation);

				// Determine the direction of the gesture
				var deltaX = endPos.x - startPos.x;//endPos.x - currentBlockCenter.x;
				var deltaY = endPos.y - startPos.y;//endPos.y - currentBlockCenter.y;
				var gestureDirection;
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					if (!chooseShorterDimension) {
						if (deltaX > 0) {
							gestureDirection = Block.prototype.RIGHTWARD;
						} else {
							gestureDirection = Block.prototype.LEFTWARD;
						}
					} else {
						if (deltaY > 0) {
							gestureDirection = Block.prototype.DOWNWARD;
						} else {
							gestureDirection = Block.prototype.UPWARD;
						}
					}
				} else {
					if (!chooseShorterDimension) {
						if (deltaY > 0) {
							gestureDirection = Block.prototype.DOWNWARD;
						} else {
							gestureDirection = Block.prototype.UPWARD;
						}
					} else {
						if (deltaX > 0) {
							gestureDirection = Block.prototype.RIGHTWARD;
						} else {
							gestureDirection = Block.prototype.LEFTWARD;
						}
					}
				}

				// This offset is subtracted from the gesture position.  So 
				// this ultimately adds 0.5 to the position, which centers the 
				// position calculation to where it really should be (because 
				// we will then be flooring it).
				var pixelOffsetForComputingCell = {
					x: (cellOffset.x * _squareSizePixels) - (_squareSizePixels * 0.5),
					y: (cellOffset.y * _squareSizePixels) - (_squareSizePixels * 0.5)
				};

				gesturePos.x = oldCellPosition.x;
				gesturePos.y = oldCellPosition.y;

				var farthestCellAvailable;

				switch (fallDirection) {
				case Block.prototype.DOWNWARD:
					switch (gestureDirection) {
					case Block.prototype.DOWNWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
						// This prevents the gesture from causing the block to 
						// actually "drop" backward to an earlier position
						if (gesturePos.y < oldCellPosition.y) {
							gestureType = _NONE;
						}
						break;
					case Block.prototype.LEFTWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
						break;
					case Block.prototype.UPWARD:
						if (mode4On && Math.abs(deltaY) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
							gestureType = _DIRECTION_CHANGE;
							if (mode5On) {
								gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaCellSize);
							}
						} else {
							gestureType = _NONE;
						}
						break;
					case Block.prototype.RIGHTWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.min(gesturePos.x, farthestCellAvailable.x);
						break;
					default:
						return;
					}
					break;
				case Block.prototype.LEFTWARD:
					switch (gestureDirection) {
					case Block.prototype.DOWNWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.LEFTWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
						// This prevents the gesture from causing the block to 
						// actually "drop" backward to an earlier position
						if (gesturePos.x > oldCellPosition.x) {
							gestureType = _NONE;
						}
						break;
					case Block.prototype.UPWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.RIGHTWARD:
						if (mode4On && Math.abs(deltaX) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
							gestureType = _DIRECTION_CHANGE;
							if (mode5On) {
								gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaCellSize);
							}
						} else {
							gestureType = _NONE;
						}
						break;
					default:
						return;
					}
					break;
				case Block.prototype.UPWARD:
					switch (gestureDirection) {
					case Block.prototype.DOWNWARD:
						if (mode4On && Math.abs(deltaY) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
							gestureType = _DIRECTION_CHANGE;
							if (mode5On) {
								gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaCellSize);
							}
						} else {
							gestureType = _NONE;
						}
						break;
					case Block.prototype.LEFTWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
						break;
					case Block.prototype.UPWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
						// This prevents the gesture from causing the block to 
						// actually "drop" backward to an earlier position
						if (gesturePos.y > oldCellPosition.y) {
							gestureType = _NONE;
						}
						break;
					case Block.prototype.RIGHTWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.min(gesturePos.x, farthestCellAvailable.x);
						break;
					default:
						return;
					}
					break;
				case Block.prototype.RIGHTWARD:
					switch (gestureDirection) {
					case Block.prototype.DOWNWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.LEFTWARD:
						if (mode4On && Math.abs(deltaX) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
							gestureType = _DIRECTION_CHANGE;
							if (mode5On) {
								gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaCellSize);
							}
						} else {
							gestureType = _NONE;
						}
						break;
					case Block.prototype.UPWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.RIGHTWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.min(gesturePos.x, farthestCellAvailable.x);
						// This prevents the gesture from causing the block to 
						// actually "drop" backward to an earlier position
						if (gesturePos.x < oldCellPosition.x) {
							gestureType = _NONE;
						}
						break;
					default:
						return;
					}
					break;
				default:
					return;
				}

				// If this gesture was unable to qualify as a direction 
				// change, then use it as a sideways move
				if (gestureType === _NONE && !chooseShorterDimension) {
					_computeGestureTypeAndCellPos(selectedBlock, startPos, 
							startTime, endPos, endTime, mode4On, mode5On, 
							considerTap, true);
				}
			}

			return {
				type: gestureType,
				pos: gesturePos
			};
		}

		// This function returns the cell position to use for the given block 
		// AFTER it has been rotated and placed into the new quadrant.
		function _getQuadrantSwitchPosition(oldX, oldY, blockType, orientation, gameAreaSize) {
			// Get the old position rotated to the new quadrant
			var newX = gameAreaSize - oldY;
			var newY = oldX;

			// Now, offset this position to allow the upper-left corner of the 
			// block to still determine the position
			var blockHeight = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(blockType, orientation).y * 2;
			newX -= (blockHeight - 1);

			return {
				x: newX,
				y: newY
			};
		}

		function _computeIsPhantomBlockValid(phantomBlock, squaresOnGameArea, blocksOnGameArea) {
			return !phantomBlock.checkIsOverTopSquare(squaresOnGameArea);
		}

		function _switchPhantomToSelected(selectedBlock, phantomBlock) {
			selectedBlock.rotate(_squaresOnGameArea, _blocksOnGameArea, false);
			var phantomPosition = phantomBlock.getCellPosition();
			selectedBlock.setCellPosition(phantomPosition.x, phantomPosition.y);
		}

		function _computePhantomBlock(gestureType, gestureCellPos, selectedBlock) {
			var blockType = selectedBlock.getType();
			var orientation = selectedBlock.getOrientation();
			var fallDirection = selectedBlock.getFallDirection();

			// Rotate and switch direction with a direction change gesture
			if (gestureType === _DIRECTION_CHANGE) {
				orientation = (orientation + 1) % 4;
				fallDirection = (fallDirection + 1) % 4;
			}

			var phantomBlock = new Block(blockType, -1, -1, orientation, fallDirection);
			phantomBlock.setCellPosition(gestureCellPos.x, gestureCellPos.y);

			return phantomBlock;
		}

		function _computePhantomBlockPolygon(phantomBlock) {
			// Get the original polygon
			var points = phantomBlock.getPolygon();

			// Get the offset from the top-left of the block to the center
			var pixelCenter = phantomBlock.getPixelCenter();
			var i;

			// Enlarge the polygon
			for (i = 0; i < points.length; ++i) {
				points[i].x = pixelCenter.x + ((points[i].x - pixelCenter.x) * _PHANTOM_BLOCK_SIZE_RATIO);
				points[i].y = pixelCenter.y + ((points[i].y - pixelCenter.y) * _PHANTOM_BLOCK_SIZE_RATIO);
			}

			return points;
		}

		function _computePhantomGuideLinePolygon(phantomBlock, squaresOnGameArea, blocksOnGameArea) {
			var fallDirection = phantomBlock.getFallDirection();

			// Get the furthest position the block can move to the "left"
			var farthestLeftCellPosition = phantomBlock.getFarthestLeftCellAvailable(squaresOnGameArea, blocksOnGameArea);

			// Get the furthest position the block can move to the "right"
			var farthestRightCellPosition = phantomBlock.getFarthestRightCellAvailable(squaresOnGameArea, blocksOnGameArea);

			// Get the furthest position the block can move "downward"
			var farthestDownCellPosition = phantomBlock.getFarthestDownwardCellAvailable(squaresOnGameArea, blocksOnGameArea);

			var leftSidePixelPoints;
			var rightSidePixelPoints;
			var bottomSidePixelPoints;

			// Get the "leftward", "rightward", and "downward" points 
			// (according to the current fall direction)
			switch (fallDirection) {
			case Block.prototype.DOWNWARD:
				leftSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.LEFT_SIDE);
				rightSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.RIGHT_SIDE);
				bottomSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.BOTTOM_SIDE);
				break;
			case Block.prototype.LEFTWARD:
				leftSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.TOP_SIDE);
				rightSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.BOTTOM_SIDE);
				bottomSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.LEFT_SIDE);
				break;
			case Block.prototype.UPWARD:
				leftSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.RIGHT_SIDE);
				rightSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.LEFT_SIDE);
				bottomSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.TOP_SIDE);
				break;
			case Block.prototype.RIGHTWARD:
				leftSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.BOTTOM_SIDE);
				rightSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.TOP_SIDE);
				bottomSidePixelPoints = phantomBlock.getSidePointsRelativeToBlockPosition(Block.prototype.RIGHT_SIDE);
				break;
			default:
				return;
			}

			// Translate the "leftward" points to the furthest "leftward" position
			for (i = 0; i < leftSidePixelPoints.length; ++i) {
				leftSidePixelPoints[i].x = (farthestLeftCellPosition.x + leftSidePixelPoints[i].x) * _squareSizePixels;
				leftSidePixelPoints[i].y = (farthestLeftCellPosition.y + leftSidePixelPoints[i].y) * _squareSizePixels;
			}

			// Translate the "rightward" points to the furthest "rightward" position
			for (i = 0; i < rightSidePixelPoints.length; ++i) {
				rightSidePixelPoints[i].x = (farthestRightCellPosition.x + rightSidePixelPoints[i].x) * _squareSizePixels;
				rightSidePixelPoints[i].y = (farthestRightCellPosition.y + rightSidePixelPoints[i].y) * _squareSizePixels;
			}

			// Translate the "downward" points to the furthest "downward" position
			for (i = 0; i < bottomSidePixelPoints.length; ++i) {
				bottomSidePixelPoints[i].x = (farthestDownCellPosition.x + bottomSidePixelPoints[i].x) * _squareSizePixels;
				bottomSidePixelPoints[i].y = (farthestDownCellPosition.y + bottomSidePixelPoints[i].y) * _squareSizePixels;
			}

			// Compute two remaining polygon points
			var lowerLeftAndRightPoints = phantomBlock.getLowerLeftAndRightFallDirectionPoints();

			var points = [];
			var i;

			// Add the "leftward" points
			for (i = 0; i < leftSidePixelPoints.length; ++i) {
				points.push(leftSidePixelPoints[i]);
			}

			// Add the "rightward" points
			for (i = 0; i < rightSidePixelPoints.length; ++i) {
				points.push(rightSidePixelPoints[i]);
			}

			// Add the inner-"right" corner point
			points.push(lowerLeftAndRightPoints.right);

			// Add the "downward" points
			for (i = 0; i < bottomSidePixelPoints.length; ++i) {
				points.push(bottomSidePixelPoints[i]);
			}

			// Add the inner-"left" corner point
			points.push(lowerLeftAndRightPoints.left);

			return points;
		}

		function _drawArcArrow(context, selectedBlock, phantomBlock, fillColor, strokeColor, strokeWidth) {
			// TODO: fun! look at book examples?
		}

		function _drawPolygon(context, polygon, fillColor, strokeColor, strokeWidth) {
			context.beginPath();

			context.fillStyle = fillColor;
			context.strokeStyle = strokeColor;
			context.lineWidth = strokeWidth;

			context.moveTo(polygon[0].x, polygon[0].y);
			for (var i = 1; i < polygon.length; ++i) {
				context.lineTo(polygon[i].x, polygon[i].y);
			}
			context.closePath();

			context.fill();
			context.stroke();
		}

		// Return the nearest active block to the given position within a 
		// certain distance threshold, if one exists.  If not, then return 
		// null.
		function _findNearestValidBlock(pos, blocksOnGameArea) {
			if (blocksOnGameArea.length > 0) {
				var nearestSquareDistance = _getSquaredDistance(pos, blocksOnGameArea[0].getPixelCenter());
				var nearestBlock = blocksOnGameArea[0];

				var currentSquareDistance;
				var i;

				// Find the nearest block
				for (i = 1; i < blocksOnGameArea.length; ++i) {
					currentSquareDistance = _getSquaredDistance(pos, blocksOnGameArea[i].getPixelCenter());

					if (currentSquareDistance <= nearestSquareDistance) {
						nearestSquareDistance = currentSquareDistance;
						nearestBlock = blocksOnGameArea[i];
					}
				}

				// Only return the nearest block if it is indeed near enough
				if (nearestSquareDistance < _blockSelect_SQUARED_DISTANCE_THRESHOLD) {
					return nearestBlock;
				}
			}

			return null;
		}

		function _getNextBlock(previewWindow) {
			var block = previewWindow.getCurrentBlock();

			// If there is a square on the game area in the way the 
			// new block from being added, then the game is over and 
			// the player has lost
			if (block.checkIsOverTopSquare(_squaresOnGameArea)) {
				_endGame();
				return;
			}

			_blocksOnGameArea.push(block);
			previewWindow.startNewBlock();

			createjs.Sound.play("newBlock");
		}

		// Check for any layers which are completed by the inclusion of 
		// squares in the given new cell positions.  If no cell positions are 
		// given, then check for all layers in the game area.  In the event of 
		// line-collapse mode, the line layers will be represented by objects 
		// with the following properties: side, layer, startCell, endCell 
		// (inclusive).  Return true any layers were found to be complete.
		function _checkForCompleteLayers(newCellPositions) {
			var minCenterSquareCellPositionX = _centerSquareCellPositionX;
			var maxCenterSquareCellPositionX = _centerSquareCellPositionX + _centerSquareCellSize;
			var centerCellPositionX = (_gameAreaCellSize / 2) - 0.5;
			var _centerSquareCellHalfSize = _centerSquareCellSize / 2;

			var completeLayers = [];
			var layersToCheck = [];

			var layer;
			var i;
			var j;
			var deltaX;
			var deltaY;
			var deltaI;
			var startX;
			var startY;
			var startI;
			var endX;
			var endY;
			var endI;

			if (_mode2On) { // Collapsing whole squares
				// Check whether we have a limited number of potential layers 
				// to check
				if (newCellPositions) {
					// Get the layers the given positions are a part of
					for (i = 0; i < newCellPositions.length; ++i) {
						deltaX = Math.abs(newCellPositions[i].x - centerCellPositionX);
						deltaY = Math.abs(newCellPositions[i].y - centerCellPositionX);

						if (deltaX > deltaY) {
							layer = Math.ceil(deltaX - _centerSquareCellHalfSize);
						} else {
							layer = Math.ceil(deltaY - _centerSquareCellHalfSize);
						}

						// Do not add any layer more than once
						if (layersToCheck.indexOf(layer) < 0) {
							layersToCheck.push(layer);
						}
					}
				} else {
					// We will need to check every layer in the game area
					var maxLayer = (_gameAreaCellSize - _centerSquareCellSize) / 2;
					for (layer = 1; layer <= maxLayer; ++layer) {
						layersToCheck.push(layer);
					}
				}

				// Check each of the layers
				mode2Onlayerloop:
				for (j = 0; j < layersToCheck.length; ++j) {
					layer = layersToCheck[j];

					// Check the top side
					startX = minCenterSquareCellPositionX - layer;
					startY = minCenterSquareCellPositionX - layer;
					endX = maxCenterSquareCellPositionX + layer;
					startI = (startY * _gameAreaCellSize) + startX;
					deltaI = 1;
					endI = (startY * _gameAreaCellSize) + endX;
					for (i = startI; i < endI; i += deltaI) {
						if (_squaresOnGameArea[i] < 0) {
							continue mode2Onlayerloop;
						}
					}

					// Check the right side
					startX = maxCenterSquareCellPositionX - 1 + layer;
					startY = minCenterSquareCellPositionX - layer;
					endY = maxCenterSquareCellPositionX + layer;
					startI = (startY * _gameAreaCellSize) + startX;
					deltaI = _gameAreaCellSize;
					endI = (endY * _gameAreaCellSize) + startX;
					for (i = startI; i < endI; i += deltaI) {
						if (_squaresOnGameArea[i] < 0) {
							continue mode2Onlayerloop;
						}
					}

					// Check the bottom side
					startX = minCenterSquareCellPositionX - layer;
					startY = maxCenterSquareCellPositionX - 1 + layer;
					endX = maxCenterSquareCellPositionX + layer;
					startI = (startY * _gameAreaCellSize) + startX;
					deltaI = 1;
					endI = (startY * _gameAreaCellSize) + endX;
					for (i = startI; i < endI; i += deltaI) {
						if (_squaresOnGameArea[i] < 0) {
							continue mode2Onlayerloop;
						}
					}

					// Check the left side
					startX = minCenterSquareCellPositionX - layer;
					startY = minCenterSquareCellPositionX - layer;
					endY = maxCenterSquareCellPositionX + layer;
					startI = (startY * _gameAreaCellSize) + startX;
					deltaI = _gameAreaCellSize;
					endI = (endY * _gameAreaCellSize) + startX;
					for (i = startI; i < endI; i += deltaI) {
						if (_squaresOnGameArea[i] < 0) {
							continue mode2Onlayerloop;
						}
					}

					completeLayers.push(layer);
				}
			} else { // Collapsing only lines
				var side;
				var startCell;
				var endCell;
				var minStartI;
				var minEndI;
				var maxEndI;

				// Check whether we have a limited number of potential layers 
				// to check
				if (newCellPositions) {
					// Get the layers the given positions are a part of
					for (i = 0; i < newCellPositions.length; ++i) {
						deltaX = Math.abs(newCellPositions[i].x - centerCellPositionX);
						deltaY = Math.abs(newCellPositions[i].y - centerCellPositionX);

						if (deltaX > _centerSquareCellHalfSize) {
							if (newCellPositions[i].x < centerCellPositionX) {
								side = Block.prototype.LEFT_SIDE;
							} else {
								side = Block.prototype.RIGHT_SIDE;
							}

							layer = {
								side: side,
								layer: Math.ceil(deltaX - _centerSquareCellHalfSize)
							};

							// Do not add any layer more than once
							if (_findIndexOfLayerToCheck(layersToCheck, layer) < 0) {
								layersToCheck.push(layer);
							}
						}

						if (deltaY > _centerSquareCellHalfSize) {
							if (newCellPositions[i].y < centerCellPositionX) {
								side = Block.prototype.TOP_SIDE;
							} else {
								side = Block.prototype.BOTTOM_SIDE;
							}

							layer = {
								side: side,
								layer: Math.ceil(deltaY - _centerSquareCellHalfSize)
							};

							// Do not add any layer more than once
							if (_findIndexOfLayerToCheck(layersToCheck, layer) < 0) {
								layersToCheck.push(layer);
							}
						}
					}
				} else {
					// We will need to check every layer in the game area
					var maxLayer = (_gameAreaCellSize - _centerSquareCellSize) / 2;
					for (layer = 1; layer <= maxLayer; ++layer) {
						layersToCheck.push(layer);
					}
				}

				// Check each of the layers
				mode2Offlayerloop:
				for (j = 0; j < layersToCheck.length; ++j) {
					layer = layersToCheck[j].layer;
					side = layersToCheck[j].side;
					startCell = -1;
					endCell = -1;

					// Only check one side
					switch (side) {
					case Block.prototype.TOP_SIDE:
						startY = minCenterSquareCellPositionX - layer;
						startI = startY * _gameAreaCellSize;
						deltaI = 1;
						startX = minCenterSquareCellPositionX;
						endX = maxCenterSquareCellPositionX - 1;
						minStartI = (startY * _gameAreaCellSize) + startX;
						minEndI = (startY * _gameAreaCellSize) + endX;
						maxEndI = ((startY + 1) * _gameAreaCellSize) - 1;
						break;
					case Block.prototype.RIGHT_SIDE:
						startX = maxCenterSquareCellPositionX - 1 + layer;
						startI = startX;
						deltaI = _gameAreaCellSize;
						startY = minCenterSquareCellPositionX;
						endY = maxCenterSquareCellPositionX - 1;
						minStartI = (startY * _gameAreaCellSize) + startX;
						minEndI = (endY * _gameAreaCellSize) + startX;
						maxEndI = ((_gameAreaCellSize - 1) * _gameAreaCellSize) + startX;
						break;
					case Block.prototype.BOTTOM_SIDE:
						startY = maxCenterSquareCellPositionX - 1 + layer;
						startI = startY * _gameAreaCellSize;
						deltaI = 1;
						startX = minCenterSquareCellPositionX;
						endX = maxCenterSquareCellPositionX - 1;
						minStartI = (startY * _gameAreaCellSize) + startX;
						minEndI = (startY * _gameAreaCellSize) + endX;
						maxEndI = ((startY + 1) * _gameAreaCellSize) - 1;
						break;
					case Block.prototype.LEFT_SIDE:
						startX = minCenterSquareCellPositionX - layer;
						startI = startX;
						deltaI = _gameAreaCellSize;
						startY = minCenterSquareCellPositionX;
						endY = maxCenterSquareCellPositionX - 1;
						minStartI = (startY * _gameAreaCellSize) + startX;
						minEndI = (endY * _gameAreaCellSize) + startX;
						maxEndI = ((_gameAreaCellSize - 1) * _gameAreaCellSize) + startX;
						break;
					default:
						return;
					}

					i = startI;

					// Find the first non-empty cell in this line
					while (i <= minStartI) {
						if (_squaresOnGameArea[i] >= 0) {
							startCell = i;
							i += deltaI;
							break;
						}
						i += deltaI;
					}

					// We can stop checking this line if the sequence of non-
					// empty cells did not start early enough
					if (startCell < 0) {
						continue mode2Offlayerloop;
					}

					// Find the last contiguous non-empty cell in this line
					while (i <= maxEndI) {
						if (_squaresOnGameArea[i] < 0) {
							endCell = i - deltaI;
							i += deltaI;
							break;
						}
						i += deltaI;
					}

					// We can stop checking this line if the sequence of non-
					// empty cells was not long enough
					if (endCell < minEndI) {
						continue mode2Offlayerloop;
					}

					// Handle the case where the line extends all the way to 
					// the edge
					if (endCell < 0) {
						endCell = i - deltaI;
					} else {
						// Ensure that there were no later non-empty cells in 
						// this line
						while (i <= maxEndI) {
							if (_squaresOnGameArea[i] >= 0) {
								continue mode2Offlayerloop;
							}
							i += deltaI;
						}
					}

					completeLayers.push({
						side: side,
						layer: layer,
						startCell: startCell,
						endCell: endCell
					});
				}
			}

			// Now save the completed layers to be removed after a short delay
			for (i = 0; i < completeLayers.length; ++i) {
				_layersToCollapse.push(completeLayers[i]);
			}

			if (completeLayers.length > 0) {
				// There is a small collapse delay between the time when a layer 
				// is completed and when it is collapsed.  However, if there are 
				// any other layers waiting to be collapsed, then ALL pending 
				// layers need to be collapsed simultaneously.  So we can use a 
				// single timer for any number of pending layers.
				if (_ellapsedCollapseTime >= _layerCollapseDelay) {
					_ellapsedCollapseTime = 0;
				}

				return true;
			} else {
				return false;
			}
		}

		function _findIndexOfLayerToCheck(layers, layerToCheck) {
			for (var i = 0; i < layers.length; ++i) {
				if (layers[i].side === layerToCheck.side && 
						layers[i].layer === layerToCheck.layer) {
					return i;
				}
			}

			return -1;
		}

		function _collapseLayer(layer) { // TODO: should I get rid of this function and modify _dropHigherLayers to make up for it?
			var minCenterSquareCellPositionX = _centerSquareCellPositionX;
			var maxCenterSquareCellPositionX = _centerSquareCellPositionX + _centerSquareCellSize;

			var i;
			var deltaI;
			var squaresCollapsedCount;

			if (_mode2On) { // Collapsing whole squares
				var startX;
				var startY;
				var startI;
				var endX;
				var endY;
				var endI;

				// Remove the top side
				startX = minCenterSquareCellPositionX - layer;
				startY = minCenterSquareCellPositionX - layer;
				endX = maxCenterSquareCellPositionX + layer;
				startI = (startY * _gameAreaCellSize) + startX;
				deltaI = 1;
				endI = (startY * _gameAreaCellSize) + endX;
				for (i = startI; i < endI; i += deltaI) {
					_squaresOnGameArea[i] = -1;
				}

				// Remove the right side
				startX = maxCenterSquareCellPositionX - 1 + layer;
				startY = minCenterSquareCellPositionX - layer;
				endY = maxCenterSquareCellPositionX + layer;
				startI = (startY * _gameAreaCellSize) + startX;
				deltaI = _gameAreaCellSize;
				endI = (endY * _gameAreaCellSize) + startX;
				for (i = startI; i < endI; i += deltaI) {
					_squaresOnGameArea[i] = -1;
				}

				// Remove the bottom side
				startX = minCenterSquareCellPositionX - layer;
				startY = maxCenterSquareCellPositionX - 1 + layer;
				endX = maxCenterSquareCellPositionX + layer;
				startI = (startY * _gameAreaCellSize) + startX;
				deltaI = 1;
				endI = (startY * _gameAreaCellSize) + endX;
				for (i = startI; i < endI; i += deltaI) {
					_squaresOnGameArea[i] = -1;
				}

				// Remove the left side
				startX = minCenterSquareCellPositionX - layer;
				startY = minCenterSquareCellPositionX - layer;
				endY = maxCenterSquareCellPositionX + layer;
				startI = (startY * _gameAreaCellSize) + startX;
				deltaI = _gameAreaCellSize;
				endI = (endY * _gameAreaCellSize) + startX;
				for (i = startI; i < endI; i += deltaI) {
					_squaresOnGameArea[i] = -1;
				}

				squaresCollapsedCount = (_centerSquareCellSize + layer) * 4;
			} else { // Collapsing only lines
				var side = layer.side;
				var startCell = layer.startCell;
				var endCell = layer.endCell;

				switch (side) {
				case Block.prototype.TOP_SIDE:
					deltaI = 1;
					break;
				case Block.prototype.RIGHT_SIDE:
					deltaI = _gameAreaCellSize;
					break;
				case Block.prototype.BOTTOM_SIDE:
					deltaI = 1;
					break;
				case Block.prototype.LEFT_SIDE:
					deltaI = _gameAreaCellSize;
					break;
				default:
					return;
				}

				// Remove the squares from the game area
				for (i = startCell, squaresCollapsedCount = 0;
						i <= endCell;
						i += deltaI, ++squaresCollapsedCount) {
					_squaresOnGameArea[i] = -1;
				}
			}

			_dropHigherLayers(layer);

			addCollapseToScore(squaresCollapsedCount);
		}

		// Drop by one each of the layers above the given layer.
		function _dropHigherLayers(collapsedLayer) {
			var minCenterSquareCellPositionX = _centerSquareCellPositionX;
			var maxCenterSquareCellPositionX = _centerSquareCellPositionX + _centerSquareCellSize;
			var centerCellPositionX = _gameAreaCellSize / 2;

			var i;
			var loopDeltaI;
			var dropDeltaI;
			var updateStartCellDeltaI;
			var updateEndCellDeltaI;
			var currentLayer;

			if (_mode2On) { // Collapsing whole squares
				var startX;
				var startY;
				var startI;
				var endX;
				var endY;
				var endI;

				++collapsedLayer;

				// Remove the second half of the top side
				startX = centerCellPositionX;
				startY = minCenterSquareCellPositionX - collapsedLayer;
				endX = maxCenterSquareCellPositionX + collapsedLayer;
				startI = (startY * _gameAreaCellSize) + startX;
				loopDeltaI = 1;
				dropDeltaI = _gameAreaCellSize;
				endI = (startY * _gameAreaCellSize) + endX;
				updateStartCellDeltaI = -_gameAreaCellSize;
				updateEndCellDeltaI = -_gameAreaCellSize + 1;
				// Loop through each higher layer and consider each to be two-
				// squares longer than the previous
				for (currentLayer = collapsedLayer; 
						currentLayer <= minCenterSquareCellPositionX; 
						++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
					// Drop all squares in this layer
					for (i = startI; i < endI; i += loopDeltaI) {
						if (_squaresOnGameArea[i] >= 0 && _squaresOnGameArea[i + dropDeltaI] < 0) {
							_squaresOnGameArea[i + dropDeltaI] = _squaresOnGameArea[i];
							_squaresOnGameArea[i] = -1;
						}
					}
				}

				// Remove the right side
				startX = maxCenterSquareCellPositionX - 1 + collapsedLayer;
				startY = minCenterSquareCellPositionX - collapsedLayer;
				endY = maxCenterSquareCellPositionX + collapsedLayer;
				startI = (startY * _gameAreaCellSize) + startX;
				loopDeltaI = _gameAreaCellSize;
				dropDeltaI = -1;
				endI = (endY * _gameAreaCellSize) + startX;
				updateStartCellDeltaI = -_gameAreaCellSize + 1;
				updateEndCellDeltaI = _gameAreaCellSize + 1;
				// Loop through each higher layer and consider each to be two-
				// squares longer than the previous
				for (currentLayer = collapsedLayer; 
						currentLayer <= minCenterSquareCellPositionX; 
						++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
					// Drop all squares in this layer
					for (i = startI; i < endI; i += loopDeltaI) {
						if (_squaresOnGameArea[i] >= 0 && _squaresOnGameArea[i + dropDeltaI] < 0) {
							_squaresOnGameArea[i + dropDeltaI] = _squaresOnGameArea[i];
							_squaresOnGameArea[i] = -1;
						}
					}
				}

				// Remove the bottom side
				startX = minCenterSquareCellPositionX - collapsedLayer;
				startY = maxCenterSquareCellPositionX - 1 + collapsedLayer;
				endX = maxCenterSquareCellPositionX + collapsedLayer;
				startI = (startY * _gameAreaCellSize) + startX;
				loopDeltaI = 1;
				dropDeltaI = -_gameAreaCellSize;
				endI = (startY * _gameAreaCellSize) + endX;
				updateStartCellDeltaI = _gameAreaCellSize - 1;
				updateEndCellDeltaI = _gameAreaCellSize + 1;
				// Loop through each higher layer and consider each to be two-
				// squares longer than the previous
				for (currentLayer = collapsedLayer; 
						currentLayer <= minCenterSquareCellPositionX; 
						++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
					// Drop all squares in this layer
					for (i = startI; i < endI; i += loopDeltaI) {
						if (_squaresOnGameArea[i] >= 0 && _squaresOnGameArea[i + dropDeltaI] < 0) {
							_squaresOnGameArea[i + dropDeltaI] = _squaresOnGameArea[i];
							_squaresOnGameArea[i] = -1;
						}
					}
				}

				// Remove the left side
				startX = minCenterSquareCellPositionX - collapsedLayer;
				startY = minCenterSquareCellPositionX - collapsedLayer;
				endY = maxCenterSquareCellPositionX + collapsedLayer;
				startI = (startY * _gameAreaCellSize) + startX;
				loopDeltaI = _gameAreaCellSize;
				dropDeltaI = 1;
				endI = (endY * _gameAreaCellSize) + startX;
				updateStartCellDeltaI = -_gameAreaCellSize - 1;
				updateEndCellDeltaI = _gameAreaCellSize - 1;
				// Loop through each higher layer and consider each to be two-
				// squares longer than the previous
				for (currentLayer = collapsedLayer; 
						currentLayer <= minCenterSquareCellPositionX; 
						++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
					// Drop all squares in this layer
					for (i = startI; i < endI; i += loopDeltaI) {
						if (_squaresOnGameArea[i] >= 0 && _squaresOnGameArea[i + dropDeltaI] < 0) {
							_squaresOnGameArea[i + dropDeltaI] = _squaresOnGameArea[i];
							_squaresOnGameArea[i] = -1;
						}
					}
				}

				// Remove the first half of the top side
				startX = minCenterSquareCellPositionX - collapsedLayer;
				startY = minCenterSquareCellPositionX - collapsedLayer;
				endX = centerCellPositionX;
				startI = (startY * _gameAreaCellSize) + startX;
				loopDeltaI = 1;
				dropDeltaI = _gameAreaCellSize;
				endI = (startY * _gameAreaCellSize) + endX;
				updateStartCellDeltaI = -_gameAreaCellSize - 1;
				updateEndCellDeltaI = -_gameAreaCellSize;
				// Loop through each higher layer and consider each to be two-
				// squares longer than the previous
				for (currentLayer = collapsedLayer; 
						currentLayer <= minCenterSquareCellPositionX; 
						++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
					// Drop all squares in this layer
					for (i = startI; i < endI; i += loopDeltaI) {
						if (_squaresOnGameArea[i] >= 0 && _squaresOnGameArea[i + dropDeltaI] < 0) {
							_squaresOnGameArea[i + dropDeltaI] = _squaresOnGameArea[i];
							_squaresOnGameArea[i] = -1;
						}
					}
				}

				// TODO: (drop only half of the top layer first, then drop the other half last)
			} else { // Collapsing only lines
				var side = collapsedLayer.side;
				var startCell = collapsedLayer.startCell;
				var endCell = collapsedLayer.endCell;
				currentLayer = collapsedLayer.layer;

				switch (side) {
				case Block.prototype.TOP_SIDE:
					loopDeltaI = 1;
					dropDeltaI = _gameAreaCellSize;
					updateStartCellDeltaI = -_gameAreaCellSize - 1;
					updateEndCellDeltaI = -_gameAreaCellSize + 1;
					break;
				case Block.prototype.RIGHT_SIDE:
					loopDeltaI = _gameAreaCellSize;
					dropDeltaI = -1;
					updateStartCellDeltaI = -_gameAreaCellSize + 1;
					updateEndCellDeltaI = _gameAreaCellSize + 1;
					break;
				case Block.prototype.BOTTOM_SIDE:
					loopDeltaI = 1;
					dropDeltaI = -_gameAreaCellSize;
					updateStartCellDeltaI = _gameAreaCellSize - 1;
					updateEndCellDeltaI = _gameAreaCellSize + 1;
					break;
				case Block.prototype.LEFT_SIDE:
					loopDeltaI = _gameAreaCellSize;
					dropDeltaI = 1;
					updateStartCellDeltaI = -_gameAreaCellSize - 1;
					updateEndCellDeltaI = _gameAreaCellSize - 1;
					break;
				default:
					return;
				}

				startCell += updateStartCellDeltaI;
				endCell += updateEndCellDeltaI;
				++currentLayer;

				// Loop through each higher layer and consider each to be two-
				// squares longer than the previous
				for (; currentLayer <= minCenterSquareCellPositionX; 
						++currentLayer, startCell += updateStartCellDeltaI, endCell += updateEndCellDeltaI) {
					// Drop all squares in this layer
					for (i = startCell; i <= endCell; i += loopDeltaI) {
						if (_squaresOnGameArea[i] >= 0 && _squaresOnGameArea[i + dropDeltaI] < 0) {
							_squaresOnGameArea[i + dropDeltaI] = _squaresOnGameArea[i];
							_squaresOnGameArea[i] = -1;
						}
					}
				}
			}
		}

		// Drop each of the blocks that used to be one-layer higher than the 
		// given collapsed layer.  This dropping then has the possibility to 
		// cascade to higher layers depending on whether the dropped blocks 
		// were supporting other higher blocks.
		function _settleHigherLayers(collapsedLayer) {
			// TODO: ****
		}

		function addCollapseToScore(squaresCollapsedCount) {
			_squaresCollapsedCount += squaresCollapsedCount;
			++_layersCollapsedCount;
			++_layersCollapsedSinceLastLevel;

			// Give a slight exponential score increase for the number of 
			// blocks in the current layer collapse
			var score = window.utils.getExpGrowthValue(
					_BASE_SCORE_PER_SQUARE, 
					_mode2On ? _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED : _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED / 4, 
					squaresCollapsedCount) * squaresCollapsedCount;

			// Give a large exponential score increase if the previous layer 
			// collapse occurred very recently
			var currentCollapseTime = Date.now();
			_recentCollapsesCount = currentCollapseTime - _prevCollapseTime < _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD ? _recentCollapsesCount + 1 : 0;
			_prevCollapseTime = currentCollapseTime;
			score = window.utils.getExpGrowthValue(
					score, 
					_mode2On ? _SCORE_GROWTH_RATE_PER_RECENT_LAYER : _SCORE_GROWTH_RATE_PER_RECENT_LAYER / 4, 
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

		function _getLayersCollapsed() {
			return _layersCollapsedCount;
		}

		function _getSquaresCollapsed() {
			return _squaresCollapsedCount;
		}

		function _getBonusesUsed() {
			return _bonusesUsedCount;
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
			_gameAreaCellSize = gameAreaSize;
			_squareSizePixels = _gameAreaCellSizePixels / _gameAreaCellSize;

			window.Block.prototype.setGameAreaDimensions(_squareSizePixels, _gameAreaCellSize, _centerSquareCellSize, _centerSquareCellPositionX);
			window.PreviewWindow.prototype.setGameAreaSize(_gameAreaCellSize);
			_setUpCenterSquareDimensions();
		}

		function _setCenterSquareSize(centerSquareSize) {
			_centerSquareCellSize = centerSquareSize;
			_computeCenterSquareCellPosition();
			
			window.Block.prototype.setGameAreaDimensions(_squareSizePixels, _gameAreaCellSize, _centerSquareCellSize, _centerSquareCellPositionX);
			_setUpCenterSquareDimensions();
		}

		function _computeCenterSquareCellPosition() {
			_centerSquareCellPositionX = Math.floor((_gameAreaCellSize - _centerSquareCellSize) / 2);
		}

		function _setStartingLevel(level) {
			_startingLevel = level;
		}

		function _getGameAreaPosition() {
			return _gameAreaPosition;
		}

		_computeDimensions();
		_setUpPreviewWindows();
		_setUpCenterSquare();

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
		this.getLayersCollapsed = _getLayersCollapsed;
		this.getSquaresCollapsed = _getSquaresCollapsed;
		this.getBonusesUsed = _getBonusesUsed;
		this.setMode1 = _setMode1;
		this.setMode2 = _setMode2;
		this.setMode3 = _setMode3;
		this.setMode4 = _setMode4;
		this.setMode5 = _setMode5;
		this.setGameAreaSize = _setGameAreaSize;
		this.setCenterSquareSize = _setCenterSquareSize;
		this.setStartingLevel = _setStartingLevel;
		this.startGesture = _startGesture;
		this.finishGesture = _finishGesture;
		this.dragGesture = _dragGesture;
		this.cancelGesture = _cancelGesture;
		this.getGameAreaPosition = _getGameAreaPosition;

		log.d("<--game.Game");
	}

	// ----------------------------------------------------------------- //
	// -- Private static members

	function _getSquaredDistance(pos1, pos2) {
		var deltaX = pos1.x - pos2.x;
		var deltaY = pos1.y - pos2.y;
		return deltaX * deltaX + deltaY * deltaY;
	}

	// Make Game available to the rest of the program
	window.Game = Game;

	log.i("<--game.LOADING_MODULE");
})();
