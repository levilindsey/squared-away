// DEPENDS ON:
//    - chessboard.js

// This file specifies the movement logic for each of the different types of 
// chess pieces. This file also provides a function for creating objects to 
// represent each instance of the chess pieces.
(function() {
  'use strict';

  var CHAR_CODE_A = 'A'.charCodeAt(0);

  var IMAGES_DIR = '/chess/images/';
  var EXTENSION = '.png';

  // This object stores the move logic for each of the different types of 
  // chess pieces. Each property key is the name of a type of piece. Each 
  // property value is a function that accepts parameters describing a 
  // hypothetical move, and returns an object describing the result of that 
  // move.
  var CHESS_PIECES_MOVE_LOGIC = {
    // TODO: refactor this to condense and re-use similar code blocks
    pawn: function(oldPos, newPos, board, isWhite, previousMove, 
                   hasMovedYet) {
      var result = {};

      var newPosPiece = board.get(newPos);

      // Cannot move to a position occupied by a piece of the same color
      if (!newPosPiece || newPosPiece.isWhite !== isWhite) {
        var oldIndex = board.posStringToIndex(oldPos);
        var oldRowCol = board.posStringToRowCol(oldPos);
        var newRowCol = board.posStringToRowCol(newPos);

        // Handle advancing one square
        if (!newPosPiece && 
            newRowCol.col === oldRowCol.col && 
            ((isWhite && 
                newRowCol.row === oldRowCol.row - 1) || 
              (!isWhite && 
                  newRowCol.row === oldRowCol.row + 1))) {
          result.movements = [{
            piece: board.arr[oldIndex],
            oldPos: oldPos,
            newPos: newPos
          }];
        }

        // Handle advancing two squares as the first move
        else if (!hasMovedYet && 
                 !newPosPiece && 
                 newRowCol.col === oldRowCol.col && 
                 ((isWhite && 
                      newRowCol.row === oldRowCol.row - 2 && 
                      !board.arr[oldIndex - 8]) || 
                    (!isWhite && 
                        newRowCol.row === oldRowCol.row + 2 && 
                        !board.arr[oldIndex + 8]))) {
          result.movements = [{
            piece: board.arr[oldIndex],
            oldPos: oldPos,
            newPos: newPos
          }];
        }

        // Handle moving diagonally forward as a direct take
        else if (newPosPiece && 
                 ((isWhite && 
                      newRowCol.row === oldRowCol.row - 1 && 
                      newRowCol.col === oldRowCol.col - 1) || 
                    (isWhite && 
                        newRowCol.row === oldRowCol.row - 1 && 
                        newRowCol.col === oldRowCol.col + 1) || 
                    (!isWhite && 
                        newRowCol.row === oldRowCol.row + 1 && 
                        newRowCol.col === oldRowCol.col + 1) || 
                    (!isWhite && 
                        newRowCol.row === oldRowCol.row + 1 && 
                        newRowCol.col === oldRowCol.col - 1))) {
          result.movements = [{
            piece: board.arr[oldIndex],
            oldPos: oldPos,
            newPos: newPos
          }];
          result.takenPiece = newPosPiece;
        }

        // Handle moving diagonally forward as taking en passant
        else if (!newPosPiece && 
                 previousMove && 
                 previousMove.movements && 
                 previousMove.movements[0].piece.type === 'pawn') {
          var prevMoveOldPosRowCol = 
              board.posStringToRowCol(previousMove.movements[0].oldPos);
          var prevMoveNewPosRowCol = 
              board.posStringToRowCol(previousMove.movements[0].newPos);

          // Was the previous move a double-step forward?
          if (Math.abs(prevMoveNewPosRowCol.row - 
                prevMoveOldPosRowCol.row) === 2) {
            // Is this taking en passant to the left?
            if (prevMoveNewPosRowCol.row === oldRowCol.row && 
                prevMoveNewPosRowCol.col === oldRowCol.col - 1 && 
                ((isWhite && 
                    newRowCol.row === oldRowCol.row - 1 && 
                    newRowCol.col === oldRowCol.col - 1) || 
                  (!isWhite && 
                    newRowCol.row === oldRowCol.row + 1 && 
                    newRowCol.col === oldRowCol.col - 1))) {
              result.movements = [{
                piece: board.arr[oldIndex],
                oldPos: oldPos,
                newPos: newPos
              }];
              result.takenPiece = previousMove.movements[0].piece;
            }

            // Is this taking en passant to the right?
            else if (prevMoveNewPosRowCol.row === oldRowCol.row && 
                       prevMoveNewPosRowCol.col === oldRowCol.col + 1 && 
                       ((isWhite && 
                            newRowCol.row === oldRowCol.row - 1 && 
                            newRowCol.col === oldRowCol.col + 1) || 
                          (!isWhite && 
                            newRowCol.row === oldRowCol.row + 1 && 
                            newRowCol.col === oldRowCol.col + 1))) {
              result.movements = [{
                piece: board.arr[oldIndex],
                oldPos: oldPos,
                newPos: newPos
              }];
              result.takenPiece = previousMove.movements[0].piece;
            }
          }
        }

        // Handle promotion
        if (result.movements && 
            ((isWhite && 
                newRowCol.row === 0) || 
              (!isWhite && 
                  newRowCol.row === 7))) {
          result.promotedPiece = result.movements[0].piece;
        }
      }

      return result;
    },

    rook: function(oldPos, newPos, board, isWhite, previousMove, 
                   hasMovedYet) {
      return getResultOfHorizontalOrVerticalMove(oldPos, newPos, board, 
          isWhite, previousMove, hasMovedYet);
    },

    knight: function(oldPos, newPos, board, isWhite, previousMove, 
                     hasMovedYet) {
      var POSSIBLE_DELTAS = [
        { col: 2, row: 1 },
        { col: 2, row: -1 },
        { col: -2, row: 1 },
        { col: -2, row: -1 },
        { col: 1, row: 2 },
        { col: 1, row: -2 },
        { col: -1, row: 2 },
        { col: -1, row: -2 }
      ];

      return getResultOfMoveWithEightPossibilities(oldPos, newPos, board, 
          isWhite, previousMove, hasMovedYet, POSSIBLE_DELTAS);
    },

    bishop: function(oldPos, newPos, board, isWhite, previousMove, 
                     hasMovedYet) {
      return getResultOfDiagonalMove(oldPos, newPos, board, isWhite, 
          previousMove, hasMovedYet);
    },

    queen: function(oldPos, newPos, board, isWhite, previousMove, 
                    hasMovedYet) {
      var result = getResultOfHorizontalOrVerticalMove(oldPos, newPos, board, 
          isWhite, previousMove, hasMovedYet);

      if (!result.movements) {
        result = getResultOfDiagonalMove(oldPos, newPos, board, isWhite, 
            previousMove, hasMovedYet);
      }

      return result;
    },

    // TODO: refactor this to condense and re-use similar code blocks
    king: function(oldPos, newPos, board, isWhite, previousMove, 
                   hasMovedYet) {
      var POSSIBLE_DELTAS = [
        { col: -1, row: -1 },
        { col: 0, row: -1 },
        { col: 1, row: -1 },
        { col: -1, row: 0 },
        { col: 1, row: 0 },
        { col: -1, row: 1 },
        { col: 0, row: 1 },
        { col: 1, row: 1 }
      ];

      var result = getResultOfMoveWithEightPossibilities(oldPos, newPos, board, 
          isWhite, previousMove, hasMovedYet, POSSIBLE_DELTAS);

      // Handle castling
      if (!result.movements) {
        if (!hasMovedYet) {
          var oldIndex = board.posStringToIndex(oldPos);
          var newIndex = board.posStringToIndex(newPos);

          var i, tmpNewPos;
          result = {};
          var kingPiece = board.arr[oldIndex];
          var valid = true;

          // Short castling?
          if (newIndex === oldIndex + 2 && 
              board.arr[oldIndex + 3] && 
              !board.arr[oldIndex + 3].hasMovedYet && 
              !board.arr[oldIndex + 1] && 
              !board.arr[oldIndex + 2]) {
            for (i = 0; i <= 2; ++i) {
              result.movements = [{
                piece: kingPiece,
                oldPos: oldPos,
                newPos: board.indexToPosString(oldIndex + i)
              }];
              if (checkWhetherMoveCausesSelfCheck(result, isWhite)) {
                valid = false;
                break;
              }
            }

            if (valid) {
              result.movements = [
                {
                  piece: kingPiece,
                  oldPos: oldPos,
                  newPos: newPos
                },
                {
                  piece: board.arr[oldIndex + 3],
                  oldPos: board.indexToPosString(oldIndex + 3),
                  newPos: board.indexToPosString(oldIndex + 1)
                }
              ];
            }
          }

          // Long castling?
          else if (newIndex === oldIndex - 2 && 
                   board.arr[oldIndex - 4] && 
                   !board.arr[oldIndex - 4].hasMovedYet && 
                   !board.arr[oldIndex - 1] && 
                   !board.arr[oldIndex - 2] && 
                   !board.arr[oldIndex - 3]) {
            for (i = 0; i >= -2; --i) {
              result.movements = [{
                piece: kingPiece,
                oldPos: oldPos,
                newPos: board.indexToPosString(oldIndex + i)
              }];
              if (checkWhetherMoveCausesSelfCheck(result, isWhite)) {
                valid = false;
                break;
              }
            }

            if (valid) {
              result.movements = [
                {
                  piece: kingPiece,
                  oldPos: oldPos,
                  newPos: newPos
                },
                {
                  piece: board.arr[oldIndex - 4],
                  oldPos: board.indexToPosString(oldIndex - 4),
                  newPos: board.indexToPosString(oldIndex - 1)
                }
              ];
            }
          }
        }
      }

      return result;
    }
  };

  // Helper function for the above bishop and queen functions.
  // TODO: Refactor this method to share a helper function with 
  //       getResultOfHorizontalOrVerticalMove that contains most of the 
  //       common code.
  function getResultOfDiagonalMove(oldPos, newPos, board, isWhite, 
                                   previousMove, hasMovedYet) {
    var result = {};

    // Cannot remain in the same position
    if (oldPos !== newPos) {
      var newPosPiece = board.get(newPos);

      // Cannot move to a position occupied by a piece of the same color
      if (!newPosPiece || newPosPiece.isWhite !== isWhite) {
        var oldIndex = board.posStringToIndex(oldPos);
        var newIndex = board.posStringToIndex(newPos);
        var oldRowCol = board.posStringToRowCol(oldPos);
        var newRowCol = board.posStringToRowCol(newPos);

        var valid = true;
        var i, startI, endI;

        if (oldIndex < newIndex) {
          startI = oldIndex;
          endI = newIndex;
        } else {
          startI = newIndex;
          endI = oldIndex;
        }

        // Moving in the same major diagonal?
        if (newRowCol.col - oldRowCol.col === newRowCol.row - oldRowCol.row) {
          // Any other pieces in between?
          for (i = startI + 9; i < endI; i += 9) {
            if (board.arr[i]) {
              valid = false;
              break;
            }
          }

          if (valid) {
            result.movements = [{
              piece: board.arr[oldIndex],
              oldPos: oldPos,
              newPos: newPos
            }];
            result.takenPiece = newPosPiece;
          }
        }
        // Moving in the same minor diagonal?
        else if (Math.abs(newRowCol.col - oldRowCol.col) === 
                  Math.abs(newRowCol.row - oldRowCol.row)) {
          // Any other pieces in between?
          for (i = startI + 7; i < endI; i += 7) {
            if (board.arr[i]) {
              valid = false;
              break;
            }
          }

          if (valid) {
            result.movements = [{
              piece: board.arr[oldIndex],
              oldPos: oldPos,
              newPos: newPos
            }];
            result.takenPiece = newPosPiece;
          }
        }
      }
    }

    return result;
  }

  // Helper function for the above rook and queen functions.
  // TODO: Refactor this method to share a helper function with 
  //       getResultOfDiagonalMove that contains most of the common code.
  function getResultOfHorizontalOrVerticalMove(oldPos, newPos, board, isWhite, 
                                               previousMove, hasMovedYet) {
    var result = {};

    // Cannot remain in the same position
    if (oldPos !== newPos) {
      var newPosPiece = board.get(newPos);

      // Cannot move to a position occupied by a piece of the same color
      if (!newPosPiece || newPosPiece.isWhite !== isWhite) {
        var oldRowCol = board.posStringToRowCol(oldPos);
        var newRowCol = board.posStringToRowCol(newPos);

        var valid = true;
        var i, start, end;

        // Moving in the same row?
        if (oldRowCol.row === newRowCol.row) {
          // Any other pieces in between?
          if (oldRowCol.col < newRowCol.col) {
            start = oldRowCol.col + 1;
            end = newRowCol.col - 1;
          } else {
            start = newRowCol.col + 1;
            end = oldRowCol.col - 1;
          }
          for (i = start; i <= end; ++i) {
            if (board.get(oldRowCol.row, i)) {
              valid = false;
              break;
            }
          }

          if (valid) {
            result.movements = [{
              piece: board.get(oldPos),
              oldPos: oldPos,
              newPos: newPos
            }];
            result.takenPiece = newPosPiece;
          }
        }
        // Moving in the same col?
        else if (oldRowCol.col === newRowCol.col) {
          // Any other pieces in between?
          if (oldRowCol.row < newRowCol.row) {
            start = oldRowCol.row + 1;
            end = newRowCol.row - 1;
          } else {
            start = newRowCol.row + 1;
            end = oldRowCol.row - 1;
          }
          for (i = start; i <= end; ++i) {
            if (board.get(i, oldRowCol.col)) {
              valid = false;
              break;
            }
          }

          if (valid) {
            result.movements = [{
              piece: board.get(oldPos),
              oldPos: oldPos,
              newPos: newPos
            }];
            result.takenPiece = newPosPiece;
          }
        }
      }
    }

    return result;
  }

  // Helper function for the above knight and king functions.
  function getResultOfMoveWithEightPossibilities(oldPos, newPos, board, 
      isWhite, previousMove, hasMovedYet, possibleDeltas) {
    var result = {};

    var newPosPiece = board.get(newPos);

    // Cannot move to a position occupied by a piece of the same color
    if (!newPosPiece || newPosPiece.isWhite !== isWhite) {
      var oldRowCol = board.posStringToRowCol(oldPos);
      var newRowCol = board.posStringToRowCol(newPos);

      // Check the possibilities and stop as soon as a match is found
      for (var i = 0; i < possibleDeltas.length; ++i) {
        if (newRowCol.row === oldRowCol.row + possibleDeltas[i].row && 
            newRowCol.col === oldRowCol.col + possibleDeltas[i].col) {
          result.movements = [{
            piece: board.get(oldPos),
            oldPos: oldPos,
            newPos: newPos
          }];
          result.takenPiece = newPosPiece;
          break;
        }
      }
    }

    return result;
  }

  function checkWhetherMoveCausesSelfCheck(result, isWhite) {
    applyTestMove(result);
    var createdSelfCheck = chess.game.checkForOpponentInCheck(isWhite);
    undoTestMove(result);
    return createdSelfCheck;
  }

  function applyTestMove(result) {
    // Move the piece(s) around. In the event of castling, there will be 
    // two pieces to move (which is why result.movements is an array)
    for (var i = 0; i < result.movements.length; ++i) {
      result.movements[i].piece.move(result.movements[i].newPos, true);
    }

    if (result.takenPiece) {
      result.takenPiece.remove(true);
    }
  }

  function undoTestMove(result) {
    // Move the piece(s) around. In the event of castling, there will be 
    // two pieces to move (which is why result.movements is an array)
    for (var i = 0; i < result.movements.length; ++i) {
      result.movements[i].piece.move(result.movements[i].oldPos, true);
    }

    if (result.takenPiece) {
      result.takenPiece.undoRemove();
    }
  }

  // Create an image element for a chess piece, add it to the DOM, and return 
  // it.
  function createImage(pieceName, isWhite, pos) {
    var color = isWhite ? 'white' : 'black';
    var src = IMAGES_DIR + color + pieceName + EXTENSION;
    var alt = 'A ' + color + ' ' + pieceName;

    var image = new Image();
    image.src = src;
    image.alt = alt;
    var parentNode = document.getElementById(pos);
    parentNode.appendChild(image);
    return image;
  }

  // Move the given image element between the divs at the given positions.
  function moveImage(image, oldPos, newPos) {
    var oldParent = document.getElementById(oldPos);
    var newParent = document.getElementById(newPos);
    oldParent.removeChild(image);
    newParent.appendChild(image);
  }

  // Remove the given image element from the div at the given pos.
  function removeImage(image, pos) {
    var parent = document.getElementById(pos);
    parent.removeChild(image);
  }

  // This function returns an object which represents a chess piece.
  var createChessPiece = function(type, isWhite, pos) {
    var getResultOfMove = CHESS_PIECES_MOVE_LOGIC[type];
    var image = createImage(type, isWhite, pos);

    var chessPiece = {
      type: type,
      isWhite: isWhite,
      pos: pos,
      hasMovedYet: false,

      // The ignoreCheck param prevents recursive checks for beitg in check 
      // when calculating hypothetical moves to take a king
      getResultOfMove: function(newPos, board, previousMove, ignoreCheck) {
        var result = getResultOfMove(
            chessPiece.pos, newPos, board, chessPiece.isWhite, previousMove, 
            chessPiece.hasMovedYet);

        if (!result.movements || 
            (!ignoreCheck && 
              checkWhetherMoveCausesSelfCheck(result, chessPiece.isWhite))) {
          result = {};
        }

        return result;
      },

      canTake: function(piece, board, previousMove, ignoreCheck) {
        var newPos = piece.pos;
        var result = chessPiece.getResultOfMove(newPos, board, previousMove, 
                                                ignoreCheck);
        return !!result.movements;
      },

      canMove: function(board, previousMove) {
        var row, col, newPos, result;
        for (row = 0; row < 8; ++row) {
          for (col = 0; col < 8; ++col) {
            newPos = board.rowColToPosString(row, col);
            result = chessPiece.getResultOfMove(newPos, board, previousMove);
            if (result.movements) {
              return true;
            }
          }
        }
        return false;
      },

      move: function(newPos, isTest) {
        chess.board.set(chessPiece.pos, null);
        chess.board.set(newPos, chessPiece);
        if (!isTest) {
          moveImage(image, chessPiece.pos, newPos);
          chessPiece.hasMovedYet = true;
        }
        chessPiece.pos = newPos;
      },

      remove: function(isTest) {
        // Do not clear the square if another piece has already taken the 
        // position of this piece
        if (chess.board.get(chessPiece.pos) === chessPiece) {
          chess.board.set(chessPiece.pos, null);
        }
        if (!isTest) {
          removeImage(image, chessPiece.pos);
        }
      },

      undoRemove: function() {
        chess.board.set(chessPiece.pos, chessPiece);
      },

      promote: function(type) {
        chessPiece.type = type;
        removeImage(image, chessPiece.pos);
        getResultOfMove = CHESS_PIECES_MOVE_LOGIC[type];
        image = createImage(type, isWhite, chessPiece.pos);
      }
    };

    return chessPiece;
  };

  // Make this function available outside of this module.
  if (!window.chess)
    window.chess = {};
  window.chess.createChessPiece = createChessPiece;
}());
