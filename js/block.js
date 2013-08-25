// ------------------------------------------------------------------------- //
// -- window.Block
// ------------------------------------------------------------------------- //
// For use with the Squa_RED Away web app.
// 
// All of the Block logic is encapsulated in this anonymous function.  This is 
// then sto_RED in the window.Block property.  This has the effect of 
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
	var _RED = 0; // S-shaped block
	var _GREEN = 1; // Z-shaped block
	var _PURPLE = 2; // L-shaped block
	var _YELLOW = 3; // J-shaped block
	var _BLUE = 4; // Square-shaped block
	var _ORANGE = 5; // Line-shaped block (defaults to vertical orientation)
	var _GREY = 6; // T-shaped block

	// Orientations
	var _DEG0 = 0;
	var _DEG90 = 1;
	var _DEG180 = 2;
	var _DEG270 = 3;

	// Fall directions
	var _DOWN = 0;
	var _LEFT = 1;
	var _UP = 2;
	var _RIGHT = 3;

	var _squareSize;
	var _gameAreaIndexSize;

	// Return an array of position objects which represent the positions 
	// of this block's constituent squares relative to this block's 
	// position.
	var _getSquareIndexPositionsRelativeToBlockPosition = function(type, orientation) {
		var square1X;
		var square1Y;
		var square2X;
		var square2Y;
		var square3X;
		var square3Y;
		var square4X;
		var square4Y;

		// Compute the constituent square positions
		switch (type) { // TODO: refactor this to only have the default orientation hard-coded and to instead automatically compute the square positions for the rotations
		case _RED: // S-shaped block
			if (orientation === _DEG0 || orientation === _DEG180) {
				square1X = 0;
				square1Y = 1;
				square2X = 1;
				square2Y = 1;
				square3X = 1;
				square3Y = 0;
				square4X = 2;
				square4Y = 0;
			} else {
				square1X = 0;
				square1Y = 0;
				square2X = 0;
				square2Y = 1;
				square3X = 1;
				square3Y = 1;
				square4X = 1;
				square4Y = 2;
			}
			break;
		case _GREEN: // Z-shaped block
			if (orientation === _DEG0 || orientation === _DEG180) {
				square1X = 0;
				square1Y = 0;
				square2X = 1;
				square2Y = 0;
				square3X = 1;
				square3Y = 1;
				square4X = 2;
				square4Y = 1;
			} else {
				square1X = 1;
				square1Y = 0;
				square2X = 1;
				square2Y = 1;
				square3X = 0;
				square3Y = 1;
				square4X = 0;
				square4Y = 2;
			}
			break;
		case _PURPLE: // L-shaped block
			if (orientation === _DEG0) {
				square1X = 0;
				square1Y = 0;
				square2X = 0;
				square2Y = 1;
				square3X = 0;
				square3Y = 2;
				square4X = 1;
				square4Y = 2;
			} else if (orientation === _DEG90) {
				square1X = 0;
				square1Y = 0;
				square2X = 0;
				square2Y = 1;
				square3X = 1;
				square3Y = 0;
				square4X = 2;
				square4Y = 0;
			} else if (orientation === _DEG180) {
				square1X = 0;
				square1Y = 0;
				square2X = 1;
				square2Y = 0;
				square3X = 1;
				square3Y = 1;
				square4X = 1;
				square4Y = 2;
			} else { // orientation === _DEG270
				square1X = 0;
				square1Y = 1;
				square2X = 1;
				square2Y = 1;
				square3X = 2;
				square3Y = 1;
				square4X = 2;
				square4Y = 0;
			}
			break;
		case _YELLOW: // J-shaped block
			if (orientation === _DEG0) {
				square1X = 1;
				square1Y = 0;
				square2X = 1;
				square2Y = 1;
				square3X = 1;
				square3Y = 2;
				square4X = 0;
				square4Y = 2;
			} else if (orientation === _DEG90) {
				square1X = 0;
				square1Y = 0;
				square2X = 0;
				square2Y = 1;
				square3X = 1;
				square3Y = 1;
				square4X = 2;
				square4Y = 1;
			} else if (orientation === _DEG180) {
				square1X = 0;
				square1Y = 0;
				square2X = 1;
				square2Y = 0;
				square3X = 0;
				square3Y = 1;
				square4X = 0;
				square4Y = 2;
			} else { // orientation === _DEG270
				square1X = 0;
				square1Y = 0;
				square2X = 1;
				square2Y = 0;
				square3X = 2;
				square3Y = 0;
				square4X = 2;
				square4Y = 1;
			}
			break;
		case _BLUE: // Square-shaped block
			square1X = 0;
			square1Y = 0;
			square2X = 1;
			square2Y = 0;
			square3X = 1;
			square3Y = 1;
			square4X = 0;
			square4Y = 1;
			break;
		case _ORANGE: // Line-shaped block (defaults to vertical orientation)
			if (orientation === _DEG0 || orientation === _DEG180) {
				square1X = 0;
				square1Y = 0;
				square2X = 0;
				square2Y = 1;
				square3X = 0;
				square3Y = 2;
				square4X = 0;
				square4Y = 3;
			} else {
				square1X = 0;
				square1Y = 0;
				square2X = 1;
				square2Y = 0;
				square3X = 2;
				square3Y = 0;
				square4X = 3;
				square4Y = 0;
			}
			break;
		case _GREY: // T-shaped block
			if (orientation === _DEG0) {
				square1X = 0;
				square1Y = 0;
				square2X = 1;
				square2Y = 0;
				square3X = 2;
				square3Y = 0;
				square4X = 1;
				square4Y = 1;
			} else if (orientation === _DEG90) {
				square1X = 1;
				square1Y = 0;
				square2X = 1;
				square2Y = 1;
				square3X = 0;
				square3Y = 1;
				square4X = 1;
				square4Y = 2;
			} else if (orientation === _DEG180) {
				square1X = 0;
				square1Y = 1;
				square2X = 1;
				square2Y = 1;
				square3X = 2;
				square3Y = 1;
				square4X = 1;
				square4Y = 0;
			} else { // orientation === _DEG270
				square1X = 0;
				square1Y = 0;
				square2X = 0;
				square2Y = 1;
				square3X = 0;
				square3Y = 2;
				square4X = 1;
				square4Y = 1;
			}
			break;
		default:
			return;
		}

		return [
			{ x: square1X, y: square1Y }, 
			{ x: square2X, y: square2Y }, 
			{ x: square3X, y: square3Y }, 
			{ x: square4X, y: square4Y }
		];
	};

	var _positionToIndex = function(position) {
		return position.y * _gameAreaIndexSize + position.x;
	}

	var _positionsToIndices = function(positions) {
		var indices = new Array();

		for (int i = 0; i < positions.length; ++i) {
			indices[i] = _positionToIndex(positions[i]);
		}

		return indices;
	}

	// Constructor
	// type: which type of block this is (0-6)
	// x: the x-coordinate of this block's initial position (in pixels)
	// y: the y-coordinate of this block's initial position (in pixels)
	// orientation: which orientation this block starts with (0-3)
	// fallDirection: which direction this block originally falls in (0-3)
	// 
	// NOTE: I choose to represent the index "position" of a block as the 
	//		 top-left cell occupied by the bounding box formed by the current 
	//		 orientation of the block.
	function Block(type, x, y, orientation, fallDirection) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _type = type;
		var _positionPixels = { x: x, y: y }; // pixels // TODO: refactor this to need only one position representation
		var _positionIndex = { x: -1, y: -1 }; // column and row indices
		var _orientation = orientation;
		var _fallDirection = fallDirection;
		var _elapsedTime = 0;

		// TODO: 
		var _update = function(deltaTime) {
			_elapsedTime += deltaTime;

			// TODO: (_squareSize, _positionPixels)
		};

		// Render this block on the given drawing context.  The context should 
		// be transforme beforehand in order to place the origin at the 
		// top-left corner of the play area.
		var _draw = function(context) {
			var positions = _getSquareIndexPositionsRelativeToBlockPosition(
									_type, _orientation);

			// Translate the square positions from block index space to canvas 
			// pixel space
			for (int i = 0; i < positions.length; ++i) {
				positions[i].x = _positionPixels.x + 
								(positions[i].x * _squareSize);
				positions[i].y = _positionPixels.y + 
								(positions[i].y * _squareSize);
			}

			// Draw the constituent squares
			window.Block.drawSquare(context, _type, 
									positions[0].x, positions[0].y);
			window.Block.drawSquare(context, _type, 
									positions[1].x, positions[1].y);
			window.Block.drawSquare(context, _type, 
									positions[2].x, positions[2].y);
			window.Block.drawSquare(context, _type, 
									positions[3].x, positions[3].y);
		};

		// Rotate the orientation of this block clockwise 90 degrees.
		var _rotate = function() {
			_orientation = (_orientation + 1) % 4;
		};

		// Rotate the fall direction of this block clockwise 90 degrees.
		var _switchFallDirection = function() {
			_fallDirection = (_fallDirection + 1) % 4;
		};
		
		// Add the squares that comprise this block to the given map.  Negative 
		// values in the map represent cells which do not contain squares.  When a 
		// cell does contain a square, the color of the square is determined by 
		// the positive number of the corresponding block type.
		var _addSquaresToMap = function(squaresOnMap) {
			var positions = _getSquareIndexPositions();
			var indices = _positionsToIndices(positions);

			for (int i = 0; i < positions.length; ++i) {
				squaresOnMap[indices[i]] = _type;
			}
		};

		// Return an array of position objects which represent the cells in 
		// the map which are occupied by this block.
		var _getSquareIndexPositions = function() {
			var positions = _getSquareIndexPositionsRelativeToBlockPosition(
									_type, _orientation);

			// Translate the square positions from block space to canvas space
			for (int i = 0; i < positions.length; ++i) {
				positions[i].x += _positionIndex.x;
				positions[i].y += _positionIndex.y;
			}

			return positions;
		};

		// Move this block down by 1 square according to its current fall 
		// direction.
		var _fall = function() {
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case _DOWN:
				deltaY = -1;
				break;
			case _LEFT:
				deltaX = -1;
				break;
			case _UP:
				deltaY = 1;
				break;
			case _RIGHT:
				deltaX = 1;
				break;
			default:
				return;
			}

			_positionIndex.x += deltaX;
			_positionIndex.y += deltaY;
			_positionPixels.x += deltaX * _squareSize;
			_positionPixels.y += deltaY * _squareSize;
		};

		// Return true if this block has collided with a stationary square on 
		// the given map and is therefore done falling.  Non-negative values 
		// in the map should represent cells containing squares.
		var _checkForCollision = function(squaresOnMap) {
			// First, check that this block is not colliding with the edge of 
			// the game area
			if (_checkForCollisionWithGameAreaEdge()) { // TODO: remove this check and instead do the check from whomever calls this function
				return true;
			}

			var deltaI;

			switch (_fallDirection) {
			case _DOWN:
				deltaI = _gameAreaIndexSize;
				break;
			case _LEFT:
				deltaI = -1;
				break;
			case _UP:
				deltaI = -_gameAreaIndexSize;
				break;
			case _RIGHT:
				deltaI = 1;
				break;
			default:
				return;
			}

			var positions = _getSquareIndexPositions();
			var indices = _positionsToIndices(positions);
			var neighborIndex;

			for (int i = 0; i < indices.length; ++i) {
				neighborIndex = indices[i] + deltaI;

				if (squaresOnMap[neighborIndex] > -1) {
					return true;
				}
			}

			return false;
		};

		var _checkForCollisionWithGameAreaEdge = function() {
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case _DOWN:
				deltaX = 0;
				deltaY = 1;
				break;
			case _LEFT:
				deltaX = -1;
				deltaY = 0;
				break;
			case _UP:
				deltaX = 0;
				deltaY = -1;
				break;
			case _RIGHT:
				deltaX = 1;
				deltaY = 0;
				break;
			default:
				return;
			}

			var positions = _getSquareIndexPositions();

			for (int i = 0; i < indices.length; ++i) {
				if (positions[i].x + deltaX > _gameAreaIndexSize || 
						positions[i].x + deltaX < 0 || 
						positions[i].y + deltaY > _gameAreaIndexSize || 
						positions[i].y + deltaY < 0) {
					return true;
				}
			}

			return false;
		}

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
		this.switchFallDirection = _switchFallDirection;
		this.checkForCollision = _checkForCollision;
		this.checkForCollisionWithGameAreaEdge = _checkForCollisionWithGameAreaEdge;
		this.fall = _fall;
		this.update = _update;
		this.draw = _draw;
		this.addSquaresToMap = _addSquaresToMap;
		this.getSquareIndexPositions = _getSquareIndexPositions;
		this.getFarthestLeftAvailable = _getFarthestLeftAvailable;
		this.getFarthestRightAvailable = _getFarthestRightAvailable;
		this.getFarthestDownwardAvailable = _getFarthestDownwardAvailable;
		this.setPosition = _setPosition;
	};

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) static members

	// Block inherits from Sprite
	Block.prototype = window.utils.object(Sprite);

	// This should be called once at the start of the program
	Block.prototype.setSquareSize = function(size) {
		_squareSize = size;
	};

	Block.prototype.getSquareSize = function() {
		return _squareSize;
	};

	Block.prototype.setGameAreaIndexSize = function(size) {
		_gameAreaIndexSize = size;
	};

	Block.prototype.drawSquare = function(context, squareType, x, y) {
		if (squareType >= 0) {
			var sourceY = squareType * _SOURCE_SQUARE_SIZE;

			context.drawImage(resources.get("img/sprites.png"), 
					0, sourceY, 
					_SOURCE_SQUARE_SIZE, _SOURCE_SQUARE_SIZE, 
					x, y);
		}
	};

	Block.prototype.getIndexOffsetFromTopLeftOfBlockToCenter = function(blockType, orientation) {
		var x = 0;
		var y = 0;

		switch (blockType) {
		case _RED: // S-shaped block
			x = 1.5;
			y = 1;
			break;
		case _GREEN: // Z-shaped block
			x = 1.5;
			y = 1;
			break;
		case _PURPLE: // L-shaped block
			x = 1;
			y = 1.5;
			break;
		case _YELLOW: // J-shaped block
			x = 1;
			y = 1.5;
			break;
		case _BLUE: // Square-shaped block
			x = 1;
			y = 1;
			break;
		case _ORANGE: // Line-shaped block
			x = 0.5;
			y = 2;
			break;
		case _GREY: // T-shaped block
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
