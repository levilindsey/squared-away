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

	var _SFX_PATH = "sfx/";
	var _MUSIC_PATH = "music/";
	var _IMAGE_PATH = "img/";

	var _canvas = null;
	var _body = null;

	var _gestureInProgress = false;

	var _sfxLoadedCount = 0;

	var _nextSongIndex = -1;
	var _currSongIndex = -1;
	var _prev1SongIndex = -1;
	var _prev2SongIndex = -1;

	var _currentSongInstance = null;
	var _nextSongInstance = null;

	var _selectedSongs = [];

	var _imageManifest = [
		_IMAGE_PATH + "sprites.png"
	];

	// The data property represents how many instances of that sound can play simultaneously
	var _sfxManifest = [
		{
			id: "blockSelect",
			src: _SFX_PATH + "block_select.ogg|" + _SFX_PATH + "block_select.m4a",
			data: 3
		},
		{
			id: "changeFallDirection",
			src: _SFX_PATH + "change_fall_direction.ogg|" + _SFX_PATH + "change_fall_direction.m4a",
			data: 3
		},
		{
			id: "collapse",
			src: _SFX_PATH + "collapse.ogg|" + _SFX_PATH + "collapse.m4a",
			data: 8
		},
		{
			id: "earnedBonus",
			src: _SFX_PATH + "earned_bonus.ogg|" + _SFX_PATH + "earned_bonus.m4a",
			data: 2
		},
		{
			id: "fall",
			src: _SFX_PATH + "fall.ogg|" + _SFX_PATH + "fall.m4a",
			data: 10
		},
		{
			id: "gameOver",
			src: _SFX_PATH + "game_over.ogg|" + _SFX_PATH + "game_over.m4a",
			data: 1
		},
		{
			id: "gameStart",
			src: _SFX_PATH + "unpause.ogg|" + _SFX_PATH + "unpause.m4a",// TODO: add a new sound file for this
			data: 1
		},
		{
			id: "land",
			src: _SFX_PATH + "land.ogg|" + _SFX_PATH + "land.m4a",
			data: 8
		},
		{
			id: "level",
			src: _SFX_PATH + "level.ogg|" + _SFX_PATH + "level.m4a",
			data: 1
		},
		{
			id: "move",
			src: _SFX_PATH + "move.ogg|" + _SFX_PATH + "move.m4a",
			data: 3
		},
		{
			id: "newBlock",
			src: _SFX_PATH + "new_block.ogg|" + _SFX_PATH + "new_block.m4a",
			data: 8
		},
		{
			id: "pause",
			src: _SFX_PATH + "pause.ogg|" + _SFX_PATH + "pause.m4a",
			data: 1
		},
		{
			id: "rotate",
			src: _SFX_PATH + "rotate.ogg|" + _SFX_PATH + "rotate.m4a",
			data: 3
		},
		{
			id: "unableToMove",
			src: _SFX_PATH + "unable_to_move.ogg|" + _SFX_PATH + "unable_to_move.m4a",
			data: 3
		},
		{
			id: "unpause",
			src: _SFX_PATH + "unpause.ogg|" + _SFX_PATH + "unpause.m4a",
			data: 1
		}
	];

	var _musicManifest = [
		{
			id: "aNightOfDizzySpells",
			src: _MUSIC_PATH + "a_night_of_dizzy_spells.ogg|" + _MUSIC_PATH + "a_night_of_dizzy_spells.m4a",
			data: 1
		},
		{
			id: "allOfUs",
			src: _MUSIC_PATH + "all_of_us.ogg|" + _MUSIC_PATH + "all_of_us.m4a",
			data: 1
		},
		{
			id: "arpanauts",
			src: _MUSIC_PATH + "arpanauts.ogg|" + _MUSIC_PATH + "arpanauts.m4a",
			data: 1
		},
		{
			id: "ascending",
			src: _MUSIC_PATH + "ascending.ogg|" + _MUSIC_PATH + "ascending.m4a",
			data: 1
		},
		{
			id: "chibiNinja",
			src: _MUSIC_PATH + "chibi_ninja.ogg|" + _MUSIC_PATH + "chibi_ninja.m4a",
			data: 1
		},
		{
			id: "comeAndFindMe",
			src: _MUSIC_PATH + "come_and_find_me.ogg|" + _MUSIC_PATH + "come_and_find_me.m4a",
			data: 1
		},
		{
			id: "comeAndFindMeB",
			src: _MUSIC_PATH + "come_and_find_me_b_mix.ogg|" + _MUSIC_PATH + "come_and_find_me_b_mix.m4a",
			data: 1
		},
		{
			id: "digitalNative",
			src: _MUSIC_PATH + "digital_native.ogg|" + _MUSIC_PATH + "digital_native.m4a",
			data: 1
		},
		{
			id: "hhavokIntro",
			src: _MUSIC_PATH + "hhavok_intro.ogg|" + _MUSIC_PATH + "hhavok_intro.m4a",
			data: 1
		},
		{
			id: "hhavokMain",
			src: _MUSIC_PATH + "hhavok_main.ogg|" + _MUSIC_PATH + "hhavok_main.m4a",
			data: 1
		},
		{
			id: "jumpshot",
			src: _MUSIC_PATH + "jumpshot.ogg|" + _MUSIC_PATH + "jumpshot.m4a",
			data: 1
		},
		{
			id: "prologue",
			src: _MUSIC_PATH + "prologue.ogg|" + _MUSIC_PATH + "prologue.m4a",
			data: 1
		},
		{
			id: "searching",
			src: _MUSIC_PATH + "searching.ogg|" + _MUSIC_PATH + "searching.m4a",
			data: 1
		},
		{
			id: "underclocked",
			src: _MUSIC_PATH + "underclocked.ogg|" + _MUSIC_PATH + "underclocked.m4a",
			data: 1
		},
		{
			id: "wereAllUnderTheStars",
			src: _MUSIC_PATH + "were_all_under_the_stars.ogg|" + _MUSIC_PATH + "were_all_under_the_stars.m4a",
			data: 1
		},
		{
			id: "wereTheResistors",
			src: _MUSIC_PATH + "were_the_resistors.ogg|" + _MUSIC_PATH + "were_the_resistors.m4a",
			data: 1
		}
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

		document.addEventListener("keypress", _onKeyPress, false);
		document.addEventListener("keyup", _onKeyUp, false);

		_canvas.addEventListener("mousedown", _onMouseDown, false);
		document.addEventListener("mouseup", _onMouseUp, false);
		document.addEventListener("mousemove", _onMouseMove, false);
		document.addEventListener("mouseout", _onMouseOut, false);

		var helpButton = document.getElementById("helpButton");
		helpButton.addEventListener("click", _pauseGame, false);
		var musicOnButton = document.getElementById("musicOnButton");
		musicOnButton.addEventListener("click", _toggleAudio, false);
		var musicOffButton = document.getElementById("musicOffButton");
		musicOffButton.addEventListener("click", _toggleAudio, false);
		var sfxOnButton = document.getElementById("sfxOnButton");
		sfxOnButton.addEventListener("click", _toggleAudio, false);
		var sfxOffButton = document.getElementById("sfxOffButton");
		sfxOffButton.addEventListener("click", _toggleAudio, false);

		// ---------- Set up shuffle for only the selected songs ---------- //

		var songCheckBox;
		var i;

		for (i = 0; i < _musicManifest.length; ++i) {
			songCheckBox = document.getElementById(_musicManifest[i].id);
			songCheckBox.addEventListener("click", _onMusicSelectionChange, false);
			if (songCheckBox.checked) {
				_selectedSongs.push(songCheckBox.value);
			}
		}

		// ---------- Initialize music/sfx on/off ---------- //

		game.musicOn = !game.musicOn;
		_toggleMusic();
		game.sfxOn = !game.sfxOn;
		_toggleSFX();

		// ---------- Hook up sound ---------- //

		// Test that the browser supports sound
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

		// Register (prepare and preload) all sound effects
		createjs.Sound.addEventListener("loadComplete", _onLoadingAudioComplete);
		createjs.Sound.registerManifest(_sfxManifest);

		_startNewRandomSong();

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
			game.playSFX("gameStart");
		} else if (game.isPaused) {
			game.playSFX("unpause");
		}

		game.play();

		_playCurrentSong();

		log.d("<--main._playGame");
	}

	function _pauseGame() {
		log.d("-->main._pauseGame");

		var pauseScreen = document.getElementById("pauseScreen");
		pauseScreen.style.display = "block";

		_populateStatsTable();

		_expandInfoArea();

		if (!game.isPaused && !game.isEnded) {
			game.playSFX("pause");
		}

		game.pause();

		_pauseCurrentSong();

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

		game.playSFX("gameOver");

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
	
	function _onKeyPress(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ENTER": _playGame(); break; // play only
		case "SPACE": _onPauseEvent(event); event.preventDefault(); break; // toggle play/pause
		default: break;
		}
	}
	
	function _onKeyUp(event) {
        var keyCode = event.keyCode;
		var key = utils.translateKeyCode(keyCode);

		switch(key) {
		case "ESCAPE": _pauseGame(); break; // pause only
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

	// This function is needed, because the music and SFX toggle buttons are 
	// actually triangles that form two halves of a square.  Therefore, the 
	// image regions overlap and without this function, only one of either 
	// music or SFX would ever be toggled.
	function _toggleAudio(event) {
		event = utils.standardizeMouseEvent(event);
		var rect = this.getBoundingClientRect();
		var localX = event.pageX - rect.left;
		var localY = event.pageY - rect.top;

		if (localY + localX < rect.width) {
			_toggleMusic(event);
		} else {
			_toggleSFX(event);
		}
	}

	function _toggleMusic(event) {
		var musicOnButton = document.getElementById("musicOnButton");
		var musicOffButton = document.getElementById("musicOffButton");

		if (game.musicOn) {
			musicOnButton.style.display = "none";
			musicOffButton.style.display = "block";
			_pauseCurrentSong();
			game.musicOn = false;
		} else {
			musicOnButton.style.display = "block";
			musicOffButton.style.display = "none";
			_playCurrentSong();
			game.musicOn = true;
		}
	}

	function _toggleSFX(event) {
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

	function _startNewRandomSong() {
		// If this was actually called while the current song is still 
		// playing, then it will be stopped
		if (_currentSongInstance) {
			_currentSongInstance.stop();
		}

		_currentSongInstance = null;
		_nextSongInstance = null;

		var nextSong = _chooseRandomNextSong();

		// Register the next song
		createjs.Sound.registerSound(nextSong.src, nextSong.id);
	}

	function _onLoadingAudioComplete(event) {
		// Check whether this was a SFX or a song
		if (_getManifestIndex(event.id, _musicManifest) >= 0) {
			// Check whether the song that just loaded is the same song that 
			// the program now expects to play next
			if (event.id === _musicManifest[_nextSongIndex].id) {
				// Create the next song instance so we can play it when the 
				// current song ends
				_nextSongInstance = createjs.Sound.createInstance(event.id);

				// If this was the first song instance to be loaded, then we 
				// should play it immediately
				if (!_currentSongInstance) {
					_onSongEnd();
				}
			} else {
				// If the song took so long to load that the program is now ready 
				// for some other song to be next instead, then lets start all 
				// over with an entirely new random song
				_startNewRandomSong();
			}
		} else {
			++_sfxLoadedCount;

			// Only allow the player to start a game once all of the sounds have been loaded
			if (_sfxLoadedCount === _sfxManifest.length) {
				var unpauseButton = document.getElementById("unpauseButton");
				unpauseButton.disabled = false;
			}
		}
	}

	function _onSongEnd() {
		// If this was actually called while the current song is still 
		// playing, then it will be stopped
		if (_currentSongInstance) {
			_currentSongInstance.stop();
		}

		// Check whether the next song has loaded
		if (_nextSongInstance) {
			_currentSongInstance = _nextSongInstance;
			_nextSongInstance = null;

			var nextSong = _chooseRandomNextSong();

			// In the event that the next song is the same as the current 
			// song, we do NOT want to re-register it.  This will stop the 
			// playback.
			if (_currSongIndex !== _nextSongIndex) {
				// Register the next song
				createjs.Sound.registerSound(nextSong.src, nextSong.id);
			} else {
				_nextSongInstance = _currentSongInstance;
			}

			// Call this function again when this new song ends
			_currentSongInstance.addEventListener("complete", _onSongEnd);

			// Play the next song
			_playCurrentSong();
		} else {
			// The next song has not yet loaded, so simply replay the song 
			// that just ended
			_playCurrentSong();
		}
	}

	function _getManifestIndex(id, manifest) {
		var i;
		for (i = 0; i < manifest.length; ++i) {
			if (manifest[i].id === id) {
				return i;
			}
		}
		return -1;
	}

	function _chooseRandomNextSong() {
		// Update the song history
		_prev2SongIndex = _prev1SongIndex;
		_prev1SongIndex = _currSongIndex;
		_currSongIndex = _nextSongIndex;

		if (_selectedSongs.length > 0) {
			// Randomly select the next song to play
			var randI;
			var songId;
			do {
				randI = Math.floor(Math.random() * _selectedSongs.length);
				songId = _selectedSongs[randI];
				_nextSongIndex = _getManifestIndex(songId, _musicManifest);
			} while (_selectedSongs.length > 3 && 
					(_nextSongIndex === _currSongIndex || 
					 _nextSongIndex === _prev1SongIndex || 
					 _nextSongIndex === _prev2SongIndex));
		} else {
			// If the player has turned music on, but has un-selected all of 
			// the music tracks, then default to playing the first track
			_nextSongIndex = 0;
		}

		return _musicManifest[_nextSongIndex];
	}

	function _playCurrentSong() {
		var currSong = _musicManifest[_currSongIndex];

		// Don't play before things have been initialized
		if (currSong) {
			var selectedSongIndex = _selectedSongs.indexOf(currSong.id);

			// Check whether the player un-selected the current song while it was 
			// paused
			if (selectedSongIndex < 0) {
				// In the event that nothing is checked, then 0 will be the _currSongIndex
				if (_selectedSongs.length != 0 || _currSongIndex != 0) {
					_startNewRandomSong();
				}
			}
			
			if (game.musicOn && !game.isPaused && !game.isEnded && _currentSongInstance && 
					(selectedSongIndex >= 0 || (_selectedSongs.length == 0 && _currSongIndex == 0))) {
				// If a song has been paused, then resume needs to be called to 
				// start playback where it left off.  Otherwise, a call to resume 
				// will return false, so we can then play the song for the first 
				// time.
				if (!_currentSongInstance.resume()) {
					_currentSongInstance.play(createjs.Sound.INTERRUPT_NONE, 0, 0, 0, game.musicVolume, 0);
				}
			}
		}
	}

	function _pauseCurrentSong() {
		if (_currentSongInstance) {
			_currentSongInstance.pause();
		}
	}

	function _onMusicSelectionChange(event) {
		var index = _selectedSongs.indexOf(this.value);

		if (this.checked) {
			if (index < 0) {
				_selectedSongs.push(this.value);
			}
		} else {
			if (index >= 0) {
				_selectedSongs.splice(index, 1);
			}
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
})();
