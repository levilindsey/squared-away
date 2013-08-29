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
//		- window.log
//		- window.Sprite
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	log.d("-->block.LOADING_MODULE");

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
	var _fallPeriod; // millis / blocks

	// Return an array of position objects which represent the positions 
	// of this block's constituent squares relative to this block's 
	// position.
	function _getSquareIndexPositionsRelativeToBlockPosition(type, orientation) {
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
	}

	function _positionToIndex(position) {
		return position.y * _gameAreaIndexSize + position.x;
	}

	function _positionsToIndices(positions) {
		var indices = new Array();

		for (var i = 0; i < positions.length; ++i) {
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
		log.d("-->block.Block");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _type = type;
		var _positionPixels = { x: x, y: y }; // pixels // TODO: refactor this to need only one position representation
		var _positionIndex = { x: -1, y: -1 }; // column and row indices
		var _orientation = orientation;
		var _fallDirection = fallDirection;
		var _timeSinceLastFall = 0;
		var _hasCollidedWithSquare = false;
		var _hasCollidedWithEdgeOfArea = false;

		// Each block keeps track of its own timers so it can fall and shimmer 
		// independently.
		function _update(deltaTime, squaresOnGameArea, blocksOnGameArea) {
			_timeSinceLastFall += deltaTime;

			// Check whether this block needs to fall one space
			if (_timeSinceLastFall > _fallPeriod) {
				_hasCollidedWithEdgeOfArea = 
						_checkForCollisionWithGameAreaEdge();

				if (!_hasCollidedWithEdgeOfArea) {
					_hasCollidedWithSquare = 
							_checkForCollision(squaresOnGameArea, 
											   blocksOnGameArea);

					if (!_hasCollidedWithSquare) {
						_fall();
					}
				}

				_timeSinceLastFall %= _fallPeriod;
			}

			// Check whether this block needs to shimmer
			if (false && // TODO: fix the false bit to use a shimmer timer
					!_hasCollidedWithEdgeOfArea && !_hasCollidedWithSquare) {
				// TODO: 
			}
		}

		// Render this block on the given drawing context.  The context should 
		// be transforme beforehand in order to place the origin at the 
		// top-left corner of the play area.
		function _draw(context) {
			var positions = _getSquareIndexPositionsRelativeToBlockPosition(
									_type, _orientation);

			// Translate the square positions from block index space to canvas 
			// pixel space
			for (var i = 0; i < positions.length; ++i) {
				positions[i].x = _positionPixels.x + 
								(positions[i].x * _squareSize);
				positions[i].y = _positionPixels.y + 
								(positions[i].y * _squareSize);
			}

			// Draw the constituent squares
			window.Block.prototype.drawSquare(context, _type, 
									positions[0].x, positions[0].y);log.d("---block._draw4");/////TODO/////
			window.Block.prototype.drawSquare(context, _type, 
									positions[1].x, positions[1].y);
			window.Block.prototype.drawSquare(context, _type, 
									positions[2].x, positions[2].y);
			window.Block.prototype.drawSquare(context, _type, 
									positions[3].x, positions[3].y);
		}

		// Rotate the orientation of this block clockwise 90 degrees.
		function _rotate() {
			_orientation = (_orientation + 1) % 4;
		}

		// Rotate the fall direction of this block clockwise 90 degrees.
		function _switchFallDirection() {
			_fallDirection = (_fallDirection + 1) % 4;
		}
		
		// Add the squares that comprise this block to the given game area.  
		// Negative values in the game area represent cells which do not 
		// contain squares.  When a cell does contain a square, the color of 
		// the square is determined by the positive number of the 
		// corresponding block type.
		function _addSquaresToGameArea(squaresOnGameArea) {
			var positions = _getSquareIndexPositions();
			var indices = _positionsToIndices(positions);

			for (var i = 0; i < positions.length; ++i) {
				squaresOnGameArea[indices[i]] = _type;
			}
		}

		// Return an array of position objects which represent the cells in 
		// the game area which are occupied by this block.
		function _getSquareIndexPositions() {
			var positions = _getSquareIndexPositionsRelativeToBlockPosition(
									_type, _orientation);

			// Translate the square positions from block space to canvas space
			for (var i = 0; i < positions.length; ++i) {
				positions[i].x += _positionIndex.x;
				positions[i].y += _positionIndex.y;
			}

			return positions;
		}

		// Move this block down by 1 square according to its current fall 
		// direction.
		function _fall() {
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
		}

		// Return true if this block has collided with a stationary square on 
		// the given game area and is therefore done falling.  Non-negative 
		// values in the game area should represent cells containing squares.
		// 
		// NOTE: it is important to check that this block is not colliding 
		//		 with an edge of the game area BEFORE calling this function.  
		//		 Otherwise, this function may look out of bounds in the game 
		//		 area array.
		function _checkForCollision(squaresOnGameArea, blocksOnGameArea) { // TODO: handle collision detection with blocksOnGameArea
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

			for (var i = 0; i < indices.length; ++i) {
				neighborIndex = indices[i] + deltaI;

				if (squaresOnGameArea[neighborIndex] > -1) {
					return true;
				}
			}

			return false;
		}

		function _checkForCollisionWithGameAreaEdge() {
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

			for (var i = 0; i < indices.length; ++i) {
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
		function _getFarthestLeftAvailable(squaresOnGameArea) {
			var deltaI;
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case _DOWN:
				deltaI = -1;
				deltaX = -1;
				deltaY = 0;
				break;
			case _LEFT:
				deltaI = -_gameAreaIndexSize;
				deltaX = 0;
				deltaY = -1;
				break;
			case _UP:
				deltaI = 1;
				deltaX = 1;
				deltaY = 0;
				break;
			case _RIGHT:
				deltaI = _gameAreaIndexSize;
				deltaX = 0;
				deltaY = 1;
				break;
			default:
				return;
			}

			var howManyStepsBlockCanMove = _getHowManyStepsBlockCanMove(deltaI);

			return { 
				x: _positionIndex.x + (howManyStepsBlockCanMove * deltaX),
				y: _positionIndex.y + (howManyStepsBlockCanMove * deltaY)
			};
		}

		// Return the farthest right position this block can move to from its 
		// current position on its current descent level.  Note: "right" is 
		// relative to the direction in which this block is falling.
		function _getFarthestRightAvailable(squaresOnGameArea) {
			var deltaI;
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case _DOWN:
				deltaI = 1;
				deltaX = 1;
				deltaY = 0;
				break;
			case _LEFT:
				deltaI = _gameAreaIndexSize;
				deltaX = 0;
				deltaY = 1;
				break;
			case _UP:
				deltaI = -1;
				deltaX = -1;
				deltaY = 0;
				break;
			case _RIGHT:
				deltaI = -_gameAreaIndexSize;
				deltaX = 0;
				deltaY = -1;
				break;
			default:
				return;
			}

			var howManyStepsBlockCanMove = _getHowManyStepsBlockCanMove(deltaI);

			return { 
				x: _positionIndex.x + (howManyStepsBlockCanMove * deltaX),
				y: _positionIndex.y + (howManyStepsBlockCanMove * deltaY)
			};
		}

		// Return the farthest downward position this block can move to from 
		// its current position.  Note: "downward" is relative to the 
		// direction in which this block is falling.
		function _getFarthestDownwardAvailable(squaresOnGameArea) {
			var deltaI;
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case _DOWN:
				deltaI = _gameAreaIndexSize;
				deltaX = 0;
				deltaY = 1;
				break;
			case _LEFT:
				deltaI = -1;
				deltaX = -1;
				deltaY = 0;
				break;
			case _UP:
				deltaI = -_gameAreaIndexSize;
				deltaX = 0;
				deltaY = -1;
				break;
			case _RIGHT:
				deltaI = 1;
				deltaX = 1;
				deltaY = 0;
				break;
			default:
				return;
			}

			var howManyStepsBlockCanMove = 
					_getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY);

			return { 
				x: _positionIndex.x + (howManyStepsBlockCanMove * deltaX),
				y: _positionIndex.y + (howManyStepsBlockCanMove * deltaY)
			};
		}

		// Return how many steps this block can move using the given delta 
		// index value before colliding with a stationary square or an edge of 
		// the game area.
		function _getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY) {
			var positions = _getSquareIndexPositions();
			var indices = _positionsToIndices(positions);
			var neighborIndex;
			var j;

			// Keep moving one cell in the same direction until we hit a 
			// square on the gameArea or we hit an edge of the game area
			for (var i = 0, dI = deltaI, dX = deltaX, dY = deltaY; ; 
					++i, dI += deltaI, dX += deltaX, dY += deltaY) {
				// Check each of this block's four constituent squares
				for (j = 0; j < indices.length; ++j) {
					neighborIndex = indices[j] + dI;

					if (positions[j].x + deltaX > _gameAreaIndexSize || 
							positions[j].x + deltaX < 0 || 
							positions[j].y + deltaY > _gameAreaIndexSize || 
							positions[j].y + deltaY < 0 || 
							squaresOnGameArea[neighborIndex] > -1) { 
						return i;
					}
				}
			}
		}

		function _setPositionIndex(x, y) {
			_positionIndex.x = x;
			_positionIndex.y = y;
		}

		function _getHasCollidedWithEdgeOfArea() {
			return _hasCollidedWithEdgeOfArea;
		}

		function _getHasCollidedWithSquare() {
			return _hasCollidedWithSquare;
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.rotate = _rotate;
		this.switchFallDirection = _switchFallDirection;
		this.update = _update;
		this.draw = _draw;
		this.addSquaresToGameArea = _addSquaresToGameArea;
		this.getSquareIndexPositions = _getSquareIndexPositions;
		this.getFarthestLeftAvailable = _getFarthestLeftAvailable;
		this.getFarthestRightAvailable = _getFarthestRightAvailable;
		this.getFarthestDownwardAvailable = _getFarthestDownwardAvailable;
		this.setPositionIndex = _setPositionIndex;
		this.getHasCollidedWithEdgeOfArea = _getHasCollidedWithEdgeOfArea;
		this.getHasCollidedWithSquare = _getHasCollidedWithSquare;

		log.d("<--block.Block");
	};

	// Block inherits from Sprite
	Block.prototype = {
		// --------------------------------------------------------------------- //
		// -- Public (non-privileged) static members

		// This should be called once at the start of the program
		setSquareSize: function(size) {
			_squareSize = size;
		},

		getSquareSize: function() {
			return _squareSize;
		},

		setGameAreaIndexSize: function(size) {
			_gameAreaIndexSize = size;
		},

		setFallSpeed: function(fallSpeed) {
			_fallPeriod = 1 / fallSpeed;
		},

		drawSquare: function(context, squareType, x, y) {
			if (squareType >= 0) {
				var sourceY = squareType * _SOURCE_SQUARE_SIZE;

				context.drawImage(resources.get("img/sprites.png"), 
						0, sourceY, 
						_SOURCE_SQUARE_SIZE, _SOURCE_SQUARE_SIZE, 
						x, y);
			}
		},

		getIndexOffsetFromTopLeftOfBlockToCenter: function(blockType, orientation) {
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
		}
	};

	// Make Block available to the rest of the program
	window.Block = Block;

	log.d("<--block.LOADING_MODULE");
})();
