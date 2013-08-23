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
		_canvas = canvas;
		_context = _canvas.getContext("2d");
		
		this.init = _init;
		// TODO: 
	};

	Game.prototype = {
		// TODO: 
	};

	// Make Game available to the rest of the program
	window.Game = Game;

	var _canvas;
	var _context;
	var _prevTime;
	var _blocksOnMap;

	// Finishing setting up game logic
	function _init() {
		// TODO: 
	}

	// Start playing a new game
	function startGame(squareMode, canSwitchDirections, startingLevel) {
		// TODO: 
	}

	// A cross-browser compatible requestAnimationFrame. From
	// https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
	var myRequestAnimationFrame = 
		window.requestAnimationFrame || // the standard
		window.webkitRequestAnimationFrame || // chrome/safari
		window.mozRequestAnimationFrame || // firefox
		window.oRequestAnimationFrame || // opera
		window.msRequestAnimationFrame || // ie
		function(callback) { // default
			window.setTimeout(callback, 16); // 60fps
		};

	// The game loop drives the progression of frames and game logic
	function gameLoop() {
		// Get the timing of the current frame
		var currTime = Date.now();
		var deltaTime = currTime - prevTime;

		// Update the game state for the current frame
		update(deltaTime);
		draw();

		// Go to the next frame
		prevTime = currTime;
		myRequestAnimationFrame(main);
	};

	// TODO: 
	function draw() {
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
	function update() {
		// TODO: 
	}
})();
