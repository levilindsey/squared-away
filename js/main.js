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

	var game = null;
	var canvas = null;
	var body = null;

	var gestureInProgress = false;

	// Preload all required resources and call init when done
	window.resources.onready = init;
	window.resources.load([
		"img/sprites.png"
	]);

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

		log.d("<--main.init");
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
		var inElement = event.relatedTarget || e.toElement;
		if (!inElement || inElement.nodeName == "HTML") {
			gestureInProgress = false;

			game.cancelGesture();
		}
	}

	log.d("<--main.LOADING_MODULE");
})();
