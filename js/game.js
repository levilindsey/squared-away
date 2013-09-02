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
	var _PREVIEW_WINDOW_COOL_DOWN_TIME_DECREASE_RATE = 0.9; // ratio
	var _INITIAL_BLOCK_FALL_SPEED = 0.0015; // in squares per millis
	var _BLOCK_FALL_SPEED_INCREASE_RATE = 1.1; // ratio
	
	var _INITIAL_COOL_DOWN_PERIOD = 800; // millis

	var _NORMAL_STROKE_WIDTH = 1; // in pixels

	var _NORMAL_STROKE_COLOR = "#5a5a5a";
	var _NORMAL_FILL_COLOR = "#141414";

	// The gesture types
	var _NONE = 1;
	var _ROTATION = 2;
	var _SIDEWAYS_MOVE = 3;
	var _DROP = 4;
	var _DIRECTION_CHANGE = 5;

	var _INVALID_MOVE_FILL_COLOR = "rgba(255,150,150,0.2)"; // TODO: change this to a neon red color, with the stroke lighter than the fill
	var _INVALID_MOVE_STROKE_COLOR = "rgba(255,150,150,0.2)"; // TODO: change this to a neon red color, with the stroke lighter than the fill
	var _VALID_MOVE_FILL_COLOR = "rgba(100,200,255,0.2)"; // TODO: change this to a neon blue color, with the stroke lighter than the fill
	var _VALID_MOVE_STROKE_COLOR = "rgba(100,200,255,0.2)"; // TODO: change this to a neon blue color, with the stroke lighter than the fill
	var _PHANTOM_GUIDE_LINE_STROKE_WIDTH = 1;
	var _PHANTOM_BLOCK_STROKE_WIDTH = 2;
	var _PHANTOM_BLOCK_SIZE_RATIO = 2;

	var _BLOCK_SELECT_SQUARED_DISTANCE_THRESHOLD = 1200; // TODO: test this
	var _TAP_SQUARED_DISTANCE_THRESHOLD = 400; // TODO: test this
	var _TAP_TIME_THRESHOLD = 300; // TODO: test this

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
		var _centerSquare = null;

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
		var _layersDestroyed = 0;

		var _currentPreviewWindowCoolDownTime = 30000; // in millis
		var _currentBlockFallSpeed = 1; // squares / millis

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

		// The game loop drives the progression of frames and game logic
		function _gameLoop() {
//			log.d("-->game._gameLoop");

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

//			log.d("<--game._gameLoop");
		}

		// Update each of the game entities with the current time.
		function _update(deltaTime) {
//			log.d("-->game._update");

			_gameTime += deltaTime;

			// Update the center square
			_centerSquare.update(deltaTime);

			var i;
			var block;

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
					_blocksOnGameArea[i].addSquaresToGameArea(_squaresOnGameArea);
					_blocksOnGameArea.splice(i, 1);

					// Check whether this settled block causes the disintegration of any layers
					if (false) { // TODO: ****
						//++_layersDestroyed;
					}
				}
			}

			// Update the preview windows
			for (i = 0; i < 4; ++i) {
				_previewWindows[i].update(deltaTime);

				// If the preview window has finished its cool down, then add 
				// its block to the game area and start a new block in preview 
				// window
				if (_previewWindows[i].isCoolDownFinished()) {
					block = _previewWindows[i].getCurrentBlock();

					// If there is a square on the game area in the way the 
					// new block from being added, then the game is over and 
					// the player has lost
					if (block.checkIsOverTopSquare(_squaresOnGameArea)) {
						_endGame();
						return;
					}

					_blocksOnGameArea.push(block);
					_previewWindows[i].startNewBlock();
				}
			}

			// Loop through each square in the game area and possibly animate 
			// it with a shimmer
			// TODO: 

			_levelDisplay.innerHTML = _level;
			_scoreDisplay.innerHTML = _score;

