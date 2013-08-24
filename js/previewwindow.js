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
	function PreviewWindow(x, y, size) {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _position = { x: x, y: y }; // in pixels
		var _size = size; // in pixels

		var _baseCoolDownPeriod = 100000; // 10 sec
		var _actualCoolDownPeriod = 100000; // 10 sec
		var _elapsedTime = 0;
		var _currentBlock = null;

		// TODO: 
		var _update = function(deltaTime) {
			_elapsedTime += deltaTime;

			// TODO: 
		};

		// TODO: 
		var _draw = function(context) {
			// TODO: 
		};

		// TODO: 
		var _startNewBlock = function() {
			// Change the current block to be a new block of some random type 
			// (from 1 to 7)
			// TODO: 

			// Compute a new (random) cool-down period to use, which is based off of _baseCoolDownPeriod
			_elapsedTime = 0;
			// TODO: 
		};

		// Set the base cool-down period to be the given time (in millis).
		var _setCoolDownPeriod = function(period) {
			_baseCoolDownPeriod = period;
		};

		// TODO: 
		var _getCurrentBlock = function() {
			return _currentBlock;
		};

		// TODO: 
		var _isCoolDownFinished = function() {
			// TODO: 
		};

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.startNewBlock = _startNewBlock;
		this.setCoolDownPeriod = _setCoolDownPeriod;
		this.getCurrentBlock = _getCurrentBlock;
		this.isCoolDownFinished = _isCoolDownFinished;
		this.update = _update;
		this.draw = _draw;

		// TODO: 
	};

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) members

	// PreviewWindow inherits from Sprite
	PreviewWindow.prototype = window.utils.object(Sprite);

	// Make PreviewWindow available to the rest of the program
	window.PreviewWindow = PreviewWindow;
})();
