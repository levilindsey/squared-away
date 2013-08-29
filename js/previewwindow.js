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
//		- window.utils
// ------------------------------------------------------------------------- //

if (DEBUG) {
	log.d("--> previewwindow.js: LOADING");
}

(function() {
	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _SOURCE_SQUARE_SIZE = 16; // in pixels

	var _NORMAL_STROKE_WIDTH = 1; // in pixels
	var _PROGRESS_STROKE_WIDTH = 4; // in pixels

	var _NORMAL_STROKE_COLOR = "#5a5a5a";
	var _NORMAL_FILL_COLOR = "#141414";

	var _COOL_DOWN_SIZE_INCREASE = 0.5; // ratio

	var _gameAreaSize = 100; // in cells

	function PreviewWindow(x, y, size, previewWindowIndex) {
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

		var _update = function(deltaTime) {
			_timeSinceLastBlock += deltaTime;
		};

		// The window, its current cool-down progress, and the next block.  
		// The size of the window increases as the cool down progresses.
		var _draw = function(context) {
			var currentProgress = _timeSinceLastBlock / _actualCoolDownPeriod; // from 0 to 1
			var currentSizeRatio = 1 + currentProgress * _COOL_DOWN_SIZE_INCREASE;
			var sideLength = _size * currentSizeRatio;
			var progressLineWidth = _PROGRESS_STROKE_WIDTH * currentSizeRatio;

			// Draw the background and the border
			context.beginPath();
			context.lineWidth = _NORMAL_STROKE_WIDTH;
			context.fillStyle = _NORMAL_FILL_COLOR;
			context.strokeStyle = _NORMAL_STROKE_COLOR;
			context.rect(_position.x, _position.y, _size, _size);
			context.fill();
			context.stroke();

			// Show the cool-down progress with a background polygon and with 
			// a thick line around the perimeter
			_drawCoolDownFill(context, currentProgress);
			_drawCoolDownStroke(context, currentProgress);

			// Draw the block in the center of the window
			_currentBlock.draw(context);
		};

		var _drawCoolDownFill = function(context, currentProgress) {
			context.beginPath();

			context.fillStyle(_progressFillColor);

			context.moveTo(_positionOfWindowCenter.x, _positionOfWindowCenter.y);
			context.lineTo(_positionOfWindowCenter.x, _position.y);
			_makeCoolDownPathAroundPerimeter(context, currentProgress);
			context.closePath();

			context.fill();
		};

		var _drawCoolDownStroke = function(context, currentProgress) {
			context.beginPath();

			context.strokeStyle(_progressStrokeColor);
			context.lineWidth(_PROGRESS_STROKE_WIDTH);

			context.moveTo(_positionOfWindowCenter.x, _position.y);
			_makeCoolDownPathAroundPerimeter(context, currentProgress);

			context.stroke();
		};

		var _makeCoolDownPathAroundPerimeter = function(context, currentProgress) {
			if (currentProgress > 1/8) { // The cool down has at least reached the top-right corner
				// Draw the section from the top-middle to the top-right
				context.lineTo(_position.x + _size, _position.y);

				if (currentProgress > 3/8) { // The cool down has at least reached the bottom-right corner
					// Draw the section from the top-right to the bottom-right
					context.lineTo(_position.x + _size, _position.y + _size);

					if (currentProgress > 5/8) { // The cool down has at least reached the bottom-left corner
						// Draw the section from the bottom-right to the bottom-left
						context.lineTo(_position.x, _position.y + _size);

						if (currentProgress > 7/8) { // The cool down has at least reached the top-left corner
							// Draw the section from the bottom-left to the top-left
							context.lineTo(_position.x, _position.y);

							// Draw the section from the top-left to somewhere along the final top portion
							context.lineTo(_position.x + ((currentProgress - (7 / 8)) * 4 * _size), _position.y);
						} else { // The cool down has not yet reached the top-left corner
							// Draw the section from the bottom-left to somewhere in the left portion
							context.lineTo(_position.x, _position.y + (((7 / 8) - currentProgress) * 4 * _size));
						}
					} else { // The cool down has not yet reached the bottom-left corner
						// Draw the section from the bottom-right to somewhere in the bottom portion
						context.lineTo(_position.x + (((5 / 8) - currentProgress) * 4 * _size), _position.y);
					}
				} else { // The cool down has not yet reached the bottom-right corner
					// Draw the section from the top-right to somewhere in the right portion
					context.lineTo(_position.x, _position.y + ((currentProgress - (1 / 8)) * 4 * _size));
				}
			} else { // The cool down has not yet reached the top-right corner
				// Draw the section from the top-middle to somewhere in the first top portion
				context.lineTo(_positionOfWindowCenter.x + (currentProgress * 4 * _size), _position.y);
			}
		};

		// Start this preview window with a random new block and a fresh cool 
		// down.
		var _startNewBlock = function() {
			// Change the current block to be a new block of some random type 
			// (from 0 to 6)
			var blockType = Math.floor(Math.random() * 7);

			var orientation = _previewWindowIndex;
			var fallDirection = _previewWindowIndex;

			var indexOffsetFromTopLeftOfBlockToCenter = window.Block.getIndexOffsetFromTopLeftOfBlockToCenter(blockType, orientation);

			var x = _positionOfWindowCenter.x - (indexOffsetFromTopLeftOfBlockToCenter.x * window.Block._squareSize());
			var y = _positionOfWindowCenter.y - (indexOffsetFromTopLeftOfBlockToCenter.y * window.Block._squareSize());

			_currentBlock = new Block(blockType, x, y, orientation, fallDirection);

			// Compute a new (random) cool-down period to use, which is based off of _baseCoolDownPeriod
			_actualCoolDownPeriod = _baseCoolDownPeriod; // TODO: actually implement the random deviation here

			_timeSinceLastBlock = 0;
		};

		// Set the base cool-down period to be the given time (in millis).
		var _setCoolDownPeriod = function(period) {
			_baseCoolDownPeriod = period;
		};

		// Return the block that has been shown in this preview window.  This block will be re-positioned to be in
		var _getCurrentBlock = function() {
			var startingX;
			var startingY;

			var indexOffsetFromTopLeftOfBlockToCenter = 
					window.Block.getIndexOffsetFromTopLeftOfBlockToCenter(
							blockType, orientation);

			switch (_previewWindowIndex) {
			case 0:
				startingX = _gameAreaSize / 2;
				startingY = 0;
				break;
			case 1:
				startingX = _gameAreaSize - (indexOffsetFromTopLeftOfBlockToCenter.x * 2);
				startingY = _gameAreaSize / 2;
				break;
			case 2:
				startingX = _gameAreaSize / 2;
				startingY = _gameAreaSize - (indexOffsetFromTopLeftOfBlockToCenter.y * 2);
				break;
			case 3:
				startingX = 0;
				startingY = _gameAreaSize / 2;
				break;
			default:
				return;
			}

			_currentBlock.setPosition(startingX, startingY);

			return _currentBlock;
		};

		var _isCoolDownFinished = function() {
			return _timeSinceLastBlock >= _actualCoolDownPeriod;
		};

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.startNewBlock = _startNewBlock;
		this.setCoolDownPeriod = _setCoolDownPeriod;
		this.getCurrentBlock = _getCurrentBlock;
		this.isCoolDownFinished = _isCoolDownFinished;
		this.update = _update;
		this.draw = _draw;
	};

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) members

	// PreviewWindow inherits from Sprite
	PreviewWindow.prototype = window.utils.object(Sprite);

	// This should be called once at the start of each game
	PreviewWindow.prototype.setGameAreaSize = function(size) {
		_gameAreaSize = size;
	};

	// Make PreviewWindow available to the rest of the program
	window.PreviewWindow = PreviewWindow;
})();

if (DEBUG) {
	log.d("<-- previewwindow.js: LOADING");
}