//			log.d("<--game._update");
		}

		function _draw() {
//			log.d("-->game._draw");

			// Clear the canvas
			_context.clearRect(0, 0, _canvas.width, _canvas.height);

			// Draw the background and the border
			_context.beginPath();
			_context.lineWidth = _NORMAL_STROKE_WIDTH;
			_context.fillStyle = _NORMAL_FILL_COLOR;
			_context.strokeStyle = _NORMAL_STROKE_COLOR;
			_context.rect(_gameAreaPosition.x, _gameAreaPosition.y, _gameAreaSizePixels, _gameAreaSizePixels);
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
										(i % _gameAreaSize) * _squareSizePixels, 
										Math.floor((i / _gameAreaSize)) * _squareSizePixels);
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
					// Draw an arc arrow from the selected block's current position to where it would be moving
					_drawArcArrow(_context, _selectedBlock, _phantomBlock, _INVALID_MOVE_FILL_COLOR, _INVALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

					// Draw a polygon at the invalid location where the selected block would be moving
					_drawPolygon(_context, _phantomBlockPolygon, _INVALID_MOVE_FILL_COLOR, _INVALID_MOVE_STROKE_COLOR, _PHANTOM_BLOCK_STROKE_WIDTH);
				} else {
					// Draw the phantom guide lines
					_drawPolygon(_context, _phantomGuideLinePolygon, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

					if (_gestureType === _DIRECTION_CHANGE) {
						// Draw an arc arrow from the selected block's current position to where it would be moving
						_drawArcArrow(_context, _selectedBlock, _phantomBlock, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);
					}

					// Draw the enlarged, phantom, overlay block
					_drawPolygon(_context, _phantomBlockPolygon, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_BLOCK_STROKE_WIDTH);
				}
			}

			_context.restore();

