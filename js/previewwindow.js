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
// Dependencies:
//		- window.Sprite
//		- window.Block
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _SOURCE_SQUARE_SIZE = 16; // in pixels

	var _gameAreaSize = 100;

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

		var _update = function(deltaTime) {
			_timeSinceLastBlock += deltaTime;
		};

		// TODO: 
		var _draw = function(context) {
			// Draw the border around the perimeter
			
			// Draw the current cool-down progress as a background polygon
			
			// Draw the current cool-down progress as a thick, colored line around the perimeter
			// TODO: 
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
