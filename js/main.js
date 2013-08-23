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

var squared = {
	game: null
};

// Preload all required resources and call init when done
window.resources.onready = init;
window.resources.load([
    "img/sprites.png"
]);

// We should not need to wait for window.load to complete, because this file 
// should be the last part to load
function init() {
	var canvas = document.getElementById("gameCanvas");

	squared.game = new Game(canvas);
	
	// Hook up the event handlers
	// TODO: start game button, pause button, the various game mode radio button groups (three groups of two), error handlers, 
}

function playGame() {
	squared.game.play();
	hideNonCanvasAreas();
}

function pauseGame() {
	squared.game.play();
	
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
