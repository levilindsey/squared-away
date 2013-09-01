// ------------------------------------------------------------------------- //
// -- window.Block
// ------------------------------------------------------------------------- //
// For use with the SquaBlock.prototype.RED Away web app.
// 
// All of the Block logic is encapsulated in this anonymous function.  This is 
// then stoBlock.prototype.RED in the window.Block property.  This has the effect of 
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

	var _SOURCE_SQUARE_SIZE = 16; // in pixels

	// These coordinates dictate the position (in cells) of each constituent 
	// square relative to the position of the parent block
	var _DEFAULT_SQUARE_CELL_POSITIONS = [
		[{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // Block.prototype.RED (S-shaped block)
		[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], // Block.prototype.GREEN (Z-shaped block)
		[{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }], // Block.prototype.PURPLE (L-shaped block)
		[{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // Block.prototype.YELLOW (J-shaped block)
		[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // Block.prototype.BLUE (Square-shaped block)
		[{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], // Block.prototype.ORANGE (Line-shaped block (defaults to vertical orientation))
		[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }]  // Block.prototype.GREY (T-shaped block)
	];

	// These points represent the shape of the given block along the given 
	// side.  These are relative to the position of the parent block.
	// NOTE: all points are given in clockwise order
	var _DEFAULT_SIDE_CELL_POSITIONS = [
		[ // Block.prototype.RED (S-shaped block)
			[{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }], // ALL_SIDES
			[{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 3, y: 0 }], // TOP_SIDE
			[{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // RIGHT_SIDE
			[{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
			[{ x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]  // LEFT_SIDE
		],
		[ // GREEN (Z-shaped block)
			[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // ALL_SIDES
			[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }], // TOP_SIDE
			[{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }], // RIGHT_SIDE
			[{ x: 3, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // BOTTOM_SIDE
			[{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]  // LEFT_SIDE
		],
		[ // PURPLE (L-shaped block)
			[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
			[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }], // TOP_SIDE
			[{ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }], // RIGHT_SIDE
			[{ x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
			[{ x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
		],
		[ // YELLOW (J-shaped block)
			[{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }], // ALL_SIDES
			[{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
			[{ x: 2, y: 0 }, { x: 2, y: 3 }], // RIGHT_SIDE
			[{ x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
			[{ x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }]  // LEFT_SIDE
		],
		[ // BLUE (Square-shaped block)
			[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
			[{ x: 0, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
			[{ x: 2, y: 0 }, { x: 2, y: 2 }], // RIGHT_SIDE
			[{ x: 2, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
			[{ x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
		],
		[ // ORANGE (Line-shaped block (defaults to vertical orientation))
			[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 4 }, { x: 0, y: 4 }], // ALL_SIDES
			[{ x: 0, y: 0 }, { x: 1, y: 0 }], // TOP_SIDE
			[{ x: 1, y: 0 }, { x: 1, y: 4 }], // RIGHT_SIDE
			[{ x: 1, y: 4 }, { x: 0, y: 4 }], // BOTTOM_SIDE
			[{ x: 0, y: 4 }, { x: 0, y: 0 }]  // LEFT_SIDE
		],
		[ // GREY (T-shaped block)
			[{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // ALL_SIDES
			[{ x: 0, y: 0 }, { x: 3, y: 0 }], // TOP_SIDE
			[{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // RIGHT_SIDE
			[{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // BOTTOM_SIDE
			[{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]  // LEFT_SIDE
		]
	];

	var _squareSize;
	var _gameAreaCellSize = 100;
	var _centerSquareCellSize = 6;
	var _centerSquareCellPositionX;
	var _fallPeriod; // millis / blocks

	// Constructor
	// type: which type of block this is (0-6)
	// x: the x-coordinate of this block's initial position (in pixels)
	// y: the y-coordinate of this block's initial position (in pixels)
	// orientation: which orientation this block starts with (0-3)
	// fallDirection: which direction this block originally falls in (0-3)
	// 
	// NOTE: I choose to represent the cell "position" of a block as the 
	//		 top-left cell occupied by the bounding box formed by the current 
	//		 orientation of the block.
	function Block(type, x, y, orientation, fallDirection) {
		log.d("-->block.Block");

		// ----------------------------------------------------------------- //
		// -- Private members

		var _type = type;
		var _positionPixels = { x: x, y: y }; // pixels // TODO: refactor this to need only one position representation
		var _positionCell = { x: -1, y: -1 }; // column and row indices
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
							_checkForCollisionWithCenterSquare() ||
							_checkForCollisionWithSquare(squaresOnGameArea, 
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
			var positions = _getSquareCellPositionsRelativeToBlockPosition(
									_type, _orientation);

			// Translate the square positions from block cell space to canvas 
			// pixel space
			for (var i = 0; i < positions.length; ++i) {
				positions[i].x = _positionPixels.x + 
								(positions[i].x * _squareSize);
				positions[i].y = _positionPixels.y + 
								(positions[i].y * _squareSize);
			}

			// Draw the constituent squares
			window.Block.prototype.drawSquare(context, _type, 
									positions[0].x, positions[0].y);
			window.Block.prototype.drawSquare(context, _type, 
									positions[1].x, positions[1].y);
			window.Block.prototype.drawSquare(context, _type, 
									positions[2].x, positions[2].y);
			window.Block.prototype.drawSquare(context, _type, 
									positions[3].x, positions[3].y);
		}

		// Rotate the orientation of this block clockwise 90 degrees.
		function _rotate() {
			var canRotate = ****;

			if (canRotate) {
				_orientation = (_orientation + 1) % 4;

				// Update the position of this block so that the lower-left 
				// corner (from the perspective of a top-to-bottom fall 
				// direction) is in the same position as before
				**** // TODO: ****
			}

			return canRotate;
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
			var positions = _getSquareCellPositions();
			var indices = _positionsToIndices(positions);

			for (var i = 0; i < positions.length; ++i) {
				squaresOnGameArea[indices[i]] = _type;
			}
		}

		// Return an array of position objects which represent the cells in 
		// the game area which are occupied by this block.
		function _getSquareCellPositions() {
			var positions = _getSquareCellPositionsRelativeToBlockPosition(
									_type, _orientation);

			// Translate the square positions from block space to canvas space
			for (var i = 0; i < positions.length; ++i) {
				positions[i].x += _positionCell.x;
				positions[i].y += _positionCell.y;
			}

			return positions;
		}

		// Move this block down by 1 square according to its current fall 
		// direction.
		function _fall() {
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				deltaX = 0;
				deltaY = 1;
				break;
			case Block.prototype.LEFTWARD:
				deltaX = -1;
				deltaY = 0;
				break;
			case Block.prototype.UPWARD:
				deltaX = 0;
				deltaY = -1;
				break;
			case Block.prototype.RIGHTWARD:
				deltaX = 1;
				deltaY = 0;
				break;
			default:
				return;
			}

			_positionCell.x += deltaX;
			_positionCell.y += deltaY;
			_positionPixels.x = _positionCell.x * _squareSize;
			_positionPixels.y = _positionCell.y * _squareSize;
		}

		// Return true if this block has collided with a stationary square on 
		// the given game area and is therefore done falling.  Non-negative 
		// values in the game area should represent cells containing squares.
		// 
		// NOTE: it is important to check that this block is not colliding 
		//		 with an edge of the game area BEFORE calling this function.  
		//		 Otherwise, this function may look out of bounds in the game 
		//		 area array.
		function _checkForCollisionWithSquare(squaresOnGameArea, blocksOnGameArea) { // TODO: handle collision detection with blocksOnGameArea
			var deltaI;

			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				deltaI = _gameAreaCellSize;
				break;
			case Block.prototype.LEFTWARD:
				deltaI = -1;
				break;
			case Block.prototype.UPWARD:
				deltaI = -_gameAreaCellSize;
				break;
			case Block.prototype.RIGHTWARD:
				deltaI = 1;
				break;
			default:
				return;
			}

			var positions = _getSquareCellPositions();
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
			case Block.prototype.DOWNWARD:
				deltaX = 0;
				deltaY = 1;
				break;
			case Block.prototype.LEFTWARD:
				deltaX = -1;
				deltaY = 0;
				break;
			case Block.prototype.UPWARD:
				deltaX = 0;
				deltaY = -1;
				break;
			case Block.prototype.RIGHTWARD:
				deltaX = 1;
				deltaY = 0;
				break;
			default:
				return;
			}

			var positions = _getSquareCellPositions();

			for (var i = 0; i < positions.length; ++i) {
				if (positions[i].x + deltaX >= _gameAreaCellSize || 
						positions[i].x + deltaX < 0 || 
						positions[i].y + deltaY >= _gameAreaCellSize || 
						positions[i].y + deltaY < 0) {
					return true;
				}
			}

			return false;
		}

		function _checkForCollisionWithCenterSquare() {
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				deltaX = 0;
				deltaY = 1;
				break;
			case Block.prototype.LEFTWARD:
				deltaX = -1;
				deltaY = 0;
				break;
			case Block.prototype.UPWARD:
				deltaX = 0;
				deltaY = -1;
				break;
			case Block.prototype.RIGHTWARD:
				deltaX = 1;
				deltaY = 0;
				break;
			default:
				return;
			}

			var minCenterSquareCellPositionX = _centerSquareCellPositionX;
			var maxCenterSquareCellPositionX = _centerSquareCellPositionX + _centerSquareCellSize;

			var positions = _getSquareCellPositions();

			for (var i = 0; i < positions.length; ++i) {
				if (positions[i].x + deltaX >= minCenterSquareCellPositionX && 
						positions[i].x + deltaX < maxCenterSquareCellPositionX && 
						positions[i].y + deltaY >= minCenterSquareCellPositionX && 
						positions[i].y + deltaY < maxCenterSquareCellPositionX) {
					return true;
				}
			}

			return false;
		}

		function _checkIsOverTopSquare(squaresOnGameArea) {
			var positions = _getSquareCellPositions();
			var indices = _positionsToIndices(positions);

			for (var i = 0; i < indices.length; ++i) {
				if (squaresOnGameArea[indices[i]] > -1) {
					return true;
				}
			}

			return false;
		}

		// Return the farthest left position this block can move to from its 
		// current position on its current descent level.  Note: "left" is 
		// relative to the direction in which this block is falling.
		function _getFarthestLeftCellAvailable(squaresOnGameArea) {
			var deltaI;
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				deltaI = -1;
				deltaX = -1;
				deltaY = 0;
				break;
			case Block.prototype.LEFTWARD:
				deltaI = -_gameAreaCellSize;
				deltaX = 0;
				deltaY = -1;
				break;
			case Block.prototype.UPWARD:
				deltaI = 1;
				deltaX = 1;
				deltaY = 0;
				break;
			case Block.prototype.RIGHTWARD:
				deltaI = _gameAreaCellSize;
				deltaX = 0;
				deltaY = 1;
				break;
			default:
				return;
			}

			var howManyStepsBlockCanMove = _getHowManyStepsBlockCanMove(deltaI);

			return { 
				x: _positionCell.x + (howManyStepsBlockCanMove * deltaX),
				y: _positionCell.y + (howManyStepsBlockCanMove * deltaY)
			};
		}

		// Return the farthest right position this block can move to from its 
		// current position on its current descent level.  Note: "right" is 
		// relative to the direction in which this block is falling.
		function _getFarthestRightCellAvailable(squaresOnGameArea) {
			var deltaI;
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				deltaI = 1;
				deltaX = 1;
				deltaY = 0;
				break;
			case Block.prototype.LEFTWARD:
				deltaI = _gameAreaCellSize;
				deltaX = 0;
				deltaY = 1;
				break;
			case Block.prototype.UPWARD:
				deltaI = -1;
				deltaX = -1;
				deltaY = 0;
				break;
			case Block.prototype.RIGHTWARD:
				deltaI = -_gameAreaCellSize;
				deltaX = 0;
				deltaY = -1;
				break;
			default:
				return;
			}

			var howManyStepsBlockCanMove = _getHowManyStepsBlockCanMove(deltaI);

			return { 
				x: _positionCell.x + (howManyStepsBlockCanMove * deltaX),
				y: _positionCell.y + (howManyStepsBlockCanMove * deltaY)
			};
		}

		// Return the farthest downward position this block can move to from 
		// its current position.  Note: "downward" is relative to the 
		// direction in which this block is falling.
		function _getFarthestDownwardCellAvailable(squaresOnGameArea) {
			var deltaI;
			var deltaX;
			var deltaY;

			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				deltaI = _gameAreaCellSize;
				deltaX = 0;
				deltaY = 1;
				break;
			case Block.prototype.LEFTWARD:
				deltaI = -1;
				deltaX = -1;
				deltaY = 0;
				break;
			case Block.prototype.UPWARD:
				deltaI = -_gameAreaCellSize;
				deltaX = 0;
				deltaY = -1;
				break;
			case Block.prototype.RIGHTWARD:
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
				x: _positionCell.x + (howManyStepsBlockCanMove * deltaX),
				y: _positionCell.y + (howManyStepsBlockCanMove * deltaY)
			};
		}

		// Return how many steps this block can move using the given delta 
		// index value before colliding with a stationary square or an edge of 
		// the game area.
		function _getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY) {
			var positions = _getSquareCellPositions();
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

					if (positions[j].x + deltaX > _gameAreaCellSize || 
							positions[j].x + deltaX < 0 || 
							positions[j].y + deltaY > _gameAreaCellSize || 
							positions[j].y + deltaY < 0 || 
							squaresOnGameArea[neighborIndex] > -1) { 
						return i;
					}
				}
			}
		}

		function _setCellPosition(x, y) {
			_positionCell.x = x;
			_positionCell.y = y;
			_positionPixels.x = _positionCell.x * _squareSize;
			_positionPixels.y = _positionCell.y * _squareSize;
		}

		function _getHasCollidedWithEdgeOfArea() {
			return _hasCollidedWithEdgeOfArea;
		}

		function _getHasCollidedWithSquare() {
			return _hasCollidedWithSquare;
		}

		function _getType() {
			return _type;
		}

		function _getOrientation() {
			return _orientation;
		}

		function _getFallDirection() {
			return _fallDirection;
		}

		function _getCenter() {
			var offset = getCellOffsetFromTopLeftOfBlockToCenter(_type, _orientation);

			return {
				x: _positionPixels.x + offset.x,
				y: _positionPixels.y + offset.y
			};
		}

		function _getPolygon() {
			var points = _getPointsAlongSideRelativeToBlockPosition(_type, _orientation, Block.prototype.ALL_SIDES);

			// Translate from block cell space to game area pixel space
			for (var i = 0; i < points.length; ++i) {
				points[i].x = (points[i].x * ) + _positionPixels.x;
				points[i].y = (points[i].y * ) + _positionPixels.y;
			}

			return points;
		}

		function _getSidePointsRelativeToBlockPosition(side) {
			var points = _getPointsAlongSideRelativeToBlockPosition(_type, _orientation, side);

			return points;
		}

		function _getLowerLeftAndRightFallDirectionPoints() {
			var mid = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(_type, _orientation);
			var maxX = mid.x * 2;
			var maxY = mid.y * 2;
			var leftPoint;
			var rightPoint;

			// Account for the fall direction
			switch (_fallDirection) {
			case Block.prototype.DOWNWARD:
				leftPoint = { x: 0, y: maxY }
				rightPoint = { x: maxX, y: maxY }
				break;
			case Block.prototype.LEFTWARD:
				leftPoint = { x: 0, y: 0 }
				rightPoint = { x: 0, y: maxY }
				break;
			case Block.prototype.UPWARD:
				leftPoint = { x: maxX, y: 0 }
				rightPoint = { x: 0, y: 0 }
				break;
			case Block.prototype.RIGHTWARD:
				leftPoint = { x: maxX, y: maxY }
				rightPoint = { x: maxX, y: 0 }
				break;
			default:
				return;
			}

			// Translate from block cell space to game-area pixel space
			leftPoint.x = (leftPoint.x * _squareSize) + _positionPixels.x;
			leftPoint.y = (leftPoint.y * _squareSize) + _positionPixels.y;
			rightPoint.x = (rightPoint.x * _squareSize) + _positionPixels.x;
			rightPoint.y = (rightPoint.y * _squareSize) + _positionPixels.y;

			return { left: leftPoint, right: rightPoint };
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.rotate = _rotate;
		this.switchFallDirection = _switchFallDirection;
		this.update = _update;
		this.draw = _draw;
		this.addSquaresToGameArea = _addSquaresToGameArea;
		this.getSquareCellPositions = _getSquareCellPositions;
		this.getFarthestLeftCellAvailable = _getFarthestLeftCellAvailable;
		this.getFarthestRightCellAvailable = _getFarthestRightCellAvailable;
		this.getFarthestDownwardCellAvailable = _getFarthestDownwardCellAvailable;
		this.setCellPosition = _setCellPosition;
		this.getHasCollidedWithEdgeOfArea = _getHasCollidedWithEdgeOfArea;
		this.getHasCollidedWithSquare = _getHasCollidedWithSquare;
		this.checkIsOverTopSquare = _checkIsOverTopSquare;
		this.checkForCollisionWithSquare = _checkForCollisionWithSquare;
		this.getType = _getType;
		this.getOrientation = _getOrientation;
		this.getFallDirection = _getFallDirection;
		this.getCenter = _getCenter;
		this.getPolygon = _getPolygon;
		this.getSidePointsRelativeToBlockPosition = _getSidePointsRelativeToBlockPosition;
		this.getLowerLeftAndRightFallDirectionPoints = _getLowerLeftAndRightFallDirectionPoints;

		log.d("<--block.Block");
	};

	// --------------------------------------------------------------------- //
	// -- Private static members

	// Return an array of point objects which represent the all of the points 
	// along the given outer face of the given block.
	// NOTE: the given side is taken into consideration AFTER rotating 
	//		 according to the given orientation.
	function _getPointsAlongSideRelativeToBlockPosition(type, orientation, side) {
		if (side !== Block.prototype.ALL_SIDES) {
			// Correct for the given orientation and account for ALL_SIDES being at index 0
			side = (((side - 1) - orientation) % side) + 1;
		}

		points = _DEFAULT_SIDE_CELL_POSITIONS[type][side];

		// Correct for the given orientation
		points = _rotatePoints(points, orientation, Block.prototype.IGNORE);

		return points;
	}

	// Return an array of position objects which represent the positions 
	// of this block's constituent squares relative to this block's 
	// position.
	function _getSquareCellPositionsRelativeToBlockPosition(type, orientation) {
		// Get the constituent square positions for the default orientation
		var points = _DEFAULT_SQUARE_CELL_POSITIONS[type];

		points = _rotatePoints(points, orientation, type);

		return points;
	}

	// NOTE: oldPoints needs to be non-null and non-empty
	// NOTE: numberOfRotations can range from 0 to 3
	function _rotatePoints(oldPoints, numberOfRotations, type) {
		var newPoints = window.utils.copyArray(oldPoints);

		// Don't do anything if we are rotating the block 0 times
		// The blue block is 90-degrees rotationally symmetric
		if (numberOfRotations > 0 && type !== Block.prototype.BLUE) {
			var max;

			// Rotate the points
			switch (numberOfRotations) {
			case 1:
				newPoints = window.utils.initializeArray(newPoints.length, { x: 0, y: 0 });
				max = _findMaxCoords(newPoints);
				for (var i = 0; i < newPoints.length; ++i) {
					newPoints[i].x = max.y - newPoints[i].y;
					newPoints[i].y = newPoints[i].x;
				}
				break;
			case 2:
				// Some of the blocks 180-degrees rotationally symmetric
				if (type !== Block.prototype.RED && type !== Block.prototype.GREEN && type !== Block.prototype.ORANGE) {
					newPoints = window.utils.initializeArray(newPoints.length, { x: 0, y: 0 });
					max = _findMaxCoords(newPoints);
					for (var i = 0; i < newPoints.length; ++i) {
						newPoints[i].x = max.x - newPoints[i].x;
						newPoints[i].y = max.y - newPoints[i].y;
					}
				}
				break;
			case 3:
				newPoints = window.utils.initializeArray(newPoints.length, { x: 0, y: 0 });
				max = _findMaxCoords(newPoints);
				for (var i = 0; i < newPoints.length; ++i) {
					newPoints[i].x = newPoints[i].y;
					newPoints[i].y = max.x - newPoints[i].x;
				}
				break;
			default:
				return;
			}
		}

		return newPoints;
	}

	function _findMaxCoords(points) {
		var maxX = points[0].x;
		var maxY = points[0].y;

		for (var i = 1; i < points.length; ++i) {
			if (points[i].x > maxX) {
				maxX = points[i].x;
			}
			if (points[i].y > maxY) {
				maxY = points[i].y;
			}
		}

		return { x: maxX, y: maxY }
	}

	function _positionToIndex(position) {
		return (position.y * _gameAreaCellSize) + position.x;
	}

	function _positionsToIndices(positions) {
		var indices = new Array();

		for (var i = 0; i < positions.length; ++i) {
			indices[i] = _positionToIndex(positions[i]);
		}

		return indices;
	}

	function _computeCenterSquareCellPosition() {
		_centerSquareCellPositionX = Math.floor((_gameAreaCellSize - _centerSquareCellSize) / 2);
	}

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) static members

	// Block inherits from Sprite
	Block.prototype = window.utils.object(Sprite);

	// Block types/colors
	Block.prototype.IGNORE = -1;
	Block.prototype.RED = 0; // S-shaped block
	Block.prototype.GREEN = 1; // Z-shaped block
	Block.prototype.PURPLE = 2; // L-shaped block
	Block.prototype.YELLOW = 3; // J-shaped block
	Block.prototype.BLUE = 4; // Square-shaped block
	Block.prototype.ORANGE = 5; // Line-shaped block (defaults to vertical orientation)
	Block.prototype.GREY = 6; // T-shaped block

	// Orientations
	Block.prototype.DEG0 = 0;
	Block.prototype.DEG90 = 1;
	Block.prototype.DEG180 = 2;
	Block.prototype.DEG270 = 3;

	// Fall directions
	Block.prototype.DOWNWARD = 0;
	Block.prototype.LEFTWARD = 1;
	Block.prototype.UPWARD = 2;
	Block.prototype.RIGHTWARD = 3;

	// Block sides
	Block.prototype.ALL_SIDES = 0;
	Block.prototype.TOP_SIDE = 1;
	Block.prototype.RIGHT_SIDE = 2;
	Block.prototype.BOTTOM_SIDE = 3;
	Block.prototype.LEFT_SIDE = 4;

	// This should be called once at the start of the program
	Block.prototype.setSquareSize = function(size) {
		_squareSize = size;
	};

	Block.prototype.getSquareSize = function() {
		return _squareSize;
	};

	Block.prototype.setGameAreaCellSize = function(size) {
		_gameAreaCellSize = size;

		_computeCenterSquareCellPosition();
	};

	Block.prototype.setCenterSquareCellSize = function(size) {
		_centerSquareCellSize = size;

		_computeCenterSquareCellPosition();
	};

	Block.prototype.setFallSpeed = function(fallSpeed) {
		_fallPeriod = 1 / fallSpeed;
	};

	Block.prototype.drawSquare = function(context, squareType, x, y) {
		if (squareType >= 0) {
			var sourceY = squareType * _SOURCE_SQUARE_SIZE;

			context.drawImage(resources.get("img/sprites.png"), 
					0, sourceY, 
					_SOURCE_SQUARE_SIZE, _SOURCE_SQUARE_SIZE, 
					x, y, 
					_squareSize, _squareSize);
		}
	};

	Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter = function(blockType, orientation) {
		var x = 0;
		var y = 0;

		switch (blockType) {
		case Block.prototype.RED: // S-shaped block
			x = 1.5;
			y = 1;
			break;
		case Block.prototype.GREEN: // Z-shaped block
			x = 1.5;
			y = 1;
			break;
		case Block.prototype.PURPLE: // L-shaped block
			x = 1;
			y = 1.5;
			break;
		case Block.prototype.YELLOW: // J-shaped block
			x = 1;
			y = 1.5;
			break;
		case Block.prototype.BLUE: // Square-shaped block
			x = 1;
			y = 1;
			break;
		case Block.prototype.ORANGE: // Line-shaped block
			x = 0.5;
			y = 2;
			break;
		case Block.prototype.GREY: // T-shaped block
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

	log.d("<--block.LOADING_MODULE");
})();
