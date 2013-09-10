// ------------------------------------------------------------------------- //
// -- window.sound
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the overall sound logic is encapsulated in this anonymous function.  
// This is then stored in the window.sound property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.log
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->sound.LOADING_MODULE");

	var _SFX_PATH = "sfx/";
	var _MUSIC_PATH = "music/";

	var _sfxLoadedCount = 0;

	var _nextMusicIndex = -1;
	var _currMusicIndex = -1;
	var _prev1MusicIndex = -1;
	var _prev2MusicIndex = -1;

	var _currentMusicInstance = null;
	var _nextMusicInstance = null;

	var _selectedMusic = [];

	// The data property represents how many instances of that sound can play simultaneously
	var _sfxManifest = [
		{
			id: "blockSelect",
			src: _SFX_PATH + "block_select.ogg|" + _SFX_PATH + "block_select.m4a",
			data: 3
		},
		{
			id: "bombPrimed",
			src: _SFX_PATH + "bomb_primed.ogg|" + _SFX_PATH + "bomb_primed.m4a",
			data: 3
		},
		{
			id: "bombReleased",
			src: _SFX_PATH + "bomb_released.ogg|" + _SFX_PATH + "bomb_released.m4a",
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
			id: "collapseBombDetonate",
			src: _SFX_PATH + "collapse_bomb_detonate.ogg|" + _SFX_PATH + "collapse_bomb_detonate.m4a",
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
			id: "settleBombDetonate",
			src: _SFX_PATH + "settle_bomb_detonate.ogg|" + _SFX_PATH + "settle_bomb_detonate.m4a",
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

	function _init() {
		log.d("-->sound._init");

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

		log.d("<--sound._init");
	}

	function _playSFX(soundId) {
		if (game.sfxOn) {
			createjs.Sound.play(soundId, createjs.Sound.INTERRUPT_ANY, 0, 0, 0, sound.sfxVolume, 0);
		}
	}

	function _toggleMusic(event) {
		var musicOnButton = document.getElementById("musicOnButton");
		var musicOffButton = document.getElementById("musicOffButton");

		if (game.musicOn) {
			musicOnButton.style.display = "none";
			musicOffButton.style.display = "block";
			_pauseMusic();
			game.musicOn = false;
		} else {
			musicOnButton.style.display = "block";
			musicOffButton.style.display = "none";
			_playCurrentMusic();
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
		_killSound(_currentMusicInstance);
		_killSound(_nextMusicInstance);

		_prev2MusicIndex = -1;
		_prev1MusicIndex = -1;
		_currMusicIndex = -1;
		_nextMusicIndex = -1;

		var nextSong = _chooseRandomNextSong();

		// Register the next song
		createjs.Sound.registerSound(nextSong.src, nextSong.id);
	}

	function _killSound(soundInstance) {
		if (soundInstance) {
			soundInstance.stop();
		}
	}

	function _onLoadingAudioComplete(event) {
		// Check whether this was a SFX or a song
		if (_getManifestIndex(event.id, _musicManifest) >= 0) {
			// Check whether the song that just loaded is the same song that 
			// the program now expects to play next
			if (event.id === _musicManifest[_nextMusicIndex].id) {
				_killSound(_nextMusicInstance);

				// Create the next song instance so we can play it when the 
				// current song ends
				_nextMusicInstance = createjs.Sound.createInstance(event.id);
				_nextMusicInstance.addEventListener("complete", _onSongEnd);
				_nextMusicInstance.addEventListener("failed", _onSoundError);

				// If this was the first song instance to be loaded, then we 
				// should play it immediately
				if (!_currentMusicInstance) {
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
		}
	}

	function _onSongEnd() {
		// If this was actually called while the current song is still 
		// playing, then it will be stopped
		_killSound(_currentMusicInstance);

		// Check whether the next song has loaded
		if (_nextMusicInstance) {
			_currentMusicInstance = _nextMusicInstance;
			_nextMusicInstance = null;

			var nextSong = _chooseRandomNextSong();

			// In the event that the next song is the same as the current 
			// song, we do NOT want to re-register it.  This will stop the 
			// playback.
			if (_currMusicIndex !== _nextMusicIndex) {
				// Register the next song
				createjs.Sound.registerSound(nextSong.src, nextSong.id);
			} else {
				_nextMusicInstance = _currentMusicInstance;
			}

			// Play the next song
			_playCurrentMusic();
		} else {
			// The next song has not yet loaded, so simply replay the song 
			// that just ended
			_playCurrentMusic();
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
		_prev2MusicIndex = _prev1MusicIndex;
		_prev1MusicIndex = _currMusicIndex;
		_currMusicIndex = _nextMusicIndex;

		if (_selectedMusic.length > 0) {
			// Randomly select the next song to play
			var randI;
			var songId;
			do {
				randI = Math.floor(Math.random() * _selectedMusic.length);
				songId = _selectedMusic[randI];
				_nextMusicIndex = _getManifestIndex(songId, _musicManifest);
			} while (_selectedMusic.length > 3 && 
					(_nextMusicIndex === _currMusicIndex || 
					 _nextMusicIndex === _prev1MusicIndex || 
					 _nextMusicIndex === _prev2MusicIndex));
		} else {
			// If the player has turned music on, but has un-selected all of 
			// the music tracks, then default to playing the first track
			_nextMusicIndex = 0;
		}

		return _musicManifest[_nextMusicIndex];
	}

	function _playCurrentMusic() {
		var currSong = _musicManifest[_currMusicIndex];

		// Don't play before things have been initialized
		if (currSong) {
			var selectedMusicIndex = _selectedMusic.indexOf(currSong.id);

			// Check whether the player un-selected the current song while it was 
			// paused
			if (selectedMusicIndex < 0) {
				// In the event that nothing is checked, then 0 will be the _currMusicIndex
				if (_selectedMusic.length !== 0 || _currMusicIndex !== 0) {
					_startNewRandomSong();
				}
			}
			
			if (game.musicOn && !game.isPaused && !game.isEnded && _currentMusicInstance && 
					(selectedMusicIndex >= 0 || (_selectedMusic.length === 0 && _currMusicIndex === 0))) {
				// If a song has been paused, then resume needs to be called to 
				// start playback where it left off.  Otherwise, a call to resume 
				// will return false, so we can then play the song for the first 
				// time.
				if (!_currentMusicInstance.resume()) {
					_currentMusicInstance.play(createjs.Sound.INTERRUPT_ANY, 0, 0, -1, sound.musicVolume, 0);
				}
			}
		}
	}

	function _pauseMusic() {
		if (_currentMusicInstance) {
			_currentMusicInstance.pause();
		}
	}

	function _onSoundError(event) {
		log.e("<->sound._onSoundError: type="+event.type+"; target="+event.target);
	}

	function _onMusicSelectionChange(event) {
		var index = _selectedMusic.indexOf(this.value);

		if (this.checked) {
			if (index < 0) {
				_selectedMusic.push(this.value);
			}
		} else {
			if (index >= 0) {
				_selectedMusic.splice(index, 1);
			}
		}
	}

	function _getMusicManifest() {
		return _musicManifest;
	}

	function _getSelectedMusic() {
		return _selectedMusic;
	}

	window.sound = {
		init: _init,
		playSFX: _playSFX,
		playCurrentMusic: _playCurrentMusic,
		pauseMusic: _pauseMusic,
		toggleSFX: _toggleSFX,
		toggleMusic: _toggleMusic,
		onMusicSelectionChange: _onMusicSelectionChange,

		getMusicManifest: _getMusicManifest,
		getSelectedMusic: _getSelectedMusic,

		sfxVolume: 0.45,
		musicVolume: 0.15
	};

	log.i("<--sound.LOADING_MODULE");
}());
