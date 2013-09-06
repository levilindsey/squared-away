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
//		- Top:		blue
//		- Right:	yellow
//		- Bottom:	green
//		- Left:		red
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.Block
//		- utils
// ------------------------------------------------------------------------- //


(function() {
	"use strict";

	log.d("-->previewwindow.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _NORMAL_STROKE_WIDTH = 1; // in pixels
	var _PROGRESS_STROKE_WIDTH = 4; // in pixels

	var _NORMAL_STROKE_COLOR = "#5a5a5a";
	var _NORMAL_FILL_COLOR = "#141414";

	var _COOL_DOWN_SIZE_INCREASE = 0.4; // ratio

	function PreviewWindow(x, y, size, previewWindowIndex) {
		log.d("-->previewwindow.PreviewWindow");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _position = { x: x, y: y }; // in pixels
		var _size = size; // in pixels
		var _previewWindowIndex = previewWindowIndex;
		var _positionOfWindowCenter = {
			x: _position.x + (_size / 2),
			y: _position.y + (_size / 2)
		}; // in pixels

		var _baseCoolDownPeriod = 100000; // 10 sec
		var _actualCoolDownPeriod = 100000; // 10 sec
		var _timeSinceLastBlock = 0;
		var _currentBlock = null;

		var _progressStrokeColor;
		var _progressFillColor;
		switch (_previewWindowIndex) {
		case 0:	// blue
			_progressStrokeColor = "#84ceff";
			_progressFillColor = "#21333f";
			break;
		case 1:	// yellow
			_progressStrokeColor = "#ffff9c";
			_progressFillColor = "#3f3f27";
			break;
		case 2:	// green
			_progressStrokeColor = "#b2ffaa";
			_progressFillColor = "#2c3f2a";
			break;
		case 3:	// red
			_progressStrokeColor = "#ffaeae";
			_progressFillColor = "#3f2b2b";
			break;
		default:
			return;
		}

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

			// Draw the background and the border
			context.beginPath();
			context.lineWidth = _NORMAL_STROKE_WIDTH;
			context.fillStyle = _NORMAL_FILL_COLOR;
			context.strokeStyle = _NORMAL_STROKE_COLOR;
			context.rect(currentPosition.x, currentPosition.y, sideLength, sideLength);
			context.fill();
			context.stroke();

			// Show the cool-down progress with a background polygon and with 
			// a thick line around the perimeter
			_drawCoolDownFill(context, currentProgress, currentPosition, sideLength);
			_drawCoolDownStroke(context, currentProgress, currentPosition, sideLength, progressLineWidth);

			// Draw the block in the center of the window
			_currentBlock.draw(context);
		}

		function _drawCoolDownFill(context, currentProgress, currentPosition, sideLength) {
			context.beginPath();

			context.fillStyle = _progressFillColor;

			context.moveTo(_positionOfWindowCenter.x, _positionOfWindowCenter.y);
			context.lineTo(_positionOfWindowCenter.x, currentPosition.y);
			_makeCoolDownPathAroundPerimeter(context, currentProgress, currentPosition, sideLength);
			context.closePath();

			context.fill();
		}

		function _drawCoolDownStroke(context, currentProgress, currentPosition, sideLength, progressLineWidth) {
			context.beginPath();

			context.strokeStyle = _progressStrokeColor;
			context.lineWidth = progressLineWidth;

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
		function _startNewBlock(coolDownPeriod) {
			// Change the current block to be a new block of some random type
			var lowerIndex;
			var upperIndex;
			switch (game.numberOfSquaresInABlock) {
			case 8: // 1 - 5
				lowerIndex = Block.prototype.ONE_1;
				upperIndex = Block.prototype.FIVE_18;
				break;
			case 7: // 4 - 5
				lowerIndex = Block.prototype.FOUR_1;
				upperIndex = Block.prototype.FIVE_18;
				break;
			case 6: // 1 - 4
				lowerIndex = Block.prototype.ONE_1;
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
			case 1:
				lowerIndex = Block.prototype.ONE_1;
				upperIndex = Block.prototype.ONE_1;
				break;
			default:
				return;
			}
			var blockType = Math.floor(Math.random() * ((upperIndex - lowerIndex) + 1)) + lowerIndex;

			var orientation = _previewWindowIndex;
			var fallDirection = _previewWindowIndex;

			var cellOffsetFromTopLeftOfBlockToCenter = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(blockType, orientation);

			var x = _positionOfWindowCenter.x - (cellOffsetFromTopLeftOfBlockToCenter.x * Block.prototype.getSquareSize());
			var y = _positionOfWindowCenter.y - (cellOffsetFromTopLeftOfBlockToCenter.y * Block.prototype.getSquareSize());

			_currentBlock = new Block(blockType, x, y, orientation, fallDirection);

			if (coolDownPeriod) {
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

			switch (_previewWindowIndex) {
			case 0:
				startingX = (gameWindow.gameWindowCellSize / 2) - 1;
				startingY = 0;
				break;
			case 1:
				startingX = gameWindow.gameWindowCellSize - (cellOffsetFromTopLeftOfBlockToCenter.x * 2);
				startingY = (gameWindow.gameWindowCellSize / 2) - 1;
				break;
			case 2:
				startingX = (gameWindow.gameWindowCellSize / 2) - 1;
				startingY = gameWindow.gameWindowCellSize - (cellOffsetFromTopLeftOfBlockToCenter.y * 2);
				break;
			case 3:
				startingX = 0;
				startingY = (gameWindow.gameWindowCellSize / 2) - 1;
				break;
			default:
				return;
			}

			_currentBlock.setCellPosition(startingX, startingY);

			return _currentBlock;
		}

		function _isCoolDownFinished() {
			return _timeSinceLastBlock >= _actualCoolDownPeriod;
		}

		function _getTimeSinceLastBlock() {
			return _timeSinceLastBlock;
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

		log.d("<--previewwindow.PreviewWindow");
	}

	// Make PreviewWindow available to the rest of the program
	window.PreviewWindow = PreviewWindow;

	log.i("<--previewwindow.LOADING_MODULE");
}());
