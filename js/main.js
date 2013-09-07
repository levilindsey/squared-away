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

	// Preload all required resources and call _init when done
	window.resources.onready = _init;
	window.resources.load(_imageManifest);

	_setupDOMForJavascript();

	// We should not need to wait for window.load to complete, because this file 
	// should be the last part to load
	function _init() {
		log.d("-->main._init");

		_body = document.getElementsByTagName("body")[0];
		_canvas = document.getElementById("gameCanvas");
		var levelDisplay = document.getElementById("topLevelDisplayData");
		var scoreDisplay = document.getElementById("topScoreDisplayData");

		_canvas.width = utils.getElementWidth(_canvas);
		_canvas.height = utils.getElementHeight(_canvas);

		game.setDOMElements(_canvas, levelDisplay, scoreDisplay, _onGameEnd);

		// ---------- Hook up the event handlers ---------- //

		window.addEventListener("blur", _pauseGame, false);

		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.addEventListener("click", _onPauseEvent, false);
		var showConsole = document.getElementById("showConsole");
		showConsole.addEventListener("click", _toggleConsole, false);

		document.addEventListener("keydown", _onKeyDown, false);
		document.addEventListener("keyup", _onKeyUp, false);
		document.addEventListener("keypress", _onKeyPress, false);

		_canvas.addEventListener("mousedown", _onMouseDown, false);
		document.addEventListener("mouseup", _onMouseUp, false);
		document.addEventListener("mousemove", _onMouseMove, false);
		document.addEventListener("mouseout", _onMouseOut, false);

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
4f08dabbf7df039c08c617424fa4b94cb4c69812
		// ---------- Set up the song checkboxes ---------- //

		var musicManifest = sound.getMusicManifest();
		var selectedMusic = sound.getSelectedMusic();
		var songCheckBox;
		var i;

		for (i = 0; i < musicManifest.length; ++i) {
			songCheckBox = document.getElementById(musicManifest[i].id);
			songCheckBox.addEventListener("click", sound.onMusicSelectionChange, false);
			if (songCheckBox.checked) {
				selectedMusic.push(songCheckBox.value);
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
			_setGameParameters();
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
	
	function _onKeyDown(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		var type;

		switch(key) {
		case "UP":
			type = input.UP
			break;
		case "RIGHT":
			type = input.RIGHT
			break;
		case "DOWN":
			type = input.DOWN
			break;
		case "LEFT":
			type = input.LEFT
			break;
		case "X":
			type = input.ROTATE
			break;
		case "Z":
			type = input.SWITCH_BLOCKS
			break;
		case "S":
			type = input.BONUS_1
			break;
		case "A":
			type = input.BONUS_2
			break;
		default: break;
		}

		input.keyboardControl(type);
	}
	
	function _onKeyUp(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ESCAPE":
			_pauseGame();
			break; // pause only
		default: break;
		}
	}
	
	function _onKeyPress(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ENTER":
			_playGame();
			break; // play only
		case "SPACE":
			_onPauseEvent(event);
			event.preventDefault();
			break; // toggle play/pause
		default: break;
		}
	}

	// Adjust the game parameters to match the selected input options
	function _setGameParameters() {
		log.d("<->main._setGameParameters");

		var mode1 = document.getElementById("mode1");
		game.mode1On = mode1.checked;
		var mode2 = document.getElementById("mode2");
		game.mode2On = mode2.checked;
		var mode3 = document.getElementById("mode3");
		game.mode3On = mode3.checked;
		var mode4 = document.getElementById("mode4");
		game.mode4On = mode4.checked;
		var mode5 = document.getElementById("mode5");
		game.mode5On = mode5.checked;
		var mode6 = document.getElementById("mode6");
		game.mode6On = mode6.checked;
		var mode7 = document.getElementById("mode7");
		game.mode7On = mode7.checked;
		var gameWindowSizeElem = document.getElementById("gameWindowSize");
		var gameWindowSize = parseInt(gameWindowSizeElem.options[gameWindowSizeElem.selectedIndex].value, 10);
		gameWindow.setGameWindowCellSize(gameWindowSize);
		var centerSquareSizeElem = document.getElementById("centerSquareSize");
		var centerSquareSize = parseInt(centerSquareSizeElem.options[centerSquareSizeElem.selectedIndex].value, 10);
		gameWindow.setCenterSquareCellSize(centerSquareSize);
		var numberOfSquaresInABlockElem = document.getElementById("numberOfSquaresInABlock");
		var numberOfSquaresInABlock = parseInt(numberOfSquaresInABlockElem.options[numberOfSquaresInABlockElem.selectedIndex].value, 10);
		game.numberOfSquaresInABlock = numberOfSquaresInABlock;
		var startingLevelElem = document.getElementById("startingLevel");
		var startingLevel = parseInt(startingLevelElem.options[startingLevelElem.selectedIndex].value, 10);
		game.startingLevel = startingLevel;
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

		var bonusesUsedData = document.getElementById("bonusesUsedData");
		bonusesUsedData.innerHTML = game.getBonusesUsed();
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

			input.startGesture(gameWindowPos, currentTime);
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

			input.finishGesture(gameWindowPos, currentTime);
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

			input.dragGesture(gameWindowPos);
		}
	}

	// This event cancels any current mouse gesture and forces the player to 
	// start again.  But only if the mouse is leaving the entire window.
	function _onMouseOut(event) {
		// var inElement = event.relatedTarget || event.toElement;
		// if (!inElement || inElement.nodeName == "HTML") {
			// _gestureInProgress = false;

			// input.cancelGesture();
		// }
	}

	function _toggleConsole(event) {
		var showConsole = document.getElementById("showConsole");

		if (showConsole.checked) {
			Logger.prototype.getConsole().style.display = "block";
		} else {
			Logger.prototype.getConsole().style.display = "none";
		}
	}

	log.i("<--main.LOADING_MODULE");
}());
