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
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->main.LOADING_MODULE");

	var AUDIO_PATH = "aud/";
	var IMAGE_PATH = "img/";

	var canvas = null;
	var body = null;

	var gestureInProgress = false;

	var soundsLoadedCount = 0;

	var imageManifest = [
		IMAGE_PATH + "sprites.png"
	];

	var sfxManifest = [
		{
			id: "blockSelect",
			src: AUDIO_PATH + "block_select.ogg|" + AUDIO_PATH + "block_select.m4a"
		},
		{
			id: "changeFallDirection",
			src: AUDIO_PATH + "change_fall_direction.ogg|" + AUDIO_PATH + "change_fall_direction.m4a"
		},
		{
			id: "collapse",
			src: AUDIO_PATH + "collapse.ogg|" + AUDIO_PATH + "collapse.m4a"
		},
		{
			id: "earnedBonus",
			src: AUDIO_PATH + "earned_bonus.ogg|" + AUDIO_PATH + "earned_bonus.m4a"
		},
		{
			id: "fall",
			src: AUDIO_PATH + "fall.ogg|" + AUDIO_PATH + "fall.m4a"
		},
		{
			id: "gameOver",
			src: AUDIO_PATH + "game_over.ogg|" + AUDIO_PATH + "game_over.m4a"
		},
		{
			id: "gameStart",
			src: AUDIO_PATH + "unpause.ogg|" + AUDIO_PATH + "unpause.m4a" // TODO: add a new sound file for this
		},
		{
			id: "land",
			src: AUDIO_PATH + "land.ogg|" + AUDIO_PATH + "land.m4a"
		},
		{
			id: "level",
			src: AUDIO_PATH + "level.ogg|" + AUDIO_PATH + "level.m4a"
		},
		{
			id: "move",
			src: AUDIO_PATH + "move.ogg|" + AUDIO_PATH + "move.m4a"
		},
		{
			id: "newBlock",
			src: AUDIO_PATH + "new_block.ogg|" + AUDIO_PATH + "new_block.m4a"
		},
		{
			id: "pause",
			src: AUDIO_PATH + "pause.ogg|" + AUDIO_PATH + "pause.m4a"
		},
		{
			id: "rotate",
			src: AUDIO_PATH + "rotate.ogg|" + AUDIO_PATH + "rotate.m4a"
		},
		{
			id: "unableToMove",
			src: AUDIO_PATH + "unable_to_move.ogg|" + AUDIO_PATH + "unable_to_move.m4a"
		},
		{
			id: "unpause",
			src: AUDIO_PATH + "unpause.ogg|" + AUDIO_PATH + "unpause.m4a"
		}
	];

	// Preload all required resources and call init when done
	window.resources.onready = init;
	window.resources.load(imageManifest);

	setupDOMForJavascript();

	// We should not need to wait for window.load to complete, because this file 
	// should be the last part to load
	function init() {
		log.d("-->main.init");

		body = document.getElementsByTagName("body")[0];
		canvas = document.getElementById("gameCanvas");
		var levelDisplay = document.getElementById("topLevelDisplayData");
		var scoreDisplay = document.getElementById("topScoreDisplayData");

		canvas.width = utils.getElementWidth(canvas);
		canvas.height = utils.getElementHeight(canvas);

		game.setDOMElements(canvas, levelDisplay, scoreDisplay, onGameEnd);

		// ---------- Hook up the event handlers ---------- //

		window.addEventListener("blur", pauseGame, false);

		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.addEventListener("click", onPauseEvent, false);
		var showConsole = document.getElementById("showConsole");
		showConsole.addEventListener("click", toggleConsole, false);

		document.addEventListener("keypress", onKeyPress, false);
		document.addEventListener("keyup", onKeyUp, false);

		canvas.addEventListener("mousedown", onMouseDown, false);
		document.addEventListener("mouseup", onMouseUp, false);
		document.addEventListener("mousemove", onMouseMove, false);
		document.addEventListener("mouseout", onMouseOut, false);

		var helpButton = document.getElementById("helpButton");
		helpButton.addEventListener("click", pauseGame, false);
		var musicOnButton = document.getElementById("musicOnButton");
		musicOnButton.addEventListener("click", toggleMusic, false);
		var musicOffButton = document.getElementById("musicOffButton");
		musicOffButton.addEventListener("click", toggleMusic, false);
		var sfxOnButton = document.getElementById("sfxOnButton");
		sfxOnButton.addEventListener("click", toggleSFX, false);
		var sfxOffButton = document.getElementById("sfxOffButton");
		sfxOffButton.addEventListener("click", toggleSFX, false);

		// ---------- Hook up sound ---------- //

		if (!createjs.Sound.initializeDefaultPlugins()) {
			// TODO: notify the actual user somehow
			log.e("Browser does not support audio");
		}

		// If this is on a mobile device, sounds need to be played inside of a touch event
		if (createjs.Sound.BrowserDetect.isIOS || 
				createjs.Sound.BrowserDetect.isAndroid || 
				createjs.Sound.BrowserDetect.isBlackberry) {
			// TODO: sound may not work... (look at the MobileSafe demo for an example of how I might be able to fix this)
			log.w("Mobile browsers restrict sound to inside touch events");
		}

		createjs.Sound.addEventListener("loadComplete", onLoadingAudioComplete);
		createjs.Sound.registerManifest(sfxManifest);

		// ---------- Initialize music/sfx on/off ---------- //

		game.musicOn = !game.musicOn;
		toggleMusic();
		game.sfxOn = !game.sfxOn;
		toggleSFX();

		log.i("<--main.init");
	}

	function onLoadingSoundsUpdate() {
		// TODO: show progress; I un-hooked this; can I hook it back up?
	}

	function onLoadingAudioComplete() {
        // Start the music
        //game.playSFX("music", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.4);

		++soundsLoadedCount;

		// Only allow the player to start a game once all of the sounds have been loaded
		if (soundsLoadedCount === sfxManifest.length) {
			var unpauseButton = document.getElementById("unpauseButton");
			unpauseButton.disabled = false;
		}
	}

	function playGame() {
		log.d("-->main.playGame");

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

		collapseInfoArea();

		// If we are starting a new game, then adjust the game parameters to 
		// match the selected input options
		if (game.isEnded) {
			setGameParameters();
			game.playSFX("gameStart");
		} else if (game.isPaused) {
			game.playSFX("unpause");
		}

		game.play();

		log.d("<--main.playGame");
	}

	function pauseGame() {
		log.d("-->main.pauseGame");

		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";

		populateStatsTable();

		expandInfoArea();

		if (!game.isPaused && !game.isEnded) {
			game.playSFX("pause");
		}

		game.pause();

		log.d("<--main.pauseGame");
	}

	function onGameEnd() {
		log.d("-->main.onGameEnd");

		// Set up the game over screen content
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");
		pauseScreenTitle.innerHTML = "Game Over";
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.innerHTML = "Play Again";

		populateStatsTable();

		game.playSFX("gameOver");

		log.d("<--main.onGameEnd");
	}

	function onPauseEvent() {
		log.d("-->main.onPauseEvent");

		if (game.isPaused || game.isEnded) {
			playGame();
		} else {
			pauseGame();
		}

		log.d("<--main.onPauseEvent");
	}
	
	function onKeyPress(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ENTER": playGame(); break; // play only
		case "SPACE": onPauseEvent(event); event.preventDefault(); break; // toggle play/pause
		default: break;
		}
	}
	
	function onKeyUp(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ESCAPE": pauseGame(); break; // pause only
		default: break;
		}
	}

	// Adjust the game parameters to match the selected input options
	function setGameParameters() {
		log.d("<->main.setGameParameters");

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
		var startingLevelElem = document.getElementById("startingLevel");
		var startingLevel = parseInt(startingLevelElem.options[startingLevelElem.selectedIndex].value, 10);
		game.startingLevel = startingLevel;
	}

	function populateStatsTable() {
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

	function setupDOMForJavascript() {
		var noJavaScriptArea = document.getElementById("noJavaScriptArea");
		noJavaScriptArea.style.display = "none";
		var playArea = document.getElementById("playArea");
		playArea.style.display = "block";
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "block";
	}

	function expandInfoArea() {
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "block";
		var helpButton = document.getElementById("helpButton");
		helpButton.style.display = "none";
		// TODO: switch divs; animate
	}

	function collapseInfoArea() {
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "none";
		var helpButton = document.getElementById("helpButton");
		helpButton.style.display = "block";
		// TODO: switch divs; animate
	}

	function toggleMusic(event) {
		var musicOnButton = document.getElementById("musicOnButton");
		var musicOffButton = document.getElementById("musicOffButton");

		if (game.musicOn) {
			musicOnButton.style.display = "none";
			musicOffButton.style.display = "block";
			//****
			game.musicOn = false;
		} else {
			musicOnButton.style.display = "block";
			musicOffButton.style.display = "none";
			//****
			game.musicOn = true;
		}
	}

	function toggleSFX(event) {
		var sfxOnButton = document.getElementById("sfxOnButton");
		var sfxOffButton = document.getElementById("sfxOffButton");

		if (game.sfxOn) {
			sfxOnButton.style.display = "none";
			sfxOffButton.style.display = "block";
			game.sfxOn = false;
		} else {
			sfxOnButton.style.display = "block";
			sfxOffButton.style.display = "none";
			game.sfxOn = true;
		}
	}

	function onMouseDown(event) {
		event = utils.standardizeMouseEvent(event);

		// We only care about gestures which occur while the game is running
		if (!game.isPaused && !game.isEnded) {
			gestureInProgress = true;

			var pagePos = { x: event.pageX, y: event.pageY };
			var currentTime = Date.now();

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameWindowRect = canvas.getBoundingClientRect();
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

	function onMouseUp(event) {
		event = utils.standardizeMouseEvent(event);

		if (gestureInProgress) {
			gestureInProgress = false;

			var pagePos = { x: event.pageX, y: event.pageY };
			var currentTime = Date.now();

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameWindowRect = canvas.getBoundingClientRect();
			var gameWindowPos = {
				x: pagePos.x - gameWindowRect.left - gameWindow.gameWindowPosition.x,
				y: pagePos.y - gameWindowRect.top - gameWindow.gameWindowPosition.y
			};

			input.finishGesture(gameWindowPos, currentTime);
		}
	}

	function onMouseMove(event) {
		event = utils.standardizeMouseEvent(event);

		// Check whether this event is part of a drag
		if (gestureInProgress) {
			var pagePos = { x: event.pageX, y: event.pageY };

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameWindowRect = canvas.getBoundingClientRect();
			var gameWindowPos = {
				x: pagePos.x - gameWindowRect.left - gameWindow.gameWindowPosition.x,
				y: pagePos.y - gameWindowRect.top - gameWindow.gameWindowPosition.y
			};

			input.dragGesture(gameWindowPos);
		}
	}

	// This event cancels any current mouse gesture and forces the player to 
	// start again.  But only if the mouse is leaving the entire window.
	function onMouseOut(event) {
		// var inElement = event.relatedTarget || event.toElement;
		// if (!inElement || inElement.nodeName == "HTML") {
			// gestureInProgress = false;

			// input.cancelGesture();
		// }
	}

	function toggleConsole(event) {
		var showConsole = document.getElementById("showConsole");

		if (showConsole.checked) {
			Logger.prototype.getConsole().style.display = "block";
		} else {
			Logger.prototype.getConsole().style.display = "none";
		}
	}

	log.i("<--main.LOADING_MODULE");
})();
