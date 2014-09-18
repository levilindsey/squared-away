// ------------------------------------------------------------------------- //
// -- window.game
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the overall game logic is encapsulated in this anonymous function.  
// This is then stored in the window.game property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//    - window.log
//    - window.Sprite
//    - window.Block
//    - window.PreviewWindow
//    - window.BombWindow
//    - window.gameWindow
//    - window.input
//    - window.sound
//    - utils
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->game.LOADING_MODULE');

  // --------------------------------------------------------------------- //
  // -- Private, static members

  var _GAME_AREA_SIZE_RATIO = 0.76; // a ratio of overall canvas size
  var _PREVIEW_WINDOW_SIZE_RATIO = 0.08; // a ratio of overall canvas size
  var _PREVIEW_WINDOW_OUTER_MARGIN_RATIO = 0.02; // a ratio of overall canvas size
  var _PREVIEW_WINDOW_INNER_MARGIN_RATIO = (1 - (_GAME_AREA_SIZE_RATIO + 
      ((_PREVIEW_WINDOW_SIZE_RATIO + _PREVIEW_WINDOW_OUTER_MARGIN_RATIO) * 2))) / 2; // a ratio of overall canvas size

  var _INITIAL_BLOCK_FALL_SPEED = 0.001; // in squares per millis
  var _BLOCK_FALL_SPEED_GROWTH_RATE = 0.40; // linear // TODO: test/tweak this

  var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_SPEED = 1 / 50000; // in block per millis
  var _PREVIEW_WINDOW_COOL_DOWN_SPEED_GROWTH_RATE = 0.15; // linear // TODO: test/tweak this

  var _INITIAL_CENTER_SQUARE_COLOR_SPEED = 1 / 9000; // color per millis
  var _CENTER_SQUARE_COLOR_CHANGE_SPEED_GROWTH_RATE = 0.15;

  var _INITIAL_COLLAPSE_SPEED = 1 / 500; // collapse per millis
  var _COLLAPSE_SPEED_GROWTH_RATE = 0.10;

  var _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL = 3; // TODO: test/tweak this
  var _LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE = 0.334; // TODO: test/tweak this

  var _BASE_SCORE_PER_SQUARE = 14;
  var _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED = 0.02; // TODO: test/tweak this
  var _SCORE_GROWTH_RATE_PER_RECENT_LAYER = 0.50; // TODO: test/tweak this

  var _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD = _INITIAL_COLLAPSE_SPEED + 200;

  var _POINTS_FOR_COLLAPSE_BOMB = 4000; // TODO: test/tweak this
  var _POINTS_FOR_SETTLE_BOMB = 4000; // TODO: test/tweak this

  var _INITIAL_COLLAPSE_BOMB_COUNT = 2; // TODO: test/tweak this
  var _INITIAL_SETTLE_BOMB_COUNT = 2; // TODO: test/tweak this

  var _GAME_OVER_CIRCLE_RADIUS = 48;

  var _CHAPTER_PARAMETERS = [
    { // Quick play
      explanationText: null,
      hintText: null,
      completeSquaresCB: false,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: true,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: true,
      fallOutwardCB: false,

      gameWindowSize: 40,
      centerSquareSize: 6,
      numberOfSquaresInABlock: 8,
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: null,
      blockFallSpeed: _INITIAL_BLOCK_FALL_SPEED, // in squares per millis
      previewWindowSpeed: _INITIAL_PREVIEW_WINDOW_COOL_DOWN_SPEED, // in blocks per millis
      levelColorIndexOffset: 0,
      layerCountForNextLevel: _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL,
      initialBombCount: 2,
      scoreToEndChapter: -1,
      layersToEndChapter: -1
    },
    { // Chapter 1
      explanationText: 
        'Let&apos;s start things off nice and simple. The goal is to arrange the falling blocks so they form complete layers. The guidelines show how far a complete layer needs to extend. You can move blocks sideways, move blocks downward, and rotate blocks. Find directions for each of these controls below the game area.' + 
        '<br><br>Complete 5 layers to pass this chapter.',
      hintText: 'TIP: You might also want to try out keyboard mode! (enable it below)',
      completeSquaresCB: false,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: false,
      changeQuadrantWithFallDirectionCB: false,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: false,
      fallOutwardCB: false,

      gameWindowSize: 60,
      centerSquareSize: 12,
      numberOfSquaresInABlock: 3,
      numberOfSidesBlocksFallFrom: 1,
      startingLevel: 1,

      musicId: 'chibiNinja',
      blockFallSpeed: 0.0015, // in squares per millis
      previewWindowSpeed: 1 / 17000, // in blocks per millis
      levelColorIndexOffset: 1,
      layerCountForNextLevel: 9999,
      initialBombCount: 0,
      scoreToEndChapter: -1,
      layersToEndChapter: 5
    },
    { // Chapter 2
      explanationText: 
        'Blocks now fall from two different sides. Also, there are now 2, 3, and 4 squares in a block.'+
        '<br><br>TIP: you can also complete layers along the other two sides of the center square. Your blocks will not be allowed to fall past the back side of the center square.' + 
        '<br><br> Complete ten layers to pass this chapter.',
      hintText: 'TIP: Use the preview windows to plan for the upcoming block.',
      completeSquaresCB: false,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: false,
      changeQuadrantWithFallDirectionCB: false,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: false,
      fallOutwardCB: false,

      gameWindowSize: 50,
      centerSquareSize: 10,
      numberOfSquaresInABlock: 6, // 2-4
      numberOfSidesBlocksFallFrom: 2,
      startingLevel: 1,

      musicId: 'jumpshot',
      blockFallSpeed: 0.001, // in squares per millis
      previewWindowSpeed: 1 / 25000, // in blocks per millis
      levelColorIndexOffset: 2,
      layerCountForNextLevel: 9999,
      initialBombCount: 0,
      scoreToEndChapter: -1,
      layersToEndChapter: 10
    },
    { // Chapter 3
      explanationText: 
        'Blocks now fall from all sides. Also, you can now change the direction blocks are falling from. When you change a block&apos;s fall direction, the block also moves to the next quadrant of the game area.' + 
        '<br><br>Get 2000 points to pass this chapter.',
      hintText: 'TIP: Changing a block&apos;s fall direction can be helpful for fitting an oddly shaped block into the best side.',
      completeSquaresCB: false,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: true,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: false,
      fallOutwardCB: false,

      gameWindowSize: 50,
      centerSquareSize: 6,
      numberOfSquaresInABlock: 6, // 2-4
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: 'arpanauts',
      blockFallSpeed: 0.001, // in squares per millis
      previewWindowSpeed: 1 / 50000, // in blocks per millis
      levelColorIndexOffset: 3,
      layerCountForNextLevel: 9999,
      initialBombCount: 0,
      scoreToEndChapter: 2000,
      layersToEndChapter: -1
    },
    { // Chapter 4
      explanationText: 
        'There are now two, three, four, and five squares in a block.' + 
        '<br><br>Complete ten layers to pass this chapter.',
      hintText: 'TIP: Changing a block&apos;s fall direction may now be even more helpful for fitting an oddly shaped block into the best side.',
      completeSquaresCB: false,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: true,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: false,
      fallOutwardCB: false,

      gameWindowSize: 40,
      centerSquareSize: 6,
      numberOfSquaresInABlock: 8, // 2-5
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: 'aNightOfDizzySpells',
      blockFallSpeed: 0.001, // in squares per millis
      previewWindowSpeed: 1 / 50000, // in blocks per millis
      levelColorIndexOffset: 4,
      layerCountForNextLevel: 9999,
      initialBombCount: 0,
      scoreToEndChapter: -1,
      layersToEndChapter: 10
    },
    { // Chapter 5
      explanationText: 
        'Ka-boom!!<br><br>To use a bomb, first tap on which bomb you want to use (below the game area) and then tap on a window you want to send it from. The black squares are collapse bombs; when these land, they collapse all nearby squares. The white squares are settle bombs; when they collapse, all unsupported squares in the entire game area settle both downward and inward. You are awarded more bombs when you earn enough points. Bombs also have a small chance of appearing naturally just like any other block.' + 
        '<br><br>Get 3000 points to pass this chapter.',
      hintText: 'TIP: With the collapse bomb, be careful to not destroy blocks which are buried underneath higher layers.',
      completeSquaresCB: false,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: true,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: true,
      fallOutwardCB: false,

      gameWindowSize: 40,
      centerSquareSize: 6,
      numberOfSquaresInABlock: 8, // 2-5
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: 'allOfUs',
      blockFallSpeed: 0.0015, // in squares per millis
      previewWindowSpeed: 1 / 40000, // in blocks per millis
      levelColorIndexOffset: 5,
      layerCountForNextLevel: 9999,
      initialBombCount: 3,
      scoreToEndChapter: 3000,
      layersToEndChapter: -1
    },
    { // Chapter 6
      explanationText: 
        'Now you need to complete whole squares rather than just single lines.' + 
        '<br><br>Complete ten layers to pass this chapter.',
      hintText: 'TIP: The more squares/layers you collapse simultaneously, the more points you&apos;re awarded.',
      completeSquaresCB: true,
      blocksFallPastCenterCB: false,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: true,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: true,
      fallOutwardCB: false,

      gameWindowSize: 40,
      centerSquareSize: 6,
      numberOfSquaresInABlock: 8, // 2-5
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: 'hhavokMain',
      blockFallSpeed: 0.0015, // in squares per millis
      previewWindowSpeed: 1 / 30000, // in blocks per millis
      levelColorIndexOffset: 6,
      layerCountForNextLevel: 9999,
      initialBombCount: 2,
      scoreToEndChapter: -1,
      layersToEndChapter: 10
    },
    { // Chapter 7
      explanationText: 
        'Now when you change a block&apos;s falling direction, it doesn&apos;t move to the next quadrant. Also, the barrier preventing blocks from falling past the center square is now gone.' + 
        '<br><br>Get 3000 points to pass this chapter.',
      hintText: 'TIP: Be careful to not let a block fall into the far edge!',
      completeSquaresCB: true,
      blocksFallPastCenterCB: true,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: false,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: true,
      fallOutwardCB: false,

      gameWindowSize: 40,
      centerSquareSize: 6,
      numberOfSquaresInABlock: 8, // 2-5
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: 'comeAndFindMe',
      blockFallSpeed: 0.002, // in squares per millis
      previewWindowSpeed: 1 / 25000, // in blocks per millis
      levelColorIndexOffset: 7,
      layerCountForNextLevel: 9999,
      initialBombCount: 1,
      scoreToEndChapter: 3000,
      layersToEndChapter: -1
    },
    { // Chapter 8
      explanationText: 
        'Gravity reversal.' + 
        '<br><br>Complete ten single-line layers to pass this chapter.',
      hintText: 'TIP: Layers now take longer to complete, and mistakes also take longer to fix.',
      completeSquaresCB: false,
      blocksFallPastCenterCB: true,
      changeFallDirectionCB: true,
      changeQuadrantWithFallDirectionCB: false,
      settleWithCollapseCB: false,
      settleInwardCB: false,
      bombsCB: true,
      fallOutwardCB: true,

      gameWindowSize: 30,
      centerSquareSize: 4,
      numberOfSquaresInABlock: 8, // 2-5
      numberOfSidesBlocksFallFrom: 4,
      startingLevel: 1,

      musicId: 'underclocked',
      blockFallSpeed: 0.001, // in squares per millis
      previewWindowSpeed: 1 / 25000, // in blocks per millis
      levelColorIndexOffset: 7,
      layerCountForNextLevel: 9999,
      initialBombCount: 2,
      scoreToEndChapter: -1,
      layersToEndChapter: 10
    }
  ];

  // A cross-browser compatible requestAnimationFrame. From
  // https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
  var _myRequestAnimationFrame = 
    window.requestAnimationFrame || // the standard
    window.webkitRequestAnimationFrame || // chrome/safari
    window.mozRequestAnimationFrame || // firefox
    window.oRequestAnimationFrame || // opera
    window.msRequestAnimationFrame || // ie
    function(callback) { // default
      window.setTimeout(callback, 16); // 60fps
    };

  // ----------------------------------------------------------------- //
  // -- Private members

  var _previewWindowOuterMarginPixels = 0; // in pixels
  var _previewWindowInnerMarginPixels = 0; // in pixels

  var _canvas = null;
  var _context = null;
  var _levelDisplay = null;
  var _scoreDisplay = null;
  var _onGameEnd = null;
  var _toggleMode = null;
  var _changeGameParameter = null;

  var _isLooping = false;

  var _prevTime = 0;

  var _keepCanvasClear = false;

  var _score = 0;
  var _level = 1;
  var _gameTime = 0; // active (unpaused) time since start of game
  var _layersCollapsedCount = 0;
  var _squaresCollapsedCount = 0;
  var _collapseBombsUsedCount = 0;
  var _settleBombsUsedCount = 0;
  var _blocksHandledCount = 0;

  var _currentBlockFallSpeed = -1; // squares per millis
  var _currentCenterSquareColorPeriod = -1; // millis per color

  var _currentPreviewWindowCoolDownTime = -1; // in millis

  var _layerCountForNextLevel = -1;
  var _layersCollapsedSinceLastLevel = 0;

  var _recentCollapsesCount = 0;
  var _prevCollapseTime = 0;

  var _pointsForPrevCollapseBomb = -2000;
  var _pointsForPrevSettleBomb = 0;

  // ---------- From the chapter parameters
  var _initialBlockFallSpeed = -1;
  var _initialPreviewWindowSpeed = -1;
  var _initialLevelColorIndexOffset = 0;
  var _initialLayerCountForNextLevel = -1;
  var _initialBombCount = -1;
  var _scoreToEndChapter = -1;
  var _layersToEndChapter = -1;

  // The game loop drives the progression of frames and game logic
  function _gameLoop() {
    _isLooping = true;

    // Get the timing of the current frame
    var currTime = Date.now();
    var deltaTime = currTime - _prevTime;

    // Check whether the game is unpaused
    if (!game.isPaused && !game.isEnded) {
      // Update the game state for the current frame
      _update(deltaTime);
      _draw();

      _myRequestAnimationFrame(_gameLoop);
    } else {
      _isLooping = false;
    }

    // Go to the next frame
    _prevTime = currTime;
  }

  // Update each of the game entities with the current time.
  function _update(deltaTime) {
    _gameTime += deltaTime;

    var i;

    // Check whether this chapter has been completed
    if ((_scoreToEndChapter > 0 && _score >= _scoreToEndChapter) || 
        (_layersToEndChapter > 0 && _layersCollapsedCount >= _layersToEndChapter)) {
      _endGame(null, true);
    } else {
      input.update(deltaTime);

      gameWindow.update(deltaTime);

      game.collapseBombWindow.update(deltaTime);
      game.settleBombWindow.update(deltaTime);

      // Update the preview windows
      switch (game.numberOfSidesBlocksFallFrom) {
      case 4:
        for (i = 0; i < 4; ++i) {
          game.previewWindows[i].update(deltaTime);
          if (game.previewWindows[i].isCoolDownFinished()) {
            _setupNextBlock(game.previewWindows[i]);
          }
        }
        break;
      case 3:
        game.previewWindows[0].update(deltaTime);
        if (game.previewWindows[0].isCoolDownFinished()) {
          _setupNextBlock(game.previewWindows[0]);
        }
        game.previewWindows[1].update(deltaTime);
        if (game.previewWindows[1].isCoolDownFinished()) {
          _setupNextBlock(game.previewWindows[1]);
        }
        game.previewWindows[3].update(deltaTime);
        if (game.previewWindows[3].isCoolDownFinished()) {
          _setupNextBlock(game.previewWindows[3]);
        }
        break;
      case 2:
        game.previewWindows[1].update(deltaTime);
        if (game.previewWindows[1].isCoolDownFinished()) {
          _setupNextBlock(game.previewWindows[1]);
        }
        game.previewWindows[3].update(deltaTime);
        if (game.previewWindows[3].isCoolDownFinished()) {
          _setupNextBlock(game.previewWindows[3]);
        }
        break;
      case 1:
        game.previewWindows[0].update(deltaTime);
        if (game.previewWindows[0].isCoolDownFinished()) {
          _setupNextBlock(game.previewWindows[0]);
        }
        break;
      default:
        return;
      }
    }
  }

  function _draw() {
    if (!_keepCanvasClear) {
      // Clear the canvas
      _context.clearRect(0, 0, _canvas.width, _canvas.height);

      var i;

      game.collapseBombWindow.draw(_context);
      game.settleBombWindow.draw(_context);

      // Draw the preview windows
      switch (game.numberOfSidesBlocksFallFrom) {
      case 4:
        for (i = 0; i < 4; ++i) {
          game.previewWindows[i].draw(_context);
        }
        break;
      case 3:
        game.previewWindows[0].draw(_context);
        game.previewWindows[1].draw(_context);
        game.previewWindows[3].draw(_context);
        break;
      case 2:
        game.previewWindows[1].draw(_context);
        game.previewWindows[3].draw(_context);
        break;
      case 1:
        game.previewWindows[0].draw(_context);
        break;
      default:
        return;
      }

      // Draw the game window
      gameWindow.draw(_context);

      if (game.isEnded && game.positionOfGameOver) {
        // Draw a big, red circle at the cause of the game being over
        _context.save();
        _context.translate(gameWindow.gameWindowPosition.x, gameWindow.gameWindowPosition.y);
        _context.beginPath();
        _context.arc(game.positionOfGameOver.x, game.positionOfGameOver.y, _GAME_OVER_CIRCLE_RADIUS, 0, 2 * Math.PI, false);
        _context.fillStyle = game.INVALID_MOVE_FILL.str;
        _context.fill();
        _context.restore();
      }
    }
  }

  // Set up a new game
  function _reset() {
    log.d('-->game._reset');

    _score = 0;
    _gameTime = 0;
    game.isPaused = true;
    game.isEnded = true;
    game.positionOfGameOver = null;
    _prevTime = 0;

    gameWindow.reset();
    input.reset();

    _setLevel(game.startingLevel);

    _scoreDisplay.innerHTML = _score;

    _layersCollapsedCount = 0;
    _squaresCollapsedCount = 0;
    _collapseBombsUsedCount = 0;
    _settleBombsUsedCount = 0;
    _blocksHandledCount = 0;

    var deltaCoolDown = _currentPreviewWindowCoolDownTime / 4;

    // Start each of the preview windows
    switch (game.numberOfSidesBlocksFallFrom) {
    case 4:
      for (var i = 0, coolDown = PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD;
          i < 4; ++i, coolDown += deltaCoolDown) {
        game.previewWindows[i].startNewBlock(coolDown, -1);
      }
      break;
    case 3:
      game.previewWindows[0].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      game.previewWindows[1].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD + deltaCoolDown, -1);
      game.previewWindows[3].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD + deltaCoolDown * 2, -1);
      game.previewWindows[2].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      break;
    case 2:
      game.previewWindows[1].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      game.previewWindows[3].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD + deltaCoolDown, -1);
      game.previewWindows[0].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      game.previewWindows[2].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      break;
    case 1:
      game.previewWindows[0].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      game.previewWindows[1].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      game.previewWindows[2].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      game.previewWindows[3].startNewBlock(PreviewWindow.prototype.START_OF_GAME_INITIAL_COOL_DOWN_PERIOD, -1);
      break;
    default:
      return;
    }

    _recentCollapsesCount = 0;
    _prevCollapseTime = 0;

    log.d('<--game._reset');
  }

  function _setLevel(level) {
    _level = level;

    // Increase the block fall speed
    _currentBlockFallSpeed = utils.getLinGrowthValue(
        _initialBlockFallSpeed, 
        _BLOCK_FALL_SPEED_GROWTH_RATE, 
        _level);
    Block.prototype.setFallSpeed(_currentBlockFallSpeed);

    // Increase the rate of the center square color changes
    _currentCenterSquareColorPeriod = 1 / utils.getLinGrowthValue(
        _INITIAL_CENTER_SQUARE_COLOR_SPEED, 
        _CENTER_SQUARE_COLOR_CHANGE_SPEED_GROWTH_RATE, 
        _level);
    gameWindow.setCenterSquareColorPeriod(_currentCenterSquareColorPeriod);

    // Decrease the preview window cooldown time
    _currentPreviewWindowCoolDownTime = 1 / utils.getLinGrowthValue(
        _initialPreviewWindowSpeed, 
        _PREVIEW_WINDOW_COOL_DOWN_SPEED_GROWTH_RATE, 
        _level);
    for (var i = 0; i < 4; ++i) {
      game.previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
    }

    // Decrease the layer collapse delay
    var layerCollapseDelay = 1 / utils.getLinGrowthValue(
        _INITIAL_COLLAPSE_SPEED, 
        _COLLAPSE_SPEED_GROWTH_RATE, 
        _level);
    gameWindow.setLayerCollapseDelay(layerCollapseDelay);

    // Get how many layers need to be collapsed to progress to the 
    // next level
    _layerCountForNextLevel = utils.getLinGrowthValue(
        game.completingSquaresOn ? _initialLayerCountForNextLevel : _initialLayerCountForNextLevel * 4, 
        _LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE, 
        _level);
    _layersCollapsedSinceLastLevel = 0;

    var currentBackgroundColorIndex = (_initialLevelColorIndexOffset + _level - 2) % game.DARK_COLORS.length;
    gameWindow.setCurrentBackgroundColorIndex(currentBackgroundColorIndex);

    _levelDisplay.innerHTML = _level;
  }

  function _setChapterParameters(chapterIndex) {
    if (chapterIndex >= 0) {
      var p = _CHAPTER_PARAMETERS[chapterIndex];

      var hintTextArea = document.getElementById('hintTextArea');
      var explanationTextArea = document.getElementById('explanationTextArea');
      if (p.explanationText) {
        explanationTextArea.innerHTML = p.explanationText;
      }
      if (p.hintText) {
        hintTextArea.innerHTML = p.hintText;
      }

      _toggleMode('completeSquaresCB', p.completeSquaresCB, null);
      _toggleMode('blocksFallPastCenterCB', p.blocksFallPastCenterCB, null);
      _toggleMode('changeFallDirectionCB', p.changeFallDirectionCB, null);
      _toggleMode('changeQuadrantWithFallDirectionCB', p.changeQuadrantWithFallDirectionCB, null);
      _toggleMode('settleWithCollapseCB', p.settleWithCollapseCB, null);
      _toggleMode('settleInwardCB', p.settleInwardCB, null);
      _toggleMode('bombsCB', p.bombsCB, null);
      _toggleMode('fallOutwardCB', p.fallOutwardCB, null);

      _changeGameParameter('gameWindowSize', p.gameWindowSize, null);
      _changeGameParameter('centerSquareSize', p.centerSquareSize, null);
      _changeGameParameter('numberOfSquaresInABlock', p.numberOfSquaresInABlock, null);
      _changeGameParameter('numberOfSidesBlocksFallFrom', p.numberOfSidesBlocksFallFrom, null);
      _changeGameParameter('startingLevel', p.startingLevel, null);

      if (p.musicId) {
        sound.playMusicOnSingleLoop(p.musicId);
      } else {
        sound.shuffleMusic();
      }

      _initialBlockFallSpeed = p.blockFallSpeed;
      _initialPreviewWindowSpeed = p.previewWindowSpeed;
      _initialLevelColorIndexOffset = p.levelColorIndexOffset;
      _initialLayerCountForNextLevel = p.layerCountForNextLevel;
      _initialBombCount = p.initialBombCount;
      _scoreToEndChapter = p.scoreToEndChapter;
      _layersToEndChapter = p.layersToEndChapter;

      game.collapseBombWindow.setBombCount(_initialBombCount);
      game.settleBombWindow.setBombCount(_initialBombCount);
    }
  }

  function _play() {
    _keepCanvasClear = false;

    // Reset game state if a game is not currently in progress
    if (game.isEnded) {
      _reset();
      game.isEnded = false;
    }

    if (game.isPaused || game.isEnded) {
      _prevTime = Date.now();
    }

    game.isPaused = false;

    // If the game loop is not already running, then start it
    if (!_isLooping) {
      _gameLoop();
    }
  }

  function _pause() {
    game.isPaused = true;
  }

  function _endGame(positionOfCause, chapterComplete) {
    game.isEnded = true;

    game.positionOfGameOver = positionOfCause;

    _onGameEnd(chapterComplete);
  }

  function _addCollapseToScore(squaresCollapsedCount) {
    _squaresCollapsedCount += squaresCollapsedCount;
    ++_layersCollapsedCount;
    ++_layersCollapsedSinceLastLevel;

    // Give a slight exponential score increase for the number of 
    // blocks in the current layer collapse
    var score = utils.getExpGrowthValue(
        _BASE_SCORE_PER_SQUARE, 
        game.completingSquaresOn ? _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED : _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED / 4, 
        squaresCollapsedCount) * squaresCollapsedCount;

    // Give a large exponential score increase if the previous layer 
    // collapse occurred very recently
    var currentCollapseTime = Date.now();
    _recentCollapsesCount = currentCollapseTime - _prevCollapseTime < _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD ? _recentCollapsesCount + 1 : 0;
    _prevCollapseTime = currentCollapseTime;
    score = utils.getExpGrowthValue(
        score, 
        game.completingSquaresOn ? _SCORE_GROWTH_RATE_PER_RECENT_LAYER : _SCORE_GROWTH_RATE_PER_RECENT_LAYER / 4, 
        _recentCollapsesCount);

    _score += Math.floor(score);

    _scoreDisplay.innerHTML = _score;

    // Check whether the player has collapsed enough layers to move on 
    // to the next level
    if (_layersCollapsedSinceLastLevel >= _layerCountForNextLevel) {
      _setLevel(_level + 1);

      sound.playSfx('level');
    }

    // Check whether the player has earned an extra collapse bomb with 
    // the new score
    if (game.bombsOn && _score > _pointsForPrevCollapseBomb + _POINTS_FOR_COLLAPSE_BOMB) {
      game.collapseBombWindow.addBomb();

      _pointsForPrevCollapseBomb += _POINTS_FOR_COLLAPSE_BOMB;

      sound.playSfx('earnedBonus');
    }

    // Check whether the player has earned an extra settle bomb with 
    // the new score
    if (game.bombsOn && _score > _pointsForPrevSettleBomb + _POINTS_FOR_SETTLE_BOMB) {
      game.settleBombWindow.addBomb();

      _pointsForPrevSettleBomb += _POINTS_FOR_SETTLE_BOMB;

      sound.playSfx('earnedBonus');
    }
  }

  function _setupNextBlock(previewWindow) {
    var block = previewWindow.getCurrentBlock();

    gameWindow.blocksOnGameWindow.push(block);
    previewWindow.startNewBlock(-1, -1);

    // If there is a square on the game area in the way the 
    // new block from being added, then the game is over and 
    // the player has lost
    if (block.checkIsOverTopSquare(gameWindow.squaresOnGameWindow)) {
      game.endGame(block.getPixelCenter(), false);
      return;
    }

    ++_blocksHandledCount;

    if (game.keyboardControlOn && !input.selectedKeyboardBlock) {
      input.selectedKeyboardBlock = block;
    }

    if (block.getBombType() < 0) {
      sound.playSfx('newBlock');
    } else {
      sound.playSfx('bombReleased');
    }
  }

  function _forceNextBlock() {
    // Determine which preview window is next
    var nextPreviewWindow;
    var longestTime;
    var currentTime;
    var i;
    switch (game.numberOfSidesBlocksFallFrom) {
    case 4:
      longestTime = game.previewWindows[0].getTimeSinceLastBlock();
      nextPreviewWindow = game.previewWindows[0];
      for (i = 1; i < 4; ++i) {
        currentTime = game.previewWindows[i].getTimeSinceLastBlock();
        if (currentTime > longestTime) {
          longestTime = currentTime;
          nextPreviewWindow = game.previewWindows[i];
        }
      }
      break;
    case 3:
      longestTime = game.previewWindows[0].getTimeSinceLastBlock();
      nextPreviewWindow = game.previewWindows[0];
      currentTime = game.previewWindows[1].getTimeSinceLastBlock();
      if (currentTime > longestTime) {
        longestTime = currentTime;
        nextPreviewWindow = game.previewWindows[1];
      }
      currentTime = game.previewWindows[3].getTimeSinceLastBlock();
      if (currentTime > longestTime) {
        longestTime = currentTime;
        nextPreviewWindow = game.previewWindows[3];
      }
      break;
    case 2:
      if (game.previewWindows[1].getTimeSinceLastBlock() > 
          game.previewWindows[3].getTimeSinceLastBlock()) {
        nextPreviewWindow = game.previewWindows[1];
      } else {
        nextPreviewWindow = game.previewWindows[3];
      }
      break;
    case 1:
      nextPreviewWindow = game.previewWindows[0];
      break;
    default:
      return;
    }

    // Force the next preview window to release its block now
    _setupNextBlock(nextPreviewWindow);
  }

  function _releaseBomb() {
    if (game.collapseBombWindow.getIsPrimed()) {
      game.collapseBombWindow.releaseBomb();
    } else {
      game.settleBombWindow.releaseBomb();
    }
  }

  function _unPrimeBomb() {
    if (game.primedBombType === BombWindow.prototype.COLLAPSE_BOMB) {
      game.collapseBombWindow.unPrimeBomb();
    } else {
      game.settleBombWindow.unPrimeBomb();
    }

    game.primedWindowIndex = -1;
    game.primedBombType = -1;

    input.selectedKeyboardBlock = gameWindow.blocksOnGameWindow[0];
  }

  function _init(canvas, levelDisplay, scoreDisplay, onGameEnd, toggleMode, 
      changeGameParameter) {
    _canvas = canvas;
    _context = _canvas.getContext('2d');
    _levelDisplay = levelDisplay;
    _scoreDisplay = scoreDisplay;
    _onGameEnd = onGameEnd;
    _toggleMode = toggleMode;
    _changeGameParameter = changeGameParameter;

    _setUpPreviewWindows();
    _setUpBombWindows();

    gameWindow.init();

    game.updateDimensions();
  }

  function _setUpPreviewWindows() {
    var previewWindow1 = new PreviewWindow(0);
    var previewWindow2 = new PreviewWindow(1);
    var previewWindow3 = new PreviewWindow(2);
    var previewWindow4 = new PreviewWindow(3);

    game.previewWindows = [previewWindow1, previewWindow2, previewWindow3, previewWindow4];
  }

  function _setUpBombWindows() {
    game.collapseBombWindow = new BombWindow(BombWindow.prototype.COLLAPSE_BOMB, _INITIAL_COLLAPSE_BOMB_COUNT);
    game.settleBombWindow = new BombWindow(BombWindow.prototype.SETTLE_BOMB, _INITIAL_SETTLE_BOMB_COUNT);
  }

  function _updateDimensions() {
    _updateCanvasDimensions();
    gameWindow.updateDimensions();
    _updatePreviewWindowDimensions();
    _updateBombWindowDimensions();
  }

  function _updateCanvasDimensions() {
    _canvas.width = utils.getElementWidth(_canvas);
    _canvas.height = utils.getElementHeight(_canvas);
    gameWindow.gameWindowPixelSize = _canvas.width * _GAME_AREA_SIZE_RATIO;
    game.previewWindowSizePixels = _canvas.width * _PREVIEW_WINDOW_SIZE_RATIO;
    _previewWindowOuterMarginPixels = _canvas.width * _PREVIEW_WINDOW_OUTER_MARGIN_RATIO;
    _previewWindowInnerMarginPixels = _canvas.width * _PREVIEW_WINDOW_INNER_MARGIN_RATIO;
    gameWindow.gameWindowPosition.x = game.previewWindowSizePixels + _previewWindowOuterMarginPixels + _previewWindowInnerMarginPixels;
    gameWindow.gameWindowPosition.y = gameWindow.gameWindowPosition.x;
  }

  function _updatePreviewWindowDimensions() {
    var size = game.previewWindowSizePixels;

    // This is the horizontal distance (in pixels) from the left side 
    // of the canvas to the left side of the top-side preview window
    var tmp1 = (game.previewWindowSizePixels / 2) + 
          _previewWindowOuterMarginPixels + 
          _previewWindowInnerMarginPixels + 
          (gameWindow.gameWindowPixelSize / 2);

    // This is the horizontal distance (in pixels) from the left side 
    // of the canvas to the left side of the right-side preview window
    var tmp2 = game.previewWindowSizePixels + 
          _previewWindowOuterMarginPixels + 
          (_previewWindowInnerMarginPixels * 2) + 
          gameWindow.gameWindowPixelSize;

    var x1 = tmp1;
    var y1 = _previewWindowInnerMarginPixels;
    var x2 = tmp2;
    var y2 = tmp1;
    var x3 = tmp1;
    var y3 = tmp2;
    var x4 = _previewWindowInnerMarginPixels;
    var y4 = tmp1;

    game.previewWindows[0].updateDimensions(x1, y1, size);
    game.previewWindows[1].updateDimensions(x2, y2, size);
    game.previewWindows[2].updateDimensions(x3, y3, size);
    game.previewWindows[3].updateDimensions(x4, y4, size);
  }

  function _updateBombWindowDimensions() {
    var x;
    var y;
    var w;
    var h;

    h = game.previewWindowSizePixels * 0.6667;
    w = h * 2;
    y = game.previewWindows[2].getCenterPosition().y - h / 2;

    x = gameWindow.gameWindowPosition.x + gameWindow.gameWindowPixelSize * 0.25 - w / 2;
    game.collapseBombWindow.updateDimensions(x, y, w, h);

    x = gameWindow.gameWindowPosition.x + gameWindow.gameWindowPixelSize * 0.75 - w / 2;
    game.settleBombWindow.updateDimensions(x, y, w, h);
  }

  function _getHelpButtonRect() {
    return {
      left: game.previewWindows[3].getPosition().x,
      top: game.previewWindows[2].getPosition().y,
      width: game.previewWindowSizePixels,
      height: game.previewWindowSizePixels
    };
  }

  function _getAudioButtonRect() {
    return {
      left: game.previewWindows[1].getPosition().x,
      top: game.previewWindows[2].getPosition().y,
      width: game.previewWindowSizePixels,
      height: game.previewWindowSizePixels
    };
  }

  function _incrementCollapseBombUsedCount() {
    ++_collapseBombsUsedCount;
  }

  function _incrementSettleBombUsedCount() {
    ++_settleBombsUsedCount;
  }

  function _clearCanvas() {
    _keepCanvasClear = true;
    _context.clearRect(0, 0, _canvas.width, _canvas.height);
  }

  function _getIsCollapseBombPrimed() {
    return game.collapseBombWindow.getIsPrimed();
  }

  function _getIsSettleBombPrimed() {
    return game.settleBombWindow.getIsPrimed();
  }

  function _getScore() {
    return _score;
  }

  function _getLevel() {
    return _level;
  }

  function _getTime() {
    return _gameTime;
  }

  function _getLayersCollapsed() {
    return _layersCollapsedCount;
  }

  function _getSquaresCollapsed() {
    return _squaresCollapsedCount;
  }

  function _getBlocksHandled() {
    return _blocksHandledCount;
  }

  function _getCollapseBombsUsed() {
    return _collapseBombsUsedCount;
  }

  function _getSettleBombsUsed() {
    return _settleBombsUsedCount;
  }

  // Make Game available to the rest of the program
  window.game = {
    draw: _draw,
    update: _update,
    reset: _reset,
    play: _play,
    pause: _pause,
    endGame: _endGame,

    getScore: _getScore,
    getLevel: _getLevel,
    getTime: _getTime,
    getLayersCollapsed: _getLayersCollapsed,
    getSquaresCollapsed: _getSquaresCollapsed,
    getBlocksHandled: _getBlocksHandled,
    getCollapseBombsUsed: _getCollapseBombsUsed,
    getSettleBombsUsed: _getSettleBombsUsed,

    addCollapseToScore: _addCollapseToScore,

    init: _init,

    getHelpButtonRect: _getHelpButtonRect,
    getAudioButtonRect: _getAudioButtonRect,

    forceNextBlock: _forceNextBlock,

    releaseBomb: _releaseBomb,
    unPrimeBomb: _unPrimeBomb,

    incrementCollapseBombUsedCount: _incrementCollapseBombUsedCount,
    incrementSettleBombUsedCount: _incrementSettleBombUsedCount,

    getIsCollapseBombPrimed: _getIsCollapseBombPrimed,
    getIsSettleBombPrimed: _getIsSettleBombPrimed,

    updateDimensions: _updateDimensions,

    setChapterParameters: _setChapterParameters,

    clearCanvas: _clearCanvas,

    previewWindows: null,
    collapseBombWindow: null,
    settleBombWindow: null,

    previewWindowSizePixels: 0, // in pixels

    primedWindowIndex: -1,
    primedBombType: -1,

    isPaused: true,
    isEnded: true,

    isMobile: false,

    musicOn: true,
    sfxOn: true,

    keyboardControlOn: false,
    completingSquaresOn: true,
    canFallPastCenterOn: true,
    canChangeFallDirectionOn: false,
    switchQuadrantsWithFallDirectionOn: false,
    collapseCausesSettlingOn: false,
    layersAlsoSettleInwardsOn: true,
    blocksFallOutwardOn: false,
    bombsOn: false,
    peanutGalleryOn: false,

    startingLevel: 1,
    numberOfSquaresInABlock: 8,
    numberOfSidesBlocksFallFrom: 4,

    positionOfGameOver: null,

    MEDIUM_COLORS: [
      { r: 55,  g: 178,  b: 22,  a: 1.0,  str: 'rgba(55,178,22,1.0)' },  // Green
      { r: 22,  g: 99,  b: 178,  a: 1.0,  str: 'rgba(22,99,178,1.0)' },  // Blue
      { r: 132,  g: 22,  b: 178,  a: 1.0,  str: 'rgba(132,22,178,1.0)' },  // Purple
      { r: 178,  g: 22,  b: 44,  a: 1.0,  str: 'rgba(178,22,44,1.0)' },  // Red
      { r: 178,  g: 99,  b: 22,  a: 1.0,  str: 'rgba(178,99,22,1.0)' },  // Orange
      { r: 178,  g: 172,  b: 22,  a: 1.0,  str: 'rgba(178,172,22,1.0)' },  // Yellow
      { r: 100,  g: 100,  b: 100,  a: 1.0,  str: 'rgba(100,100,100,1.0)' }  // Grey
    ],

    LIGHT_COLORS: [
      { r: 175,  g: 243,  b: 157, a: 1.0,  str: 'rgba(175,243,157,1.0)' },  // Green
      { r: 157,  g: 199,  b: 243, a: 1.0,  str: 'rgba(157,199,243,1.0)' },  // Blue
      { r: 218,  g: 157,  b: 243, a: 1.0,  str: 'rgba(218,157,243,1.0)' },  // Purple
      { r: 243,  g: 157,  b: 169, a: 1.0,  str: 'rgba(243,157,169,1.0)' },  // Red
      { r: 243,  g: 199,  b: 157, a: 1.0,  str: 'rgba(243,199,157,1.0)' },  // Orange
      { r: 243,  g: 240,  b: 157, a: 1.0,  str: 'rgba(243,240,157,1.0)' },  // Yellow
      { r: 200,  g: 200,  b: 200, a: 1.0,  str: 'rgba(200,200,200,1.0)' }  // Grey
    ],

    LESS_DARK_COLORS: [
      { r: 21,  g: 77,  b: 9,  a: 1.0,  str: 'rgba(21,77,9,1.0)' },    // Green
      { r: 9,    g: 49,  b: 91,  a: 1.0,  str: 'rgba(9,49,91,1.0)' },    // Blue
      { r: 63,  g: 9,  b: 87,  a: 1.0,  str: 'rgba(63,9,87,1.0)' },    // Purple
      { r: 87,  g: 9,  b: 20,  a: 1.0,  str: 'rgba(87,9,20,1.0)' },    // Red
      { r: 87,  g: 48,  b: 9,  a: 1.0,  str: 'rgba(87,48,9,1.0)' },    // Orange
      { r: 87,  g: 82,  b: 9,  a: 1.0,  str: 'rgba(87,82,9,1.0)' },    // Yellow
      { r: 48,  g: 48,  b: 48,  a: 1.0,  str: 'rgba(48,48,48,1.0)' }    // Grey
    ],

    DARK_COLORS: [
      { r: 11,  g: 39,  b: 5,  a: 1.0, str: 'rgba(11,39,5,1.0)' },    // Green
      { r: 6,    g: 29,  b: 54,  a: 1.0, str: 'rgba(6,29,54,1.0)' },    // Blue
      { r: 37,  g: 6,  b: 50,  a: 1.0, str: 'rgba(37,6,50,1.0)' },    // Purple
      { r: 54,  g: 6,  b: 13,  a: 1.0, str: 'rgba(54,6,13,1.0)' },    // Red
      { r: 50,  g: 28,  b: 6,  a: 1.0, str: 'rgba(50,28,6,1.0)' },    // Orange
      { r: 49,  g: 45,  b: 5,  a: 1.0, str: 'rgba(49,45,5,1.0)' },    // Yellow
      { r: 34,  g: 34,  b: 34,  a: 1.0, str: 'rgba(34,34,34,1.0)' }    // Grey
    ],

    PREVIEW_WINDOW_PROGRESS_FILLS: [
      { r: 33,  g: 51,  b: 63, a: 1.0, str: 'rgba(33,51,63,1.0)' },    // Blue
      { r: 63,  g: 63,  b: 39, a: 1.0, str: 'rgba(63,63,39,1.0)' },    // Yellow
      { r: 44,  g: 63,  b: 42, a: 1.0, str: 'rgba(44,63,42,1.0)' },    // Green
      { r: 63,  g: 43,  b: 43, a: 1.0, str: 'rgba(63,43,43,1.0)' }    // Red
    ],

    PREVIEW_WINDOW_PROGRESS_STROKES: [
      { r: 132,  g: 206,  b: 255, a: 1.0, str: 'rgba(132,206,255,1.0)' },  // Blue
      { r: 255,  g: 255,  b: 156, a: 1.0, str: 'rgba(255,255,156,1.0)' },  // Yellow
      { r: 178,  g: 255,  b: 170, a: 1.0, str: 'rgba(178,255,170,1.0)' },  // Green
      { r: 255,  g: 174,  b: 174, a: 1.0, str: 'rgba(255,174,174,1.0)' }  // Red
    ],

    DEFAULT_FILL: { r: 20, g: 20, b: 20, a: 1.0, str: 'rgba(20,20,20,1.0)' }, // Off-black
    DEFAULT_STROKE: { r: 90, g: 90, b: 90, a: 1.0, str: 'rgba(90,90,90,1.0)' }, // Darkish grey

    VALID_MOVE_FILL: { r: 100, g: 200, b: 255, a: 0.2, str: 'rgba(100,200,255,0.2)' }, // Neon blue
    VALID_MOVE_STROKE: { r: 100, g: 200, b: 255, a: 0.5, str: 'rgba(100,200,255,0.5)' }, // Lighter neon blue

    INVALID_MOVE_FILL: { r: 255, g: 120, b: 120, a: 0.8, str: 'rgba(255,120,120,0.8)' }, // Neon red
    INVALID_MOVE_STROKE: { r: 255, g: 200, b: 200, a: 1.0, str: 'rgba(255,200,200,1.0)' } // Lighter neon red
  };

  log.i('<--game.LOADING_MODULE');
}());
