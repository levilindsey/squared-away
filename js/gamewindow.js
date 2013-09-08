// ------------------------------------------------------------------------- //
// -- window.gameWindow
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the logic for the actual contents of the game window is encapsulated 
// in this anonymous function.  This is then stored in the window.gameWindow 
// property.  This has the effect of minimizing side-effects and problems when 
// linking multiple script files.
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.Block
//		- window.game
//		- window.input
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->gameWindow.LOADING_MODULE");

	// ----------------------------------------------------------------- //
	// -- Private members

	var _NORMAL_STROKE_WIDTH = 2; // in pixels

	var _NORMAL_STROKE_COLOR = "#5a5a5a";
	var _NORMAL_FILL_COLOR = "#141414";

	var _INVALID_MOVE_FILL_COLOR = "rgba(255,200,200,0.4)"; // TODO: change this to a neon red color, with the stroke lighter than the fill
	var _INVALID_MOVE_STROKE_COLOR = "rgba(255,200,200,0.4)"; // TODO: change this to a neon red color, with the stroke lighter than the fill
	var _VALID_MOVE_FILL_COLOR = "rgba(100,200,255,0.2)"; // TODO: change this to a neon blue color, with the stroke lighter than the fill
	var _VALID_MOVE_STROKE_COLOR = "rgba(100,200,255,0.2)"; // TODO: change this to a neon blue color, with the stroke lighter than the fill
	var _PHANTOM_GUIDE_LINE_STROKE_WIDTH = 1;
	var _PHANTOM_BLOCK_STROKE_WIDTH = 2;

	var _centerSquare = null;

	var _layerCollapseDelay = 0.2;
	var _ellapsedCollapseTime = _layerCollapseDelay;

	var _layersToCollapse = [];

	var _currentBackgroundColorIndex = 0;

	// Update each of the game entities with the current time.
	function _update(deltaTime) {
		// Update the center square
		_centerSquare.update(deltaTime);

		var i;
		var layersWereCollapsed = false;
		var block;

		// There is a small collapse delay between the time when a layer 
		// is completed and when it is collapsed.  However, if there are 
		// any other layers waiting to be collapsed, then ALL pending 
		// layers need to be collapsed simultaneously.  So we can use a 
		// single timer for any number of pending layers.
		_ellapsedCollapseTime += deltaTime;
		if (_ellapsedCollapseTime >= _layerCollapseDelay) {
			// Sort the completed layers by descending layer number
			_layersToCollapse.sort(function(a, b) {
				if (game.completingSquaresOn) {
					return b - a;
				} else {
					return b.layer - a.layer;
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
				// TODO: *******!!!!!! (if I actually want to represent the animation of collapse with different cell numbers, then I am going to have to refactor each of the places in the code that look at gameWindow.squaresOnGameWindow[i] < 0 and make sure that they also behave correctly with gameWindow.squaresOnGameWindow[i] equal to the weird animating collapse numbers
			}
		}

		if (layersWereCollapsed) {
			// Collapsing layers has the potential to complete additional 
			// layers, so we should check for that now
			_checkForCompleteLayers();

			// TODO: settle stuff?
		}

		// Update the blocks
		for (i = 0; i < gameWindow.blocksOnGameWindow.length; ++i) {
			block = gameWindow.blocksOnGameWindow[i];

			block.update(deltaTime, gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);

			var addSquares = false;

			// If the block has reached the edge of the game area and is 
			// trying to fall out, then the game is over and the player 
			// has lost
			if (block.getHasCollidedWithEdgeOfArea()) {
				game.endGame();
				addSquares = true;
			}
			// Check whether the block has reached a stationary square and 
			// can no longer fall
			else if (block.getHasCollidedWithSquare()) {
				addSquares = true;
			}
			// Check whether the canFallPastCenterOn mode is off and the block 
			// has reached the back line of the center square
			else if (!game.canFallPastCenterOn && 
					block.getHasCollidedWithBackLineOfCenterSquare()) {
				// ---------- Slide the block inward ---------- //

				var fallDirection = block.getFallDirection();
				var cellPosition = block.getCellPosition();
				var farthestCellAvailable;
				var onLeftOfCenter;

				// Check which side of the center square the block is on
				switch (fallDirection) {
				case Block.prototype.DOWNWARD:
					onLeftOfCenter = cellPosition.x < gameWindow.centerSquareCellPositionX;
					break;
				case Block.prototype.LEFTWARD:
					onLeftOfCenter = cellPosition.y < gameWindow.centerSquareCellPositionX;
					break;
				case Block.prototype.UPWARD:
					onLeftOfCenter = cellPosition.x >= gameWindow.centerSquareCellPositionX;
					break;
				case Block.prototype.RIGHTWARD:
					onLeftOfCenter = cellPosition.y >= gameWindow.centerSquareCellPositionX;
					break;
				default:
					return;
				}

				// Compute where to slide this block
				if (onLeftOfCenter) {
					farthestCellAvailable = block.getFarthestRightCellAvailable(
							gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
				} else {
					farthestCellAvailable = block.getFarthestLeftCellAvailable(
							gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);
				}

				block.setCellPosition(farthestCellAvailable.x, farthestCellAvailable.y);

				addSquares = true;
			}
			// In case the selected block falls without the player 
			// spawning any drag events, the gesture type and phantom 
			// shapes need to be updated
			else if (block === input.selectedMouseBlock) {
				input.dragMouseGesture();
			}

			if (addSquares) {
				// Add it's squares to the game area and delete the block 
				// object
				var newCellPositions = block.addSquaresToGameWindow(gameWindow.squaresOnGameWindow);
				gameWindow.blocksOnGameWindow.splice(i, 1);

				// If the player is still selecting it, then un-select it
				if (input.selectedMouseBlock === block) {
					input.selectedMouseBlock = null;
				}
				if (input.selectedKeyboardBlock === block) {
					// Check whether there currently are any other blocks to 
					// select automatically
					if (gameWindow.blocksOnGameWindow.length > 0) {
						input.selectedKeyboardBlock = gameWindow.blocksOnGameWindow[0];
					} else {
						input.selectedKeyboardBlock = null;
					}
				}

				// Check whether this was the last active block
				if (gameWindow.blocksOnGameWindow.length === 0) {
					block = game.forceNextBlock();
				}

				// Check whether this landed block causes the collapse of any layers
				var layersWereCompleted = _checkForCompleteLayers(newCellPositions);

				if (layersWereCompleted) {
					sound.playSFX("collapse");
					sound.playSFX("land");
				} else {
					sound.playSFX("land");
				}
			}
		}
	}

	function _draw(context) {
		// Draw the background and the border
		context.beginPath();
		context.lineWidth = _NORMAL_STROKE_WIDTH;
		if (_currentBackgroundColorIndex >= 0) {
			context.fillStyle = utils.decToHexColorStr(game.DARK_COLORS[_currentBackgroundColorIndex]);
			context.strokeStyle = utils.decToHexColorStr(game.MEDIUM_COLORS[_currentBackgroundColorIndex]);
		} else {
			context.fillStyle = _NORMAL_FILL_COLOR;
			context.strokeStyle = _NORMAL_STROKE_COLOR;
		}
		context.rect(gameWindow.gameWindowPosition.x, gameWindow.gameWindowPosition.y, gameWindow.gameWindowPixelSize, gameWindow.gameWindowPixelSize);
		context.fill();
		context.stroke();

		// ---- Draw the center square ---- //

		_centerSquare.draw(context);

		// ---- Draw the main play area ---- //

		context.save();
		context.translate(gameWindow.gameWindowPosition.x, gameWindow.gameWindowPosition.y);

		var i;

		// Draw each of the falling blocks
		for (i = 0; i < gameWindow.blocksOnGameWindow.length; ++i) {
			gameWindow.blocksOnGameWindow[i].draw(context);
		}

		// Draw each of the stationary squares
		for (i = 0; i < gameWindow.squaresOnGameWindow.length; ++i) {
			Block.prototype.drawSquare(
									context, gameWindow.squaresOnGameWindow[i], 
									(i % gameWindow.gameWindowCellSize) * gameWindow.squarePixelSize, 
									Math.floor((i / gameWindow.gameWindowCellSize)) * gameWindow.squarePixelSize);
		}

		// Check whether there are currently any disintegrating sections
		if (true) {// TODO: 
			// Draw the disintegrating sections
			// TODO: ?????
		}

		// Check whether the player is currently a selecting a block
		var selectedBlock = input.selectedMouseBlock || input.selectedKeyboardBlock;
		if (selectedBlock && input.phantomBlock) {
			// Check whether the phantom block is in a valid location
			if (input.isPhantomBlockValid) {
				// Draw the phantom guide lines
				_drawPolygon(context, input.phantomGuideLinePolygon, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

				if (input.isGestureDirectionChange()) {
					// Draw an arc arrow from the selected block's current position to where it would be moving
					_drawArcArrow(context, selectedBlock, input.phantomBlock, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);
				}

				// Draw the enlarged, phantom, overlay block
				_drawPolygon(context, input.phantomBlockPolygon, _VALID_MOVE_FILL_COLOR, _VALID_MOVE_STROKE_COLOR, _PHANTOM_BLOCK_STROKE_WIDTH);
			} else {
				// Draw an arc arrow from the selected block's current position to where it would be moving
				_drawArcArrow(context, selectedBlock, input.phantomBlock, _INVALID_MOVE_FILL_COLOR, _INVALID_MOVE_STROKE_COLOR, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

				// Draw a polygon at the invalid location where the selected block would be moving
				_drawPolygon(context, input.phantomBlockPolygon, _INVALID_MOVE_FILL_COLOR, _INVALID_MOVE_STROKE_COLOR, _PHANTOM_BLOCK_STROKE_WIDTH);
			}
		}

		context.restore();
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

	// Check for any layers which are completed by the inclusion of 
	// squares in the given new cell positions.  If no cell positions are 
	// given, then check for all layers in the game area.  In the event of 
	// line-collapse mode, the line layers will be represented by objects 
	// with the following properties: side, layer, startCell, endCell 
	// (inclusive).  Return true any layers were found to be complete.
	function _checkForCompleteLayers(newCellPositions) {
		var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
		var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;
		var centerCellPositionX = (gameWindow.gameWindowCellSize / 2) - 0.5;
		var centerSquareCellHalfSize = gameWindow.centerSquareCellSize / 2;

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
		var maxLayer;

		if (game.completingSquaresOn) { // Collapsing whole squares
			// Check whether we have a limited number of potential layers 
			// to check
			if (newCellPositions) {
				// Get the layers the given positions are a part of
				for (i = 0; i < newCellPositions.length; ++i) {
					deltaX = Math.abs(newCellPositions[i].x - centerCellPositionX);
					deltaY = Math.abs(newCellPositions[i].y - centerCellPositionX);

					if (deltaX > deltaY) {
						layer = Math.ceil(deltaX - centerSquareCellHalfSize);
					} else {
						layer = Math.ceil(deltaY - centerSquareCellHalfSize);
					}

					// Do not add any layer more than once
					if (layersToCheck.indexOf(layer) < 0) {
						layersToCheck.push(layer);
					}
				}
			} else {
				// We will need to check every layer in the game area
				maxLayer = (gameWindow.gameWindowCellSize - gameWindow.centerSquareCellSize) / 2;
				for (layer = 1; layer <= maxLayer; ++layer) {
					layersToCheck.push(layer);
				}
			}

			// Check each of the layers
			completingSquaresOnlayerloop:
			for (j = 0; j < layersToCheck.length; ++j) {
				layer = layersToCheck[j];

				// Check the top side
				startX = minCenterSquareCellPositionX - layer;
				startY = minCenterSquareCellPositionX - layer;
				endX = maxCenterSquareCellPositionX + layer;
				startI = (startY * gameWindow.gameWindowCellSize) + startX;
				deltaI = 1;
				endI = (startY * gameWindow.gameWindowCellSize) + endX;
				for (i = startI; i < endI; i += deltaI) {
					if (gameWindow.squaresOnGameWindow[i] < 0) {
						continue completingSquaresOnlayerloop;
					}
				}

				// Check the right side
				startX = maxCenterSquareCellPositionX - 1 + layer;
				startY = minCenterSquareCellPositionX - layer;
				endY = maxCenterSquareCellPositionX + layer;
				startI = (startY * gameWindow.gameWindowCellSize) + startX;
				deltaI = gameWindow.gameWindowCellSize;
				endI = (endY * gameWindow.gameWindowCellSize) + startX;
				for (i = startI; i < endI; i += deltaI) {
					if (gameWindow.squaresOnGameWindow[i] < 0) {
						continue completingSquaresOnlayerloop;
					}
				}

				// Check the bottom side
				startX = minCenterSquareCellPositionX - layer;
				startY = maxCenterSquareCellPositionX - 1 + layer;
				endX = maxCenterSquareCellPositionX + layer;
				startI = (startY * gameWindow.gameWindowCellSize) + startX;
				deltaI = 1;
				endI = (startY * gameWindow.gameWindowCellSize) + endX;
				for (i = startI; i < endI; i += deltaI) {
					if (gameWindow.squaresOnGameWindow[i] < 0) {
						continue completingSquaresOnlayerloop;
					}
				}

				// Check the left side
				startX = minCenterSquareCellPositionX - layer;
				startY = minCenterSquareCellPositionX - layer;
				endY = maxCenterSquareCellPositionX + layer;
				startI = (startY * gameWindow.gameWindowCellSize) + startX;
				deltaI = gameWindow.gameWindowCellSize;
				endI = (endY * gameWindow.gameWindowCellSize) + startX;
				for (i = startI; i < endI; i += deltaI) {
					if (gameWindow.squaresOnGameWindow[i] < 0) {
						continue completingSquaresOnlayerloop;
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

					if (deltaX > centerSquareCellHalfSize) {
						if (newCellPositions[i].x < centerCellPositionX) {
							side = Block.prototype.LEFT_SIDE;
						} else {
							side = Block.prototype.RIGHT_SIDE;
						}

						layer = {
							side: side,
							layer: Math.ceil(deltaX - centerSquareCellHalfSize)
						};

						// Do not add any layer more than once
						if (_findIndexOfLayerToCheck(layersToCheck, layer) < 0) {
							layersToCheck.push(layer);
						}
					}

					if (deltaY > centerSquareCellHalfSize) {
						if (newCellPositions[i].y < centerCellPositionX) {
							side = Block.prototype.TOP_SIDE;
						} else {
							side = Block.prototype.BOTTOM_SIDE;
						}

						layer = {
							side: side,
							layer: Math.ceil(deltaY - centerSquareCellHalfSize)
						};

						// Do not add any layer more than once
						if (_findIndexOfLayerToCheck(layersToCheck, layer) < 0) {
							layersToCheck.push(layer);
						}
					}
				}
			} else {
				// We will need to check every layer in the game area
				maxLayer = (gameWindow.gameWindowCellSize - gameWindow.centerSquareCellSize) / 2;
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
					startI = startY * gameWindow.gameWindowCellSize;
					deltaI = 1;
					startX = minCenterSquareCellPositionX;
					endX = maxCenterSquareCellPositionX - 1;
					minStartI = (startY * gameWindow.gameWindowCellSize) + startX;
					minEndI = (startY * gameWindow.gameWindowCellSize) + endX;
					maxEndI = ((startY + 1) * gameWindow.gameWindowCellSize) - 1;
					break;
				case Block.prototype.RIGHT_SIDE:
					startX = maxCenterSquareCellPositionX - 1 + layer;
					startI = startX;
					deltaI = gameWindow.gameWindowCellSize;
					startY = minCenterSquareCellPositionX;
					endY = maxCenterSquareCellPositionX - 1;
					minStartI = (startY * gameWindow.gameWindowCellSize) + startX;
					minEndI = (endY * gameWindow.gameWindowCellSize) + startX;
					maxEndI = ((gameWindow.gameWindowCellSize - 1) * gameWindow.gameWindowCellSize) + startX;
					break;
				case Block.prototype.BOTTOM_SIDE:
					startY = maxCenterSquareCellPositionX - 1 + layer;
					startI = startY * gameWindow.gameWindowCellSize;
					deltaI = 1;
					startX = minCenterSquareCellPositionX;
					endX = maxCenterSquareCellPositionX - 1;
					minStartI = (startY * gameWindow.gameWindowCellSize) + startX;
					minEndI = (startY * gameWindow.gameWindowCellSize) + endX;
					maxEndI = ((startY + 1) * gameWindow.gameWindowCellSize) - 1;
					break;
				case Block.prototype.LEFT_SIDE:
					startX = minCenterSquareCellPositionX - layer;
					startI = startX;
					deltaI = gameWindow.gameWindowCellSize;
					startY = minCenterSquareCellPositionX;
					endY = maxCenterSquareCellPositionX - 1;
					minStartI = (startY * gameWindow.gameWindowCellSize) + startX;
					minEndI = (endY * gameWindow.gameWindowCellSize) + startX;
					maxEndI = ((gameWindow.gameWindowCellSize - 1) * gameWindow.gameWindowCellSize) + startX;
					break;
				default:
					return;
				}

				i = startI;

				// Find the first non-empty cell in this line
				while (i <= minStartI) {
					if (gameWindow.squaresOnGameWindow[i] >= 0) {
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
					if (gameWindow.squaresOnGameWindow[i] < 0) {
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
						if (gameWindow.squaresOnGameWindow[i] >= 0) {
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
		var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
		var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;

		var i;
		var deltaI;
		var squaresCollapsedCount;

		if (game.completingSquaresOn) { // Collapsing whole squares
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
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			deltaI = 1;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			for (i = startI; i < endI; i += deltaI) {
				gameWindow.squaresOnGameWindow[i] = -1;
			}

			// Remove the right side
			startX = maxCenterSquareCellPositionX - 1 + layer;
			startY = minCenterSquareCellPositionX - layer;
			endY = maxCenterSquareCellPositionX + layer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			deltaI = gameWindow.gameWindowCellSize;
			endI = (endY * gameWindow.gameWindowCellSize) + startX;
			for (i = startI; i < endI; i += deltaI) {
				gameWindow.squaresOnGameWindow[i] = -1;
			}

			// Remove the bottom side
			startX = minCenterSquareCellPositionX - layer;
			startY = maxCenterSquareCellPositionX - 1 + layer;
			endX = maxCenterSquareCellPositionX + layer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			deltaI = 1;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			for (i = startI; i < endI; i += deltaI) {
				gameWindow.squaresOnGameWindow[i] = -1;
			}

			// Remove the left side
			startX = minCenterSquareCellPositionX - layer;
			startY = minCenterSquareCellPositionX - layer;
			endY = maxCenterSquareCellPositionX + layer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			deltaI = gameWindow.gameWindowCellSize;
			endI = (endY * gameWindow.gameWindowCellSize) + startX;
			for (i = startI; i < endI; i += deltaI) {
				gameWindow.squaresOnGameWindow[i] = -1;
			}

			squaresCollapsedCount = (gameWindow.centerSquareCellSize + layer) * 4;
		} else { // Collapsing only lines
			var side = layer.side;
			var startCell = layer.startCell;
			var endCell = layer.endCell;

			switch (side) {
			case Block.prototype.TOP_SIDE:
				deltaI = 1;
				break;
			case Block.prototype.RIGHT_SIDE:
				deltaI = gameWindow.gameWindowCellSize;
				break;
			case Block.prototype.BOTTOM_SIDE:
				deltaI = 1;
				break;
			case Block.prototype.LEFT_SIDE:
				deltaI = gameWindow.gameWindowCellSize;
				break;
			default:
				return;
			}

			// Remove the squares from the game area
			for (i = startCell, squaresCollapsedCount = 0;
					i <= endCell;
					i += deltaI, ++squaresCollapsedCount) {
				gameWindow.squaresOnGameWindow[i] = -1;
			}
		}

		_dropHigherLayers(layer);

		game.addCollapseToScore(squaresCollapsedCount);
	}

	// Drop by one each of the layers above the given layer.
	function _dropHigherLayers(collapsedLayer) {
		var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
		var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;
		var centerCellPositionX = gameWindow.gameWindowCellSize / 2;

		var i;
		var loopDeltaI;
		var dropDeltaI;
		var updateStartCellDeltaI;
		var updateEndCellDeltaI;
		var currentLayer;

		if (game.completingSquaresOn) { // Collapsing whole squares
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
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = 1;
			dropDeltaI = gameWindow.gameWindowCellSize;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			updateStartCellDeltaI = -gameWindow.gameWindowCellSize;
			updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
			// Loop through each higher layer and consider each to be two-
			// squares longer than the previous
			for (currentLayer = collapsedLayer; 
					currentLayer <= minCenterSquareCellPositionX; 
					++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
				// Drop all squares in this layer
				for (i = startI; i < endI; i += loopDeltaI) {
					if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
						gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
					}
				}
			}

			// Remove the right side
			startX = maxCenterSquareCellPositionX - 1 + collapsedLayer;
			startY = minCenterSquareCellPositionX - collapsedLayer;
			endY = maxCenterSquareCellPositionX + collapsedLayer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = gameWindow.gameWindowCellSize;
			dropDeltaI = -1;
			endI = (endY * gameWindow.gameWindowCellSize) + startX;
			updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
			updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
			// Loop through each higher layer and consider each to be two-
			// squares longer than the previous
			for (currentLayer = collapsedLayer; 
					currentLayer <= minCenterSquareCellPositionX; 
					++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
				// Drop all squares in this layer
				for (i = startI; i < endI; i += loopDeltaI) {
					if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
						gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
					}
				}
			}

			// Remove the bottom side
			startX = minCenterSquareCellPositionX - collapsedLayer;
			startY = maxCenterSquareCellPositionX - 1 + collapsedLayer;
			endX = maxCenterSquareCellPositionX + collapsedLayer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = 1;
			dropDeltaI = -gameWindow.gameWindowCellSize;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
			updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
			// Loop through each higher layer and consider each to be two-
			// squares longer than the previous
			for (currentLayer = collapsedLayer; 
					currentLayer <= minCenterSquareCellPositionX; 
					++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
				// Drop all squares in this layer
				for (i = startI; i < endI; i += loopDeltaI) {
					if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
						gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
					}
				}
			}

			// Remove the left side
			startX = minCenterSquareCellPositionX - collapsedLayer;
			startY = minCenterSquareCellPositionX - collapsedLayer;
			endY = maxCenterSquareCellPositionX + collapsedLayer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = gameWindow.gameWindowCellSize;
			dropDeltaI = 1;
			endI = (endY * gameWindow.gameWindowCellSize) + startX;
			updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
			updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
			// Loop through each higher layer and consider each to be two-
			// squares longer than the previous
			for (currentLayer = collapsedLayer; 
					currentLayer <= minCenterSquareCellPositionX; 
					++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
				// Drop all squares in this layer
				for (i = startI; i < endI; i += loopDeltaI) {
					if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
						gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
					}
				}
			}

			// Remove the first half of the top side
			startX = minCenterSquareCellPositionX - collapsedLayer;
			startY = minCenterSquareCellPositionX - collapsedLayer;
			endX = centerCellPositionX;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = 1;
			dropDeltaI = gameWindow.gameWindowCellSize;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
			updateEndCellDeltaI = -gameWindow.gameWindowCellSize;
			// Loop through each higher layer and consider each to be two-
			// squares longer than the previous
			for (currentLayer = collapsedLayer; 
					currentLayer <= minCenterSquareCellPositionX; 
					++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
				// Drop all squares in this layer
				for (i = startI; i < endI; i += loopDeltaI) {
					if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
						gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
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
				dropDeltaI = gameWindow.gameWindowCellSize;
				updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
				updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
				break;
			case Block.prototype.RIGHT_SIDE:
				loopDeltaI = gameWindow.gameWindowCellSize;
				dropDeltaI = -1;
				updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
				updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
				break;
			case Block.prototype.BOTTOM_SIDE:
				loopDeltaI = 1;
				dropDeltaI = -gameWindow.gameWindowCellSize;
				updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
				updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
				break;
			case Block.prototype.LEFT_SIDE:
				loopDeltaI = gameWindow.gameWindowCellSize;
				dropDeltaI = 1;
				updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
				updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
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
					if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
						gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
					}
				}
			}
		}

		if (game.collapseCausesSettlingOn) {
			_settleHigherLayers(collapsedLayer);
		}
	}

	// Drop each of the blocks that used to be one-layer higher than the 
	// given collapsed layer.  This dropping then has the possibility to 
	// cascade to higher layers depending on whether the dropped blocks 
	// were supporting other higher blocks.
	function _settleHigherLayers(collapsedLayer) {
		// TODO: ****
	}

	function _setUpCenterSquare() {
		_centerSquare = new CenterSquare();
		_setUpCenterSquareDimensions();
	}

	function _setUpCenterSquareDimensions() {
		var size = gameWindow.centerSquareCellSize * gameWindow.squarePixelSize;
		var x = gameWindow.gameWindowPosition.x + (gameWindow.gameWindowPixelSize - size) / 2;

		_centerSquare.setDimensions(x, size);
	}

	function _setGameWindowCellSize(gameWindowCellSize) {
		gameWindow.gameWindowCellSize = gameWindowCellSize;
		gameWindow.squarePixelSize = gameWindow.gameWindowPixelSize / gameWindow.gameWindowCellSize;

		_setUpCenterSquareDimensions();
	}

	function _setCenterSquareCellSize(centerSquareSize) {
		gameWindow.centerSquareCellSize = centerSquareSize;
		_computeCenterSquareCellPosition();

		_setUpCenterSquareDimensions();
	}

	function _computeCenterSquareCellPosition() {
		gameWindow.centerSquareCellPositionX = Math.floor((gameWindow.gameWindowCellSize - gameWindow.centerSquareCellSize) / 2);
	}

	function _reset() {
		gameWindow.blocksOnGameWindow = [];
		gameWindow.squaresOnGameWindow = utils.initializeArray(
								gameWindow.gameWindowCellSize * gameWindow.gameWindowCellSize, -1);

		_layersToCollapse = [];

		_currentBackgroundColorIndex = 0;
	}

	function _setLayerCollapseDelay(layerCollapseDelay) {
		_layerCollapseDelay = layerCollapseDelay;
	}

	function _setCenterSquareColorPeriod(colorPeriod) {
		_centerSquare.setColorPeriod(colorPeriod);
	}

	function _setCurrentBackgroundColorIndex(currentBackgroundColorIndex) {
		_currentBackgroundColorIndex = currentBackgroundColorIndex;
	}

	function _init() {
		_setUpCenterSquare();
	}

	// Make GameWindow available to the rest of the program
	window.gameWindow = {
		draw: _draw,
		update: _update,
		reset: _reset,
		init: _init,

		setGameWindowCellSize: _setGameWindowCellSize,
		setCenterSquareCellSize: _setCenterSquareCellSize,
		setLayerCollapseDelay: _setLayerCollapseDelay,
		setCenterSquareColorPeriod: _setCenterSquareColorPeriod,
		setCurrentBackgroundColorIndex: _setCurrentBackgroundColorIndex,

		blocksOnGameWindow: null, // the moving, four-square pieces
		squaresOnGameWindow: null, // the stationary, single-square pieces

		squarePixelSize: 0, // in pixels

		gameWindowCellSize: 100, // in number of squares
		gameWindowPixelSize: 0, // in pixels
		gameWindowPosition: { x: 0, y: 0 }, // in pixels

		centerSquareCellSize: 6, // in number of squares
		centerSquareCellPositionX: 47 // in number of squares
	};

	log.i("<--gameWindow.LOADING_MODULE");
}());
