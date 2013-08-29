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

if (DEBUG) {
	log.d("-->main.LOADING_FILE");
}

(function() {
	var game = null;

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

		var canvas = document.getElementById("gameCanvas");
		var levelDisplay = document.getElementById("topLevelDisplayData");
		var scoreDisplay = document.getElementById("topScoreDisplayData");log.d("---main.init1");/////TODO/////

		game = new Game(canvas, levelDisplay, scoreDisplay, onGameEnd);log.d("---main.init2");/////TODO/////

		// Hook up the event handlers
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.addEventListener("click", onPauseEvent, false);log.d("---main.init3");/////TODO/////
		window.addEventListener("keypress", onKeyPress, false);
		window.addEventListener("blur", pauseGame, false);log.d("---main.init4");/////TODO/////

		log.d("<--main.init");
	}

	function playGame() {
		log.d("-->main.playGame");

		// Set up the pause screen content
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "none";
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");
		pauseScreenTitle.style.display = "block";
		pauseScreenTitle.innerHtml = "Game Paused";
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.style.marginTop = "0px";
		unpauseButton.innerHtml = "Unpause";
		var statsTable = document.getElementById("statsTable");
		statsTable.style.display = "block";

		hideNonCanvasAreas();

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

		game.pause();

		log.d("<--main.pauseGame");
	}

	function onGameEnd() {
		log.d("-->main.onGameEnd");

		// Set up the game over screen content
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");
		pauseScreenTitle.innerHtml = "Game Over";
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.innerHtml = "Play Again";

		populateStatsTable();

		log.d("<--main.onGameEnd");
	}

	function onPauseEvent(event) {
		log.d("-->main.onPauseEvent");

		if (game.isPaused()) {
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
		case "ESCAPE": pauseGame(); break; // pause only
		case "ENTER": playGame(); break; // play only
		case "SPACE": onPauseEvent(event); break; // toggle play/pause
		// TODO: look for other key-press events?
		default: break;
		}
	}

	// Adjust the game parameters to match the selected input options
	function setGameParameters() {
		var mode1 = document.getElementById("mode1");
		game.setMode1(mode1.checked);
		var mode2 = document.getElementById("mode2");
		game.setMode2(mode2.checked);
		var mode3 = document.getElementById("mode3");
		game.setMode3(mode3.checked);
		var mode4 = document.getElementById("mode4");
		game.setMode4(mode4.checked);
		var gameAreaSizeElem = document.getElementById("gameAreaSize");
		var gameAreaSize = parseInt(gameAreaSizeElem.options[gameAreaSizeElem.selectedIndex].value);
		game.setGameAreaSize(gameAreaSize);
		var centerSquareSizeElem = document.getElementById("centerSquareSize");
		var centerSquareSize = parseInt(centerSquareSizeElem.options[centerSquareSizeElem.selectedIndex].value);
		game.setCenterSquareSize(centerSquareSize);
		var startingLevelElem = document.getElementById("startingLevel");
		var startingLevel = parseInt(startingLevelElem.options[startingLevelElem.selectedIndex].value);
		game.setStartingLevel(startingLevel);
	}

	function populateStatsTable() {
		var scoreData = document.getElementById("scoreData");
		scoreData.innerHtml = game.getScore();

		var levelData = document.getElementById("levelData");
		levelData.innerHtml = game.getLevel();

		var timeData = document.getElementById("timeData");
		timeData.innerHtml = game.getTime();
	}

	function setupDOMForJavascript() {
		var noJavaScriptArea = document.getElementById("noJavaScriptArea");
		noJavaScriptArea.style.display = "none";
		var playArea = document.getElementById("playArea");
		playArea.style.display = "block";
		var infoArea = document.getElementById("infoArea");
		infoArea.style.display = "block";
	}

	function showNonCanvasAreas() {
		var banner = document.getElementById("banner");
		banner.style.visibility = "visible";
		var infoArea = document.getElementById("infoArea");
		infoArea.style.visibility = "visible";
		// TODO: animate
	}

	function hideNonCanvasAreas() {
		var banner = document.getElementById("banner");
		banner.style.visibility = "hidden";
		var infoArea = document.getElementById("infoArea");
		infoArea.style.visibility = "hidden";
		// TODO: animate
	}

	function expandInfoArea() {
		// TODO: switch divs; animate
	}

	function collapseInfoArea() {
		// TODO: switch divs; animate
	}
})();

if (DEBUG) {
	log.d("<--main.LOADING_FILE");
}
