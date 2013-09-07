// ------------------------------------------------------------------------- //
// -- window.input
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the overall input logic is encapsulated in this anonymous function.  
// This is then stored in the window.input property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.Block
//		- window.gameWindow
//		- window.game
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->input.LOADING_MODULE");

	// ----------------------------------------------------------------- //
	// -- Private members

	// The gesture types
	var _NONE = 1;
	var _ROTATION = 2;
	var _SIDEWAYS_MOVE = 3;
	var _DROP = 4;
	var _DIRECTION_CHANGE = 5;

	var _BLOCK_SELECT_SQUARED_DISTANCE_THRESHOLD = 2000; // TODO: test this
	var _TAP_SQUARED_DISTANCE_THRESHOLD = 100; // TODO: test this
	var _TAP_TIME_THRESHOLD = 180; // TODO: test this
	var _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE = 140; // pixels

	var _PHANTOM_BLOCK_SIZE_RATIO = 1.2;

	var _gestureStartTime = 0;
	var _gestureStartPos = { x: 0, y: 0 };
	var _gestureCurrentTime = 0;
	var _gestureCurrentPos = { x: 0, y: 0 };

	var _gestureType = _NONE;
	var _gestureCellPos = { x: 0, y: 0 };

	function _startGesture(pos, time) {
		log.d("-->input._startGesture");

		_gestureStartPos = pos;
		_gestureStartTime = time;

		// Find the closest block within a certain distance threshold to 
		// this gesture, if any
		input.selectedBlock = _findNearestValidBlock(_gestureStartPos, gameWindow.blocksOnGameWindow);

		if (input.selectedBlock) {
			sound.playSFX("blockSelect");
		}

		// Clear any phantom objects. These will be set when a drag occurs.
		input.phantomBlock = null;
		input.phantomBlockPolygon = null;
		input.isPhantomBlockValid = false;
		input.phantomGuideLinePolygon = null;

		log.d("<--input._startGesture");
	}

	function _finishGesture(pos, time) {
		log.d("-->input._finishGesture");

		_gestureCurrentPos = pos;
		_gestureCurrentTime = time;

		var logMsg = 
				": start=("+_gestureStartPos.x+","+_gestureStartPos.y+","+_gestureStartTime+
				");end=("+_gestureCurrentPos.x+","+_gestureCurrentPos.y+","+_gestureCurrentTime+
				");cellPos=("+_gestureCellPos.x+","+_gestureCellPos.y+")";

		// Check whether the player is currently selecting a block
		if (input.selectedBlock) {
			// Extract some features from the gesture
			var gestureTypeAndCellPos = 
					_computeGestureTypeAndCellPos(
							input.selectedBlock, 
							_gestureStartPos, _gestureStartTime, 
							_gestureCurrentPos, _gestureCurrentTime, 
							game.mode4On, game.mode5On, true, false);

			_gestureType = gestureTypeAndCellPos.type;
			_gestureCellPos = gestureTypeAndCellPos.pos;

			// Check whether the gesture was a sideways move, a drop, or a 
			// direction change
			switch (_gestureType) {
			case _NONE:
				log.i("---input._finishGesture: _NONE" + logMsg);
				break;
			case _ROTATION:
				log.i("---input._finishGesture: _ROTATION" + logMsg);

				// Rotate the selected block
				var wasAbleToRotate = input.selectedBlock.rotate(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow, true);

				if (wasAbleToRotate) {
					sound.playSFX("rotate");
				} else {
					sound.playSFX("unableToMove");
				}
				break;
			case _SIDEWAYS_MOVE:
				log.i("---input._finishGesture: _SIDEWAYS_MOVE" + logMsg);

				input.selectedBlock.setCellPosition(_gestureCellPos.x, _gestureCellPos.y);

				sound.playSFX("move");
				break;
			case _DROP:
				log.i("---input._finishGesture: _DROP" + logMsg);

				input.selectedBlock.setCellPosition(_gestureCellPos.x, _gestureCellPos.y);

				sound.playSFX("move");
				break;
			case _DIRECTION_CHANGE:
				log.i("---input._finishGesture: _DIRECTION_CHANGE" + logMsg);

				if (game.mode5On) {
					input.isPhantomBlockValid = _computeIsPhantomBlockValid(input.phantomBlock, gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);

					if (input.isPhantomBlockValid) {
						_switchPhantomToSelected(input.selectedBlock, input.phantomBlock);
						input.selectedBlock.switchFallDirection();

						sound.playSFX("changeFallDirection");
					} else {
						sound.playSFX("unableToMove");
					}
				} else {
					input.selectedBlock.switchFallDirection();

					sound.playSFX("changeFallDirection");
				}
				break;
			default:
				return;
			}
		} else {
			log.i("---input._finishGesture: <no selected block>" + logMsg);
		}

		_cancelGesture();

		log.d("<--input._finishGesture");
	}

	function _dragGesture(pos) {
		log.d("-->input._dragGesture");

		// If the pos parameter is not set, then it should be because this 
		// function is being called not because a player drag event, but 
		// because of a block fall event, which actually changes the semantics 
		// of the gesture (in which case, we should keep the old value of 
		// _gestureCurrentPos)
		if (pos) {
			_gestureCurrentPos = pos;
		}

		// Check whether the player is currently selecting a block
		if (input.selectedBlock) {
			// Extract some features from the gesture
			var gestureTypeAndCellPos = 
					_computeGestureTypeAndCellPos(
							input.selectedBlock, 
							_gestureStartPos, -1, 
							_gestureCurrentPos, -1, 
							game.mode4On, game.mode5On, false, false);

			// Only bother re-computing this stuff if the gesture type or 
			// position has changed since the last frame
			if (_gestureCellPos !== gestureTypeAndCellPos.pos || 
					_gestureType !== gestureTypeAndCellPos.type) {
				_gestureType = gestureTypeAndCellPos.type;
				_gestureCellPos = gestureTypeAndCellPos.pos;

				// Compute the square locations which represent the potential 
				// location the player might be moving the selected block to
				input.phantomBlock = _computePhantomBlock(_gestureType, _gestureCellPos, input.selectedBlock);

				// Get a slightly enlarged polygon around the area of the 
				// phantom block squares
				input.phantomBlockPolygon = _computePhantomBlockPolygon(input.phantomBlock);

				// Determine whether the phantom block squares are in a valid 
				// location of the game area
				input.isPhantomBlockValid = _gestureType !== _DIRECTION_CHANGE || 
						_computeIsPhantomBlockValid(input.phantomBlock, gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);

				// Compute the dimensions of the polygons for the phantom lines
				input.phantomGuideLinePolygon = _computePhantomGuideLinePolygon(input.phantomBlock, gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
			}
		}

		log.d("<--input._dragGesture");
	}

	function _cancelGesture() {
		input.selectedBlock = null;
		input.phantomBlock = null;
		input.phantomBlockPolygon = null;
		input.isPhantomBlockValid = false;
		input.phantomGuideLinePolygon = null;
	}

	// Return the nearest active block to the given position within a 
	// certain distance threshold, if one exists.  If not, then return 
	// null.
	function _findNearestValidBlock(pos, blocksOnGameWindow) {
		if (blocksOnGameWindow.length > 0) {
			var nearestSquareDistance = utils.getSquaredDistance(pos, blocksOnGameWindow[0].getPixelCenter());
			var nearestBlock = blocksOnGameWindow[0];

			var currentSquareDistance;
			var i;

			// Find the nearest block
			for (i = 1; i < blocksOnGameWindow.length; ++i) {
				currentSquareDistance = utils.getSquaredDistance(pos, blocksOnGameWindow[i].getPixelCenter());

				if (currentSquareDistance <= nearestSquareDistance) {
					nearestSquareDistance = currentSquareDistance;
					nearestBlock = blocksOnGameWindow[i];
				}
			}

			// Only return the nearest block if it is indeed near enough
			if (nearestSquareDistance < _BLOCK_SELECT_SQUARED_DISTANCE_THRESHOLD) {
				return nearestBlock;
			}
		}

		return null;
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
		var squaredDistance = utils.getSquaredDistance(startPos, endPos);

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
			//var currentBlockCenter = selectedBlock.getPixelCenter();
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
				x: (cellOffset.x * gameWindow.squarePixelSize) - (gameWindow.squarePixelSize * 0.5),
				y: (cellOffset.y * gameWindow.squarePixelSize) - (gameWindow.squarePixelSize * 0.5)
			};

			gesturePos.x = oldCellPosition.x;
			gesturePos.y = oldCellPosition.y;

			var farthestCellAvailable;

			switch (fallDirection) {
			case Block.prototype.DOWNWARD:
				switch (gestureDirection) {
				case Block.prototype.DOWNWARD:
					gestureType = _DROP;
					farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / gameWindow.squarePixelSize);
					gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
					// This prevents the gesture from causing the block to 
					// actually "drop" backward to an earlier position
					if (gesturePos.y < oldCellPosition.y) {
						gestureType = _NONE;
					}
					break;
				case Block.prototype.LEFTWARD:
					gestureType = _SIDEWAYS_MOVE;
					farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / gameWindow.squarePixelSize);
					gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
					break;
				case Block.prototype.UPWARD:
					if (mode4On && Math.abs(deltaY) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
						gestureType = _DIRECTION_CHANGE;
						if (mode5On) {
							gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, gameWindow.gameWindowCellSize);
						}
					} else {
						gestureType = _NONE;
					}
					break;
				case Block.prototype.RIGHTWARD:
					gestureType = _SIDEWAYS_MOVE;
					farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / gameWindow.squarePixelSize);
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
					farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / gameWindow.squarePixelSize);
					gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
					break;
				case Block.prototype.LEFTWARD:
					gestureType = _DROP;
					farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / gameWindow.squarePixelSize);
					gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
					// This prevents the gesture from causing the block to 
					// actually "drop" backward to an earlier position
					if (gesturePos.x > oldCellPosition.x) {
						gestureType = _NONE;
					}
					break;
				case Block.prototype.UPWARD:
					gestureType = _SIDEWAYS_MOVE;
					farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / gameWindow.squarePixelSize);
					gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
					break;
				case Block.prototype.RIGHTWARD:
					if (mode4On && Math.abs(deltaX) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
						gestureType = _DIRECTION_CHANGE;
						if (mode5On) {
							gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, gameWindow.gameWindowCellSize);
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
							gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, gameWindow.gameWindowCellSize);
						}
					} else {
						gestureType = _NONE;
					}
					break;
				case Block.prototype.LEFTWARD:
					gestureType = _SIDEWAYS_MOVE;
					farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / gameWindow.squarePixelSize);
					gesturePos.x = Math.max(gesturePos.x, farthestCellAvailable.x);
					break;
				case Block.prototype.UPWARD:
					gestureType = _DROP;
					farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / gameWindow.squarePixelSize);
					gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
					// This prevents the gesture from causing the block to 
					// actually "drop" backward to an earlier position
					if (gesturePos.y > oldCellPosition.y) {
						gestureType = _NONE;
					}
					break;
				case Block.prototype.RIGHTWARD:
					gestureType = _SIDEWAYS_MOVE;
					farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / gameWindow.squarePixelSize);
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
					farthestCellAvailable = selectedBlock.getFarthestLeftCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / gameWindow.squarePixelSize);
					gesturePos.y = Math.min(gesturePos.y, farthestCellAvailable.y);
					break;
				case Block.prototype.LEFTWARD:
					if (mode4On && Math.abs(deltaX) > _MIN_DIRECTION_CHANGE_GESTURE_DISTANCE) {
						gestureType = _DIRECTION_CHANGE;
						if (mode5On) {
							gesturePos = _getQuadrantSwitchPosition(oldCellPosition.x, oldCellPosition.y, blockType, orientation, gameWindow.gameWindowCellSize);
						}
					} else {
						gestureType = _NONE;
					}
					break;
				case Block.prototype.UPWARD:
					gestureType = _SIDEWAYS_MOVE;
					farthestCellAvailable = selectedBlock.getFarthestRightCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.y = Math.floor((endPos.y - pixelOffsetForComputingCell.y) / gameWindow.squarePixelSize);
					gesturePos.y = Math.max(gesturePos.y, farthestCellAvailable.y);
					break;
				case Block.prototype.RIGHTWARD:
					gestureType = _DROP;
					farthestCellAvailable = selectedBlock.getFarthestDownwardCellAvailable(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
					gesturePos.x = Math.floor((endPos.x - pixelOffsetForComputingCell.x) / gameWindow.squarePixelSize);
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
	function _getQuadrantSwitchPosition(oldX, oldY, blockType, orientation, gameWindowSize) {
		// Get the old position rotated to the new quadrant
		var newX = gameWindowSize - oldY;
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

	function _computeIsPhantomBlockValid(phantomBlock, squaresOnGameWindow, blocksOnGameWindow) {
		return !phantomBlock.checkIsOverTopSquare(squaresOnGameWindow);
	}

	function _switchPhantomToSelected(selectedBlock, phantomBlock) {
		selectedBlock.rotate(gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow, false);
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

	function _computePhantomGuideLinePolygon(phantomBlock, squaresOnGameWindow, blocksOnGameWindow) {
		var fallDirection = phantomBlock.getFallDirection();

		// Get the furthest position the block can move to the "left"
		var farthestLeftCellPosition = phantomBlock.getFarthestLeftCellAvailable(squaresOnGameWindow, blocksOnGameWindow);

		// Get the furthest position the block can move to the "right"
		var farthestRightCellPosition = phantomBlock.getFarthestRightCellAvailable(squaresOnGameWindow, blocksOnGameWindow);

		// Get the furthest position the block can move "downward"
		var farthestDownCellPosition = phantomBlock.getFarthestDownwardCellAvailable(squaresOnGameWindow, blocksOnGameWindow);

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
			leftSidePixelPoints[i].x = (farthestLeftCellPosition.x + leftSidePixelPoints[i].x) * gameWindow.squarePixelSize;
			leftSidePixelPoints[i].y = (farthestLeftCellPosition.y + leftSidePixelPoints[i].y) * gameWindow.squarePixelSize;
		}

		// Translate the "rightward" points to the furthest "rightward" position
		for (i = 0; i < rightSidePixelPoints.length; ++i) {
			rightSidePixelPoints[i].x = (farthestRightCellPosition.x + rightSidePixelPoints[i].x) * gameWindow.squarePixelSize;
			rightSidePixelPoints[i].y = (farthestRightCellPosition.y + rightSidePixelPoints[i].y) * gameWindow.squarePixelSize;
		}

		// Translate the "downward" points to the furthest "downward" position
		for (i = 0; i < bottomSidePixelPoints.length; ++i) {
			bottomSidePixelPoints[i].x = (farthestDownCellPosition.x + bottomSidePixelPoints[i].x) * gameWindow.squarePixelSize;
			bottomSidePixelPoints[i].y = (farthestDownCellPosition.y + bottomSidePixelPoints[i].y) * gameWindow.squarePixelSize;
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

	function _isGestureDirectionChange() {
		return _gestureType === _DIRECTION_CHANGE;
	}

	function _keyboardControl(type) {
		// TODO: ****
	}

	// Make input available to the rest of the program
	window.input = {
		startGesture: _startGesture,
		finishGesture: _finishGesture,
		dragGesture: _dragGesture,
		cancelGesture: _cancelGesture,

		isGestureDirectionChange: _isGestureDirectionChange,

		selectedBlock: null,

		phantomBlock: null,
		phantomBlockPolygon: null,
		isPhantomBlockValid: false,
		phantomGuideLinePolygon: null,

		keyboardControl: _keyboardControl,

		UP: 0,
		RIGHT: 1,
		DOWN: 2,
		LEFT: 3,
		ROTATE: 4,
		SWITCH_BLOCKS: 5,
		BONUS_1: 6,
		BONUS_2: 7
	};

	log.i("<--input.LOADING_MODULE");
}());
