// DEPENDS ON:
//    - chessboard.js
//    - chesspieces.js
//    - chessgame.js

// This file specifies the initialization and event-handling logic for the 
// chess app.

// I like to keep all of my JavaScript enclosed in isolated modules in order 
// to minimize global side-effects.
(function() {
  'use strict';

  var CHAR_CODE_A = 'A'.charCodeAt(0);

  // Colors to use as highlights which provide extra guidance to the player in 
  // regards to the current move.
  var COLORS = {
    selected: '#0073c4',
    takingMove: '#c2c400',
    validMove: '#0dc400',
    invalidMove: '#c40000'
  };

  // Keep track of which squares are currently given a special highlight 
  // color, so that we can later reset the squares to their normal colors.
  var squaresWithHighlights = [];

  // Initialize the chess app.
  function init() {
    instantiateSquares();

    var boardDiv = document.getElementById('chessBoard');
    boardDiv.addEventListener('mouseout', onBoardMouseOut, false);

    var randomMove = document.getElementById('randomMove');
    randomMove.addEventListener('click', onRandomMoveClick, false);

    var startNewGame = document.getElementById('startNewGame');
    startNewGame.addEventListener('click', onStartNewGameClick, false);

    var promoteToQueen = document.getElementById('promoteToQueen');
    promoteToQueen.addEventListener('click', onPromotionClick, false);
    var promoteToRook = document.getElementById('promoteToRook');
    promoteToRook.addEventListener('click', onPromotionClick, false);
    var promoteToKnight = document.getElementById('promoteToKnight');
    promoteToKnight.addEventListener('click', onPromotionClick, false);
    var promoteToBishop = document.getElementById('promoteToBishop');
    promoteToBishop.addEventListener('click', onPromotionClick, false);

    chess.game.init();
    chess.game.setUpPiecesForStartOfGame();
  }

  // Create divs for each of the squares on the board, give them the 
  // appropriate background colors, and give them ids which describe their 
  // square positions.
  function instantiateSquares() {
    var boardElement = document.getElementById('chessBoard');
    boardElement.innerHTML = "";

    var row, col, pos, newDiv;

    for (row = 0; row < 8; ++row) {
      for (col = 0; col < 8; ++col) {
        pos = chess.board.rowColToPosString(row, col);

        newDiv = document.createElement('div');
        newDiv.id = pos;
        newDiv.style.backgroundColor = 
            chess.board.isWhiteSquare(pos) ? 'white' : 'black';
        newDiv.addEventListener('mouseover', onSquareMouseOver, false);
        newDiv.addEventListener('click', onSquareClick, false);
        boardElement.appendChild(newDiv);
      }
    }
  }

  function onSquareMouseOver() {
    if (!chess.game.isOver && !chess.game.waitingForPromotion) {
      var pos = this.id;
      var highlights = chess.game.getHighlights(pos);

      // Update square highlights to reflect the potential of a move at this 
      // square
      if (highlights) {
        removeOldHighlights();

        if (highlights.validMove) {
          highlightSquare(highlights.validMove, 'validMove');
        }
        if (highlights.invalidMove) {
          highlightSquare(highlights.invalidMove, 'invalidMove');
        }
        if (highlights.takingMove) {
          highlightSquare(highlights.takingMove, 'takingMove');
        }
      }
    }
  }

  function onSquareClick() {
    if (!chess.game.isOver && !chess.game.waitingForPromotion) {
      var pos = this.id;
      chess.game.handleSquareClick(pos);

      // If a square was just selected, then highlight it
      if (chess.game.selectedPiece) {
        highlightSquare(chess.game.selectedPiece.pos, 'selected');
      } else {
        removeOldHighlights();
      }
    }
  }

  function onBoardMouseOut() {
    removeOldHighlights();
  }

  function onRandomMoveClick() {
    if (!chess.game.isOver && !chess.game.waitingForPromotion) {
      chess.game.makeARandomMove();
      removeOldHighlights();
    }
  }

  function onStartNewGameClick() {
    init();
  }

  function onPromotionClick() {
    var type;
    switch (this.id) {
    case 'promoteToQueen':
      type = 'queen';
      break;
    case 'promoteToRook':
      type = 'rook';
      break;
    case 'promoteToKnight':
      type = 'knight';
      break;
    case 'promoteToBishop':
      type = 'bishop';
      break;
    default:
      return;
    }

    chess.game.handlePromotion(type);
  }

  // Highlight the given square according to the given type of action.
  function highlightSquare(pos, action) {
    var div = document.getElementById(pos);
    div.style.backgroundColor = COLORS[action];
    var posAndAction = { pos: pos, action: action };
    squaresWithHighlights.push(posAndAction);
  }

  // Reset all highlighted squares to their normal colors (i.e., black or 
  // white).
  function removeOldHighlights() {
    var i, div;

    // Reset the colors
    for (i = 0; i < squaresWithHighlights.length; ++i) {
      div = document.getElementById(squaresWithHighlights[i].pos);
      div.style.backgroundColor = 
          chess.board.isWhiteSquare(squaresWithHighlights[i].pos) ? 
              'white' : 'black';
    }

    // Clear the array
    squaresWithHighlights = [];

    // Re-add the currently selected square, if there is one
    if (chess.game.selectedPiece) {
      highlightSquare(chess.game.selectedPiece.pos, 'selected');
    }
  }

  init();
}());