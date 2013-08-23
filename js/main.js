// ------------------------------------------------------------------------- //
// -- main
// ------------------------------------------------------------------------- //
// This file provides the main driving logic for the Squared web app.
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

	function resetGame() {
		game.reset();
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
		game.reset();
	};

	function onPauseEvent(event) {
		if () {
			
		}
	};

	function populateStatsTable() {
		// Populate the stats table
		var scoreData = document.getElementById("scoreData");
		scoreData.innerHtml = ;
		var levelData = document.getElementById("levelData");
		levelData.innerHtml = ;
		var timeData = document.getElementById("timeData");
		timeData.innerHtml = ;
	}

	// Handle exceptions or other miscellaneous problems
	function handleProblem(message) {
		// TODO: show problemArea and hide all others; add message
	}

	function setupDOMForJavascript() {
		// TODO: show all of the content of the page that is normally hidden in case the visitor does not have Javascript enabled
	}

	function showNonCanvasAreas() {
		// TODO: show; animate
	}

	function hideNonCanvasAreas() {
		// TODO: hide; animate
	}

	function expandInfoArea() {
		// TODO: switch divs; animate
	}

	function collapseInfoArea() {
		// TODO: switch divs; animate
	}
})();