//			log.d("<--game._draw");
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
									_gameAreaSize * _gameAreaSize, -1);
			_prevTime = 0;

			_setLevel(_startingLevel);

			var deltaCoolDown = _currentPreviewWindowCoolDownTime / 4;

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

			_centerSquare.setLevel(level);

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

			_previewWindows = [previewWindow1, previewWindow2, previewWindow3, previewWindow4];
		}

		function _setUpCenterSquare() {
			_centerSquare = new CenterSquare();
			_setUpCenterSquareDimensions();
		}

		function _setUpCenterSquareDimensions() {
			var size = _centerSquareSize * _squareSizePixels;
			var x = _gameAreaPosition.x + (_gameAreaSizePixels - size) / 2;

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
								_mode4On, _mode5On, true);

				_gestureType = gestureTypeAndCellPos.type;
				_gestureCellPos = gestureTypeAndCellPos.pos;

				// Check whether the gesture was a sideways move, a drop, or a 
				// direction change
				switch (_gestureType) {
				case _NONE:
					log.d("---game._finishGesture: _NONE");
					break;
				case _ROTATION:
					log.d("---game._finishGesture: _ROTATION");

					// Rotate the selected block
					var wasAbleToRotate = _selectedBlock.rotate(_squaresOnGameArea, _blocksOnGameArea, true);

					if (wasAbleToRotate) {
						// Play the rotation SFX
						// TODO: 
					} else {
						// Play the unable-to-move SFX
						// TODO: 
					}
					break;
				case _SIDEWAYS_MOVE:
					log.d("---game._finishGesture: _SIDEWAYS_MOVE");

					_selectedBlock.setCellPosition(_gestureCellPos.x, _gestureCellPos.y);

					// Play the sideways move SFX
					// TODO: 
					break;
				case _DROP:
					log.d("---game._finishGesture: _DROP");

					_selectedBlock.setCellPosition(_gestureCellPos.x, _gestureCellPos.y);

					// Play the drop SFX
					// TODO: 
					break;
				case _DIRECTION_CHANGE:
					log.d("---game._finishGesture: _DIRECTION_CHANGE");

					if (_mode5On) {
						_isPhantomBlockValid = _computeIsPhantomBlockValid(_phantomBlock, _squaresOnGameArea, _blocksOnGameArea);

						if (_isPhantomBlockValid) {
							_switchPhantomToSelected(_selectedBlock, _phantomBlock);
							_selectedBlock.switchFallDirection();

							// Play the direction change SFX
							// TODO: 
						} else {
							// Play the unable-to-move SFX
							// TODO: 
						}
					} else {
						_selectedBlock.switchFallDirection();

						// Play the direction change SFX
						// TODO: 
					}
					break;
				default:
					return;
				}
			} else {
				log.d("---game._finishGesture: <no selected block>");
			}

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
								_mode4On, _mode5On, false);

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
//					_isPhantomBlockValid = _gestureType !== _DIRECTION_CHANGE || 
//							_computeIsPhantomBlockValid(_phantomBlock, _squaresOnGameArea, _blocksOnGameArea);
_isPhantomBlockValid = false;
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
				startTime, endPos, endTime, mode4On, mode5On, considerTap) {
			var gestureType = null;
			var gesturePos = { x: -1, y: -1 };

			var duration = endTime - startTime;
			var squaredDistance = _getSquaredDistance(startPos, endPos);

			// Check whether the gesture was short enough to be a tap
			if (considerTap && squaredDistance < _TAP_SQUARED_DISTANCE_THRESHOLD) {
				// Check whether the gesture was brief enough to be a tap
				if (duration < _TAP_TIME_THRESHOLD) {
					gestureType = _ROTATION;
				} else {
					gestureType = _NONE;
				}
			} else {
				// Determine the direction of the gesture
				var deltaX = endPos.x - startPos.x;
				var deltaY = endPos.y - startPos.y;
				var gestureDirection;
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
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

				var blockType = selectedBlock.getType();
				var fallDirection = selectedBlock.getFallDirection();
				var orientation = selectedBlock.getOrientation();
				var oldCellPosition = selectedBlock.getCellPosition();
				var cellOffset = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(blockType, orientation);
				// This offset is subtracted from the gesture position.  So 
				// this ultimately adds 0.5 to the position, which centers the 
				// position calculation to where it really should be (because 
				// we will then be flooring it).
				var pixelOffsetForComputingCell = {
					x: (cellOffset.x * _squareSizePixels) - (_squareSizePixels * 0.5),
					y: (cellOffset.y * _squareSizePixels) - (_squareSizePixels * 0.5)
				};

				gesturePos.x = oldCellPosition.x;
if(isNaN(gesturePos.x)){
var trace = printStackTrace();
alert("UUUUGHH1!! \nx="+x+";\ny="+y+";\n"+trace.join('\n'));
}
				gesturePos.y = oldCellPosition.y;

				var farthestCellAvailable;

				switch (fallDirection) {
				case Block.prototype.DOWNWARD:
					switch (gestureDirection) {
					case Block.prototype.DOWNWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.LEFTWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
						break;
					case Block.prototype.UPWARD:
						gestureType = _DIRECTION_CHANGE;
						gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaSize);
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
						gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.LEFTWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
						break;
					case Block.prototype.UPWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.RIGHTWARD:
						gestureType = _DIRECTION_CHANGE;
						gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaSize);
						break;
					default:
						return;
					}
					break;
				case Block.prototype.UPWARD:
					switch (gestureDirection) {
					case Block.prototype.DOWNWARD:
						gestureType = _DIRECTION_CHANGE;
						gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaSize);
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
						gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
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
						gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.LEFTWARD:
						gestureType = _DIRECTION_CHANGE;
						gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, _gameAreaSize);
						break;
					case Block.prototype.UPWARD:
						gestureType = _SIDEWAYS_MOVE;
						farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / _squareSizePixels);
						gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
						break;
					case Block.prototype.RIGHTWARD:
						gestureType = _DROP;
						farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(_squaresOnGameArea, _blocksOnGameArea);
						gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / _squareSizePixels);
						gesturePos.x = Math.min(gesturePos.x, farthestCellAvailable.x);
						break;
					default:
						return;
					}
					break;
				default:
					return;
				}
