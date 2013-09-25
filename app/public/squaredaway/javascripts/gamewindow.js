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
//    - window.log
//    - window.Sprite
//    - window.Block
//    - window.game
//    - window.input
//    - utils
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->gameWindow.LOADING_MODULE');

  // ----------------------------------------------------------------- //
  // -- Private members

  var _GAME_AREA_BORDER_STROKE_WIDTH = 2; // pixels
  var _COMPLETION_LINE_STROKE_WIDTH = 2; // pixels

  var _PHANTOM_GUIDE_LINE_STROKE_WIDTH = 1;
  var _PHANTOM_BLOCK_STROKE_WIDTH = 2;

  var _UP_RIGHT_COLLAPSE_ANIMATION = 1;
  var _SIDEWAYS_COLLAPSE_ANIMATION = 2;
  var _NO_ANIMATION = 0;

  var _START_SHIMMER_ANIMATION_TICK_PERIOD = 50;
  var _PROB_OF_SHIMMER = 0.0013;
  var _SHIMMER_ANIMATION_PERIOD = 250; // millis

  var _centerSquare = null;

  var _layersToCollapse = [];

  var _currentBackgroundColorIndex = 0;

  var _gameWindowTime = 0;
  var _timeSinceLastStartShimmerTick = 0;

  var _centerSquarePixelX;
  var _centerSquarePixelSize;

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
      layersWereCollapsed = _forceCollapseAnyPendingLayers();
    }

    if (layersWereCollapsed) {
      // Collapsing layers has the potential to complete additional 
      // layers, so we should check for that now
      layersWereCollapsed = _checkForCompleteLayers();
    }

    // Update the blocks
    for (i = 0; i < gameWindow.blocksOnGameWindow.length; ++i) {
      block = gameWindow.blocksOnGameWindow[i];

      block.update(deltaTime, gameWindow.squaresOnGameWindow, gameWindow.blocksOnGameWindow);

      var addSquares = false;

      // If the block has reached the edge of the game area and is 
      // trying to fall out, then the game is over and the player 
      // has lost
      if (block.getHasCollidedWithOutOfBounds()) {
        game.endGame(block.getPixelCenter(), false);
        addSquares = true;
      }
      // Check whether the block has reached a stationary square and 
      // can no longer fall
      else if (block.getHasLanded()) {
        addSquares = true;
      }
      // Check whether the canFallPastCenterOn mode is off and the block 
      // has reached the back line of the center square
      else if (!game.blocksFallOutwardOn && 
           !game.canFallPastCenterOn && 
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
            sound.playSfx('collapseBombDetonate');
          } else {
            _handleSettleBomb();
            game.incrementSettleBombUsedCount()
            _centerSquare.animateSettleBomb();
            sound.playSfx('settleBombDetonate');
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
            sound.playSfx('collapse');
            sound.playSfx('land');
          } else {
            sound.playSfx('land');
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
    // ---- Draw the main play area ---- //

    context.save();
    context.translate(gameWindow.gameWindowPosition.x, gameWindow.gameWindowPosition.y);

    // Draw the background and the border
    context.beginPath();
    context.lineWidth = _GAME_AREA_BORDER_STROKE_WIDTH;
    if (_currentBackgroundColorIndex >= 0) {
      context.fillStyle = game.DARK_COLORS[_currentBackgroundColorIndex].str;
      context.strokeStyle = game.MEDIUM_COLORS[_currentBackgroundColorIndex].str;
    } else {
      context.fillStyle = game.DEFAULT_FILL.str;
      context.strokeStyle = game.DEFAULT_STROKE.str;
    }
    context.rect(0, 0, gameWindow.gameWindowPixelSize, gameWindow.gameWindowPixelSize);
    context.fill();
    context.stroke();

    _drawCompletionLines(context);

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

    // ---- Draw the center square ---- //

    _centerSquare.draw(context);

    context.restore();
  }

  // Draw lines marking where layers of squares must extend before being 
  // recognized as complete and then being collapsed.
  function _drawCompletionLines(context) {
    context.lineWidth = _COMPLETION_LINE_STROKE_WIDTH;
    if (_currentBackgroundColorIndex >= 0) {
      context.strokeStyle = game.LESS_DARK_COLORS[_currentBackgroundColorIndex].str;
    } else {
      context.strokeStyle = game.DARK_COLORS[6].str;
    }

    var centerSquareBackCoord = _centerSquarePixelX + _centerSquarePixelSize;

    if (game.completingSquaresOn || game.blocksFallOutwardOn) { // Draw four diagonal lines
      // Top-left line
      context.moveTo(_centerSquarePixelX, _centerSquarePixelX);
      context.lineTo(0, 0);
      context.stroke();

      // Top-right line
      context.moveTo(centerSquareBackCoord, _centerSquarePixelX);
      context.lineTo(gameWindow.gameWindowPixelSize, 0);
      context.stroke();

      // Bottom-right line
      context.moveTo(centerSquareBackCoord, centerSquareBackCoord);
      context.lineTo(gameWindow.gameWindowPixelSize, gameWindow.gameWindowPixelSize);
      context.stroke();

      // Bottom-left line
      context.moveTo(_centerSquarePixelX, centerSquareBackCoord);
      context.lineTo(0, gameWindow.gameWindowPixelSize);
      context.stroke();
    } else { // draw eight horizontal and vertical lines extending from the corners of the center square
      // Top side left line
      context.moveTo(_centerSquarePixelX, _centerSquarePixelX);
      context.lineTo(_centerSquarePixelX, 0);
      context.stroke();

      // Top side right line
      context.moveTo(centerSquareBackCoord, _centerSquarePixelX);
      context.lineTo(centerSquareBackCoord, 0);
      context.stroke();

      // Right side top line
      context.moveTo(centerSquareBackCoord, _centerSquarePixelX);
      context.lineTo(gameWindow.gameWindowPixelSize, _centerSquarePixelX);
      context.stroke();

      // Right side bottom line
      context.moveTo(centerSquareBackCoord, centerSquareBackCoord);
      context.lineTo(gameWindow.gameWindowPixelSize, centerSquareBackCoord);
      context.stroke();

      // Bottom side right line
      context.moveTo(centerSquareBackCoord, centerSquareBackCoord);
      context.lineTo(centerSquareBackCoord, gameWindow.gameWindowPixelSize);
      context.stroke();

      // Bottom side left line
      context.moveTo(_centerSquarePixelX, centerSquareBackCoord);
      context.lineTo(_centerSquarePixelX, gameWindow.gameWindowPixelSize);
      context.stroke();

      // Left side bottom line
      context.moveTo(_centerSquarePixelX, centerSquareBackCoord);
      context.lineTo(0, centerSquareBackCoord);
      context.stroke();

      // Left side top line
      context.moveTo(_centerSquarePixelX, _centerSquarePixelX);
      context.lineTo(0, _centerSquarePixelX);
      context.stroke();
    }
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
    var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - 1;
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
    var startEndAndDeltaI;

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

        if (game.blocksFallOutwardOn) {
          // If we are falling outward, then reverse the layer numbering
          for (i = 0; i < layersToCheck.length; ++i) {
            layersToCheck[i] = gameWindow.centerSquareCellPositionX + 1 - layersToCheck[i];
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
      for (j = 0; j < layersToCheck.length; ++j) {
        layer = layersToCheck[j];
        collapsingIndices = [];

        startEndAndDeltaI = _checkForCompleteSquareLayerOnOneSide(
            layer, collapsingIndices, 
            minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
            Block.prototype.TOP_SIDE);
        if (!startEndAndDeltaI) {
          continue;
        }

        startEndAndDeltaI = _checkForCompleteSquareLayerOnOneSide(
            layer, collapsingIndices, 
            minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
            Block.prototype.RIGHT_SIDE);
        if (!startEndAndDeltaI) {
          continue;
        }

        startEndAndDeltaI = _checkForCompleteSquareLayerOnOneSide(
            layer, collapsingIndices, 
            minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
            Block.prototype.BOTTOM_SIDE);
        if (!startEndAndDeltaI) {
          continue;
        }

        startEndAndDeltaI = _checkForCompleteSquareLayerOnOneSide(
            layer, collapsingIndices, 
            minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
            Block.prototype.LEFT_SIDE);
        if (!startEndAndDeltaI) {
          continue;
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

        if (game.blocksFallOutwardOn) {
          // If we are falling outward, then reverse the layer numbering
          for (i = 0; i < layersToCheck.length; ++i) {
            layersToCheck[i].layer = gameWindow.centerSquareCellPositionX + 1 - layersToCheck[i].layer;
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
          if (game.blocksFallOutwardOn) {
            startY = layer - 1;
            startX = layer;
            endX = gameWindow.gameWindowCellSize - layer - 1;
          } else {
            startY = minCenterSquareCellPositionX - layer;
            startX = minCenterSquareCellPositionX;
            endX = maxCenterSquareCellPositionX;
          }
          minStartI = startY * gameWindow.gameWindowCellSize;
          deltaI = 1;
          startI = (startY * gameWindow.gameWindowCellSize) + startX;
          endI = (startY * gameWindow.gameWindowCellSize) + endX;
          maxEndI = ((startY + 1) * gameWindow.gameWindowCellSize) - 1;
          break;
        case Block.prototype.RIGHT_SIDE:
          if (game.blocksFallOutwardOn) {
            startX = gameWindow.gameWindowCellSize - layer;
            startY = layer;
            endY = gameWindow.gameWindowCellSize - layer - 1;
          } else {
            startX = maxCenterSquareCellPositionX + layer;
            startY = minCenterSquareCellPositionX;
            endY = maxCenterSquareCellPositionX;
          }
          minStartI = startX;
          deltaI = gameWindow.gameWindowCellSize;
          startI = (startY * gameWindow.gameWindowCellSize) + startX;
          endI = (endY * gameWindow.gameWindowCellSize) + startX;
          maxEndI = ((gameWindow.gameWindowCellSize - 1) * gameWindow.gameWindowCellSize) + startX;
          break;
        case Block.prototype.BOTTOM_SIDE:
          if (game.blocksFallOutwardOn) {
            startY = gameWindow.gameWindowCellSize - layer;
            startX = layer;
            endX = gameWindow.gameWindowCellSize - layer - 1;
          } else {
            startY = maxCenterSquareCellPositionX + layer;
            startX = minCenterSquareCellPositionX;
            endX = maxCenterSquareCellPositionX;
          }
          minStartI = startY * gameWindow.gameWindowCellSize;
          deltaI = 1;
          startI = (startY * gameWindow.gameWindowCellSize) + startX;
          endI = (startY * gameWindow.gameWindowCellSize) + endX;
          maxEndI = ((startY + 1) * gameWindow.gameWindowCellSize) - 1;
          break;
        case Block.prototype.LEFT_SIDE:
          if (game.blocksFallOutwardOn) {
            startX = layer - 1;
            startY = layer;
            endY = gameWindow.gameWindowCellSize - layer - 1;
          } else {
            startX = minCenterSquareCellPositionX - layer;
            startY = minCenterSquareCellPositionX;
            endY = maxCenterSquareCellPositionX;
          }
          minStartI = startX;
          deltaI = gameWindow.gameWindowCellSize;
          startI = (startY * gameWindow.gameWindowCellSize) + startX;
          endI = (endY * gameWindow.gameWindowCellSize) + startX;
          maxEndI = ((gameWindow.gameWindowCellSize - 1) * gameWindow.gameWindowCellSize) + startX;
          break;
        default:
          return;
        }

        // Determine whether this layer is complete in the 
        // required middle section
        for (i = startI; i <= endI; i += deltaI) {
          if (gameWindow.squaresOnGameWindow[i] < 0) {
            continue mode2Offlayerloop;
          }
        }

        // Find the first empty cell before the start of the 
        // middle section
        i = startI;
        while (i >= minStartI && 
            gameWindow.squaresOnGameWindow[i] >= 0) {
          startCell = i;
          i -= deltaI;
        }

        // Find the first empty cell after the end of the middle 
        // section
        i = endI;
        while (i <= maxEndI && 
            gameWindow.squaresOnGameWindow[i] >= 0) {
          endCell = i;
          i += deltaI;
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

  function _checkForCompleteSquareLayerOnOneSide(layer, collapsingIndices, 
      minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
      side) {
    var startX;
    var startY;
    var endX;
    var endY;
    var startI;
    var endI;
    var deltaI;
    var i;

    switch (side) {
    case Block.prototype.TOP_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = layer - 1;
        endX = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = minCenterSquareCellPositionX - layer;
        endX = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = 1;
      endI = (startY * gameWindow.gameWindowCellSize) + endX;
      break;
    case Block.prototype.RIGHT_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = gameWindow.gameWindowCellSize - layer;
        startY = layer - 1;
        endY = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = maxCenterSquareCellPositionX + layer;
        startY = minCenterSquareCellPositionX - layer;
        endY = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = gameWindow.gameWindowCellSize;
      endI = (endY * gameWindow.gameWindowCellSize) + startX;
      break;
    case Block.prototype.BOTTOM_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = gameWindow.gameWindowCellSize - layer;
        endX = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = maxCenterSquareCellPositionX + layer;
        endX = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = 1;
      endI = (startY * gameWindow.gameWindowCellSize) + endX;
      break;
    case Block.prototype.LEFT_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = layer - 1;
        endY = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = minCenterSquareCellPositionX - layer;
        endY = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = gameWindow.gameWindowCellSize;
      endI = (endY * gameWindow.gameWindowCellSize) + startX;
      break;
    default:
      return;
    }

    for (i = startI; i <= endI; i += deltaI) {
      if (gameWindow.squaresOnGameWindow[i] < 0) {
        return false;
      }
      if (collapsingIndices) {
        collapsingIndices.push(i);
      }
    }

    return {
      startI: startI,
      endI: endI,
      deltaI: deltaI
    };
  }

  function _collapseLayer(layer) { // TODO: should I get rid of this function and modify _dropHigherLayers to make up for it?
    var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
    var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - 1;

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

      _collapseCompleteSquareLayerOnOneSide(
          layer, minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, Block.prototype.TOP_SIDE);

      _collapseCompleteSquareLayerOnOneSide(
          layer, minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, Block.prototype.RIGHT_SIDE);

      _collapseCompleteSquareLayerOnOneSide(
          layer, minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, Block.prototype.BOTTOM_SIDE);

      _collapseCompleteSquareLayerOnOneSide(
          layer, minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, Block.prototype.LEFT_SIDE);

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

  function _collapseCompleteSquareLayerOnOneSide(layer, 
      minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
      side) {
    var startX;
    var startY;
    var endX;
    var endY;
    var startI;
    var endI;
    var deltaI;
    var i;

    switch (side) {
    case Block.prototype.TOP_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = layer - 1;
        endX = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = minCenterSquareCellPositionX - layer;
        endX = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = 1;
      endI = (startY * gameWindow.gameWindowCellSize) + endX;
      break;
    case Block.prototype.RIGHT_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = gameWindow.gameWindowCellSize - layer;
        startY = layer - 1;
        endY = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = maxCenterSquareCellPositionX + layer;
        startY = minCenterSquareCellPositionX - layer;
        endY = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = gameWindow.gameWindowCellSize;
      endI = (endY * gameWindow.gameWindowCellSize) + startX;
      break;
    case Block.prototype.BOTTOM_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = gameWindow.gameWindowCellSize - layer;
        endX = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = maxCenterSquareCellPositionX + layer;
        endX = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = 1;
      endI = (startY * gameWindow.gameWindowCellSize) + endX;
      break;
    case Block.prototype.LEFT_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = layer - 1;
        endY = gameWindow.gameWindowCellSize - layer;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = minCenterSquareCellPositionX - layer;
        endY = maxCenterSquareCellPositionX + layer;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      deltaI = gameWindow.gameWindowCellSize;
      endI = (endY * gameWindow.gameWindowCellSize) + startX;
      break;
    default:
      return;
    }

    for (i = startI; i <= endI; i += deltaI) {
      gameWindow.squaresOnGameWindow[i] = -1;
      gameWindow.animatingSquares[i] = _NO_ANIMATION;
    }
  }

  function _lowerHigherLevels(collapsedLayer, settleInsteadOfDrop, forceEntireSquare, forceInwardSettling) {
    var lowerLayersFn = settleInsteadOfDrop ? _settleLayers : _dropLayers;
    var settleInwardToTheEdge = false;

    var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
    var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - 1;
    var centerCellPositionX = gameWindow.gameWindowCellSize / 2;

    var settleInward = game.layersAlsoSettleInwardsOn || (forceInwardSettling && !game.blocksFallOutwardOn);

    var loopDeltaI;
    var dropDeltaI;
    var updateStartCellDeltaI;
    var updateEndCellDeltaI;
    var firstInwardSettleStop;
    var secondInwardSettleStop;
    var startX;
    var startY;

    if (game.completingSquaresOn || forceEntireSquare) { // Collapsing whole squares
      var startI;
      var endX;
      var endY;
      var endI;

      ++collapsedLayer;

      _lowerCompleteSquareHigherLayersOnOneSide(collapsedLayer, 
          minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, centerCellPositionX, 
          settleInward, lowerLayersFn, Block.prototype.TOP_SIDE, 
          true, false);

      _lowerCompleteSquareHigherLayersOnOneSide(collapsedLayer, 
          minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, centerCellPositionX, 
          settleInward, lowerLayersFn, Block.prototype.RIGHT_SIDE, 
          false, false);

      _lowerCompleteSquareHigherLayersOnOneSide(collapsedLayer, 
          minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, centerCellPositionX, 
          settleInward, lowerLayersFn, Block.prototype.BOTTOM_SIDE, 
          false, false);

      _lowerCompleteSquareHigherLayersOnOneSide(collapsedLayer, 
          minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, centerCellPositionX, 
          settleInward, lowerLayersFn, Block.prototype.LEFT_SIDE, 
          false, false);

      _lowerCompleteSquareHigherLayersOnOneSide(collapsedLayer, 
          minCenterSquareCellPositionX, 
          maxCenterSquareCellPositionX, centerCellPositionX, 
          settleInward, lowerLayersFn, Block.prototype.TOP_SIDE, 
          true, true);
    } else { // Collapsing only lines
      var side = collapsedLayer.side;
      var startCell = collapsedLayer.startCell;
      var endCell = collapsedLayer.endCell;

      // De-construct the x and y coords from the index if we need them
      if (game.layersAlsoSettleInwardsOn || forceInwardSettling) {
        startX = startCell % gameWindow.gameWindowCellSize;
        startY = Math.floor(startCell / gameWindow.gameWindowCellSize);
      }

      // NOTE: When falling inward, each layer is expanded by one on 
      //     each side for the purpose of lowering blocks.  However, 
      //     when falling outward, we simply fall all blocks above the 
      //     layer until we get to the front side of the center square.

      switch (side) {
      case Block.prototype.TOP_SIDE:
        if (game.blocksFallOutwardOn) {
          loopDeltaI = 1;
          dropDeltaI = -gameWindow.gameWindowCellSize;
          updateStartCellDeltaI = gameWindow.gameWindowCellSize;
          updateEndCellDeltaI = gameWindow.gameWindowCellSize;
        } else {
          loopDeltaI = 1;
          dropDeltaI = gameWindow.gameWindowCellSize;
          updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
          updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
        }
        if (settleInward) {
          firstInwardSettleStop = ((startY - 1) * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
          secondInwardSettleStop = ((startY - 1) * gameWindow.gameWindowCellSize) + centerCellPositionX;
        }
        break;
      case Block.prototype.RIGHT_SIDE:
        if (game.blocksFallOutwardOn) {
          loopDeltaI = gameWindow.gameWindowCellSize;
          dropDeltaI = 1;
          updateStartCellDeltaI = -1;
          updateEndCellDeltaI = -1;
        } else {
          loopDeltaI = gameWindow.gameWindowCellSize;
          dropDeltaI = -1;
          updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
          updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
        }
        if (settleInward) {
          firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + (startX + 1);
          secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + (startX + 1);
        }
        break;
      case Block.prototype.BOTTOM_SIDE:
        if (game.blocksFallOutwardOn) {
          loopDeltaI = 1;
          dropDeltaI = gameWindow.gameWindowCellSize;
          updateStartCellDeltaI = -gameWindow.gameWindowCellSize;
          updateEndCellDeltaI = -gameWindow.gameWindowCellSize;
        } else {
          loopDeltaI = 1;
          dropDeltaI = -gameWindow.gameWindowCellSize;
          updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
          updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
        }
        if (settleInward) {
          firstInwardSettleStop = ((startY + 1) * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
          secondInwardSettleStop = ((startY + 1) * gameWindow.gameWindowCellSize) + centerCellPositionX;
        }
        break;
      case Block.prototype.LEFT_SIDE:
        if (game.blocksFallOutwardOn) {
          loopDeltaI = gameWindow.gameWindowCellSize;
          dropDeltaI = -1;
          updateStartCellDeltaI = 1;
          updateEndCellDeltaI = 1;
        } else {
          loopDeltaI = gameWindow.gameWindowCellSize;
          dropDeltaI = 1;
          updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
          updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
        }
        if (settleInward) {
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

  function _lowerCompleteSquareHigherLayersOnOneSide(layer, 
      minCenterSquareCellPositionX, maxCenterSquareCellPositionX, 
      centerCellPositionX, settleInward, lowerLayersFn, side, 
      onlyLowerOneHalf, firstHalf) {
    var startX;
    var startY;
    var endX;
    var endY;
    var startI;
    var endI;
    var loopDeltaI;
    var dropDeltaI;
    var updateStartCellDeltaI;
    var updateEndCellDeltaI;
    var firstInwardSettleStop;
    var secondInwardSettleStop;

    switch (side) {
    case Block.prototype.TOP_SIDE:
      if (onlyLowerOneHalf) {
        if (firstHalf) {
          if (game.blocksFallOutwardOn) {
            startX = layer - 1;
            startY = layer - 1;
            endX = centerCellPositionX - 1;
            updateStartCellDeltaI = gameWindow.gameWindowCellSize + 1;
            updateEndCellDeltaI = gameWindow.gameWindowCellSize;
            dropDeltaI = -gameWindow.gameWindowCellSize;
          } else {
            startX = minCenterSquareCellPositionX - layer;
            startY = minCenterSquareCellPositionX - layer;
            endX = centerCellPositionX - 1;
            updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
            updateEndCellDeltaI = -gameWindow.gameWindowCellSize;
            dropDeltaI = gameWindow.gameWindowCellSize;
          }
        } else {
          if (game.blocksFallOutwardOn) {
            startX = centerCellPositionX;
            startY = layer - 1;
            endX = gameWindow.gameWindowCellSize - layer;
            updateStartCellDeltaI = gameWindow.gameWindowCellSize;
            updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
            dropDeltaI = -gameWindow.gameWindowCellSize;
          } else {
            startX = centerCellPositionX;
            startY = minCenterSquareCellPositionX - layer;
            endX = maxCenterSquareCellPositionX + layer;
            updateStartCellDeltaI = -gameWindow.gameWindowCellSize;
            updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
            dropDeltaI = gameWindow.gameWindowCellSize;
          }
        }
      } else {
        if (game.blocksFallOutwardOn) {
          startX = layer - 1;
          startY = layer - 1;
          endX = gameWindow.gameWindowCellSize - layer;
          updateStartCellDeltaI = gameWindow.gameWindowCellSize + 1;
          updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
          dropDeltaI = -gameWindow.gameWindowCellSize;
        } else {
          startX = minCenterSquareCellPositionX - layer;
          startY = minCenterSquareCellPositionX - layer;
          endX = maxCenterSquareCellPositionX + layer;
          updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
          updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
          dropDeltaI = gameWindow.gameWindowCellSize;
        }
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      loopDeltaI = 1;
      endI = (startY * gameWindow.gameWindowCellSize) + endX;
      if (settleInward) {
        firstInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
        secondInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX;
      }
      break;
    case Block.prototype.RIGHT_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = gameWindow.gameWindowCellSize - layer;
        startY = layer - 1;
        endY = gameWindow.gameWindowCellSize - layer;
        updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
        updateEndCellDeltaI = -gameWindow.gameWindowCellSize - 1;
        dropDeltaI = 1;
      } else {
        startX = maxCenterSquareCellPositionX + layer;
        startY = minCenterSquareCellPositionX - layer;
        endY = maxCenterSquareCellPositionX + layer;
        updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
        updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
        dropDeltaI = -1;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      loopDeltaI = gameWindow.gameWindowCellSize;
      endI = (endY * gameWindow.gameWindowCellSize) + startX;
      if (settleInward) {
        firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + startX;
        secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + startX;
      }
      break;
    case Block.prototype.BOTTOM_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = gameWindow.gameWindowCellSize - layer;
        endX = gameWindow.gameWindowCellSize - layer;
        updateStartCellDeltaI = -gameWindow.gameWindowCellSize + 1;
        updateEndCellDeltaI = -gameWindow.gameWindowCellSize - 1;
        dropDeltaI = gameWindow.gameWindowCellSize;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = maxCenterSquareCellPositionX + layer;
        endX = maxCenterSquareCellPositionX + layer;
        updateStartCellDeltaI = gameWindow.gameWindowCellSize - 1;
        updateEndCellDeltaI = gameWindow.gameWindowCellSize + 1;
        dropDeltaI = -gameWindow.gameWindowCellSize;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      loopDeltaI = 1;
      endI = (startY * gameWindow.gameWindowCellSize) + endX;
      if (settleInward) {
        firstInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX - 1;
        secondInwardSettleStop = (startY * gameWindow.gameWindowCellSize) + centerCellPositionX;
      }
      break;
    case Block.prototype.LEFT_SIDE:
      if (game.blocksFallOutwardOn) {
        startX = layer - 1;
        startY = layer - 1;
        endY = gameWindow.gameWindowCellSize - layer;
        updateStartCellDeltaI = gameWindow.gameWindowCellSize + 1;
        updateEndCellDeltaI = -gameWindow.gameWindowCellSize + 1;
        dropDeltaI = -1;
      } else {
        startX = minCenterSquareCellPositionX - layer;
        startY = minCenterSquareCellPositionX - layer;
        endY = maxCenterSquareCellPositionX + layer;
        updateStartCellDeltaI = -gameWindow.gameWindowCellSize - 1;
        updateEndCellDeltaI = gameWindow.gameWindowCellSize - 1;
        dropDeltaI = 1;
      }
      startI = (startY * gameWindow.gameWindowCellSize) + startX;
      loopDeltaI = gameWindow.gameWindowCellSize;
      endI = (endY * gameWindow.gameWindowCellSize) + startX;
      if (settleInward) {
        firstInwardSettleStop = ((centerCellPositionX - 1) * gameWindow.gameWindowCellSize) + startX;
        secondInwardSettleStop = (centerCellPositionX * gameWindow.gameWindowCellSize) + startX;
      }
      break;
    default:
      return;
    }

    lowerLayersFn(layer, minCenterSquareCellPositionX, startI, endI, 
        updateStartCellDeltaI, updateEndCellDeltaI, loopDeltaI, 
        dropDeltaI, firstInwardSettleStop, secondInwardSettleStop);
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
              gameWindow.animatingSquares[i] = _NO_ANIMATION;
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
              gameWindow.animatingSquares[i] = _NO_ANIMATION;
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
            gameWindow.animatingSquares[i] = _NO_ANIMATION;
          }
        }
      }
    }
  }

  function _handleCollapseBomb(cellPos, fallDirection) {
    var layersWereCollapsed = _forceCollapseAnyPendingLayers();

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
    //    - OR, should I instead DROP all blocks above the blast?

    // It's possible that a collapse at the beginning of this function led 
    // to the completion of a layer
    if (layersWereCollapsed) {
      _checkForCompleteLayers();
    }
  }

  function _handleSettleBomb() {
    _forceCollapseAnyPendingLayers();

    // TODO: should I continue to force inward settling?
    _settleHigherLayers(0, true, true);

    // Settling layers has the potential to complete additional layers, so 
    // we should check for that now
    _checkForCompleteLayers();
  }

  function _forceCollapseAnyPendingLayers() {
    var layersWereCollapsed = false;

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

    return layersWereCollapsed;
  }

  function _setUpCenterSquare() {
    _centerSquare = new CenterSquare();
  }

  function _setUpCenterSquareDimensions() {
    _centerSquarePixelSize = gameWindow.centerSquareCellSize * gameWindow.squarePixelSize;
    _centerSquarePixelX = (gameWindow.gameWindowPixelSize - _centerSquarePixelSize) / 2;

    _centerSquare.setDimensions(_centerSquarePixelX, _centerSquarePixelSize);
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

  function _updateDimensions() {
    gameWindow.setGameWindowCellSize(gameWindow.gameWindowCellSize);
    gameWindow.setCenterSquareCellSize(gameWindow.centerSquareCellSize);
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
    centerSquareCellPositionX: 47, // in number of squares

    updateDimensions: _updateDimensions
  };

  log.i('<--gameWindow.LOADING_MODULE');
}());
