// ------------------------------------------------------------------------- //
// -- utils
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// Dependencies:
//    - <none>
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->utils.LOADING_MODULE');

  // Return a new object which whose prototype is the given old object.
  function _object(o) {
    function F() {}
    F.prototype = o;
    return new F();
  }

  function _getElementWidth(element) {
    if (typeof element.clip !== 'undefined') {
      return element.clip.width;
    } else if (element.style.pixelWidth) {
      return element.style.pixelWidth;
    } else {
      return element.offsetWidth;
    }
  }

  function _getElementHeight(element) {
    if (typeof element.clip !== 'undefined') {
      return element.clip.height;
    } else if (element.style.pixelHeight) {
      return element.style.pixelHeight;
    } else {
      return element.offsetHeight;
    }
  }

  function _translateKeyCode(keyCode) {
        var key;

        switch(keyCode) {
        case 32: key = 'SPACE'; break;
        case 37: key = 'LEFT'; break;
        case 38: key = 'UP'; break;
        case 39: key = 'RIGHT'; break;
        case 40: key = 'DOWN'; break;
        case  8: key = 'BACKSPACE'; break;
        case  9: key = 'TAB'; break;
        case 13: key = 'ENTER'; break;
        case 16: key = 'SHIFT'; break;
        case 17: key = 'CTRL'; break;
        case 18: key = 'ALT'; break;
        case 27: key = 'ESCAPE'; break;
        case 46: key = 'DELETE'; break;
        default: key = String.fromCharCode(keyCode).toUpperCase(); break;
        }

    return key;
  }

  function _initializeArray(length, initialValue) {
    var array = [];

    for (var i = 0; i < length; ++i) {
      array[i] = initialValue;
    }

    return array;
  }

  function _copyArray(oldArray) {
    var newArray = [];

    for (var i = 0; i < oldArray.length; ++i) {
      newArray.push(oldArray[i]);
    }

    return newArray;
  }

  function _getHourMinSecTime(millis) {
    var hours = Math.floor(millis / (1000 * 60 * 60));
    hours = hours.toString();
    if (hours.length < 2) {
      hours = '0' + hours;
    }

    var minutes = Math.floor(millis / (1000 * 60)) % 60;
    minutes = minutes.toString();
    if (minutes.length < 2) {
      minutes = '0' + minutes;
    }

    var seconds = Math.floor(millis / 1000) % 60;
    seconds = seconds.toString();
    if (seconds.length < 2) {
      seconds = '0' + seconds;
    }

    millis = millis % 1000;
    millis = hours.toString();
    while (millis.length < 3) {
      millis = '0' + millis;
    }

    return hours + ':' + minutes + ':' + seconds;
  }

  // Return the current mouse event with the pageX and pageY properties 
  // added.  This fixes some cross-compatibility issues with IE.
  function _standardizeMouseEvent(event) {
    event = event || window.event; // account for IE
    if (typeof event.pageX === 'undefined') { // account for IE
      event.pageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      event.pageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return event;
  }

  function _standardizeClientRect(element) {
    var rect = element.getBoundingClientRect();

    return {
      left: rect.left + document.body.scrollLeft + document.documentElement.scrollLeft,
      top: rect.top + document.body.scrollTop + document.documentElement.scrollTop,
      width: rect.width,
      height: rect.height
    };
  }

  function _getLinGrowthValue(initial, rate, time) {
    return initial * (1 + rate * (time - 1));
  }

  function _getExpGrowthValue(initial, rate, time) {
    return initial * Math.pow((1 + rate), time);
  }

  function _getSquaredDistance(pos1, pos2) {
    var deltaX = pos1.x - pos2.x;
    var deltaY = pos1.y - pos2.y;
    return deltaX * deltaX + deltaY * deltaY;
  }

  function _interpolateColors(prevColorRGB, nextColorRGB, progressThroughCurrentColors) {
    var oneMinusProgress = 1 - progressThroughCurrentColors;

    var r = (prevColorRGB.r * oneMinusProgress) + (nextColorRGB.r * progressThroughCurrentColors);
    r = Math.min(r, 255);
    r = Math.floor(r);
    r = r.toString(16);
    if (r.length < 2) {
      r = '0' + r;
    }

    var g = (prevColorRGB.g * oneMinusProgress) + (nextColorRGB.g * progressThroughCurrentColors);
    g = Math.min(g, 255);
    g = Math.floor(g);
    g = g.toString(16);
    if (g.length < 2) {
      g = '0' + g;
    }

    var b = (prevColorRGB.b * oneMinusProgress) + (nextColorRGB.b * progressThroughCurrentColors);
    b = Math.min(b, 255);
    b = Math.floor(b);
    b = b.toString(16);
    if (b.length < 2) {
      b = '0' + b;
    }

    return '#' + r + g + b;
  }

  function _decToHexColorStr(decColor) {
    var r = decColor.r.toString(16);
    if (r.length < 2) {
      r = '0' + r;
    }
    var g = decColor.g.toString(16);
    if (g.length < 2) {
      g = '0' + g;
    }
    var b = decColor.b.toString(16);
    if (b.length < 2) {
      b = '0' + b;
    }
    return '#' + r + g + b;
  }

  function _getIntersection(arr1, arr2) {
    var intersection = [];
    var k = 0;
    var i;
    var j;

    outerLoop:
    for (i = 0; i < arr1.length; ++i) {
      innerLoop:
      for (j = 0; j < arr2.length; ++j) {
        if (arr1[i] === arr2[j]) {
          intersection[k] = arr1[i];
          ++k;
          continue outerLoop;
        }
      }
    }

    return intersection;
  }

  function _getDifference(arr1, arr2) {
    var difference = utils.copyArray(arr1);
    var k;
    var i;
    var j;

    outerLoop:
    for (i = 0, k = 0; i < arr1.length; ++i, ++k) {
      innerLoop:
      for (j = 0; j < arr2.length; ++j) {
        if (arr1[i] === arr2[j]) {
          difference.splice(k, 1);
          --k;
          continue outerLoop;
        }
      }
    }

    return difference;
  }

  function _setRect(elem, x, y, w, h) {
    elem.style.left = x + 'px';
    elem.style.top = y + 'px';
    elem.style.width = w + 'px';
    elem.style.height = h + 'px';
  }

  // Make utils available to the rest of the program
  window.utils = {
    object: _object,

    initializeArray: _initializeArray,
    copyArray: _copyArray,

    getElementWidth: _getElementWidth,
    getElementHeight: _getElementHeight,

    translateKeyCode: _translateKeyCode,

    getHourMinSecTime: _getHourMinSecTime,

    getLinGrowthValue: _getLinGrowthValue,
    getExpGrowthValue: _getExpGrowthValue,

    standardizeMouseEvent: _standardizeMouseEvent,
    standardizeClientRect: _standardizeClientRect,

    getSquaredDistance: _getSquaredDistance,

    interpolateColors: _interpolateColors,
    decToHexColorStr: _decToHexColorStr,

    getIntersection: _getIntersection,
    getDifference: _getDifference,

    setRect: _setRect
  };

  log.i('<--utils.LOADING_MODULE');
}());