if(considerTap || isNaN(gesturePos.x)){// TODO: REMOVE ME
var msg = "UUUUGHH2!! \ngesturePos.x="+gesturePos.x+";\ngesturePos.y="+gesturePos.y+";\n"+
"farthestCellAvailable="+ (farthestCellAvailable ? farthestCellAvailable.x+","+farthestCellAvailable.y : "<undefined>")+";\n"+
"gestureType="+gestureType+";\n"+
"fallDirection="+fallDirection+";\n"+
"gestureDirection="+gestureDirection+";\n"+
"pixelOffsetForComputingCell="+pixelOffsetForComputingCell.x+","+pixelOffsetForComputingCell.y+";\n"+
"deltaPos="+deltaX+","+deltaY+";\n"+
"startPos="+startPos.x+","+startPos.y+";\n"+
"endPos="+endPos.x+","+endPos.y+";\n"+
"oldCellPosition="+oldCellPosition.x+","+oldCellPosition.y+";\n";
if (isNaN(gesturePos.x)) {
var trace = printStackTrace();
alert(msg+trace.join('\n'));
} else {
log.w(msg);
}

// // Fall directions
// Block.prototype.DOWNWARD = 0;
// Block.prototype.LEFTWARD = 1;
// Block.prototype.UPWARD = 2;
// Block.prototype.RIGHTWARD = 3;

// // Block sides
// Block.prototype.ALL_SIDES = 0;
// Block.prototype.TOP_SIDE = 1;
// Block.prototype.RIGHT_SIDE = 2;
// Block.prototype.BOTTOM_SIDE = 3;
// Block.prototype.LEFT_SIDE = 4;

// // The gesture types
// var _NONE = 1;
// var _ROTATION = 2;
// var _SIDEWAYS_MOVE = 3;
// var _DROP = 4;
// var _DIRECTION_CHANGE = 5;
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
			var type = phantomBlock.getType();
			var orientation = phantomBlock.getOrientation();
			var offset = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(type, orientation);

			// Enlarge the polygon
			for (var i = 0; i < points.length; ++i) {
				points[i].x = ((points[i].x - offset.x) * _PHANTOM_BLOCK_SIZE_RATIO) + offset.x;
				points[i].y = ((points[i].y - offset.y) * _PHANTOM_BLOCK_SIZE_RATIO) + offset.y;
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

				// Find the nearest block
				for (var i = 1; i < blocksOnGameArea.length; ++i) {
					currentSquareDistance = _getSquaredDistance(pos, blocksOnGameArea[i].getPixelCenter());

					if (currentSquareDistance <= nearestSquareDistance) {
						nearestSquareDistance = currentSquareDistance;
						nearestBlock = blocksOnGameArea[i];
					}
				}

				// Only return the nearest block if it is indeed near enough
				if (nearestSquareDistance < _BLOCK_SELECT_SQUARED_DISTANCE_THRESHOLD) {
					return nearestBlock;
				}
			}

			return null;
		}

		function _getSquaredDistance(pos1, pos2) {
			var deltaX = pos1.x - pos2.x;
			var deltaY = pos1.y - pos2.y;
			return deltaX * deltaX + deltaY * deltaY;
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
			window.Block.prototype.setGameAreaCellSize(_gameAreaSize);
			window.PreviewWindow.prototype.setGameAreaSize(_gameAreaSize);
			_setUpCenterSquareDimensions();
		}

		function _setCenterSquareSize(centerSquareSize) {
			_centerSquareSize = centerSquareSize;
			
			window.Block.prototype.setCenterSquareCellSize(_centerSquareSize);
			_setUpCenterSquareDimensions();
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

	// Make Game available to the rest of the program
	window.Game = Game;

	log.d("<--game.LOADING_MODULE");
})();
