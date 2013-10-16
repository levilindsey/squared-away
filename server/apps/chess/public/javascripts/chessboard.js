// This file creates a convenience object for representing the pieces stored 
// on the chess board. This allows for all positions to be referenced 
// according to their string representations (e.g., 'C6').
(function() {
  'use strict';

  var CHAR_CODE_A = 'A'.charCodeAt(0);

  var board = {
    arr: null,

    init: function() {
      board.arr = [];
      board.arr.length = 64;
    },

    // Can take either a single param as a pos str, or two as a row and col
    get: function(posStrOrRow, col) {
      var index;
      if (typeof col === 'undefined') {
        index = board.posStringToIndex(posStrOrRow);
      } else {
        index = posStrOrRow * 8 + col;
      }
      return board.arr[index];
    },

    set: function(posStr, chessPiece) {
      var index = board.posStringToIndex(posStr);
      board.arr[index] = chessPiece;
    },

    isWhiteSquare: function(posStr) {
      var colIsEven = (posStr.charCodeAt(0) - CHAR_CODE_A) % 2 === 0;
      var rowIsEven = (parseInt(posStr.substr(1, 1), 10) - 1) % 2 === 0;
      return colIsEven !== rowIsEven;
    },

    posStringToRowCol: function(posStr) {
      return {
        row: 8 - parseInt(posStr.substr(1, 1), 10),
        col: posStr.charCodeAt(0) - CHAR_CODE_A
      };
    },

    rowColToPosString: function(row, col) {
      return String.fromCharCode(CHAR_CODE_A + col) + (8 - row);
    },

    posStringToIndex: function(posStr) {
      var rowCol = board.posStringToRowCol(posStr);
      return rowCol.row * 8 + rowCol.col;
    },

    indexToPosString: function(index) {
      var row = Math.floor(index / 8);
      var col = index % 8;
      return board.rowColToPosString(row, col);
    }
  };

  // Make this object available outside of this module.
  if (!window.chess)
    window.chess = {};
  window.chess.board = board;
}());