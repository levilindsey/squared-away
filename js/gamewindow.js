// ------------------------------------------------------------------------- //
// -- window.GameWindow
// ------------------------------------------------------------------------- //
// For use with the Squared web app.
// 
// All of the GameWindow logic is encapsulated in this anonymous function.  
// This is then stored in the window.GameWindow property.  This has the effect 
// of minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.Sprite
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	function GameWindow(width, height) {
		// TODO: 
	};

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) members

	// GameWindow inherits from Sprite
	GameWindow.prototype = window.utils.object(Sprite);

	// This should be called once at the start of the program
	GameWindow.prototype.setMapDimensions = function(mapWidth, mapHeight) {
		_mapWidth = mapWidth;
		_mapHeight = mapHeight;
	};

	// Make GameWindow available to the rest of the program
	window.GameWindow = GameWindow;
})();
