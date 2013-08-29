// ------------------------------------------------------------------------- //
// -- window.Sprite
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the Sprite logic is encapsulated in this anonymous function.  This is 
// then stored in the window.Sprite property.  This has the effect of minimizing 
// side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.log
//		- window.utils
// ------------------------------------------------------------------------- //

if (DEBUG) {
	log.d("--> sprite.js: LOADING");
}

(function() {
	// Constructor
	function Sprite() {
		// ----------------------------------------------------------------- //
		// -- Private members

		var _url = null;
		var _sourceRect = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
		var _frames = [0];
		var _frameAnimationPeriod = 125;
		var _frameAnimationStartTime = 0;
		var _loopFrameAnimation = false;
		var _animatingFrames = false;
		var _currentSourceX = _sourceRect.x;

		var _drawSprite = function(context) {
			context.drawImage(resources.get(_url), 
					_currentSourceX, _sourceRect.y, 
					_sourceRect.width, _sourceRect.height, 
					canvasRect.x, canvasRect.y);
		};

		// TODO: 
		var _updateSprite = function(currentTime) {
			// Check whether we are currently animating through this sprite's 
			// multiple frames
			if (_animatingFrames) {
				var deltaTime = currentTime - _frameAnimationStartTime;
				var frameIndex = Math.floor(deltaTime / _frameAnimationPeriod);
				
				// Check
				if (frameIndex >= _frames.length) {
					// If this sprite's frame animation is set up to loop, 
					// then loop!
					if (_loopFrameAnimation) {
						frameIndex %= _frames.length;
					} else {
						_animatingFrames = false;
						_currentSourceX = _sourceRect.x;
						return;
					}

					var currentFrame = _frames[frameIndex];
					_currentSourceX = currentFrame * _sourceRect.width;
				}
			} else {
				_currentSourceX = _sourceRect.x;
			}
		};

		var _setURL = function(url) {
			_url = url;
		};

		var _setSourceRect = function(x, y, width, height) {
			_sourceRect.x = x;
			_sourceRect.y = y;
			_sourceRect.width = width;
			_sourceRect.height = height;
		};

		var _setLoopFrameAnimation = function(loopFrameAnimation) {
			_loopFrameAnimation = loopFrameAnimation;
		};

		var _setAnimatingFrames = function(animatingFrames) {
			_animatingFrames = animatingFrames;
		};

		var _setFrameAnimationPeriod = function(frameAnimationPeriod) {
			_frameAnimationPeriod = frameAnimationPeriod;
		};

		var _setFrameAnimationStartTime = function(frameAnimationStartTime) {
			_frameAnimationStartTime = frameAnimationStartTime;
		};

		var _setFrames = function(frames) {
			_frames = frames;
		};

		// ----------------------------------------------------------------- //
		// -- Privileged members

		this.drawFromSource = _drawFromSource;
		this.update = _update;
		this.setURL = _setURL;
		this.setSourceRect = _setSourceRect;
		this.setLoopFrameAnimation = _setLoopFrameAnimation;
		this.setAnimatingFrames = _setAnimatingFrames;
		this.setFrameAnimationPeriod = _setFrameAnimationPeriod;
		this.setFrameAnimationStartTime = _setFrameAnimationStartTime;
		this.setFrames = _setFrames;
	};

	Sprite.prototype = {
		// ----------------------------------------------------------------- //
		// -- Public members

		canvasRect: { x: 0, y: 0, width: 0, height: 0 }
	};

	// Make Sprite available to the rest of the program
	window.Sprite = Sprite;
})();

if (DEBUG) {
	log.d("<-- sprite.js: LOADING");
}
