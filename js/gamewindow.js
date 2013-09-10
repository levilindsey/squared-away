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

	var _NORMAL_STROKE_WIDTH = 2; // pixels

	var _PHANTOM_GUIDE_LINE_STROKE_WIDTH = 1;
	var _PHANTOM_BLOCK_STROKE_WIDTH = 2;

	var _UP_RIGHT_COLLAPSE_ANIMATION = 1;
	var _SIDEWAYS_COLLAPSE_ANIMATION = 2;
	var _NO_ANIMATION = 0;

	var _START_SHIMMER_ANIMATION_TICK_PERIOD = 50;
	var _PROB_OF_SHIMMER = 0.002;
	var _SHIMMER_ANIMATION_PERIOD = 250; // millis

	var _centerSquare = null;

	var _layersToCollapse = [];

	var _currentBackgroundColorIndex = 0;

	var _gameWindowTime = 0;
	var _timeSinceLastStartShimmerTick = 0;

	// Update each of the game entities with the current time.
	function _update(deltaTime) {
		_gameWindowTime += deltaTime;
		_timeSinceLastStartShimmerTick += deltaTime;

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
		gameWindow.ellapsedCollapseTime += deltaTime;
		if (gameWindow.ellapsedCollapseTime >= gameWindow.layerCollapseDelay) {
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
			}
		}

		if (layersWereCollapsed) {
			// Collapsing layers has the potential to complete additional 
			// layers, so we should check for that now
			_checkForCompleteLayers();
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
				game.endGame(block.getPixelCenter());
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
				var bombType = block.getBombType();
				if (bombType >= 0) {
					if (bombType === 0) {
						_handleCollapseBomb(block.getCellPosition(), block.getFallDirection());
						game.incrementCollapseBombUsedCount()
						sound.playSFX("collapseBombDetonate");
					} else {
						_handleSettleBomb();
						game.incrementSettleBombUsedCount()
						_centerSquare.animateSettleBomb();
						sound.playSFX("settleBombDetonate");
					}
					gameWindow.blocksOnGameWindow.splice(i, 1);
				} else {
					// Add it's squares to the game area and delete the block 
					// object
					var newCellPositions = block.addSquaresToGameWindow(gameWindow.squaresOnGameWindow);
					gameWindow.blocksOnGameWindow.splice(i, 1);

					// Check whether this landed block causes the collapse of any layers
					var layersWereCompleted = _checkForCompleteLayers(newCellPositions);

					if (layersWereCompleted) {
						sound.playSFX("collapse");
						sound.playSFX("land");
					} else {
						sound.playSFX("land");
					}
				}

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
			}
		}

		// Check whether we are ready to possibly start animating some squares with shimmer
		if (_timeSinceLastStartShimmerTick > _START_SHIMMER_ANIMATION_TICK_PERIOD) {
			_timeSinceLastStartShimmerTick %= _START_SHIMMER_ANIMATION_TICK_PERIOD;

			// Loop over each square and possibly animate it with a shimmer
			for (i = 0; i < gameWindow.squaresOnGameWindow.length; ++i) {
				// Make sure there is a square here and it is not already animating
				if (gameWindow.squaresOnGameWindow[i] >= 0 && 
						gameWindow.animatingSquares[i] === _NO_ANIMATION) {
					// TODO: refactor this so I can call the random number generator only once for the whole set, or at least fewer times than this
					if (Math.random() < _PROB_OF_SHIMMER) {
						gameWindow.animatingSquares[i] = _gameWindowTime;
					}
				}
			}
		}
	}

	function _draw(context) {
		// Draw the background and the border
		context.beginPath();
		context.lineWidth = _NORMAL_STROKE_WIDTH;
		if (_currentBackgroundColorIndex >= 0) {
			context.fillStyle = game.DARK_COLORS[_currentBackgroundColorIndex].str;
			context.strokeStyle = game.MEDIUM_COLORS[_currentBackgroundColorIndex].str;
		} else {
			context.fillStyle = game.DEFAULT_FILL.str;
			context.strokeStyle = game.DEFAULT_STROKE.str;
		}
		context.rect(gameWindow.gameWindowPosition.x, gameWindow.gameWindowPosition.y, gameWindow.gameWindowPixelSize, gameWindow.gameWindowPixelSize);
		context.fill();
		context.stroke();

		// ---- Draw the main play area ---- //

		context.save();
		context.translate(gameWindow.gameWindowPosition.x, gameWindow.gameWindowPosition.y);

		var collapseAnimationProgress = gameWindow.layerCollapseDelay - gameWindow.ellapsedCollapseTime;
		collapseAnimationProgress = Math.max(collapseAnimationProgress, 0);
		collapseAnimationProgress = 0.9999999 - collapseAnimationProgress / gameWindow.layerCollapseDelay;
		var upRightCollapseAnimationIndex = 
				Block.prototype.START_INDEX_OF_UP_RIGHT_COLLAPSE_ANIMATION + 
				Math.floor(collapseAnimationProgress * 
						Block.prototype.NUMBER_OF_FRAMES_IN_COLLAPSE_ANIMATION);
		var sidewaysCollapseAnimationIndex = 
				Block.prototype.START_INDEX_OF_SIDEWAYS_COLLAPSE_ANIMATION + 
				Math.floor(collapseAnimationProgress * 
						Block.prototype.NUMBER_OF_FRAMES_IN_COLLAPSE_ANIMATION);

		var shimmerAnimationProgress;
		var animationIndex;
		var i;
		var rotateSprite = false;

		// Draw each of the falling blocks
		for (i = 0; i < gameWindow.blocksOnGameWindow.length; ++i) {
			gameWindow.blocksOnGameWindow[i].draw(context);
		}

		// Draw each of the stationary squares
		for (i = 0; i < gameWindow.squaresOnGameWindow.length; ++i) {
			// Check whether we are currently animating this square in some manner
			if (gameWindow.animatingSquares[i] === _NO_ANIMATION) {
				animationIndex = 0;
			} else if (gameWindow.animatingSquares[i] === _UP_RIGHT_COLLAPSE_ANIMATION) {
				animationIndex = upRightCollapseAnimationIndex;
			} else if (gameWindow.animatingSquares[i] === _SIDEWAYS_COLLAPSE_ANIMATION) {
				animationIndex = sidewaysCollapseAnimationIndex;
			} else {
				shimmerAnimationProgress = (_gameWindowTime - gameWindow.animatingSquares[i]) / _SHIMMER_ANIMATION_PERIOD;
				if (shimmerAnimationProgress < 1) {
					animationIndex = 
							Block.prototype.START_INDEX_OF_SHIMMER_ANIMATION + 
							Math.floor(shimmerAnimationProgress * 
									Block.prototype.NUMBER_OF_FRAMES_IN_SHIMMER_ANIMATION);
				} else {
					gameWindow.animatingSquares[i] = _NO_ANIMATION;
					animationIndex = 0;
				}
			}

			Block.prototype.drawSquare(
					context, gameWindow.squaresOnGameWindow[i], 
					(i % gameWindow.gameWindowCellSize) * gameWindow.squarePixelSize, 
					Math.floor((i / gameWindow.gameWindowCellSize)) * gameWindow.squarePixelSize, 
					animationIndex);
		}

		// Check whether the player is currently a selecting a block
		var selectedBlock = input.selectedMouseBlock || input.selectedKeyboardBlock;
		if (selectedBlock && input.phantomBlock) {
			// Check whether the phantom block is in a valid location
			if (input.isPhantomBlockValid) {
				// Draw the phantom guide lines
				_drawPolygon(context, input.phantomGuideLinePolygon, game.VALID_MOVE_FILL.str, game.VALID_MOVE_STROKE.str, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

				if (input.isGestureDirectionChange()) {
					// Draw an arc arrow from the selected block's current position to where it would be moving
					_drawArcArrow(context, selectedBlock, input.phantomBlock, game.VALID_MOVE_FILL.str, game.VALID_MOVE_STROKE.str, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);
				}

				// Draw the enlarged, phantom, overlay block
				_drawPolygon(context, input.phantomBlockPolygon, game.VALID_MOVE_FILL.str, game.VALID_MOVE_STROKE.str, _PHANTOM_BLOCK_STROKE_WIDTH);
			} else {
				// Draw an arc arrow from the selected block's current position to where it would be moving
				_drawArcArrow(context, selectedBlock, input.phantomBlock, game.INVALID_MOVE_FILL.str, game.INVALID_MOVE_STROKE.str, _PHANTOM_GUIDE_LINE_STROKE_WIDTH);

				// Draw a polygon at the invalid location where the selected block would be moving
				_drawPolygon(context, input.phantomBlockPolygon, game.INVALID_MOVE_FILL.str, game.INVALID_MOVE_STROKE.str, _PHANTOM_BLOCK_STROKE_WIDTH);
			}
		}

		context.restore();

		// ---- Draw the center square ---- //

		_centerSquare.draw(context);
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
	// (inclusive).  Return true if any layers were found to be complete.
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
		var animationValue;

		if (game.completingSquaresOn) { // Collapsing whole squares
			var collapsingIndices;
			var sideLength;

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
				collapsingIndices = [];

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
					collapsingIndices.push(i);
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
					collapsingIndices.push(i);
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
					collapsingIndices.push(i);
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
					collapsingIndices.push(i);
				}

				completeLayers.push(layer);

				// Mark each square in this layer as collapsing
				sideLength = gameWindow.centerSquareCellSize + layer * 2;
				for (i = 0; i < sideLength; ++i) {
					gameWindow.animatingSquares[collapsingIndices[i]] = _UP_RIGHT_COLLAPSE_ANIMATION;
				}for (; i < sideLength * 2; ++i) {
					gameWindow.animatingSquares[collapsingIndices[i]] = _SIDEWAYS_COLLAPSE_ANIMATION;
				}for (; i < sideLength * 3; ++i) {
					gameWindow.animatingSquares[collapsingIndices[i]] = _UP_RIGHT_COLLAPSE_ANIMATION;
				}for (; i < sideLength * 4; ++i) {
					gameWindow.animatingSquares[collapsingIndices[i]] = _SIDEWAYS_COLLAPSE_ANIMATION;
				}
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
					layersToCheck.push({
						side: Block.prototype.TOP_SIDE,
						layer: layer
					});
					layersToCheck.push({
						side: Block.prototype.LEFT_SIDE,
						layer: layer
					});
					layersToCheck.push({
						side: Block.prototype.BOTTOM_SIDE,
						layer: layer
					});
					layersToCheck.push({
						side: Block.prototype.RIGHT_SIDE,
						layer: layer
					});
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

				animationValue =
						(side === Block.prototype.TOP_SIDE || 
								side === Block.prototype.BOTTOM_SIDE) ? 
							_UP_RIGHT_COLLAPSE_ANIMATION : 
							_SIDEWAYS_COLLAPSE_ANIMATION;

				// Mark each square in this layer as collapsing
				for (i = startCell; i <= endCell; i += deltaI) {
					gameWindow.animatingSquares[i] = animationValue;
				}
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
			if (gameWindow.ellapsedCollapseTime >= gameWindow.layerCollapseDelay) {
				gameWindow.ellapsedCollapseTime = 0;
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
				gameWindow.animatingSquares[i] = _NO_ANIMATION;
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
				gameWindow.animatingSquares[i] = _NO_ANIMATION;
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
				gameWindow.animatingSquares[i] = _NO_ANIMATION;
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
				gameWindow.animatingSquares[i] = _NO_ANIMATION;
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
				gameWindow.animatingSquares[i] = _NO_ANIMATION;
			}
		}

		if (game.collapseCausesSettlingOn) {
			_settleHigherLayers(layer, false, false);
		} else {
			_dropHigherLayers(layer);
		}

		game.addCollapseToScore(squaresCollapsedCount);
	}

	// Drop each of the layers above the given layer by one square.
	function _dropHigherLayers(collapsedLayer) {
		_lowerHigherLevels(collapsedLayer, false, false, false);
	}

	// Drop each of the layers above the given layer until they reach either a 
	// non-empty cell or the close side of the center square.
	function _settleHigherLayers(collapsedLayer, forceEntireSquare, forceInwardSettling) {
		_lowerHigherLevels(collapsedLayer, true, forceEntireSquare, forceInwardSettling);
	}

	function _lowerHigherLevels(collapsedLayer, settleInsteadOfDrop, forceEntireSquare, forceInwardSettling) {
		var lowerLayersFn = settleInsteadOfDrop ? _settleLayers : _dropLayers;
		var settleInwardToTheEdge = false;

		var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
		var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - 1;
		var centerCellPositionX = gameWindow.gameWindowCellSize / 2;

		var loopDeltaI;
		var dropDeltaI;
		var updateStartCellDeltaI;
		var updateEndCellDeltaI;
		var firstInwardSettleStop;
		var secondInwardSettleStop;

		if (game.completingSquaresOn || forceEntireSquare) { // Collapsing whole squares
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
			if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
				firstInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
				secondInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX;
			}
			lowerLayersFn(collapsedLayer, minCenterSquareCellPositionX, 
					startI, endI, updateStartCellDeltaI, updateEndCellDeltaI, 
					loopDeltaI, dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);

			// Remove the right side
			startX = maxCenterSquareCellPositionX + collapsedLayer;
			startY = minCenterSquareCellPositionX - collapsedLayer;
			endY = maxCenterSquareCellPositionX + collapsedLayer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = gameWindow.gameWindowCellSize;
			dropDeltaI = -1;
			endI = (endY * gameWindow.gameWindowCellSize) + startX;
			updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
			updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
			if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
				firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + startX;
				secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + startX;
			}
			lowerLayersFn(collapsedLayer, minCenterSquareCellPositionX, 
					startI, endI, updateStartCellDeltaI, updateEndCellDeltaI, 
					loopDeltaI, dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);

			// Remove the bottom side
			startX = minCenterSquareCellPositionX - collapsedLayer;
			startY = maxCenterSquareCellPositionX + collapsedLayer;
			endX = maxCenterSquareCellPositionX + collapsedLayer;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = 1;
			dropDeltaI = -gameWindow.gameWindowCellSize;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
			updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
			if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
				firstInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
				secondInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX;
			}
			lowerLayersFn(collapsedLayer, minCenterSquareCellPositionX, 
					startI, endI, updateStartCellDeltaI, updateEndCellDeltaI, 
					loopDeltaI, dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);

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
			if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
				firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + startX;
				secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + startX;
			}
			lowerLayersFn(collapsedLayer, minCenterSquareCellPositionX, 
					startI, endI, updateStartCellDeltaI, updateEndCellDeltaI, 
					loopDeltaI, dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);

			// Remove the first half of the top side
			startX = minCenterSquareCellPositionX - collapsedLayer;
			startY = minCenterSquareCellPositionX - collapsedLayer;
			endX = centerCellPositionX - 1;
			startI = (startY * gameWindow.gameWindowCellSize) + startX;
			loopDeltaI = 1;
			dropDeltaI = gameWindow.gameWindowCellSize;
			endI = (startY * gameWindow.gameWindowCellSize) + endX;
			updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
			updateEndCellDeltaI = -gameWindow.gameWindowCellSize;
			if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
				firstInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
				secondInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX;
			}
			lowerLayersFn(collapsedLayer, minCenterSquareCellPositionX, 
					startI, endI, updateStartCellDeltaI, updateEndCellDeltaI, 
					loopDeltaI, dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);
		} else { // Collapsing only lines
			var side = collapsedLayer.side;
			var startCell = collapsedLayer.startCell;
			var endCell = collapsedLayer.endCell;
			var startX;
			var startY;

			// De-construct the x and y coords from the index if we need them
			if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
				startX = startCell % gameWindow.gameWindowCellSize;
				startY = Math.floor(startCell / gameWindow.gameWindowCellSize);
			}

			switch (side) {
			case Block.prototype.TOP_SIDE:
				loopDeltaI = 1;
				dropDeltaI = gameWindow.gameWindowCellSize;
				updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
				updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
				if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
					firstInwardSettleStop = ((startY - 1) * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
					secondInwardSettleStop = ((startY - 1) * gameWindow.gameWindowCellSize) + centerCellPositionX;
				}
				break;
			case Block.prototype.RIGHT_SIDE:
				loopDeltaI = gameWindow.gameWindowCellSize;
				dropDeltaI = -1;
				updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
				updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
				if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
					firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + (startX + 1);
					secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + (startX + 1);
				}
				break;
			case Block.prototype.BOTTOM_SIDE:
				loopDeltaI = 1;
				dropDeltaI = -gameWindow.gameWindowCellSize;
				updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
				updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
				if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
					firstInwardSettleStop = ((startY + 1) * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
					secondInwardSettleStop = ((startY + 1) * gameWindow.gameWindowCellSize) + centerCellPositionX;
				}
				break;
			case Block.prototype.LEFT_SIDE:
				loopDeltaI = gameWindow.gameWindowCellSize;
				dropDeltaI = 1;
				updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
				updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
				if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
					firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + (startX - 1);
					secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + (startX - 1);
				}
				break;
			default:
				return;
			}

			startCell += updateStartCellDeltaI;
			endCell += updateEndCellDeltaI;

			lowerLayersFn(collapsedLayer.layer + 1, minCenterSquareCellPositionX, 
					startCell, endCell, updateStartCellDeltaI, updateEndCellDeltaI, 
					loopDeltaI, dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);
		}
	}

	function _dropLayers(startLayer, endLayer, startI, endI, 
			updateStartCellDeltaI, updateEndCellDeltaI, loopDeltaI, 
			dropDeltaI) {
		var layer;
		var i;

		// Loop through each higher layer
		for (layer = startLayer; 
				layer <= endLayer; 
				++layer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
			// Drop all squares in this layer
			for (i = startI; i <= endI; i += loopDeltaI) {
				if (gameWindow.squaresOnGameWindow[i] >= 0 && gameWindow.squaresOnGameWindow[i + dropDeltaI] < 0) {
					gameWindow.squaresOnGameWindow[i + dropDeltaI] = gameWindow.squaresOnGameWindow[i];
					gameWindow.squaresOnGameWindow[i] = -1;
				}
			}
		}
	}

	function _settleLayers(startLayer, endLayer, startI, endI, 
			updateStartCellDeltaI, updateEndCellDeltaI, loopDeltaI, 
			dropDeltaI, firstInwardSettleStop, secondInwardSettleStop) {
		var currentLayer;
		var tempLayer;
		var totalDropDeltaI;
		var i;
		var maxMove;
		var currentMove;

		// Loop through each higher layer
		for (currentLayer = startLayer; 
				currentLayer <= endLayer; 
				++currentLayer, startI += updateStartCellDeltaI, endI += updateEndCellDeltaI) {
			// Check whether we need to settle inward
			if (firstInwardSettleStop) {
				// The inward settling happens toward the center, so we perform it 
				// in two separate halves
				for (i = firstInwardSettleStop - loopDeltaI, maxMove = 1; 
						i >= startI; 
						i -= loopDeltaI, ++maxMove) {
					// Make sure there is a square to settle
					if (gameWindow.squaresOnGameWindow[i] >= 0) {
						totalDropDeltaI = loopDeltaI;
						currentMove = 0;

						// Find how far over to settle the square
						while (currentMove < maxMove && 
								gameWindow.squaresOnGameWindow[i + totalDropDeltaI] < 0) {
							totalDropDeltaI += loopDeltaI;
							++currentMove;
						}

						// Don't move it if we've decided it can't move
						if (totalDropDeltaI !== loopDeltaI) {
							gameWindow.squaresOnGameWindow[i + totalDropDeltaI - loopDeltaI] = gameWindow.squaresOnGameWindow[i];
							gameWindow.squaresOnGameWindow[i] = -1;
						}
					}
				}
				for (i = secondInwardSettleStop + loopDeltaI, maxMove = 1; 
						i <= endI; 
						i += loopDeltaI, ++maxMove) {
					// Make sure there is a square to settle
					if (gameWindow.squaresOnGameWindow[i] >= 0) {
						totalDropDeltaI = -loopDeltaI;
						currentMove = 0;

						// Find how far over to settle the square
						while (currentMove < maxMove && 
								gameWindow.squaresOnGameWindow[i + totalDropDeltaI] < 0) {
							totalDropDeltaI -= loopDeltaI;
							++currentMove;
						}

						// Don't move it if we've decided it can't move
						if (totalDropDeltaI !== -loopDeltaI) {
							gameWindow.squaresOnGameWindow[i + totalDropDeltaI + loopDeltaI] = gameWindow.squaresOnGameWindow[i];
							gameWindow.squaresOnGameWindow[i] = -1;
						}
					}
				}

				// Update the inward stops for the next loop
				firstInwardSettleStop -= dropDeltaI;
				secondInwardSettleStop -= dropDeltaI;
			}

			// Settle downward
			for (i = startI; i <= endI; i += loopDeltaI) {
				// Make sure there is a square to settle
				if (gameWindow.squaresOnGameWindow[i] >= 0) {
					totalDropDeltaI = dropDeltaI;
					tempLayer = currentLayer;

					// Find how far down to settle the square
					while (tempLayer > 1 && 
							gameWindow.squaresOnGameWindow[i + totalDropDeltaI] < 0) {
						totalDropDeltaI += dropDeltaI;
						--tempLayer;
					}

					// Don't move it if we've decided it can't move
					if (totalDropDeltaI !== dropDeltaI) {
						gameWindow.squaresOnGameWindow[i + totalDropDeltaI - dropDeltaI] = gameWindow.squaresOnGameWindow[i];
						gameWindow.squaresOnGameWindow[i] = -1;
					}
				}
			}
		}
	}

	function _handleCollapseBomb(cellPos, fallDirection) {
		var minXIValue = cellPos.x - BombWindow.prototype.COLLAPSE_BOMB_RADIUS;
		var minYIValue = (cellPos.y - BombWindow.prototype.COLLAPSE_BOMB_RADIUS) * gameWindow.gameWindowCellSize;
		var maxXIValue = cellPos.x + BombWindow.prototype.COLLAPSE_BOMB_RADIUS;
		var maxYIValue = (cellPos.y + BombWindow.prototype.COLLAPSE_BOMB_RADIUS) * gameWindow.gameWindowCellSize;

		var xIValue;
		var yIValue;

		for (yIValue = minYIValue; yIValue <= maxYIValue; yIValue += gameWindow.gameWindowCellSize) {
			for (xIValue = minXIValue; xIValue <= maxXIValue; ++xIValue) {
				gameWindow.squaresOnGameWindow[yIValue + xIValue] = -1;
			}
		}

		// TODO: should I add settling here? probably not...
		//		- OR, should I instead DROP all blocks above the blast?
	}

	function _handleSettleBomb() {
		// TODO: should I continue to force inward settling?
		_settleHigherLayers(0, true, true);
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
				gameWindow.gameWindowCellSize * gameWindow.gameWindowCellSize, 
				-1);
		gameWindow.animatingSquares = utils.initializeArray(
				gameWindow.gameWindowCellSize * gameWindow.gameWindowCellSize, 
				_NO_ANIMATION);

		_layersToCollapse = [];

		_currentBackgroundColorIndex = 0;
	}

	function _setLayerCollapseDelay(layerCollapseDelay) {
		gameWindow.layerCollapseDelay = layerCollapseDelay;
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
		animatingSquares: null, // the squares that are currently collapsing

		layerCollapseDelay: 0.2,
		ellapsedCollapseTime: 0.2,

		squarePixelSize: 0, // in pixels

		gameWindowCellSize: 100, // in number of squares
		gameWindowPixelSize: 0, // in pixels
		gameWindowPosition: { x: 0, y: 0 }, // in pixels

		centerSquareCellSize: 6, // in number of squares
		centerSquareCellPositionX: 47 // in number of squares
	};

	log.i("<--gameWindow.LOADING_MODULE");
}());
