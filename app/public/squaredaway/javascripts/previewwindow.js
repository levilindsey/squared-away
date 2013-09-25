// ------------------------------------------------------------------------- //
// -- window.PreviewWindow
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the PreviewWindow logic is encapsulated in this anonymous function.  
// This is then stored in the window.PreviewWindow property.  This has the 
// effect of minimizing side-effects and problems when linking multiple script 
// files.
// 
// COLORS:
//    - Top:    blue
//    - Right:  yellow
//    - Bottom:  green
//    - Left:    red
// 
// Dependencies:
//    - window.log
//    - window.Sprite
//    - window.Block
//    - utils
// ------------------------------------------------------------------------- //


(function() {
  'use strict';

  log.d('-->previewwindow.LOADING_MODULE');

  // --------------------------------------------------------------------- //
  // -- Private, static members

  var _NORMAL_STROKE_WIDTH = 1; // in pixels
  var _PROGRESS_STROKE_WIDTH = 4; // in pixels

  var _COOL_DOWN_SIZE_INCREASE = 0.4; // ratio

  var _NATURAL_BOMB_FREQUENCY = 0.01;
  var _RATIO_OF_NATURAL_COLLAPSE_BOMBS = 0.5;

  function PreviewWindow(previewWindowIndex) {
    log.d('-->previewwindow.PreviewWindow');

    // ----------------------------------------------------------------- //
    // -- Private members

    var _position = { x: 0, y: 0 }; // in pixels
    var _size = 0; // in pixels
    var _previewWindowIndex = previewWindowIndex;
    var _positionOfWindowCenter = { x: 0, y: 0 }; // in pixels

    var _baseCoolDownPeriod = 100000; // 10 sec
    var _actualCoolDownPeriod = 100000; // 10 sec
    var _timeSinceLastBlock = 0;
    var _currentBlock = null;

    function _update(deltaTime) {
      _timeSinceLastBlock += deltaTime;
    }

    // The window, its current cool-down progress, and the next block.  
    // The size of the window increases as the cool down progresses.
    function _draw(context) {
      var currentProgress = _timeSinceLastBlock / _actualCoolDownPeriod; // from 0 to 1
      var currentSizeRatio = 1 + currentProgress * _COOL_DOWN_SIZE_INCREASE;
      var sideLength = _size * currentSizeRatio;
      var progressLineWidth = _PROGRESS_STROKE_WIDTH * currentSizeRatio;
      var currentSizePositionOffset = ((sideLength - _size) / 2);
      var currentPosition = {
        x: _position.x - currentSizePositionOffset,
        y: _position.y - currentSizePositionOffset
      };

      var areAllWindowsPrimed = game.primedWindowIndex > 0 && !game.keyboardControlOn;
      var isThisWindowPrimed = game.primedWindowIndex === _previewWindowIndex;

      // Draw the background and the border
      context.beginPath();
      context.lineWidth = _NORMAL_STROKE_WIDTH;
      context.fillStyle = areAllWindowsPrimed || isThisWindowPrimed ? game.MEDIUM_COLORS[2].str : game.DEFAULT_FILL.str;
      context.strokeStyle = game.DEFAULT_STROKE.str;
      context.rect(currentPosition.x, currentPosition.y, sideLength, sideLength);
      context.fill();
      context.stroke();

      // TODO: refactor this messy boolean logic

      // Check whether this preview window is currently primed with a bomb
      if (areAllWindowsPrimed || isThisWindowPrimed) {
        // Just show the stroke for the cool-down progress
        _drawCoolDownStroke(context, currentProgress, currentPosition, sideLength, progressLineWidth);
      } else {
        // Show the cool-down progress with a background polygon and with 
        // a thick line around the perimeter
        _drawCoolDownFill(context, currentProgress, currentPosition, sideLength);
        _drawCoolDownStroke(context, currentProgress, currentPosition, sideLength, progressLineWidth);
      }

      if (isThisWindowPrimed) {
        // Draw the bomb block in the center of the window
        var x = _positionOfWindowCenter.x - 0.5 * gameWindow.squarePixelSize;
        var y = _positionOfWindowCenter.y - 0.5 * gameWindow.squarePixelSize;
        Block.prototype.drawSquare(context, 7 + game.primedBombType, x, y, 0);
      } else {
        // Draw the block in the center of the window
        _currentBlock.draw(context);
      }
    }

    function _drawCoolDownFill(context, currentProgress, currentPosition, sideLength) {
      context.beginPath();

      context.fillStyle = game.PREVIEW_WINDOW_PROGRESS_FILLS[_previewWindowIndex].str;

      context.moveTo(_positionOfWindowCenter.x, _positionOfWindowCenter.y);
      context.lineTo(_positionOfWindowCenter.x, currentPosition.y);
      _makeCoolDownPathAroundPerimeter(context, currentProgress, currentPosition, sideLength);
      context.closePath();

      context.fill();
    }

    function _drawCoolDownStroke(context, currentProgress, currentPosition, sideLength, progressLineWidth) {
      context.beginPath();

      context.strokeStyle = game.PREVIEW_WINDOW_PROGRESS_STROKES[_previewWindowIndex].str;
      context.lineWidth = _PROGRESS_STROKE_WIDTH;

      context.moveTo(_positionOfWindowCenter.x, currentPosition.y);
      _makeCoolDownPathAroundPerimeter(context, currentProgress, currentPosition, sideLength);

      context.stroke();
    }

    function _makeCoolDownPathAroundPerimeter(context, currentProgress, currentPosition, sideLength) {
      if (currentProgress > 1/8) { // The cool down has at least reached the top-right corner
        // Draw the section from the top-middle to the top-right
        context.lineTo(currentPosition.x + sideLength, currentPosition.y);

        if (currentProgress > 3/8) { // The cool down has at least reached the bottom-right corner
          // Draw the section from the top-right to the bottom-right
          context.lineTo(currentPosition.x + sideLength, currentPosition.y + sideLength);

          if (currentProgress > 5/8) { // The cool down has at least reached the bottom-left corner
            // Draw the section from the bottom-right to the bottom-left
            context.lineTo(currentPosition.x, currentPosition.y + sideLength);

            if (currentProgress > 7/8) { // The cool down has at least reached the top-left corner
              // Draw the section from the bottom-left to the top-left
              context.lineTo(currentPosition.x, currentPosition.y);

              // Draw the section from the top-left to somewhere along the final top portion
              context.lineTo(currentPosition.x + ((currentProgress - (7 / 8)) * 4 * sideLength), currentPosition.y);
            } else { // The cool down has not yet reached the top-left corner
              // Draw the section from the bottom-left to somewhere in the left portion
              context.lineTo(currentPosition.x, currentPosition.y + (((7 / 8) - currentProgress) * 4 * sideLength));
            }
          } else { // The cool down has not yet reached the bottom-left corner
            // Draw the section from the bottom-right to somewhere in the bottom portion
            context.lineTo(currentPosition.x + (((5 / 8) - currentProgress) * 4 * sideLength), currentPosition.y + sideLength);
          }
        } else { // The cool down has not yet reached the bottom-right corner
          // Draw the section from the top-right to somewhere in the right portion
          context.lineTo(currentPosition.x + sideLength, currentPosition.y + ((currentProgress - (1 / 8)) * 4 * sideLength));
        }
      } else { // The cool down has not yet reached the top-right corner
        // Draw the section from the top-middle to somewhere in the first top portion
        context.lineTo(_positionOfWindowCenter.x + (currentProgress * 4 * sideLength), currentPosition.y);
      }
    }

    // Start this preview window with a random new block and a fresh cool 
    // down.
    function _startNewBlock(coolDownPeriod, bombType) {
      var blockType;

      if (bombType < 0) {
        if (game.bombsOn && Math.random() < _NATURAL_BOMB_FREQUENCY) {
          blockType = Block.prototype.ONE_1;
          if (Math.random() < _RATIO_OF_NATURAL_COLLAPSE_BOMBS) {
            bombType = BombWindow.prototype.COLLAPSE_BOMB;
          } else {
            bombType = BombWindow.prototype.SETTLE_BOMB;
          }

          sound.playSfx('bombPrimed');
        } else {
          // Change the current block to be a new block of some random type
          var lowerIndex;
          var upperIndex;
          switch (game.numberOfSquaresInABlock) {
          case 8: // 2 - 5
            lowerIndex = Block.prototype.TWO_1;
            upperIndex = Block.prototype.FIVE_18;
            break;
          case 7: // 4 - 5
            lowerIndex = Block.prototype.FOUR_1;
            upperIndex = Block.prototype.FIVE_18;
            break;
          case 6: // 2 - 4
            lowerIndex = Block.prototype.TWO_1;
            upperIndex = Block.prototype.FOUR_7;
            break;
          case 5:
            lowerIndex = Block.prototype.FIVE_1;
            upperIndex = Block.prototype.FIVE_18;
            break;
          case 4:
            lowerIndex = Block.prototype.FOUR_1;
            upperIndex = Block.prototype.FOUR_7;
            break;
          case 3:
            lowerIndex = Block.prototype.THREE_1;
            upperIndex = Block.prototype.THREE_2;
            break;
          case 2:
            lowerIndex = Block.prototype.TWO_1;
            upperIndex = Block.prototype.TWO_1;
            break;
          default:
            return;
          }
          blockType = Math.floor(Math.random() * ((upperIndex - lowerIndex) + 1)) + lowerIndex;
          bombType = -1;
        }
      } else {
        blockType = Block.prototype.ONE_1;
      }

      var orientation;
      var fallDirection;
      if (game.blocksFallOutwardOn) {
        orientation = (_previewWindowIndex + 2) % 4;
      } else {
        orientation = _previewWindowIndex;
      }
      fallDirection = orientation;

      _currentBlock = new Block(blockType, orientation, fallDirection, bombType);

      _updateBlockPosition();

      if (coolDownPeriod >= 0) {
        _actualCoolDownPeriod = coolDownPeriod;
      } else {
        // Compute a new (random) cool-down period to use, which is based off of _baseCoolDownPeriod
        _actualCoolDownPeriod = _baseCoolDownPeriod; // TODO: actually implement the random deviation here
      }

      _timeSinceLastBlock = 0;
    }

    // Set the base cool-down period to be the given time (in millis).
    function _setCoolDownPeriod(period) {
      _baseCoolDownPeriod = period;
    }

    // Return the block that has been shown in this preview window.  This block will be re-positioned to be in
    function _getCurrentBlock() {
      var startingX;
      var startingY;

      var type = _currentBlock.getType();
      var orientation = _previewWindowIndex;

      var cellOffsetFromTopLeftOfBlockToCenter = 
          Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(
              type, orientation);

      if (game.blocksFallOutwardOn) {
        switch (_previewWindowIndex) {
        case 0:
          startingX = (gameWindow.gameWindowCellSize / 2) - Math.ceil(cellOffsetFromTopLeftOfBlockToCenter.x);
          startingY = gameWindow.centerSquareCellPositionX - (cellOffsetFromTopLeftOfBlockToCenter.y * 2);
          break;
        case 1:
          startingX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;
          startingY = (gameWindow.gameWindowCellSize / 2) - Math.ceil(cellOffsetFromTopLeftOfBlockToCenter.y);
          break;
        case 2:
          startingX = (gameWindow.gameWindowCellSize / 2) - Math.floor(cellOffsetFromTopLeftOfBlockToCenter.x);
          startingY = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;
          break;
        case 3:
          startingX = gameWindow.centerSquareCellPositionX - (cellOffsetFromTopLeftOfBlockToCenter.x * 2);
          startingY = (gameWindow.gameWindowCellSize / 2) - Math.floor(cellOffsetFromTopLeftOfBlockToCenter.y);
          break;
        default:
          return;
        }
      } else {
        switch (_previewWindowIndex) {
        case 0:
          startingX = (gameWindow.gameWindowCellSize / 2) - Math.ceil(cellOffsetFromTopLeftOfBlockToCenter.x);
          startingY = 0;
          break;
        case 1:
          startingX = gameWindow.gameWindowCellSize - (cellOffsetFromTopLeftOfBlockToCenter.x * 2);
          startingY = (gameWindow.gameWindowCellSize / 2) - Math.ceil(cellOffsetFromTopLeftOfBlockToCenter.y);
          break;
        case 2:
          startingX = (gameWindow.gameWindowCellSize / 2) - Math.floor(cellOffsetFromTopLeftOfBlockToCenter.x);
          startingY = gameWindow.gameWindowCellSize - (cellOffsetFromTopLeftOfBlockToCenter.y * 2);
          break;
        case 3:
          startingX = 0;
          startingY = (gameWindow.gameWindowCellSize / 2) - Math.floor(cellOffsetFromTopLeftOfBlockToCenter.y);
          break;
        default:
          return;
        }
      }

      _currentBlock.setCellPosition(startingX, startingY);

      return _currentBlock;
    }

    function _releaseBomb() {
      _startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, game.primedBombType);
    }

    function _isCoolDownFinished() {
      return _timeSinceLastBlock >= _actualCoolDownPeriod;
    }

    function _getTimeSinceLastBlock() {
      return _timeSinceLastBlock;
    }

    function _getPosition() {
      return _position;
    }

    function _getCenterPosition() {
      return _positionOfWindowCenter;
    }

    function _isPointOverWindow(point) {
      return point.x >= _position.x && 
        point.x <= _position.x + _size && 
        point.y >= _position.y && 
        point.y <= _position.y + _size;
    }

    function _updateDimensions(x, y, size) {
      _position.x = x;
      _position.y = y;
      _size = size;
      _positionOfWindowCenter.x = _position.x + (_size / 2);
      _positionOfWindowCenter.y = _position.y + (_size / 2);

      _updateBlockPosition();
    }

    function _updateBlockPosition() {
      if (_currentBlock) {
        var type = _currentBlock.getType();
        var orientation = _previewWindowIndex;

        var cellOffsetFromTopLeftOfBlockToCenter = 
            Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(
                type, orientation);

        var x = _positionOfWindowCenter.x - (cellOffsetFromTopLeftOfBlockToCenter.x * gameWindow.squarePixelSize);
        var y = _positionOfWindowCenter.y - (cellOffsetFromTopLeftOfBlockToCenter.y * gameWindow.squarePixelSize);

        _currentBlock.setPixelPosition(x, y);
      }
    }

    // ----------------------------------------------------------------- //
    // -- Privileged members

    this.startNewBlock = _startNewBlock;
    this.setCoolDownPeriod = _setCoolDownPeriod;
    this.getCurrentBlock = _getCurrentBlock;
    this.isCoolDownFinished = _isCoolDownFinished;
    this.update = _update;
    this.draw = _draw;
    this.getTimeSinceLastBlock = _getTimeSinceLastBlock;
    this.getPosition = _getPosition;
    this.getCenterPosition = _getCenterPosition;
    this.isPointOverWindow = _isPointOverWindow;
    this.releaseBomb = _releaseBomb;
    this.updateDimensions = _updateDimensions;

    log.d('<--previewwindow.PreviewWindow');
  }

  // Make PreviewWindow available to the rest of the program
  window.PreviewWindow = PreviewWindow;

  PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD = 800; // millis

  log.i('<--previewwindow.LOADING_MODULE');
}());
