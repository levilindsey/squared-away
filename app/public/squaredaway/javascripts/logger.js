// ------------------------------------------------------------------------- //
// -- window.log
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// Dependencies:
//    - <none>
// ------------------------------------------------------------------------- //

var DEBUG = false;

(function() {
  'use strict';

  // ----------------------------------------------------------------- //
  // -- Private static members

  var _INFO_FOREGROUND = '#84ceff';
  var _DEBUG_FOREGROUND = '#b2ffaa';
  var _WARNING_FOREGROUND = '#ffff9c';
  var _ERROR_FOREGROUND = '#ffaeae';

  var _INFO_BACKGROUND = '#21333f';
  var _DEBUG_BACKGROUND = '#2c3f2a';
  var _WARNING_BACKGROUND = '#3f3f27';
  var _ERROR_BACKGROUND = '#3f2b2b';

  // Constructor
  function Logger(consoleElement) {
    // ----------------------------------------------------------------- //
    // -- Private members

    var _consoleElement = consoleElement;

    function _i(msg) {
      _writeLine(msg, 'I', _INFO_FOREGROUND, _INFO_BACKGROUND);
    }

    function _d(msg) {
      if (DEBUG) {
        _writeLine(msg, 'D', _DEBUG_FOREGROUND, _DEBUG_BACKGROUND);
      }
    }

    function _w(msg) {
      _writeLine(msg, 'W', _WARNING_FOREGROUND, _WARNING_BACKGROUND);
    }

    function _e(msg) {
      Logger.prototype.getConsole().style.display = 'block';
      _writeLine(msg, 'E', _ERROR_FOREGROUND, _ERROR_BACKGROUND);
    }

    function _writeLine(msg, prefix, foreground, background) {
      var timestamp = Date.now();

      // Create the full log message
      msg = [prefix, msg, timestamp].join('; ');

      // Style the message
      var msgSpan = document.createElement('span');
      msgSpan.style.color = foreground;
      msgSpan.style.backgroundColor = background;
      msgSpan.style.fontFamily = 'monospace';
      
      var br = document.createElement('br');

      // Add the message to the DOM
      var msgTextNode = document.createTextNode(msg);
      msgSpan.appendChild(msgTextNode);
      _consoleElement.appendChild(msgSpan);
      _consoleElement.appendChild(br);
    }

    // ----------------------------------------------------------------- //
    // -- Privileged members

    this.i = _i;
    this.d = _d;
    this.w = _w;
    this.e = _e;
  }

  var _CONSOLE_ELEMENT = document.getElementById('console');

  Logger.prototype = {
    // ----------------------------------------------------------------- //
    // -- Public members

    getConsole: function() {
      return _CONSOLE_ELEMENT;
    }
  };

  // Make Logger available to the rest of the program
  window.Logger = Logger;

  window.log = new Logger(_CONSOLE_ELEMENT);

  log.i('<--logger.LOADING_MODULE');
}());
