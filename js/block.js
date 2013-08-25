// ------------------------------------------------------------------------- //
// -- window.Block
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the Block logic is encapsulated in this anonymous function.  This is 
// then stored in the window.Block property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.Sprite
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	// --------------------------------------------------------------------- //
	// -- Private static members

	// Block types/colors
	var RED = 0; // S-shaped block
	var GREEN = 1; // Z-shaped block
	var PURPLE = 2; // L-shaped block
	var YELLOW = 3; // J-shaped block
	var BLUE = 4; // Square-shaped block
	var ORANGE = 5; // Line-shaped block (defaults to vertical orientation)
	var GREY = 6; // T-shaped block

	// Orientations
	var DEG0 = 0;
	var DEG90 = 1;
	var DEG180 = 2;
	var DEG270 = 3;

	// Fall directions
	var DOWN = 0;
	var LEFT = 1;
	var UP = 2;
	var RIGHT = 3;

	var _squareSize;

	// Constructor
	// type: which type of block this is (0-6)
	// x: which column this block is originally positioned at
	// y: which row this block is originally positioned at
	// orientation: which orientation this block starts with (0-3)
	// fallDirection: which direction this block originally falls in (0-3)
	// 
	// NOTE: I choose to represent the "position" of a block as the top-left 
	//		 cell occupied by the bounding box formed by the current 
	//		 orientation of the block.
	function Block(type, x, y, orientation, fallDirection) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _type = type;
		var _positionPixels = { x: x, y: y }; // pixels
		var _positionIndex = { x: -1, y: -1 }; // column and row indices
		var _orientation = orientation;
		var _fallDirection = fallDirection;
		var _elapsedTime = 0;

		// TODO: 
		var _update = function(deltaTime) {
			_elapsedTime += deltaTime;

			// TODO: 
		};

		// Render this block on the given drawing context.  The context should 
		// be transforme beforehand in order to place the origin at the 
		// top-left corner of the play area.
		var _draw = function(context) {
			// TODO: (_squareSize, _positionPixels)
		};

		// Rotate this block clockwise 90 degrees.
		var _rotate = function() {
			_orientation = (_orientation + 1) % 4;
		};

		// Move this block down by 1 square according to its current fall 
		// direction.
		var _fall = function() {
			// TODO: (_positionIndex, _positionPixels)
		};

		// Return true if this block has collided with a stationary square on 
		// the given map and is therefore done falling.  Non-negative values 
		// in the map should represent cells containing squares.
		var _checkForCollision = function(squaresOnMap) {
			// TODO: 
		};
		
		// Add the squares that comprise this block to the given map.  Negative 
		// values in the map represent cells which do not contain squares.  When a 
		// cell does contain a square, the color of the square is determined by 
		// the positive number of the corresponding block type.
		var _addSquaresToMap = function(squaresOnMap) {
			// TODO: (use _getSquarePositions)
		};

		// Return an array of position objects which represent the cells in 
		// the map which are occupied by this block.
		var _getSquarePositions = function() {
			// TODO: 
		};

		// Return the farthest left position this block can move to from its 
		// current position on its current descent level.  Note: "left" is 
		// relative to the direction in which this block is falling.
		var _getFarthestLeftAvailable = function(squaresOnMap) {
			// TODO: 
		};

		// Return the farthest right position this block can move to from its 
		// current position on its current descent level.  Note: "right" is 
		// relative to the direction in which this block is falling.
		var _getFarthestRightAvailable = function(squaresOnMap) {
			// TODO: 
		};

		// Return the farthest downward position this block can move to from 
		// its current position.  Note: "downward" is relative to the 
		// direction in which this block is falling.
		var _getFarthestDownwardAvailable = function(squaresOnMap) {
			// TODO: 
		};

		var _setPositionIndex = function(x, y) {
			_positionIndex.x = x;
			_positionIndex.y = y;
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.rotate = _rotate;
		this.checkForCollision = _checkForCollision;
		this.fall = _fall;
		this.update = _update;
		this.draw = _draw;
		this.addSquaresToMap = _addSquaresToMap;
		this.getSquarePositions = _getSquarePositions;
		this.getFarthestLeftAvailable = _getFarthestLeftAvailable;
		this.getFarthestRightAvailable = _getFarthestRightAvailable;
		this.getFarthestDownwardAvailable = _getFarthestDownwardAvailable;
		this.setPosition = _setPosition;
	};

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) members

	// Block inherits from Sprite
	Block.prototype = window.utils.object(Sprite);

	// This should be called once at the start of the program
	Block.prototype.setSquareSize = function(size) {
		_squareSize = size;
	};

	Block.prototype.getSquareSize = function() {
		return _squareSize;
	};

	Block.prototype.getIndexOffsetFromTopLeftOfBlockToCenter = function(blockType, orientation) {
		var x = 0;
		var y = 0;

		switch (blockType) {
		case RED: // S-shaped block
			x = 1.5;
			y = 1;
			break;
		case GREEN: // Z-shaped block
			x = 1.5;
			y = 1;
			break;
		case PURPLE: // L-shaped block
			x = 1;
			y = 1.5;
			break;
		case YELLOW: // J-shaped block
			x = 1;
			y = 1.5;
			break;
		case BLUE: // Square-shaped block
			x = 1;
			y = 1;
			break;
		case ORANGE: // Line-shaped block
			x = 0.5;
			y = 2;
			break;
		case GREY: // T-shaped block
			x = 1.5;
			y = 1;
			break;
		default:
			break;
		}

		// If the block is oriented 90 degrees off of the default, then swap 
		// the x and y offsets
		if (orientation === 1 || orientation === 3) {
			var tmp = x;
			x = y;
			y = tmp;
		}

		return { x: x, y: y };
	};

	// Make Block available to the rest of the program
	window.Block = Block;
})();
