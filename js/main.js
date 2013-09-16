// ------------------------------------------------------------------------- //
// -- main
// ------------------------------------------------------------------------- //
// This file provides the main driving logic for the Squared Away web app.
// 
// Dependencies:
//		- window.log
//		- window.Game
//		- window.Sprite
//		- window.Block
//		- window.PreviewWindow
//		- window.GameWindow
//		- window.resources
//		- window.input
//		- window.sound
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->main.LOADING_MODULE");

	var _ANIMATION_STEP_SIZE = 25;

	var _VIEWPORT_MARGIN = 20;

	var _ABANDON_CONFIRMATION_MSG = "Are you sure you want to abandon your progress in the current game?";

	var _IMAGE_PATH = "img/";

	var _NUMBER_OF_CHAPTERS = 10;

	var _canvas = null;
	var _body = null;

	var _gestureInProgress = false;

	var _selectedChapterIndex = 1;
	var _highestCompletedChapter = 0;

	var _chapterItemWidth = 500;

	var _prevChapterWasSuccessful = false;

	var _imageManifest = [
		_IMAGE_PATH + "sprites.png"
	];

	var _buttonManifest = {
		quickPlayButton: { normal: "img/quick_play.png", hover: "img/quick_play_hover.png" },
		customPlayButton: { normal: "img/custom_play.png", hover: "img/custom_play_hover.png" },
		prevButton: { normal: "img/prev.png", hover: "img/prev_hover.png" },
		nextButton: { normal: "img/next.png", hover: "img/next_hover.png" },
		helpButton: { normal: "img/help.png", hover: "img/help_hover.png" },
		chapter1: { normal: "img/chapter_1.png", hover: "img/chapter_1_hover.png" },
		chapter2: { normal: "img/chapter_2.png", hover: "img/chapter_2_hover.png" },
		chapter3: { normal: "img/chapter_3.png", hover: "img/chapter_3_hover.png" },
		chapter4: { normal: "img/chapter_4.png", hover: "img/chapter_4_hover.png" },
		chapter5: { normal: "img/chapter_5.png", hover: "img/chapter_5_hover.png" },
		chapter6: { normal: "img/chapter_6.png", hover: "img/chapter_6_hover.png" },
		chapter7: { normal: "img/chapter_7.png", hover: "img/chapter_7_hover.png" },
		chapter8: { normal: "img/chapter_8.png", hover: "img/chapter_8_hover.png" },
		chapter9: { normal: "img/chapter_9.png", hover: "img/chapter_9_hover.png" },
		chapter10: { normal: "img/chapter_10.png", hover: "img/chapter_10_hover.png" },
		playGameButton: { normal: "img/play_game.png", hover: "img/play_game_hover.png" },
		customPlayMainMenuButton: { normal: "img/main_menu.png", hover: "img/main_menu_hover.png" },
		unpauseButton: { normal: "img/unpause.png", hover: "img/unpause_hover.png" },
		restartButton: { normal: "img/restart.png", hover: "img/restart_hover.png" },
		pauseMainMenuButton: { normal: "img/main_menu.png", hover: "img/main_menu_hover.png" },
		nextChapterButton: { normal: "img/next_chapter.png", hover: "img/next_chapter_hover.png" },
		playAgainButton: { normal: "img/play_again.png", hover: "img/play_again_hover.png" },
		gameOverMainMenuButton: { normal: "img/main_menu.png", hover: "img/main_menu_hover.png" },
		musicButton: {
			on: "img/music_on.png", onHover: "img/music_on_hover.png",
			off: "img/music_off.png", offHover: "img/music_off_hover.png"
		},
		sfxButton: {
			on: "img/sfx_on.png", onHover: "img/sfx_on_hover.png",
			off: "img/sfx_off.png", offHover: "img/sfx_off_hover.png"
		}
	};

	var checkBoxIds = [
		"keyboardControlCB",
		"completeSquaresCB",
		"blocksFallPastCenterCB",
		"changeFallDirectionCB",
		"changeQuadrantWithFallDirectionCB",
		"settleWithCollapseCB",
		"settleInwardCB",
		"bombsCB",
		"fallOutwardCB",
		"consoleCB",
		"peanutGalleryCB"
	];

	var startOfGameCheckBoxIds = [
		"fallOutwardCB"
	];

	var dropDownMenuIds = [
		"gameWindowSize",
		"centerSquareSize",
		"numberOfSquaresInABlock",
		"numberOfSidesBlocksFallFrom",
		"startingLevel"
	];

	// These are the drop down menus whose values should not change in mid game
	var startOfGameDropDownMenuIds = [
		"gameWindowSize",
		"centerSquareSize",
		"numberOfSidesBlocksFallFrom"
	];

	// Preload all required resources and call _init when done
	window.resources.onready = _init;
	window.resources.load(_imageManifest);

	_setupDOMForJavascript();

	// We should not need to wait for window.load to complete, because this file 
	// should be the last part to load
	function _init() {
		log.d("-->main._init");

		var i;

		_body = document.getElementsByTagName("body")[0];
		_canvas = document.getElementById("gameCanvas");
		var levelDisplay = document.getElementById("topLevelDisplayData");
		var scoreDisplay = document.getElementById("topScoreDisplayData");
		var quickPlayButton = document.getElementById("quickPlayButton");
		var nextButton = document.getElementById("nextButton");
		var prevButton = document.getElementById("prevButton");
		var helpButton = document.getElementById("helpButton");
		var musicButton = document.getElementById("musicButton");
		var sfxButton = document.getElementById("sfxButton");
		var nextChapterButton = document.getElementById("nextChapterButton");
		var playAgainButton = document.getElementById("playAgainButton");
		var gameOverMainMenuButton = document.getElementById("gameOverMainMenuButton");
		var unpauseButton = document.getElementById("unpauseButton");
		var restartButton = document.getElementById("restartButton");
		var pauseMainMenuButton = document.getElementById("pauseMainMenuButton");
		var playGameButton = document.getElementById("playGameButton");
		var customPlayMainMenuButton = document.getElementById("customPlayMainMenuButton");

		var screenSize = _fitAppToViewPort();

		game.init(_canvas, levelDisplay, scoreDisplay, _onGameEnd, 
				_toggleMode, _changeGameParameter);

		_adjustGameAreaElements(screenSize);

		// ---------- Hook up the event handlers ---------- //

		window.addEventListener("resize", _onWindowResize, false)
		window.addEventListener("blur", _pauseGame, false);

		document.addEventListener("keydown", _onKeyDown, false);
		document.addEventListener("keyup", _onKeyUp, false);
		document.addEventListener("keypress", _onKeyPress, false);

		_canvas.addEventListener("mousedown", _onMouseDown, false);
		document.addEventListener("mousemove", _onMouseMove, false);
		document.addEventListener("mouseup", _onMouseUp, false);
		_canvas.addEventListener("touchstart", _onTouchEvent, false);
		document.addEventListener("touchmove", _onTouchEvent, false);
		document.addEventListener("touchend", _onTouchEvent, false);
		document.addEventListener("touchcancel", _onTouchEvent, false);

		var modeCBs = document.getElementsByClassName("modeCB");
		for (i = 0; i < modeCBs.length; ++i) {
			modeCBs[i].addEventListener("click", _onModeCBClicked, false);
		}

		var gameParameterSelects = document.getElementsByClassName("gameParameterSelect");
		for (i = 0; i < gameParameterSelects.length; ++i) {
			gameParameterSelects[i].addEventListener("change", _onGameParameterSelectionChange, false);
		}

		// Game area screen buttons
		helpButton.addEventListener("click", _pauseGame, false);
		helpButton.addEventListener("mouseover", _onButtonOver, false);
		helpButton.addEventListener("mouseout", _onButtonOut, false);
		musicButton.addEventListener("click", _onAudioClick, false);
		musicButton.addEventListener("mousemove", _onAudioMove, false);
		musicButton.addEventListener("mouseout", _onAudioOut, false);
		sfxButton.addEventListener("click", _onAudioClick, false);
		sfxButton.addEventListener("mousemove", _onAudioMove, false);
		sfxButton.addEventListener("mouseout", _onAudioOut, false);

		// Main menu screen buttons
		quickPlayButton.addEventListener("click", _onQuickPlayClick, false);
		quickPlayButton.addEventListener("mouseover", _onButtonOver, false);
		quickPlayButton.addEventListener("mouseout", _onButtonOut, false);
		nextButton.addEventListener("click", _onNextClick, false);
		nextButton.addEventListener("mouseover", _onButtonOver, false);
		nextButton.addEventListener("mouseout", _onButtonOut, false);
		prevButton.addEventListener("click", _onPrevClick, false);
		prevButton.addEventListener("mouseover", _onButtonOver, false);
		prevButton.addEventListener("mouseout", _onButtonOut, false);

		// Game over screen buttons
		nextChapterButton.addEventListener("click", _onNextChapterClick, false);
		nextChapterButton.addEventListener("mouseover", _onButtonOver, false);
		nextChapterButton.addEventListener("mouseout", _onButtonOut, false);
		playAgainButton.addEventListener("click", _onPlayAgainClick, false);
		playAgainButton.addEventListener("mouseover", _onButtonOver, false);
		playAgainButton.addEventListener("mouseout", _onButtonOut, false);
		gameOverMainMenuButton.addEventListener("click", _onMainMenuButtonClick, false);
		gameOverMainMenuButton.addEventListener("mouseover", _onButtonOver, false);
		gameOverMainMenuButton.addEventListener("mouseout", _onButtonOut, false);

		// Pause screen buttons
		unpauseButton.addEventListener("click", _onUnpauseClick, false);
		unpauseButton.addEventListener("mouseover", _onButtonOver, false);
		unpauseButton.addEventListener("mouseout", _onButtonOut, false);
		restartButton.addEventListener("click", _onRestartClick, false);
		restartButton.addEventListener("mouseover", _onButtonOver, false);
		restartButton.addEventListener("mouseout", _onButtonOut, false);
		pauseMainMenuButton.addEventListener("click", _onMainMenuButtonClick, false);
		pauseMainMenuButton.addEventListener("mouseover", _onButtonOver, false);
		pauseMainMenuButton.addEventListener("mouseout", _onButtonOut, false);

		// Custom play screen buttons
		playGameButton.addEventListener("click", _onStartGameClick, false);
		playGameButton.addEventListener("mouseover", _onButtonOver, false);
		playGameButton.addEventListener("mouseout", _onButtonOut, false);
		customPlayMainMenuButton.addEventListener("click", _onMainMenuButtonClick, false);
		customPlayMainMenuButton.addEventListener("mouseover", _onButtonOver, false);
		customPlayMainMenuButton.addEventListener("mouseout", _onButtonOut, false);

		_setHighestCompletedChapter(0);

		// Initialize the various modes and game parameters
		_setInitialModesAndParamsToHtmlValues();

		_showScreen("mainMenuScreen");

		// ---------- Set up the song checkboxes ---------- //

		var musicManifest = sound.getMusicManifest();
		var selectedMusic = sound.getSelectedMusic();
		var songCheckBox;

		for (i = 0; i < musicManifest.length; ++i) {
			songCheckBox = document.getElementById(musicManifest[i].id);
			songCheckBox.addEventListener("click", sound.onMusicSelectionChange, false);
			if (songCheckBox.checked) {
				selectedMusic.push(songCheckBox.id);
			}
		}

		sound.init(_onAudioOut);

		log.i("<--main._init");
	}

	function _playGame() {
		log.d("-->main._playGame");

		// Set up the pause screen content
		_showScreen(null);
		var topLevelDisplayArea = document.getElementById("topLevelDisplayArea");
		topLevelDisplayArea.style.display = "block";
		var topScoreDisplayArea = document.getElementById("topScoreDisplayArea");
		topScoreDisplayArea.style.display = "block";

		_prevChapterWasSuccessful = false;

		// If we are starting a new game, then adjust the game parameters to 
		// match the selected input options
		if (game.isEnded) {
			game.setChapterParameters(_selectedChapterIndex);

			sound.playSfx("gameStart");
		} else if (game.isPaused) {
			sound.playSfx("unpause");
		}

		game.play();

		sound.playCurrentMusic();

		log.d("<--main._playGame");
	}

	function _pauseGame() {
		log.d("-->main._pauseGame");

		if (!game.isPaused && !game.isEnded) {
			_showScreen("pauseScreen");

			game.pause();

			sound.playSfx("pause");
			sound.pauseMusic();

			// If this was the effect of a help-button press, then scroll to the 
			// help area
			var helpButton = document.getElementById("helpButton");
			if (this === helpButton) {
				var infoAreaRect = utils.standardizeClientRect(infoArea);
				window.scrollTo(0, infoAreaRect.top);
			}
		}

		log.d("<--main._pauseGame");
	}

	function _onGameEnd(chapterComplete) {
		log.d("-->main._onGameEnd");

		_populateStatsTable();

		if (chapterComplete) {
			if (_selectedChapterIndex > _highestCompletedChapter) {
				_setHighestCompletedChapter(_selectedChapterIndex);
			}
			_prevChapterWasSuccessful = true;
			sound.playSfx("chapterComplete");
		} else {
			_prevChapterWasSuccessful = false;
			sound.playSfx("gameOver");
		}

		// Set up the game over screen content
		_showScreen("gameOverScreen");

		sound.pauseMusic();

		log.d("<--main._onGameEnd");
	}

	function _populateStatsTable() {
		var scoreData = document.getElementById("scoreData");
		scoreData.innerHTML = game.getScore();

		var levelData = document.getElementById("levelData");
		levelData.innerHTML = game.getLevel();

		var timeData = document.getElementById("timeData");
		var timeString = utils.getHourMinSecTime(game.getTime());
		timeData.innerHTML = timeString;

		var layersCollapsedData = document.getElementById("layersCollapsedData");
		layersCollapsedData.innerHTML = game.getLayersCollapsed();

		var squaresCollapsedData = document.getElementById("squaresCollapsedData");
		squaresCollapsedData.innerHTML = game.getSquaresCollapsed();

		var blocksHandledData = document.getElementById("blocksHandledData");
		blocksHandledData.innerHTML = game.getBlocksHandled();

		var collapseBombsUsedData = document.getElementById("collapseBombsUsedData");
		collapseBombsUsedData.innerHTML = game.getCollapseBombsUsed();

		var settleBombsUsedData = document.getElementById("settleBombsUsedData");
		settleBombsUsedData.innerHTML = game.getSettleBombsUsed();
	}

	function _setupDOMForJavascript() {
		var noJavaScriptArea = document.getElementById("noJavaScriptArea");
		noJavaScriptArea.style.display = "none";
		var playArea = document.getElementById("playArea");
		playArea.style.display = "block";
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "block";
	}

	function _expandInfoArea() {
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "block";
		var helpButton = document.getElementById("helpButton");
		helpButton.style.display = "none";
		// TODO: switch divs; animate
	}

	function _collapseInfoArea() {
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "none";
		var helpButton = document.getElementById("helpButton");
		helpButton.style.display = "block";
		// TODO: switch divs; animate
	}

	function _onKeyDown(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		var gameControl = -1;

		switch(key) {
		case "UP":
			gameControl = input.UP;
			event.preventDefault();
			break;
		case "RIGHT":
			gameControl = input.RIGHT;
			break;
		case "DOWN":
			gameControl = input.DOWN;
			event.preventDefault();
			break;
		case "LEFT":
			gameControl = input.LEFT;
			break;
		case "X":
			gameControl = input.ROTATE;
			break;
		case "Z":
			gameControl = input.SWITCH_BLOCKS;
			break;
		case "A":
			gameControl = input.COLLAPSE_BOMB;
			break;
		case "S":
			gameControl = input.SETTLE_BOMB;
			break;
		default:
			break;
		}

		if (gameControl >= 0) {
			input.onKeyboardControlOn(gameControl);
		}
	}

	function _onKeyUp(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		var gameControl = -1;

		switch(key) {
		case "ESCAPE": // pause only
			if (!game.isPaused && !game.isEnded) {
				_pauseGame();
			}
			break;

		case "UP":
			gameControl = input.UP;
			break;
		case "RIGHT":
			gameControl = input.RIGHT;
			break;
		case "DOWN":
			gameControl = input.DOWN;
			break;
		case "LEFT":
			gameControl = input.LEFT;
			break;
		case "X":
			gameControl = input.ROTATE;
			break;
		case "Z":
			gameControl = input.SWITCH_BLOCKS;
			break;
		case "A":
			gameControl = input.COLLAPSE_BOMB;
			break;
		case "S":
			gameControl = input.SETTLE_BOMB;
			break;
		default:
			break;
		}

		if (gameControl >= 0) {
			input.onKeyboardControlOff(gameControl);
		}
	}

	function _onKeyPress(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ENTER": // play only
			if (game.isPaused || game.isEnded) {
				_playGame();
			}
			break;
		case "SPACE": // toggle play/pause
			if (game.isPaused || game.isEnded) {
				_playGame();
			} else {
				_pauseGame();
			}
			event.preventDefault();
			break;
		default:
			return;
		}
	}

	function _onTouchEvent(event) {
		switch (event.type) {
		case "touchstart":
			_onMouseDown(event);
			break;
		case "touchmove":
			_onMouseMove(event);
			break;
		case "touchend":
			_onMouseUp(event);
			break;
		case "touchcancel":
			input.cancelMouseGesture();
			break;
		default:
			return;
		}

		if (input.selectedMouseBlock) {
			event.preventDefault();
		}
	}

	function _onMouseDown(event) {
		event = utils.standardizeMouseEvent(event);

		// We only care about gestures which occur while the game is running
		if (!game.isPaused && !game.isEnded) {
			_gestureInProgress = true;

			var pagePos = { x: event.pageX, y: event.pageY };
			var currentTime = Date.now();

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameWindowRect = utils.standardizeClientRect(_canvas);
			var gameWindowPos = {
				x: pagePos.x - gameWindowRect.left - gameWindow.gameWindowPosition.x,
				y: pagePos.y - gameWindowRect.top - gameWindow.gameWindowPosition.y
			};

			input.startMouseGesture(gameWindowPos, currentTime);
		}

		// It ruins gameplay for the browser to use the mouse drag as a 
		// highlight gesture
		event.preventDefault();
	}

	function _onMouseUp(event) {
		event = utils.standardizeMouseEvent(event);

		if (_gestureInProgress) {
			_gestureInProgress = false;

			var pagePos = { x: event.pageX, y: event.pageY };
			var currentTime = Date.now();

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameWindowRect = utils.standardizeClientRect(_canvas);
			var gameWindowPos = {
				x: pagePos.x - gameWindowRect.left - gameWindow.gameWindowPosition.x,
				y: pagePos.y - gameWindowRect.top - gameWindow.gameWindowPosition.y
			};

			input.finishMouseGesture(gameWindowPos, currentTime);
		}
	}

	function _onMouseMove(event) {
		event = utils.standardizeMouseEvent(event);

		// Check whether this event is part of a drag
		if (_gestureInProgress) {
			var pagePos = { x: event.pageX, y: event.pageY };

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameWindowRect = utils.standardizeClientRect(_canvas);
			var gameWindowPos = {
				x: pagePos.x - gameWindowRect.left - gameWindow.gameWindowPosition.x,
				y: pagePos.y - gameWindowRect.top - gameWindow.gameWindowPosition.y
			};

			input.dragMouseGesture(gameWindowPos);
		}
	}

	function _onUnpauseClick() {
		if (game.isEnded) {
			_playGame();
		} else if (game.isPaused) {
			_playGame();
		} else {
			_pauseGame();
		}
	}

	function _onStartGameClick() {
		// Check whether we are in custom play
		if (_selectedChapterIndex === -1) {
			_setCustomStartOfGameParameters();
		}
		_playGame();
	}

	function _onQuickPlayClick() {
		_selectedChapterIndex = 0;
		_playGame();
	}

	function _onCustomPlayClick() {
		_showScreen("customPlayScreen");
		_showCustomControls();
		_selectedChapterIndex = -1;
	}

	function _onNextChapterClick() {
		_playGame();
	}

	function _onPlayAgainClick() {
		if (_prevChapterWasSuccessful) {
			if (_selectedChapterIndex > 1) {
				--_selectedChapterIndex;
			} else {
				_selectedChapterIndex = _NUMBER_OF_CHAPTERS;
			}
		}

		_playGame();
	}

	function _onRestartClick() {
		var result = confirm(_ABANDON_CONFIRMATION_MSG);
		if (result) {
			game.isEnded = true;
			_playGame();
		}
	}

	function _onMainMenuButtonClick() {
		if (this.id === "pauseMainMenuButton") {
			var result = confirm(_ABANDON_CONFIRMATION_MSG);
			if (!result) {
				return;
			} else {
				game.isEnded = true;
				_clearGameArea();
			}
		} else if (_selectedChapterIndex < 1) {
			_selectedChapterIndex = _highestCompletedChapter + 1;
			if (_selectedChapterIndex > _NUMBER_OF_CHAPTERS) {
				_selectedChapterIndex = 1;
			}
		}

		_showScreen("mainMenuScreen");
	}

	function _onNextClick() {
		if (_selectedChapterIndex < _NUMBER_OF_CHAPTERS) {
			++_selectedChapterIndex;
			_slideNextChapterItem(_selectedChapterIndex - 1, true);
			_showPrevAndNextButtons();
			_updateChapterProgressIndicator();
		}
	}

	function _onPrevClick() {
		if (_selectedChapterIndex > 1) {
			--_selectedChapterIndex;
			_slideNextChapterItem(_selectedChapterIndex + 1, false);
			_showPrevAndNextButtons();
			_updateChapterProgressIndicator();
		}
	}

	function _updateChapterProgressIndicator() {
		var chapterProgressIndicator = document.getElementById("chapterProgressIndicator");
		chapterProgressIndicator.innerHTML = _selectedChapterIndex + "/" + _NUMBER_OF_CHAPTERS;
	}

	function _slideNextChapterItem(oldIndex, slideLeft) {
		var oldChapterItemId = "chapter" + oldIndex;
		var oldChapterItemElem = document.getElementById(oldChapterItemId);
		var newChapterItemId = "chapter" + _selectedChapterIndex;
		var newChapterItemElem = document.getElementById(newChapterItemId);

		if (slideLeft) {
			oldChapterItemElem.style.left = (-_chapterItemWidth) + "px";
		} else {
			oldChapterItemElem.style.left = (_chapterItemWidth) + "px";
		}
		newChapterItemElem.style.left = "0px";

		oldChapterItemElem.style.visibility = "hidden";
		newChapterItemElem.style.visibility = "visible";
	}

	function _onButtonOver(event) {
		document.getElementById(this.id).src = _buttonManifest[this.id].hover;
	}

	function _onButtonOut(event) {
		document.getElementById(this.id).src = _buttonManifest[this.id].normal;
	}

	// This function is needed, because the music and SFX toggle buttons are 
	// actually triangles that form two halves of a square.  Therefore, the 
	// image regions overlap and without this function, only one of either 
	// music or SFX would ever be toggled.
	function _onAudioClick(event) {
		if (_isOverMusic(event, this)) {
			sound.toggleMusic(event);
		} else {
			sound.toggleSfx(event);
		}
	}

	function _onAudioMove(event) {
		var musicId = "musicButton";
		var musicElement = document.getElementById(musicId);
		var sfxId = "sfxButton";
		var sfxElement = document.getElementById(sfxId);

		if (_isOverMusic(event, this)) {
			if (game.musicOn) {
				musicElement.src = _buttonManifest[musicId].onHover;
			} else {
				musicElement.src = _buttonManifest[musicId].offHover;
			}

			if (game.sfxOn) {
				sfxElement.src = _buttonManifest[sfxId].on;
			} else {
				sfxElement.src = _buttonManifest[sfxId].on;
			}
		} else {
			if (game.sfxOn) {
				sfxElement.src = _buttonManifest[sfxId].onHover;
			} else {
				sfxElement.src = _buttonManifest[sfxId].onHover;
			}

			if (game.musicOn) {
				musicElement.src = _buttonManifest[musicId].on;
			} else {
				musicElement.src = _buttonManifest[musicId].off;
			}
		}
	}

	function _onAudioOut() {
		var musicId = "musicButton";
		var musicElement = document.getElementById(musicId);
		var sfxId = "sfxButton";
		var sfxElement = document.getElementById(sfxId);

		if (game.musicOn) {
			musicElement.src = _buttonManifest[musicId].on;
		} else {
			musicElement.src = _buttonManifest[musicId].off;
		}

		if (game.sfxOn) {
			sfxElement.src = _buttonManifest[sfxId].on;
		} else {
			sfxElement.src = _buttonManifest[sfxId].on;
		}
	}

	function _isOverMusic(event, that) {
		event = utils.standardizeMouseEvent(event);
		var rect = utils.standardizeClientRect(that);
		var localX = event.pageX - rect.left;
		var localY = event.pageY - rect.top;

		return localY + localX < rect.width;
	}

	function _onModeCBClicked() {
		if (startOfGameCheckBoxIds.indexOf(this.id) < 0) {
			_toggleMode(this.id, this.checked, this);
		}
	}

	function _onWindowResize() {
		var screenSize = _fitAppToViewPort();
		game.updateDimensions();
		_adjustGameAreaElements(screenSize);
	}

	function _fitAppToViewPort() {
		var pageColumn = document.getElementById("pageColumn");
		var playArea = document.getElementById("playArea");

		var viewportWidth = document.documentElement.clientWidth;
		var viewportHeight = document.documentElement.clientHeight;

		var canvasRect = utils.standardizeClientRect(_canvas);
		var verticalScroll = canvasRect.top - _VIEWPORT_MARGIN;
		var screenSize = Math.min(viewportWidth, viewportHeight) - _VIEWPORT_MARGIN * 2;

		pageColumn.style.width = screenSize + "px"

		playArea.style.width = screenSize + "px";
		playArea.style.height = screenSize + "px";

		var h3Height = screenSize * 0.1;
		var h4Height = h3Height * 0.5;
		var screenElemMarginBottom = h4Height * 0.6;
		var screenButtonWidth = screenSize * 0.35;
		var screenButtonHeight = screenButtonWidth * 90 / 252;
		var headerAreaHeight = h3Height + h4Height + screenElemMarginBottom * 2;

		// TODO: refactor the screen layout to all use percentages and get rid of these following functions
		_adjustScreenHeaders(screenSize, h3Height, h4Height, screenElemMarginBottom);
		_adjustMainMenuScreen(screenSize);
		_adjustPauseScreen(screenSize, headerAreaHeight, screenButtonWidth, screenButtonHeight, screenElemMarginBottom);
		_adjustGameOverScreen(screenSize, headerAreaHeight, screenButtonWidth, screenButtonHeight, screenElemMarginBottom);
		_adjustCustomPlayScreen(screenSize, headerAreaHeight, screenButtonWidth, screenButtonHeight, screenElemMarginBottom);

		window.scrollTo(0, verticalScroll);

		return screenSize;
	}

	function _adjustScreenHeaders(size, h3Height, h4Height, screenElemMarginBottom) {
		var h3s = document.getElementsByTagName("h3");
		var h4s = document.getElementsByTagName("h4");
		var i;

		h3Height += "px";
		h4Height += "px";
		screenElemMarginBottom += "px";

		for (i = 0; i < h3s.length; ++i) {
			h3s[i].style.height = h3Height;
			h3s[i].style.marginBottom = screenElemMarginBottom;
		}

		for (i = 0; i < h4s.length; ++i) {
			h4s[i].style.height = h4Height;
			h4s[i].style.marginBottom = screenElemMarginBottom;
		}
	}

	function _adjustGameAreaElements(screenSize) {
		var topLevelDisplayArea = document.getElementById("topLevelDisplayArea");
		var topScoreDisplayArea = document.getElementById("topScoreDisplayArea");

		var helpButton = document.getElementById("helpButton");
		var musicButton = document.getElementById("musicButton");
		var sfxButton = document.getElementById("sfxButton");

		_canvas.style.width = screenSize + "px";
		_canvas.style.height = screenSize + "px";

		topLevelDisplayArea.style.width = (screenSize - 20) + "px";
		topScoreDisplayArea.style.width = (screenSize - 20) + "px";

		var helpRect = game.getHelpButtonRect();
		var audioRect = game.getAudioButtonRect();

		utils.setRect(helpButton, helpRect.left, helpRect.top, helpRect.width, helpRect.height);
		utils.setRect(musicButton, audioRect.left, audioRect.top, audioRect.width, audioRect.height);
		utils.setRect(sfxButton, audioRect.left, audioRect.top, audioRect.width, audioRect.height);
	}

	function _adjustMainMenuScreen(screenSize) {
		var quickPlayButton = document.getElementById("quickPlayButton");
		var customPlayButton = document.getElementById("customPlayButton");
		var prevButton = document.getElementById("prevButton");
		var nextButton = document.getElementById("nextButton");
		var chapterList = document.getElementById("chapterList");
		var chapterProgressIndicator = document.getElementById("chapterProgressIndicator");

		var halfSize = screenSize / 2;
		_chapterItemWidth = 0.55 * screenSize;
		var topButtonWidth = 0.36 * screenSize;
		var topButtonHeight = topButtonWidth * 90 / 252;
		var sideButtonHeight = topButtonHeight;
		var sideButtonWidth = sideButtonHeight * 0.69 / 0.90;
		var progressIndicatorWidth = _chapterItemWidth / 3;

		var x, y, w, h;

		w = topButtonWidth;
		h = topButtonHeight;
		x = 10;
		y = 10;
		utils.setRect(quickPlayButton, x, y, w, h);

		x = screenSize - 10 - w;
		utils.setRect(customPlayButton, x, y, w, h);

		w = _chapterItemWidth;
		h = _chapterItemWidth;
		x = halfSize - w / 2;
		y = x;
		utils.setRect(chapterList, x, y, w, h);

		w = sideButtonWidth;
		h = sideButtonHeight;
		x = 10;
		y = y + (_chapterItemWidth - sideButtonHeight) / 2;
		utils.setRect(prevButton, x, y, w, h);

		x = screenSize - 10 - w;
		utils.setRect(nextButton, x, y, w, h);

		w = progressIndicatorWidth;
		h = progressIndicatorWidth / 4;
		x = halfSize - w / 2;
		y = screenSize - 10 - h;
		utils.setRect(chapterProgressIndicator, x, y, w, h);
		chapterProgressIndicator.style.fontSize = h + "px";
	}

	function _adjustPauseScreen(screenSize, headerAreaHeight, screenButtonWidth, screenButtonHeight, screenElemMarginBottom) {
		var pauseScreenHeader = document.getElementById("pauseScreenHeader");
		var unpauseButton = document.getElementById("unpauseButton");
		var restartButton = document.getElementById("restartButton");
		var pauseMainMenuButton = document.getElementById("pauseMainMenuButton");

		var overallHeight = headerAreaHeight + screenButtonHeight * 3 + screenElemMarginBottom * 2;
		var headerTop = (screenSize - overallHeight) / 2;

		pauseScreenHeader.style.marginTop = headerTop + "px";
		unpauseButton.style.width = screenButtonWidth + "px";
		unpauseButton.style.height = screenButtonHeight + "px";
		unpauseButton.style.marginBottom = screenElemMarginBottom + "px";
		restartButton.style.width = screenButtonWidth + "px";
		restartButton.style.height = screenButtonHeight + "px";
		restartButton.style.marginBottom = screenElemMarginBottom + "px";
		pauseMainMenuButton.style.width = screenButtonWidth + "px";
		pauseMainMenuButton.style.height = screenButtonHeight + "px";
		pauseMainMenuButton.style.marginBottom = screenElemMarginBottom + "px";
	}

	function _adjustGameOverScreen(screenSize, headerAreaHeight, screenButtonWidth, screenButtonHeight, screenElemMarginBottom) {
		var gameOverScreenHeader = document.getElementById("gameOverScreenHeader");
		var nextChapterButton = document.getElementById("nextChapterButton");
		var playAgainButton = document.getElementById("playAgainButton");
		var gameOverMainMenuButton = document.getElementById("gameOverMainMenuButton");
		var statsTable = document.getElementById("statsTable");

		var tableWidth = screenButtonWidth * 2;
		var tableFontSize = screenButtonHeight / 3;
		var tableRowHeight = tableFontSize * 1.5;
		var overallHeight = headerAreaHeight + screenButtonHeight * 3 + screenElemMarginBottom * 2 + tableRowHeight * 8;
		var headerTop = (screenSize - overallHeight) / 2;

		gameOverScreenHeader.style.marginTop = headerTop + "px";
		nextChapterButton.style.width = screenButtonWidth + "px";
		nextChapterButton.style.height = screenButtonHeight + "px";
		nextChapterButton.style.marginBottom = screenElemMarginBottom + "px";
		playAgainButton.style.width = screenButtonWidth + "px";
		playAgainButton.style.height = screenButtonHeight + "px";
		playAgainButton.style.marginBottom = screenElemMarginBottom + "px";
		gameOverMainMenuButton.style.width = screenButtonWidth + "px";
		gameOverMainMenuButton.style.height = screenButtonHeight + "px";
		gameOverMainMenuButton.style.marginBottom = screenElemMarginBottom + "px";
		statsTable.style.width = tableWidth + "px";
		statsTable.style.fontSize = tableFontSize + "px";
	}

	function _adjustCustomPlayScreen(screenSize, headerAreaHeight, screenButtonWidth, screenButtonHeight, screenElemMarginBottom) {
		var customPlayScreenHeader = document.getElementById("customPlayScreenHeader");
		var playGameButton = document.getElementById("playGameButton");
		var customPlayMainMenuButton = document.getElementById("customPlayMainMenuButton");

		var overallHeight = headerAreaHeight + screenButtonHeight * 2 + screenElemMarginBottom;
		var headerTop = (screenSize - overallHeight) / 2;

		customPlayScreenHeader.style.marginTop = headerTop + "px";
		playGameButton.style.width = screenButtonWidth + "px";
		playGameButton.style.height = screenButtonHeight + "px";
		playGameButton.style.marginBottom = screenElemMarginBottom + "px";
		customPlayMainMenuButton.style.width = screenButtonWidth + "px";
		customPlayMainMenuButton.style.height = screenButtonHeight + "px";
		customPlayMainMenuButton.style.marginBottom = screenElemMarginBottom + "px";
	}

	function _toggleMode(modeCBId, isOn, element) {
		if (!element) {
			element = document.getElementById(modeCBId);
		}

		element.checked = isOn;

		switch (modeCBId) {
		case "keyboardControlCB":
			_toggleKeyboardControlOn(isOn);
			break;
		case "completeSquaresCB":
			game.completingSquaresOn = isOn;
			break;
		case "blocksFallPastCenterCB":
			game.canFallPastCenterOn = isOn;
			break;
		case "changeFallDirectionCB":
			game.canChangeFallDirectionOn = isOn;
			break;
		case "changeQuadrantWithFallDirectionCB":
			game.switchQuadrantsWithFallDirectionOn = isOn;
			break;
		case "settleWithCollapseCB":
			game.collapseCausesSettlingOn = isOn;
			break;
		case "settleInwardCB":
			game.layersAlsoSettleInwardsOn = isOn;
			break;
		case "bombsCB":
			game.bombsOn = isOn;
			break;
		case "fallOutwardCB":
			game.blocksFallOutwardOn = isOn;
			break;
		case "consoleCB":
			Logger.prototype.getConsole().style.display = isOn ? "block" : "none";
			break;
		case "peanutGalleryCB":
			_togglePeanutGalleryOn(isOn);
			break;
		default:
			log.e("---main._toggleMode: modeCBId=" + modeCBId);
			return;
		}

		_setPeanutGalleryComment(modeCBId, isOn);
	}

	function _toggleKeyboardControlOn(isOn) {
		game.keyboardControlOn = isOn;

		if (!game.keyboardControlOn) {
			input.selectedKeyboardBlock = null;
		}

		var directionElems;
		var displayStyle;
		var i;

		// Update the keyboard directions' displays
		directionElems = document.getElementsByClassName("keyboardDirection");
		displayStyle = game.keyboardControlOn ? "block" : "none";
		for (i = 0; i < directionElems.length; ++i) {
			directionElems[i].style.display = displayStyle;
		}

		// Update the mouse directions' displays
		directionElems = document.getElementsByClassName("mouseDirection");
		displayStyle = game.keyboardControlOn ? "none" : "block";
		for (i = 0; i < directionElems.length; ++i) {
			directionElems[i].style.display = displayStyle;
		}
	}

	function _setPeanutGalleryComment(elementId, isOn, useDefault) {
		if (game.peanutGalleryOn) {
			switch (elementId) {
			case "keyboardControlCB":
				document.getElementById("keyboardControlCBDefaultComment").style.display = "block";
				break;
			case "completeSquaresCB":
				document.getElementById("completeSquaresCBDefaultComment").style.display = "block";
				break;
			case "blocksFallPastCenterCB":
				if (isOn) {
					document.getElementById("blocksFallPastCenterCBOnComment").style.display = "block";
					document.getElementById("blocksFallPastCenterCBOffComment").style.display = "none";
				} else {
					document.getElementById("blocksFallPastCenterCBOnComment").style.display = "none";
					document.getElementById("blocksFallPastCenterCBOffComment").style.display = "block";
				}
				break;
			case "changeFallDirectionCB":
				if (isOn) {
					document.getElementById("changeFallDirectionCBOnComment").style.display = "block";
					document.getElementById("changeFallDirectionCBOffComment").style.display = "none";
				} else {
					document.getElementById("changeFallDirectionCBOnComment").style.display = "none";
					document.getElementById("changeFallDirectionCBOffComment").style.display = "block";
				}
				break;
			case "changeQuadrantWithFallDirectionCB":
				document.getElementById("changeQuadrantWithFallDirectionCBDefaultComment").style.display = "block";
				break;
			case "settleWithCollapseCB":
				document.getElementById("settleWithCollapseCBDefaultComment").style.display = "block";
				break;
			case "settleInwardCB":
				document.getElementById("settleInwardCBDefaultComment").style.display = "block";
				break;
			case "bombsCB":
				if (isOn) {
					document.getElementById("bombsCBOnComment").style.display = "block";
					document.getElementById("bombsCBOffComment").style.display = "none";
				} else {
					document.getElementById("bombsCBOnComment").style.display = "none";
					document.getElementById("bombsCBOffComment").style.display = "block";
				}
				break;
			case "fallOutwardCB":
				if (useDefault) {
					document.getElementById("fallOutwardCBDefaultComment").style.display = "block";
					document.getElementById("fallOutwardCBOnComment").style.display = "none";
					document.getElementById("fallOutwardCBOffComment").style.display = "none";
				} else {
					if (isOn) {
						document.getElementById("fallOutwardCBDefaultComment").style.display = "none";
						document.getElementById("fallOutwardCBOnComment").style.display = "block";
						document.getElementById("fallOutwardCBOffComment").style.display = "none";
					} else {
						document.getElementById("fallOutwardCBDefaultComment").style.display = "none";
						document.getElementById("fallOutwardCBOnComment").style.display = "none";
						document.getElementById("fallOutwardCBOffComment").style.display = "block";
					}
				}
				break;
			case "consoleCB":
				document.getElementById("consoleCBDefaultComment").style.display = "block";
				break;
			case "peanutGalleryCB":
				document.getElementById("peanutGalleryCBDefaultComment").style.display = "block";
				break;
			default:
				return;
			}
		}
	}

	function _togglePeanutGalleryOn(isOn) {
		game.peanutGalleryOn = isOn;

		var peanutGalleryElems = document.getElementsByClassName("peanutGallery");
		var element;
		var i;

		if (game.peanutGalleryOn) {
			// First, show ALL of the peanutGallery elements
			for (i = 0; i < peanutGalleryElems.length; ++i) {
				peanutGalleryElems[i].style.display = "block";
			}

			// Then, hide all of the appropriate conditional peanutGallery elements
			for (i = 0; i < checkBoxIds.length; ++i) {
				element = document.getElementById(checkBoxIds[i]);
				_setPeanutGalleryComment(checkBoxIds[i], element.checked, true);
			}
		} else {
			// Hide all of the peanutGallery elements
			for (i = 0; i < peanutGalleryElems.length; ++i) {
				peanutGalleryElems[i].style.display = "none";
			}
		}
	}

	function _onGameParameterSelectionChange() {
		var number = parseInt(this.options[this.selectedIndex].value, 10);
		if (startOfGameDropDownMenuIds.indexOf(this.id) < 0) {
			_changeGameParameter(this.id, number, this);
		}
	}

	function _changeGameParameter(gameParameterSelectId, number, element) {
		if (!element) {
			element = document.getElementById(gameParameterSelectId);
		}

		element.value = "" + number;

		switch (gameParameterSelectId) {
		case "gameWindowSize":
			gameWindow.setGameWindowCellSize(number);
			break;
		case "centerSquareSize":
			gameWindow.setCenterSquareCellSize(number);
			break;
		case "numberOfSquaresInABlock":
			game.numberOfSquaresInABlock = number;
			break;
		case "numberOfSidesBlocksFallFrom":
			game.numberOfSidesBlocksFallFrom = number;
			break;
		case "startingLevel":
			game.startingLevel = number;
			break;

		default:
			log.e("---main._changeGameParameter: gameParameterSelectId=" + gameParameterSelectId);
			return;
		}
	}

	// Set up all of the game parameters to reflect the html values.
	function _setInitialModesAndParamsToHtmlValues() {
		var i;
		var element;
		var number;

		// Initialize the various modes
		for (i = 0; i < checkBoxIds.length; ++i) {
			element = document.getElementById(checkBoxIds[i]);
			_toggleMode(checkBoxIds[i], element.checked, element);
		}

		// Initialize some other game parameters
		for (i = 0; i < dropDownMenuIds.length; ++i) {
			element = document.getElementById(dropDownMenuIds[i]);
			number = parseInt(element.options[element.selectedIndex].value, 10);
			_changeGameParameter(dropDownMenuIds[i], number, element);
		}
	}

	// Set up all of the game parameters that cannot be changed in mid game.
	function _setCustomStartOfGameParameters() {
		var i;
		var element;
		var number;

		// Initialize some other game parameters
		for (i = 0; i < startOfGameDropDownMenuIds.length; ++i) {
			element = document.getElementById(startOfGameDropDownMenuIds[i]);
			number = parseInt(element.options[element.selectedIndex].value, 10);
			_changeGameParameter(startOfGameDropDownMenuIds[i], number, element);
		}
		for (i = 0; i < startOfGameCheckBoxIds.length; ++i) {
			element = document.getElementById(startOfGameCheckBoxIds[i]);
			_toggleMode(startOfGameCheckBoxIds[i], element.checked, element);
		}
	}

	function _setHighestCompletedChapter(highestCompletedChapter) {
		_highestCompletedChapter = highestCompletedChapter;

		_selectedChapterIndex = _highestCompletedChapter + 1;
		if (_selectedChapterIndex > _NUMBER_OF_CHAPTERS) {
			_selectedChapterIndex = 1;
		}

		var chapterItems = document.getElementsByClassName("chapterItem");
		var chapterNumber;
		var i;

		// Set the appropriate chapters as unlocked
		for (i = 0; i < chapterItems.length; ++i) {
			chapterNumber = parseInt(chapterItems[i].id.substring(7), 10);
			if (chapterNumber <= _highestCompletedChapter + 1) {
				_unlockButton(chapterItems[i]);
			}
		}

		// Set the appropriate relative positions of the chapter items
		for (i = 0; i < chapterItems.length; ++i) {
			chapterNumber = parseInt(chapterItems[i].id.substring(7), 10);
			if (chapterNumber < _selectedChapterIndex) {
				chapterItems[i].style.visibility = "hidden";
				chapterItems[i].style.left = -_chapterItemWidth + "px";
			} else if (chapterNumber > _selectedChapterIndex) {
				chapterItems[i].style.visibility = "hidden";
				chapterItems[i].style.left = _chapterItemWidth + "px";
			} else {
				chapterItems[i].style.visibility = "visible";
				chapterItems[i].style.left = "0px";
			}
		}

		// Unlock custom play if all chapters have been completed
		if (_highestCompletedChapter >= _NUMBER_OF_CHAPTERS) {
			_unlockButton(customPlayButton);
			customPlayButton.onclick = _onCustomPlayClick;
		}

		_showPrevAndNextButtons();
		_updateChapterProgressIndicator();
	}

	function _showPrevAndNextButtons() {
		var prevButton = document.getElementById("prevButton");
		var nextButton = document.getElementById("nextButton");

		if (_selectedChapterIndex > 1) {
			prevButton.style.display = "block";
		} else {
			prevButton.style.display = "none";
		}

		if (_selectedChapterIndex < _NUMBER_OF_CHAPTERS) {
			nextButton.style.display = "block";
		} else {
			nextButton.style.display = "none";
		}
	}

	function _unlockButton(button) {
		button.className += " button";
		button.src = _buttonManifest[button.id].normal;
		button.onclick = _onStartGameClick;
		button.onmouseover = _onButtonOver;
		button.onmouseout = _onButtonOut;
	}

	function _showScreen(screenId) {
		var mainMenuScreen = document.getElementById("mainMenuScreen");
		mainMenuScreen.style.display = "none";
		var gameOverScreen = document.getElementById("gameOverScreen");
		gameOverScreen.style.display = "none";
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "none";
		var customPlayScreen = document.getElementById("customPlayScreen");
		customPlayScreen.style.display = "none";

		if (screenId) {
			var showScreen = document.getElementById(screenId);
			showScreen.style.display = "block";

			_expandInfoArea();

			// Set the sub-header content
			if (screenId === "pauseScreen") {
				var pauseScreenSubHeader = document.getElementById("pauseScreenSubHeader");
				pauseScreenSubHeader.innerHTML = _getCurrentChapterStr();
			} else if (screenId === "gameOverScreen") {
				var gameOverScreenSubHeader = document.getElementById("gameOverScreenSubHeader");
				gameOverScreenSubHeader.innerHTML = _getCurrentChapterStr();

				var gameOverScreenHeader = document.getElementById("gameOverScreenHeader");
				var nextChapterButton = document.getElementById("nextChapterButton");

				// Set some appropriate content depending on whether the 
				// chapter was successfully completed
				if (_prevChapterWasSuccessful) {
					gameOverScreenHeader.innerHTML = "Chapter Complete";
					nextChapterButton.style.display = "block";
				} else {
					gameOverScreenHeader.innerHTML = "Game Over";
					nextChapterButton.style.display = "none";
				}
			}
		} else {
			_collapseInfoArea();
		}
	}

	function _getCurrentChapterStr() {
		var currentChapterIndex;
		var currentChapterStr;

		if (_prevChapterWasSuccessful) {
			if (_selectedChapterIndex > 1) {
				currentChapterIndex = _selectedChapterIndex - 1;
			} else {
				currentChapterIndex = _NUMBER_OF_CHAPTERS;
			}
		} else {
			currentChapterIndex = _selectedChapterIndex;
		}

		if (currentChapterIndex < 0) {
			currentChapterStr = "Custom play";
		} else if (currentChapterIndex === 0) {
			currentChapterStr = "Quick play";
		} else {
			currentChapterStr = "Chapter " + currentChapterIndex;
		}

		return currentChapterStr;
	}

	function _showCustomControls() {
		var customControls = document.getElementsByClassName("customControl");
		var i;
		for (i = 0; i < customControls.length; ++i) {
			customControls[i].style.display = "block";
		}
	}

	function _clearGameArea() {
		var topLevelDisplayArea = document.getElementById("topLevelDisplayArea");
		topLevelDisplayArea.style.display = "block";
		var topScoreDisplayArea = document.getElementById("topScoreDisplayArea");
		topScoreDisplayArea.style.display = "block";
		game.clearCanvas();
	}

	log.i("<--main.LOADING_MODULE");
}());
