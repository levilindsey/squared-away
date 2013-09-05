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
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->sprite.LOADING_MODULE");

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

		function _drawSprite(context) {
			context.drawImage(resources.get(_url), 
					_currentSourceX, _sourceRect.y, 
					_sourceRect.width, _sourceRect.height, 
					canvasRect.x, canvasRect.y);
		}

		// TODO: 
		function _updateSprite(currentTime) {
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
		}

		function _setURL(url) {
			_url = url;
		}

		function _setSourceRect(x, y, width, height) {
			_sourceRect.x = x;
			_sourceRect.y = y;
			_sourceRect.width = width;
			_sourceRect.height = height;
		}

		function _setLoopFrameAnimation(loopFrameAnimation) {
			_loopFrameAnimation = loopFrameAnimation;
		}

		function _setAnimatingFrames(animatingFrames) {
			_animatingFrames = animatingFrames;
		}

		function _setFrameAnimationPeriod(frameAnimationPeriod) {
			_frameAnimationPeriod = frameAnimationPeriod;
		}

		function _setFrameAnimationStartTime(frameAnimationStartTime) {
			_frameAnimationStartTime = frameAnimationStartTime;
		}

		function _setFrames(frames) {
			_frames = frames;
		}

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
	}

	Sprite.prototype = {
		// ----------------------------------------------------------------- //
		// -- Public members

		canvasRect: { x: 0, y: 0, width: 0, height: 0 }
	};

	// Make Sprite available to the rest of the program
	window.Sprite = Sprite;

	log.i("<--sprite.LOADING_MODULE");
})();
