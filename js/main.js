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
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->main.LOADING_MODULE");

	var AUDIO_PATH = "aud/";
	var IMAGE_PATH = "img/";

	var game = null;
	var canvas = null;
	var body = null;

	var gestureInProgress = false;

	var soundsLoadedCount = 0;

	var imageManifest = [
		IMAGE_PATH + "sprites.png"
	];

	var audioManifest = [
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

		game = new Game(canvas, levelDisplay, scoreDisplay, onGameEnd);

		// Hook up the event handlers
		var unpauseButton = document.getElementById("unpauseButton");
		window.addEventListener("blur", pauseGame, false);
		unpauseButton.addEventListener("click", onPauseEvent, false);
		document.addEventListener("keypress", onKeyPress, false);
		document.addEventListener("keyup", onKeyUp, false);
		canvas.addEventListener("mousedown", onMouseDown, false);
		document.addEventListener("mouseup", onMouseUp, false);
		document.addEventListener("mousemove", onMouseMove, false);
		document.addEventListener("mouseout", onMouseOut, false);

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
		createjs.Sound.registerManifest(audioManifest);

		log.d("<--main.init");
	}

	function onLoadingSoundsUpdate() {
		// TODO: show progress; I un-hooked this; can I hook it back up?
	}

	function onLoadingAudioComplete() {
        // Start the music
        //createjs.Sound.play("music", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.4);

		++soundsLoadedCount;

		// Only allow the player to start a game once all of the sounds have been loaded
		if (soundsLoadedCount === audioManifest.length) {
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
		if (game.getIsEnded()) {
			setGameParameters();
			createjs.Sound.play("gameStart");
		} else if (game.getIsPaused()) {
			createjs.Sound.play("unpause");
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

		if (!game.getIsPaused() && !game.getIsEnded()) {
			createjs.Sound.play("pause");
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

		createjs.Sound.play("gameOver");

		log.d("<--main.onGameEnd");
	}

	function onPauseEvent() {
		log.d("-->main.onPauseEvent");

		if (game.getIsPaused() || game.getIsEnded()) {
			playGame();
		} else {
			pauseGame();
		}

		log.d("<--main.onPauseEvent");
	}
	
	function onKeyPress(event) {
        var keyCode = event.keyCode;
		var key = window.utils.translateKeyCode(keyCode);

		switch(key) {
		case "ENTER": playGame(); break; // play only
		case "SPACE": onPauseEvent(event); event.preventDefault(); break; // toggle play/pause
		default: break;
		}
	}
	
	function onKeyUp(event) {
        var keyCode = event.keyCode;
		var key = window.utils.translateKeyCode(keyCode);

		switch(key) {
		case "ESCAPE": pauseGame(); break; // pause only
		default: break;
		}
	}

	// Adjust the game parameters to match the selected input options
	function setGameParameters() {
		log.d("<->main.setGameParameters");

		var mode1 = document.getElementById("mode1");
		game.setMode1(mode1.checked);
		var mode2 = document.getElementById("mode2");
		game.setMode2(mode2.checked);
		var mode3 = document.getElementById("mode3");
		game.setMode3(mode3.checked);
		var mode4 = document.getElementById("mode4");
		game.setMode4(mode4.checked);
		var mode5 = document.getElementById("mode5");
		game.setMode5(mode5.checked);
		var gameAreaSizeElem = document.getElementById("gameAreaSize");
		var gameAreaSize = parseInt(gameAreaSizeElem.options[gameAreaSizeElem.selectedIndex].value, 10);
		game.setGameAreaSize(gameAreaSize);
		var centerSquareSizeElem = document.getElementById("centerSquareSize");
		var centerSquareSize = parseInt(centerSquareSizeElem.options[centerSquareSizeElem.selectedIndex].value, 10);
		game.setCenterSquareSize(centerSquareSize);
		var startingLevelElem = document.getElementById("startingLevel");
		var startingLevel = parseInt(startingLevelElem.options[startingLevelElem.selectedIndex].value, 10);
		game.setStartingLevel(startingLevel);
	}

	function populateStatsTable() {
		var scoreData = document.getElementById("scoreData");
		scoreData.innerHTML = game.getScore();

		var levelData = document.getElementById("levelData");
		levelData.innerHTML = game.getLevel();

		var timeData = document.getElementById("timeData");
		var timeString = window.utils.getHourMinSecTime(game.getTime());
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
		infoArea.style.visibility = "visible";
		// TODO: switch divs; animate
	}

	function collapseInfoArea() {
		var infoArea = document.getElementById("infoArea");
		infoArea.style.visibility = "hidden";
		// TODO: switch divs; animate
	}

	function onMouseDown(event) {
		event = window.utils.standardizeMouseEvent(event);

		// We only care about gestures which occur while the game is running
		if (!game.getIsPaused() && !game.getIsEnded()) {
			gestureInProgress = true;

			var pagePos = { x: event.pageX, y: event.pageY };
			var currentTime = Date.now();

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameAreaRect = canvas.getBoundingClientRect();
			var gameAreaOffset = game.getGameAreaPosition();
			var gameAreaPos = {
				x: pagePos.x - gameAreaRect.left - gameAreaOffset.x,
				y: pagePos.y - gameAreaRect.top - gameAreaOffset.y
			};

			game.startGesture(gameAreaPos, currentTime);
		}

		// It ruins gameplay for the browser to use the mouse drag as a 
		// highlight gesture
		event.preventDefault();
	}

	function onMouseUp(event) {
		event = window.utils.standardizeMouseEvent(event);

		if (gestureInProgress) {
			gestureInProgress = false;

			var pagePos = { x: event.pageX, y: event.pageY };
			var currentTime = Date.now();

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameAreaRect = canvas.getBoundingClientRect();
			var gameAreaOffset = game.getGameAreaPosition();
			var gameAreaPos = {
				x: pagePos.x - gameAreaRect.left - gameAreaOffset.x,
				y: pagePos.y - gameAreaRect.top - gameAreaOffset.y
			};

			game.finishGesture(gameAreaPos, currentTime);
		}
	}

	function onMouseMove(event) {
		event = window.utils.standardizeMouseEvent(event);

		// Check whether this event is part of a drag
		if (gestureInProgress) {
			var pagePos = { x: event.pageX, y: event.pageY };

			// Translate the tap position from page coordinates to game-area 
			// coordinates
			var gameAreaRect = canvas.getBoundingClientRect();
			var gameAreaOffset = game.getGameAreaPosition();
			var gameAreaPos = {
				x: pagePos.x - gameAreaRect.left - gameAreaOffset.x,
				y: pagePos.y - gameAreaRect.top - gameAreaOffset.y
			};

			game.dragGesture(gameAreaPos);
		}
	}

	// This event cancels any current mouse gesture and forces the player to 
	// start again.  But only if the mouse is leaving the entire window.
	function onMouseOut(event) {
		var inElement = event.relatedTarget || event.toElement;
		if (!inElement || inElement.nodeName == "HTML") {
			gestureInProgress = false;

			game.cancelGesture();
		}
	}

	log.d("<--main.LOADING_MODULE");
})();
