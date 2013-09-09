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

	var _IMAGE_PATH = "img/";

	var _canvas = null;
	var _body = null;

	var _gestureInProgress = false;

	var _imageManifest = [
		_IMAGE_PATH + "sprites.png"
	];

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

	var dropDownMenuIds = [
		"gameWindowSize",
		"centerSquareSize",
		"numberOfSquaresInABlock",
		"startingLevel"
	];

	// These are the drop down menus whose values should not change in mid game
	var startOfGameDropDownMenuIds = [
		"gameWindowSize",
		"centerSquareSize"
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

		_canvas.width = utils.getElementWidth(_canvas);
		_canvas.height = utils.getElementHeight(_canvas);

		game.setDOMElements(_canvas, levelDisplay, scoreDisplay, _onGameEnd);

		// ---------- Hook up the event handlers ---------- //

		window.addEventListener("blur", _pauseGame, false);

		document.addEventListener("keydown", _onKeyDown, false);
		document.addEventListener("keyup", _onKeyUp, false);
		document.addEventListener("keypress", _onKeyPress, false);

		_canvas.addEventListener("mousedown", _onMouseDown, false);
		document.addEventListener("mouseup", _onMouseUp, false);
		document.addEventListener("mousemove", _onMouseMove, false);

		var modeCBs = document.getElementsByClassName("modeCB");
		for (i = 0; i < modeCBs.length; ++i) {
			modeCBs[i].addEventListener("click", _onModeCBClicked, false);
		}

		var gameParameterSelects = document.getElementsByClassName("gameParameterSelect");
		for (i = 0; i < gameParameterSelects.length; ++i) {
			gameParameterSelects[i].addEventListener("change", _onGameParameterSelectionChange, false);
		}

		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.addEventListener("click", _onPauseEvent, false);

		var helpButton = document.getElementById("helpButton");
		helpButton.addEventListener("click", _pauseGame, false);
		var musicOnButton = document.getElementById("musicOnButton");
		musicOnButton.addEventListener("click", sound.toggleAudio, false);
		var musicOffButton = document.getElementById("musicOffButton");
		musicOffButton.addEventListener("click", sound.toggleAudio, false);
		var sfxOnButton = document.getElementById("sfxOnButton");
		sfxOnButton.addEventListener("click", sound.toggleAudio, false);
		var sfxOffButton = document.getElementById("sfxOffButton");
		sfxOffButton.addEventListener("click", sound.toggleAudio, false);

		// Initialize the various modes and game parameters
		_setInitialModesAndParamsToHtmlValues();

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

		sound.init();

		log.i("<--main._init");
	}

	function _playGame() {
		log.d("-->main._playGame");

		// Set up the pause screen content
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "none";
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");
		pauseScreenTitle.style.display = "block";
		pauseScreenTitle.innerHTML = "Game Paused";
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.style.marginTop = "0px";
		unpauseButton.innerHTML = "Unpause";
		var statsTable = document.getElementById("statsTable");
		statsTable.style.display = "block";
		var topLevelDisplayArea = document.getElementById("topLevelDisplayArea");
		topLevelDisplayArea.style.display = "block";
		var topScoreDisplayArea = document.getElementById("topScoreDisplayArea");
		topScoreDisplayArea.style.display = "block";

		_collapseInfoArea();

		// If we are starting a new game, then adjust the game parameters to 
		// match the selected input options
		if (game.isEnded) {
			_setStartOfGameParameters();
			sound.playSFX("gameStart");
		} else if (game.isPaused) {
			sound.playSFX("unpause");
		}

		game.play();

		sound.playCurrentMusic();

		log.d("<--main._playGame");
	}

	function _pauseGame() {
		log.d("-->main._pauseGame");

		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";

		_populateStatsTable();

		_expandInfoArea();

		if (!game.isPaused && !game.isEnded) {
			sound.playSFX("pause");
		}

		game.pause();

		sound.pauseMusic();

		log.d("<--main._pauseGame");
	}

	function _onGameEnd() {
		log.d("-->main._onGameEnd");

		// Set up the game over screen content
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");
		pauseScreenTitle.innerHTML = "Game Over";
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.innerHTML = "Play Again";

		_populateStatsTable();

		sound.playSFX("gameOver");

		sound.pauseMusic();

		log.d("<--main._onGameEnd");
	}

	function _onPauseEvent() {
		log.d("-->main._onPauseEvent");

		if (game.isPaused || game.isEnded) {
			_playGame();
		} else {
			_pauseGame();
		}

		log.d("<--main._onPauseEvent");
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
		case "S":
			gameControl = input.COLLAPSE_BOMB;
			break;
		case "A":
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
			_pauseGame();
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
		case "S":
			gameControl = input.COLLAPSE_BOMB;
			break;
		case "A":
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
			_playGame();
			break;
		case "SPACE": // toggle play/pause
			_onPauseEvent(event);
			event.preventDefault();
			break;
		default:
			return;
		}

		input.onKeyboardControlOn(gameControl);
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
			var gameWindowRect = _canvas.getBoundingClientRect();
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
			var gameWindowRect = _canvas.getBoundingClientRect();
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
			var gameWindowRect = _canvas.getBoundingClientRect();
			var gameWindowPos = {
				x: pagePos.x - gameWindowRect.left - gameWindow.gameWindowPosition.x,
				y: pagePos.y - gameWindowRect.top - gameWindow.gameWindowPosition.y
			};

			input.dragMouseGesture(gameWindowPos);
		}
	}

	function _onModeCBClicked() {
		_toggleMode(this.id, this.checked, this);
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
			return;
		}

		_setPeanutGalleryComment(modeCBId, isOn);
	}

	function _toggleKeyboardControlOn(isOn) {
		game.keyboardControlOn = isOn;

		if (!game.keyboardControlOn) {
			input.selectedKeyboardBlock = null;
		}

		var keyboardDirectionElems = document.getElementsByClassName("keyboardDirection");
		var displayStyle = game.keyboardControlOn ? "block" : "none";
		var i;

		for (i = 0; i < keyboardDirectionElems.length; ++i) {
			keyboardDirectionElems[i].style.display = displayStyle;
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
		var number = parseInt(this.options[this.selectedIndex].id, 10);
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
		case "startingLevel":
			game.startingLevel = number;
			break;

		default:
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
	function _setStartOfGameParameters() {
		var i;
		var element;
		var number;

		// Initialize some other game parameters
		for (i = 0; i < startOfGameDropDownMenuIds.length; ++i) {
			element = document.getElementById(startOfGameDropDownMenuIds[i]);
			number = parseInt(element.options[element.selectedIndex].value, 10);
			_changeGameParameter(startOfGameDropDownMenuIds[i], number, element);
		}
	}

	log.i("<--main.LOADING_MODULE");
}());
