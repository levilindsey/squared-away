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
		var helpButton = document.getElementById("helpButton");
		var musicOnButton = document.getElementById("musicOnButton");
		var musicOffButton = document.getElementById("musicOffButton");
		var sfxOnButton = document.getElementById("sfxOnButton");
		var sfxOffButton = document.getElementById("sfxOffButton");

		_fitAppToViewPort();

		game.init(_canvas, levelDisplay, scoreDisplay, _onGameEnd);

		_adjustButtonDimensions();

		// ---------- Hook up the event handlers ---------- //

		window.addEventListener("resize", _onWindowResize, false)
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

		helpButton.addEventListener("click", _pauseGame, false);
		helpButton.addEventListener("mouseover", _onHelpOver, false);
		helpButton.addEventListener("mouseout", _onHelpOut, false);
		musicOnButton.addEventListener("click", _onAudioClick, false);
		musicOnButton.addEventListener("mousemove", _onAudioMove, false);
		musicOnButton.addEventListener("mouseout", _onAudioOut, false);
		musicOffButton.addEventListener("click", _onAudioClick, false);
		musicOffButton.addEventListener("mousemove", _onAudioMove, false);
		musicOffButton.addEventListener("mouseout", _onAudioOut, false);
		sfxOnButton.addEventListener("click", _onAudioClick, false);
		sfxOnButton.addEventListener("mousemove", _onAudioMove, false);
		sfxOnButton.addEventListener("mouseout", _onAudioOut, false);
		sfxOffButton.addEventListener("click", _onAudioClick, false);
		sfxOffButton.addEventListener("mousemove", _onAudioMove, false);
		sfxOffButton.addEventListener("mouseout", _onAudioOut, false);

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

		// If this was the effect of a help-button press, then scroll to the 
		// help area
		var helpButton = document.getElementById("helpButton");
		if (this === helpButton) {
			var infoAreaRect = utils.standardizeClientRect(infoArea);
			window.scrollTo(0, infoAreaRect.top);
		}

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
			_playGame();
			break;
		case "SPACE": // toggle play/pause
			_onPauseEvent(event);
			event.preventDefault();
			break;
		default:
			return;
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

	// This function is needed, because the music and SFX toggle buttons are 
	// actually triangles that form two halves of a square.  Therefore, the 
	// image regions overlap and without this function, only one of either 
	// music or SFX would ever be toggled.
	function _onAudioClick(event) {
		if (_isOverMusic(event, this)) {
			sound.toggleMusic(event);
		} else {
			sound.toggleSFX(event);
		}
	}

	function _onAudioMove(event) {
		if (_isOverMusic(event, this)) {
			if (game.musicOn) {
				document.getElementById("musicOnButton").src = "img/music_on_hover.png";
			} else {
				document.getElementById("musicOffButton").src = "img/music_off_hover.png";
			}
			if (game.sfxOn) {
				document.getElementById("sfxOnButton").src = "img/sfx_on.png";
			} else {
				document.getElementById("sfxOffButton").src = "img/sfx_off.png";
			}
		} else {
			if (game.sfxOn) {
				document.getElementById("sfxOnButton").src = "img/sfx_on_hover.png";
			} else {
				document.getElementById("sfxOffButton").src = "img/sfx_off_hover.png";
			}
			if (game.musicOn) {
				document.getElementById("musicOnButton").src = "img/music_on.png";
			} else {
				document.getElementById("musicOffButton").src = "img/music_off.png";
			}
		}
	}

	function _onAudioOut(event) {
		if (_isOverMusic(event, this)) {
			if (game.musicOn) {
				document.getElementById("musicOnButton").src = "img/music_on.png";
			} else {
				document.getElementById("musicOffButton").src = "img/music_off.png";
			}
			if (game.sfxOn) {
				document.getElementById("sfxOnButton").src = "img/sfx_on.png";
			} else {
				document.getElementById("sfxOffButton").src = "img/sfx_off.png";
			}
		} else {
			if (game.sfxOn) {
				document.getElementById("sfxOnButton").src = "img/sfx_on.png";
			} else {
				document.getElementById("sfxOffButton").src = "img/sfx_off.png";
			}
			if (game.musicOn) {
				document.getElementById("musicOnButton").src = "img/music_on.png";
			} else {
				document.getElementById("musicOffButton").src = "img/music_off.png";
			}
		}
	}

	function _isOverMusic(event, that) {
		event = utils.standardizeMouseEvent(event);
		var rect = utils.standardizeClientRect(that);
		var localX = event.pageX - rect.left;
		var localY = event.pageY - rect.top;

		return localY + localX < rect.width;
	}

	function _onHelpOver(event) {
		document.getElementById("helpButton").src = "img/help_hover.png";
	}

	function _onHelpOut(event) {
		document.getElementById("helpButton").src = "img/help.png";
	}

	function _onModeCBClicked() {
		_toggleMode(this.id, this.checked, this);
	}

	function _onWindowResize() {
		_fitAppToViewPort();
		game.updateDimensions();
		_adjustButtonDimensions();
	}

	function _fitAppToViewPort() {
		var MARGIN = 20;
		var pageColumn = document.getElementById("pageColumn");
		var playArea = document.getElementById("playArea");
		var topLevelDisplayArea = document.getElementById("topLevelDisplayArea");
		var topScoreDisplayArea = document.getElementById("topScoreDisplayArea");

		var viewportWidth = document.documentElement.clientWidth;
		var viewportHeight = document.documentElement.clientHeight;

		var canvasRect = utils.standardizeClientRect(_canvas);
		var verticalScroll = canvasRect.top - MARGIN;
		var size = Math.min(viewportWidth, viewportHeight) - MARGIN * 2;

		pageColumn.style.width = size + "px"

		playArea.style.width = size + "px";
		playArea.style.height = size + "px";

		topLevelDisplayArea.style.width = (size - 20) + "px";
		topScoreDisplayArea.style.width = (size - 20) + "px";

		_canvas.style.width = size + "px";
		_canvas.style.height = size + "px";

		window.scrollTo(0, verticalScroll);
	}

	function _adjustButtonDimensions() {
		var helpButton = document.getElementById("helpButton");
		var musicOnButton = document.getElementById("musicOnButton");
		var musicOffButton = document.getElementById("musicOffButton");
		var sfxOnButton = document.getElementById("sfxOnButton");
		var sfxOffButton = document.getElementById("sfxOffButton");

		var helpRect = game.getHelpButtonRect();
		var audioRect = game.getAudioButtonRect();

		helpButton.style.left = helpRect.left;
		helpButton.style.top = helpRect.top;
		helpButton.style.width = helpRect.width;
		helpButton.style.height = helpRect.height;

		musicOnButton.style.left = audioRect.left;
		musicOnButton.style.top = audioRect.top;
		musicOnButton.style.width = audioRect.width;
		musicOnButton.style.height = audioRect.height;

		musicOffButton.style.left = audioRect.left;
		musicOffButton.style.top = audioRect.top;
		musicOffButton.style.width = audioRect.width;
		musicOffButton.style.height = audioRect.height;

		sfxOnButton.style.left = audioRect.left;
		sfxOnButton.style.top = audioRect.top;
		sfxOnButton.style.width = audioRect.width;
		sfxOnButton.style.height = audioRect.height;

		sfxOffButton.style.left = audioRect.left;
		sfxOffButton.style.top = audioRect.top;
		sfxOffButton.style.width = audioRect.width;
		sfxOffButton.style.height = audioRect.height;

		_centerPauseButton();
	}

	function _centerPauseButton() {
		var pauseScreen = document.getElementById("pauseScreen");
		var unpauseButton = document.getElementById("unpauseButton");
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");

		var pauseScreenRect = utils.standardizeClientRect(pauseScreen);
		var unpauseButtonRect = utils.standardizeClientRect(unpauseButton);
		var pauseScreenTitleRect = utils.standardizeClientRect(pauseScreenTitle);

		var y;

		y = pauseScreenRect.height / 2 - unpauseButtonRect.height - pauseScreenTitleRect.height - pauseScreenTitle.style.marginBottom;
		pauseScreenTitle.style.marginTop = y + "px";

		if (!game.hasAGameStarted) {
			y = (pauseScreenRect.height - unpauseButtonRect.height) / 2;
			unpauseButton.style.marginTop = y + "px";
		}
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
		case "numberOfSidesBlocksFallFrom":
			game.numberOfSidesBlocksFallFrom = number;
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
