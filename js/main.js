// ------------------------------------------------------------------------- //
// -- main
// ------------------------------------------------------------------------- //
// This file provides the main driving logic for the Squared Away web app.
// 
// Dependencies:
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
		var canvas = document.getElementById("gameCanvas");

		game = new Game(canvas);
		
		// Hook up the event handlers
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.addEventListener("click", onPauseEvent, false);
		
		// TODO: start game button, pause button, the various game mode radio button groups (three groups of two), error handlers, 
	}

	function playGame() {
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

		game.play();
	}

	function pauseGame() {
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";
		
		populateStatsTable();
		
		game.pause();
	}

	function endGame() {
		// Set up the game over screen content
		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";
		var pauseScreenTitle = document.getElementById("pauseScreenTitle");
		pauseScreenTitle.innerHtml = "Game Over";
		var unpauseButton = document.getElementById("unpauseButton");
		unpauseButton.innerHtml = "Play Again";

		populateStatsTable();
	}

	function onPauseEvent(event) {
		if () {
			
		}
	}

	function populateStatsTable() {
		var scoreData = document.getElementById("scoreData");
		scoreData.innerHtml = game.getScore();

		var levelData = document.getElementById("levelData");
		levelData.innerHtml = game.getLevel();

		var timeData = document.getElementById("timeData");
		timeData.innerHtml = game.getTime();
	}

	// Handle exceptions or other miscellaneous problems
	function handleProblem(message) {
		// Show the problem area and hide the others
		hideNonCanvasAreas();
		var problemScreen = document.getElementById("problemScreen");
		problemScreen.style.display = "block";

		// Add the error message
		var problemText = problemScreen.getElementById("problemText");
		problemText.innerHtml = message;
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
		var banner = document.getElementById("problemArea");
		banner.style.visibility = "visible";
		var infoArea = document.getElementById("infoArea");
		infoArea.style.visibility = "visible";
		// TODO: animate
	}

	function hideNonCanvasAreas() {
		var banner = document.getElementById("problemArea");
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
