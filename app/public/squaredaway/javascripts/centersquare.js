// ------------------------------------------------------------------------- //
// -- window.CenterSquare
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// Dependencies:
//    - window.log
//    - window.Sprite
//    - utils
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->centersquare.LOADING_MODULE');

  // --------------------------------------------------------------------- //
  // -- Private, static members

  var _STROKE_WIDTH = 2; // pixels

  var _SETTLE_BOMB_SHAKE_PERIOD = 800; // millis
  var _SETTLE_BOMB_SHAKE_SUB_PERIOD = 40; // millis

  function CenterSquare() {
    log.d('-->centersquare.CenterSquare');

    // ----------------------------------------------------------------- //
    // -- Private members

    var _x = 0; // in pixels
    var _size = 0; // in pixels

    var _timeSinceLastColor = 0;
    var _timeSinceLastSettleBomb = _SETTLE_BOMB_SHAKE_PERIOD;
    var _timeSinceLastSettleBombSubPeriod = 0;

    var _prev2ColorIndex = 0;

    var _prevColorIndex = 0;
    var _nextColorIndex = 0;

    var _currentColorPeriod = 9000;
    var _currentFillColor = '#000000';
    var _currentStrokeColor = '#000000';

    function _update(deltaTime) {
      _timeSinceLastColor += deltaTime;
      _timeSinceLastSettleBomb += deltaTime;
      _timeSinceLastSettleBombSubPeriod += deltaTime;

      if (_timeSinceLastColor > _currentColorPeriod) {
        _timeSinceLastColor %= _currentColorPeriod;

        _prev2ColorIndex = _prevColorIndex;
        _prevColorIndex = _nextColorIndex;
        do {
          _nextColorIndex = Math.floor(Math.random() * 7);
        } while (_nextColorIndex === _prevColorIndex || 
            _nextColorIndex === _prev2ColorIndex);
      }

      var progressThroughCurrentColors = _timeSinceLastColor / _currentColorPeriod;

      _currentFillColor = utils.interpolateColors(game.MEDIUM_COLORS[_prevColorIndex], game.MEDIUM_COLORS[_nextColorIndex], progressThroughCurrentColors);
      _currentStrokeColor = utils.interpolateColors(game.LIGHT_COLORS[_prevColorIndex], game.LIGHT_COLORS[_nextColorIndex], progressThroughCurrentColors);
    }

    // Draw the square in the center of the game area.  Also, slowly cycle 
    // through the colors.
    function _draw(context) {
      var x = _x;
      var y = _x;

      // Check whether we should be currently animating for a settle bomb
      if (_timeSinceLastSettleBomb < _SETTLE_BOMB_SHAKE_PERIOD) {
        // Check whether the animation is ready for its next 'shake'
        if (_timeSinceLastSettleBombSubPeriod >= _SETTLE_BOMB_SHAKE_SUB_PERIOD) {
          _timeSinceLastSettleBombSubPeriod %= _SETTLE_BOMB_SHAKE_SUB_PERIOD;

          var radius = gameWindow.squarePixelSize * 0.85;

          x = x - radius + (Math.random() * radius * 2);
          y = y - radius + (Math.random() * radius * 2);
        }
      }

      // Draw the background and the border
      context.beginPath();
      context.lineWidth = _STROKE_WIDTH;
      context.fillStyle = _currentFillColor;
      context.strokeStyle = _currentStrokeColor;
      context.rect(x, y, _size, _size);
      context.fill();
      context.stroke();
    }

    function _animateSettleBomb() {
      _timeSinceLastSettleBomb = 0;
      _timeSinceLastSettleBombSubPeriod = _SETTLE_BOMB_SHAKE_SUB_PERIOD;
    }

    function _setColorPeriod(currentColorPeriod) {
      _currentColorPeriod = currentColorPeriod;
    }

    function _setDimensions(x, size) {
      _x = x;
      _size = size;
    }

    // ----------------------------------------------------------------- //
    // -- Privileged members

    this.update = _update;
    this.draw = _draw;
    this.setColorPeriod = _setColorPeriod;
    this.setDimensions = _setDimensions;
    this.animateSettleBomb = _animateSettleBomb;

    log.d('<--centersquare.CenterSquare');
  }

  // Make CenterSquare available to the rest of the program
  window.CenterSquare = CenterSquare;

  log.i('<--centersquare.LOADING_MODULE');
}());
