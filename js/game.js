// ------------------------------------------------------------------------- //
// -- window.Game
// ------------------------------------------------------------------------- //
// For use with the Squared web app.
// 
// All of the overall Game logic is encapsulated in this anonymous function.  
// This is then stored in the window.Game property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.Sprite
//		- window.Block
//		- window.PreviewWindow
//		- window.GameWindow
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	function Game(canvas) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _canvas = canvas;
		var _context = _canvas.getContext("2d");

		var _prevTime = // TODO; ;
		var _blocksOnMap = // TODO: ;

		// Finishing setting up game logic
		var _init = function() {
			// TODO: 
		}

		// Set up a new game
		var _setUpNewGame = function(squareMode, canSwitchDirections, startingLevel) {
			// TODO: 
		}

		var _play = function() {
			// TODO: unpause basically
		}

		var _pause = function() {
			// TODO: (display a slightly transparent grey rectangle over the whole play area (ACTUALLY, don't. main will do that))
		}
		
		var _end = function() {
			// TODO: (show a game over message, show a restart button, leave the old game state on the play area, grey everything out like with pause, ...)
		}

		// The game loop drives the progression of frames and game logic
		function gameLoop() {
			// Get the timing of the current frame
			var currTime = Date.now();
			var deltaTime = currTime - _prevTime;

			// Update the game state for the current frame
			_update(deltaTime);
			_draw();

			// Go to the next frame
			_prevTime = currTime;
			window.utils.myRequestAnimationFrame(main);
		};

		// TODO: 
		function _draw() {
			// Clean the canvas
			context.clearRect(_canvas.width, _canvas.height);

			// Draw each of the falling blocks
			// TODO: 

			// Draw each of the stationary squares
			// TODO: 

			// Check whether a block is selected
			if () {
				// Draw horizontal and vertical guide lines
				// TODO: 

				// Draw an enlarged version of the selected block
				// TODO: (this should include a light-neon-blue border (i.e., a slightly larger programmatical rectangle rendered behind each of the block's foreground squares))
			}

			// Check whether there are currently any disintigrating sections
			if () {
				// Draw the disintigrating sections
				// TODO: ?????
			}
		}

		// TODO: 
		function _update() {
			// TODO: 
		}

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.init = _init;
		// TODO: 
		//		- set up each of the preview windows (create initial blocks, set up their cooldowns, etc.)
		//		- 
	};

	Game.prototype = {
		// TODO: 
	};

	// Make Game available to the rest of the program
	window.Game = Game;
})();
