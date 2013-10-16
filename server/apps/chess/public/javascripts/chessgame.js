// DEPENDS ON:
//    - chessboard.js
//    - chesspieces.js

// This file specifies the initialization and event-handling logic for the 
// chess app.

// I like to keep all of my JavaScript enclosed in isolated modules in order 
// to minimize global side-effects.
(function() {
  'use strict';

  var INITIAL_POSITIONS = [
    // White pieces
    { type: 'rook', isWhite: true, pos: 'A1' },
    { type: 'knight', isWhite: true, pos: 'B1' },
    { type: 'bishop', isWhite: true, pos: 'C1' },
    { type: 'queen', isWhite: true, pos: 'D1' },
    { type: 'king', isWhite: true, pos: 'E1' },
    { type: 'bishop', isWhite: true, pos: 'F1' },
    { type: 'knight', isWhite: true, pos: 'G1' },
    { type: 'rook', isWhite: true, pos: 'H1' },

    { type: 'pawn', isWhite: true, pos: 'A2' },
    { type: 'pawn', isWhite: true, pos: 'B2' },
    { type: 'pawn', isWhite: true, pos: 'C2' },
    { type: 'pawn', isWhite: true, pos: 'D2' },
    { type: 'pawn', isWhite: true, pos: 'E2' },
    { type: 'pawn', isWhite: true, pos: 'F2' },
    { type: 'pawn', isWhite: true, pos: 'G2' },
    { type: 'pawn', isWhite: true, pos: 'H2' },

    // Black pieces
    { type: 'pawn', isWhite: false, pos: 'A7' },
    { type: 'pawn', isWhite: false, pos: 'B7' },
    { type: 'pawn', isWhite: false, pos: 'C7' },
    { type: 'pawn', isWhite: false, pos: 'D7' },
    { type: 'pawn', isWhite: false, pos: 'E7' },
    { type: 'pawn', isWhite: false, pos: 'F7' },
    { type: 'pawn', isWhite: false, pos: 'G7' },
    { type: 'pawn', isWhite: false, pos: 'H7' },

    { type: 'rook', isWhite: false, pos: 'A8' },
    { type: 'knight', isWhite: false, pos: 'B8' },
    { type: 'bishop', isWhite: false, pos: 'C8' },
    { type: 'queen', isWhite: false, pos: 'D8' },
    { type: 'king', isWhite: false, pos: 'E8' },
    { type: 'bishop', isWhite: false, pos: 'F8' },
    { type: 'knight', isWhite: false, pos: 'G8' },
    { type: 'rook', isWhite: false, pos: 'H8' }
  ];

  var isWhitesTurn;

  // This is important for the pawn's ability of taking en-passant.
  var previousMove;

  // A div used for reporting specific game action info to the player.
  var notif;

  // A div used for reporting general game status info to the player.
  var status;

  // Handle the consequences of the current player making the given move.
  function applyMove(result) {
    // Set up player-color strings for reporting purposes
    var currentPlayerColor, opponentPlayerColor;
    if (isWhitesTurn) {
      currentPlayerColor = 'white';
      opponentPlayerColor = 'black';
    } else {
      currentPlayerColor = 'black';
      opponentPlayerColor = 'white';
    }

    // Move the piece(s) around. In the event of castling, there will be 
    // two pieces to move (which is why result.movements is an array)
    for (var i = 0; i < result.movements.length; ++i) {
      result.movements[i].piece.move(result.movements[i].newPos);
      notif.innerHTML = currentPlayerColor + ' player moved ' + 
          result.movements[i].piece.type + ' from ' + 
          result.movements[i].oldPos + ' to ' + 
          result.movements[i].newPos;
    }

    // Taking a piece
    if (result.takenPiece) {
      result.takenPiece.remove();
      notif.innerHTML = currentPlayerColor + ' player took ' + 
          opponentPlayerColor + ' ' + result.takenPiece.type + ' at ' + 
          result.takenPiece.pos;
    }

    // Promoting a pawn
    if (result.promotedPiece) {
      var promotionDiv = document.getElementById('promotion');
      promotionDiv.style.display = 'block';
      game.waitingForPromotion = true;
      notif.innerHTML = 'Promote your pawn';
    }

    // Castling
    if (result.movements.length > 1) {
      notif.innerHTML = currentPlayerColor + ' player castled';
    }

    previousMove = result;

    endTurn();
  }

  function endTurn() {
    if (!game.waitingForPromotion) {
      var opponentPlayerColor;
      if (isWhitesTurn) {
        opponentPlayerColor = 'black';
      } else {
        opponentPlayerColor = 'white';
      }

      var isInCheck = game.checkForOpponentInCheck(!isWhitesTurn);
      var somePieceCanMove = 
          game.checkWhetherAnyOpponentPieceCanMove(!isWhitesTurn);

      if (isInCheck) {
        if (somePieceCanMove) {
          // Check
          status.innerHTML = 'The ' + opponentPlayerColor + 
              ' player is in check';
        } else {
          // Checkmate
          status.innerHTML = 'The ' + opponentPlayerColor + ' player is mated';
          gameOver();
        }
      } else {
        if (somePieceCanMove) {
          // Normal play
          status.innerHTML = '';
        } else {
          // Stalemate
          status.innerHTML = 'The ' + opponentPlayerColor + 
              ' player is stalemated';
          gameOver();
        }
      }

      isWhitesTurn = !isWhitesTurn;
      game.selectedPiece = null;

      var playerColorSpan = document.getElementById('playerColor');
      if (playerColorSpan) {
        playerColorSpan.innerHTML = opponentPlayerColor;
      }
    }
  }

  function gameOver() {
    game.isOver = true;
    var turnDisplay = document.getElementById('turnDisplay');
    turnDisplay.innerHTML = 'Game over';
  }

  function pickRandomValidPiece() {
    var remainingIndices = initializeArrayWithValuesOfIndices(64);
    var index;

    do {
      index = spliceRandomIndexFromArray(remainingIndices);

      if (isIndexValidForCurrentMove(index)) {
        return chess.board.arr[index];
      }
    } while (remainingIndices.length > 0);

    throw {
      type: 'InvalidStateError',
      msg: 'There should always exist some valid piece, else this function ' +
            'should not be called due to the end of the game'
    };
  }

  function pickRandomValidMoveForPiece(piece) {
    var remainingIndices = initializeArrayWithValuesOfIndices(64);
    var index, posStr, result;

    do {
      index = spliceRandomIndexFromArray(remainingIndices);
      posStr = chess.board.indexToPosString(index);
      result = piece.getResultOfMove(posStr, chess.board, previousMove);

      if (result.movements) {
        return result;
      }
    } while (remainingIndices.length > 0);

    throw {
      type: 'InvalidStateError',
      msg: 'Unable to find a valid move for a supposedly valid piece: type=' + 
            piece.type + ', pos=' + piece.pos + ', isWhite=' + piece.isWhite
    };
  }

  function isIndexValidForCurrentMove(index) {
    return chess.board.arr[index] && 
           chess.board.arr[index].isWhite === isWhitesTurn && 
           chess.board.arr[index].canMove(chess.board, previousMove);
  }

  function initializeArrayWithValuesOfIndices(size) {
    var arr = [];
    for (var i = 0; i < size; ++i) {
      arr[i] = i;
    }
    return arr;
  }

  function spliceRandomIndexFromArray(arr) {
    var i = Math.floor(Math.random() * arr.length);
    var value = arr[i];
    arr.splice(i, 1);
    return value;
  }

  var game = {
    selectedPiece: null,
    whiteKing: null,
    blackKing: null,

    isOver: false,
    waitingForPromotion: false,

    init: function() {
      notif = document.getElementById('notification');
      status = document.getElementById('status');

      isWhitesTurn = true;
      previousMove = null;

      game.selectedPiece = null;
      game.whiteKing = null;
      game.blackKing = null;
      game.isOver = false;
      game.waitingForPromotion = false;
    },

    // Clear all of the squares on the board, and add each of the pieces to 
    // their starting squares.
    setUpPiecesForStartOfGame: function() {
      chess.board.init();

      var chessPiece;
      for (var i = 0; i < INITIAL_POSITIONS.length; ++i) {
        chessPiece = chess.createChessPiece(INITIAL_POSITIONS[i].type, 
                                            INITIAL_POSITIONS[i].isWhite, 
                                            INITIAL_POSITIONS[i].pos);
        chess.board.set(INITIAL_POSITIONS[i].pos, chessPiece);

        if (chessPiece.type === 'king') {
          if (chessPiece.isWhite) {
            game.whiteKing = chessPiece;
          } else {
            game.blackKing = chessPiece;
          }
        }
      }
    },

    // Return an object describing which squares should be highlighted in 
    // which ways in order to express the potential side-effects of the player 
    // moving the selected piece to the given position.
    getHighlights: function getHighlights(pos) {
      if (game.selectedPiece) {
        var highlights = {};
        var result = game.selectedPiece.getResultOfMove(pos, chess.board, previousMove);

        if (result.movements) {
          highlights.validMove = pos;
          if (result.takenPiece) {
            highlights.takingMove = result.takenPiece.pos;
          }
        } else {
          highlights.invalidMove = pos;
        }

        return highlights;
      } else {
        return null;
      }
    },

    handleSquareClick: function handleSquareClick(pos) {
      if (game.selectedPiece) {
        // The player should be moving the selected piece

        var result = game.selectedPiece.getResultOfMove(pos, chess.board, 
            previousMove);

        if (result.movements) {
          applyMove(result);
        } else {
          notif.innerHTML = 'You cannot move your ' + 
              game.selectedPiece.type + ' there';
        }
      } else {
        // The player should be selecting a piece to move

        var piece = chess.board.get(pos);

        if (piece) {
          if (piece.isWhite === isWhitesTurn) {
            if (piece.canMove(chess.board, previousMove)) {
              game.selectedPiece = piece;
              notif.innerHTML = 'You have selected your ' + piece.type;
            } else {
              notif.innerHTML = 'You cannot move that piece';
            }
          } else {
            notif.innerHTML = 'That piece belongs to the other player';
          }
        } else {
          notif.innerHTML = 'There is no piece there';
        }
      }
    },

    handlePromotion: function(type) {
      game.selectedPiece.promote(type);
      var promotionDiv = document.getElementById('promotion');
      promotionDiv.style.display = 'none';
      notif.innerHTML = 'The ' + (isWhitesTurn ? 'white' : 'black') + 
          ' player promoted a pawn to a ' + type;
      game.waitingForPromotion = false;
      endTurn();
    },

    checkForOpponentInCheck: function(opponentIsWhite) {
      var opponentKing = opponentIsWhite ? game.whiteKing : game.blackKing;
      for (var i = 0; i < chess.board.arr.length; ++i) {
        if (chess.board.arr[i] && 
            chess.board.arr[i].isWhite !== opponentIsWhite && 
            chess.board.arr[i].canTake(opponentKing, chess.board, 
                                       previousMove, true)) {
          return true;
        }
      }
      return false;
    },

    checkWhetherAnyOpponentPieceCanMove: function(opponentIsWhite) {
      for (var i = 0; i < chess.board.arr.length; ++i) {
        if (chess.board.arr[i] && 
            chess.board.arr[i].isWhite === opponentIsWhite && 
            chess.board.arr[i].canMove(chess.board, previousMove)) {
          return true;
        }
      }
      return false;
    },

    makeARandomMove: function() {
      if (!game.selectedPiece) {
        game.selectedPiece = pickRandomValidPiece();
      }
      var result = pickRandomValidMoveForPiece(game.selectedPiece);
      applyMove(result);
    }
  };

  // Make this object available outside of this module.
  if (!window.chess)
    window.chess = {};
  window.chess.game = game;
}());