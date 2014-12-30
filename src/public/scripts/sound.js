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
//    - window.log
//    - utils
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->sound.LOADING_MODULE');

  var _SFX_PATH = '/squared-away/sfx/';
  var _MUSIC_PATH = '/squared-away/music/';

  var _onAudioToggle;

  var _sfxLoadedCount = 0;

  var _singleLoopMusicId = false;

  var _nextMusicIndex = -1;
  var _currMusicIndex = -1;
  var _prev1MusicIndex = -1;
  var _prev2MusicIndex = -1;

  var _currentMusicInstance = null;
  var _nextMusicInstance = null;

  var _selectedMusicIds = [];

  var _registeredMusicIds = [];
  var _registeredSfxIds = [];

  var _SOUND_ERROR_PLAY_AGAIN_DELAY = 3000;
  var _RE_REGISTER_MUSIC_DELAY = 60000;
  var _RE_REGISTER_SFX_DELAY = 10000;

  // The data property represents how many instances of that sound can play simultaneously
  var _sfxManifest = [
    {
      id: 'blockSelect',
      src: _SFX_PATH + 'block_select.ogg|' + _SFX_PATH + 'block_select.m4a',
      data: 2
    },
    {
      id: 'bombPrimed',
      src: _SFX_PATH + 'bomb_primed.ogg|' + _SFX_PATH + 'bomb_primed.m4a',
      data: 2
    },
    {
      id: 'bombReleased',
      src: _SFX_PATH + 'bomb_released.ogg|' + _SFX_PATH + 'bomb_released.m4a',
      data: 2
    },
    {
      id: 'changeFallDirection',
      src: _SFX_PATH + 'change_fall_direction.ogg|' + _SFX_PATH + 'change_fall_direction.m4a',
      data: 2
    },
    {
      id: 'chapterComplete',
      src: _SFX_PATH + 'earned_bonus.ogg|' + _SFX_PATH + 'earned_bonus.m4a',// TODO: add a new sound file for this
      data: 1
    },
    {
      id: 'collapse',
      src: _SFX_PATH + 'collapse.ogg|' + _SFX_PATH + 'collapse.m4a',
      data: 3
    },
    {
      id: 'collapseBombDetonate',
      src: _SFX_PATH + 'collapse_bomb_detonate.ogg|' + _SFX_PATH + 'collapse_bomb_detonate.m4a',
      data: 2
    },
    {
      id: 'earnedBonus',
      src: _SFX_PATH + 'earned_bonus.ogg|' + _SFX_PATH + 'earned_bonus.m4a',
      data: 1
    },
    {
      id: 'fall',
      src: _SFX_PATH + 'fall.ogg|' + _SFX_PATH + 'fall.m4a',
      data: 4
    },
    {
      id: 'gameOver',
      src: _SFX_PATH + 'game_over.ogg|' + _SFX_PATH + 'game_over.m4a',
      data: 1
    },
    {
      id: 'gameStart',
      src: _SFX_PATH + 'unpause.ogg|' + _SFX_PATH + 'unpause.m4a',// TODO: add a new sound file for this
      data: 1
    },
    {
      id: 'land',
      src: _SFX_PATH + 'land.ogg|' + _SFX_PATH + 'land.m4a',
      data: 3
    },
    {
      id: 'level',
      src: _SFX_PATH + 'level.ogg|' + _SFX_PATH + 'level.m4a',
      data: 1
    },
    {
      id: 'move',
      src: _SFX_PATH + 'move.ogg|' + _SFX_PATH + 'move.m4a',
      data: 3
    },
    {
      id: 'newBlock',
      src: _SFX_PATH + 'new_block.ogg|' + _SFX_PATH + 'new_block.m4a',
      data: 3
    },
    {
      id: 'pause',
      src: _SFX_PATH + 'pause.ogg|' + _SFX_PATH + 'pause.m4a',
      data: 1
    },
    {
      id: 'rotate',
      src: _SFX_PATH + 'rotate.ogg|' + _SFX_PATH + 'rotate.m4a',
      data: 3
    },
    {
      id: 'settleBombDetonate',
      src: _SFX_PATH + 'settle_bomb_detonate.ogg|' + _SFX_PATH + 'settle_bomb_detonate.m4a',
      data: 2
    },
    {
      id: 'unableToMove',
      src: _SFX_PATH + 'unable_to_move.ogg|' + _SFX_PATH + 'unable_to_move.m4a',
      data: 3
    },
    {
      id: 'unpause',
      src: _SFX_PATH + 'unpause.ogg|' + _SFX_PATH + 'unpause.m4a',
      data: 1
    }
  ];

  var _musicManifest = [
    {
      id: 'aNightOfDizzySpells',
      src: _MUSIC_PATH + 'a_night_of_dizzy_spells.ogg|' + _MUSIC_PATH + 'a_night_of_dizzy_spells.m4a',
      data: 1,
      title: 'A Night of Dizzy Spells'
    },
    {
      id: 'allOfUs',
      src: _MUSIC_PATH + 'all_of_us.ogg|' + _MUSIC_PATH + 'all_of_us.m4a',
      data: 1,
      title: 'All of Us'
    },
    {
      id: 'arpanauts',
      src: _MUSIC_PATH + 'arpanauts.ogg|' + _MUSIC_PATH + 'arpanauts.m4a',
      data: 1,
      title: 'Arpanauts'
    },
    {
      id: 'ascending',
      src: _MUSIC_PATH + 'ascending.ogg|' + _MUSIC_PATH + 'ascending.m4a',
      data: 1,
      title: 'Ascending'
    },
    {
      id: 'chibiNinja',
      src: _MUSIC_PATH + 'chibi_ninja.ogg|' + _MUSIC_PATH + 'chibi_ninja.m4a',
      data: 1,
      title: 'Chibi Ninja'
    },
    {
      id: 'comeAndFindMe',
      src: _MUSIC_PATH + 'come_and_find_me.ogg|' + _MUSIC_PATH + 'come_and_find_me.m4a',
      data: 1,
      title: 'Come and Find Me'
    },
    {
      id: 'comeAndFindMeB',
      src: _MUSIC_PATH + 'come_and_find_me_b_mix.ogg|' + _MUSIC_PATH + 'come_and_find_me_b_mix.m4a',
      data: 1,
      title: 'Come and Find Me (B Mix)'
    },
    {
      id: 'digitalNative',
      src: _MUSIC_PATH + 'digital_native.ogg|' + _MUSIC_PATH + 'digital_native.m4a',
      data: 1,
      title: 'Digital Native'
    },
    {
      id: 'hhavokIntro',
      src: _MUSIC_PATH + 'hhavok_intro.ogg|' + _MUSIC_PATH + 'hhavok_intro.m4a',
      data: 1,
      title: 'HHavok (Intro)'
    },
    {
      id: 'hhavokMain',
      src: _MUSIC_PATH + 'hhavok_main.ogg|' + _MUSIC_PATH + 'hhavok_main.m4a',
      data: 1,
      title: 'HHavok (Main)'
    },
    {
      id: 'jumpshot',
      src: _MUSIC_PATH + 'jumpshot.ogg|' + _MUSIC_PATH + 'jumpshot.m4a',
      data: 1,
      title: 'Jumpshot'
    },
    {
      id: 'prologue',
      src: _MUSIC_PATH + 'prologue.ogg|' + _MUSIC_PATH + 'prologue.m4a',
      data: 1,
      title: 'Prologue'
    },
    {
      id: 'searching',
      src: _MUSIC_PATH + 'searching.ogg|' + _MUSIC_PATH + 'searching.m4a',
      data: 1,
      title: 'Searching'
    },
    {
      id: 'underclocked',
      src: _MUSIC_PATH + 'underclocked.ogg|' + _MUSIC_PATH + 'underclocked.m4a',
      data: 1,
      title: 'Underclocked (Underunderclocked Mix)'
    },
    {
      id: 'wereAllUnderTheStars',
      src: _MUSIC_PATH + 'were_all_under_the_stars.ogg|' + _MUSIC_PATH + 'were_all_under_the_stars.m4a',
      data: 1,
      title: 'We&apos;re All Under the Stars'
    },
    {
      id: 'wereTheResistors',
      src: _MUSIC_PATH + 'were_the_resistors.ogg|' + _MUSIC_PATH + 'were_the_resistors.m4a',
      data: 1,
      title: 'We&apos;re the Resistors'
    }
  ];

  function _init(onAudioToggle) {
    log.d('-->sound._init');

    _onAudioToggle = onAudioToggle;

    // If this is on a mobile device, sounds need to be played inside of a touch event
    if (createjs.Sound.BrowserDetect.isIOS || 
        createjs.Sound.BrowserDetect.isAndroid || 
        createjs.Sound.BrowserDetect.isBlackberry) {
      // TODO: sound may not work... (look at the MobileSafe demo for an example of how I might be able to fix this)
      game.isMobile = true;
      log.w('---sound._init: sound will not be played on mobile browsers');
    }
    // Test that the browser supports sound
    else if (!createjs.Sound.initializeDefaultPlugins()) {
      // TODO: notify the actual user somehow
      log.e('---sound._init: Browser does not support audio');
    }

    // ---------- Initialize music/sfx on/off ---------- //

    game.musicOn = !game.musicOn;
    _toggleMusic();
    game.sfxOn = !game.sfxOn;
    _toggleSfx();

    // ---------- Load sounds ---------- //

    _registerSounds();

    log.d('<--sound._init');
  }

  function _registerSounds() {
    // Register (prepare and preload) all sound effects
    createjs.Sound.addEventListener('loadComplete', _onLoadingAudioComplete);
    createjs.Sound.registerManifest(_sfxManifest);
    createjs.Sound.registerManifest(_musicManifest);

    // Periodically try to re-register any songs which did not register 
    // successfully before
    setTimeout(_registerRemainingMusic, _RE_REGISTER_MUSIC_DELAY);
    setTimeout(_registerRemainingSfx, _RE_REGISTER_SFX_DELAY);
  }

  function _registerRemainingMusic() {
    if (_registeredMusicIds.length < _musicManifest.length) {
      setTimeout(_registerRemainingMusic, _RE_REGISTER_MUSIC_DELAY);

      var unregisteredSoundIds = _registerRemainingSounds(_registeredMusicIds, _musicManifest);

      _logUnregisteredSounds(unregisteredSoundIds);
    }
  }

  function _registerRemainingSfx() {
    if (_registeredSfxIds.length < _sfxManifest.length) {
      setTimeout(_registerRemainingSfx, _RE_REGISTER_SFX_DELAY);

      var unregisteredSoundIds = _registerRemainingSounds(_registeredSfxIds, _sfxManifest);

      _logUnregisteredSounds(unregisteredSoundIds);
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

  function _getUnregisteredSoundIds(registeredSoundIds, manifest) {
    var manifestIds = [];
    var i;
    for (i = 0; i < manifest.length; ++i) {
      manifestIds.push(manifest[i].id);
    }
    return utils.getDifference(manifestIds, registeredSoundIds);
  }

  function _registerRemainingSounds(registeredSoundIds, manifest) {
    if (registeredSoundIds.length < manifest.length) {
      var unregisteredSoundIds = _getUnregisteredSoundIds(registeredSoundIds, manifest);
      var soundIndex;
      var sound;
      var i;
      for (i = 0; i < unregisteredSoundIds.length; ++i) {
        soundIndex = _getManifestIndex(unregisteredSoundIds[i], manifest);
        sound = manifest[soundIndex];
        createjs.Sound.registerSound(sound.src, sound.id, sound.data);
      }
      return unregisteredSoundIds;
    }
  }

  function _logUnregisteredSounds(unregisteredSoundIds) {
    var msg = unregisteredSoundIds[0];
    var i;
    for (i = 1; i < unregisteredSoundIds.length; ++i) {
      msg += ', ' + unregisteredSoundIds[i];
    }
    log.w('---sound.: UNREGISTERED SOUNDS: '+msg);
  }

  function _playMusicOnSingleLoop(musicId) {
    _singleLoopMusicId = musicId;

    _killSound(_currentMusicInstance);
    _killSound(_nextMusicInstance);

    _nextMusicIndex = _getManifestIndex(_singleLoopMusicId, _musicManifest);
    _prev2MusicIndex = _nextMusicIndex;
    _prev1MusicIndex = _nextMusicIndex;
    _currMusicIndex = _nextMusicIndex;

    _nextMusicInstance = _getSoundInstance(_singleLoopMusicId);

    _onSongEnd(true);
  }

  function _shuffleMusic() {
    _singleLoopMusicId = null;

    _startNewRandomMusic();
  }

  function _playSfx(soundId) {
    if (!game.isMobile && game.sfxOn) {
      createjs.Sound.play(soundId, createjs.Sound.INTERRUPT_ANY, 0, 0, 0, sound.sfxVolume, 0);
    }
  }

  function _toggleMusic() {
    if (!game.isMobile && game.musicOn) {
      game.musicOn = false;
      _pauseMusic();
    } else {
      game.musicOn = true;
      _playCurrentMusic(false);
    }

    _onAudioToggle();
  }

  function _toggleSfx() {
    if (!game.isMobile && game.sfxOn) {
      game.sfxOn = false;
    } else {
      game.sfxOn = true;
    }

    _onAudioToggle();
  }

  function _startNewRandomMusic() {
    if (!_singleLoopMusicId) {
      // If this was actually called while the current song is still 
      // playing, then it will be stopped
      _killSound(_currentMusicInstance);
      _killSound(_nextMusicInstance);

      _prev2MusicIndex = -1;
      _prev1MusicIndex = -1;
      _currMusicIndex = -1;
      _nextMusicIndex = -1;

      var nextSong = _chooseRandomNextSong();

      if (nextSong) {
        _nextMusicInstance = _getSoundInstance(nextSong.id);

        _onSongEnd(true);
      }
    }
  }

  function _killSound(soundInstance) {
    if (soundInstance) {
      soundInstance.stop();
    }
  }

  function _getSoundInstance(soundId) {
    var soundInstance = createjs.Sound.createInstance(soundId);
    soundInstance.addEventListener('complete', _onSongEnd);
    soundInstance.addEventListener('failed', _onSoundError);
    return soundInstance;
  }

  function _onLoadingAudioComplete(event) {
    // Check whether this was a SFX or a song
    var musicManifestIndex = _getManifestIndex(event.id, _musicManifest);
    if (musicManifestIndex >= 0) {
      if (_registeredMusicIds.indexOf(event.id) < 0) {
        _registeredMusicIds.push(event.id);
      }

      // Create a sound instance
      _nextMusicInstance = _getSoundInstance(event.id);

      // If this was the first song instance to be loaded, then we 
      // should play it immediately
      if (!_currentMusicInstance) {
        _nextMusicIndex = musicManifestIndex;
        _onSongEnd(true);
      }
    } else {
      if (_registeredSfxIds.indexOf(event.id) < 0) {
        _registeredSfxIds.push(event.id);
      }
    }
  }

  function _onSongEnd(playEvenIfNotSelected) {
    // If this was actually called while the current song is still 
    // playing, then it will be stopped
    _killSound(_currentMusicInstance);

    // Check whether the next song has loaded
    if (_nextMusicInstance) {
      _currentMusicInstance = _nextMusicInstance;
      _nextMusicInstance = null;

      // Pick the next song to play
      var nextSongId;
      if (_singleLoopMusicId) {
        nextSongId = _singleLoopMusicId;
      } else {
        var nextSong = _chooseRandomNextSong();
        if (nextSong) {
          nextSongId = nextSong.id;
        } else {
          return;
        }
      }
      _nextMusicInstance = _getSoundInstance(nextSongId);

      // Play the new song
      _playCurrentMusic(playEvenIfNotSelected);

      // Update the now playing label
      var nowPlayingTitle = document.getElementById('nowPlayingTitle');
      nowPlayingTitle.innerHTML = _musicManifest[_currMusicIndex].title;
    } else {
      // The next song has not yet loaded, so simply replay the song 
      // that just ended
      _playCurrentMusic(playEvenIfNotSelected);
    }
  }

  function _chooseRandomNextSong() {
    // Update the song history
    _prev2MusicIndex = _prev1MusicIndex;
    _prev1MusicIndex = _currMusicIndex;
    _currMusicIndex = _nextMusicIndex;

    if (_registeredMusicIds.length > 0) {
      var validIds = utils.getIntersection(_registeredMusicIds, _selectedMusicIds);
      if (validIds.length > 0) {
        // Randomly select the next song to play
        var randI;
        var songId;
        do {
          randI = Math.floor(Math.random() * validIds.length);
          songId = validIds[randI];
          _nextMusicIndex = _getManifestIndex(songId, _musicManifest);
        } while (validIds.length > 3 && 
            (_nextMusicIndex === _currMusicIndex || 
             _nextMusicIndex === _prev1MusicIndex || 
             _nextMusicIndex === _prev2MusicIndex));
      } else {
        var firstRegisteredSongId = _registeredMusicIds[0];
        _nextMusicIndex = _getManifestIndex(firstRegisteredSongId, _musicManifest);
      }
    } else {
      _nextMusicIndex = -1;
    }

    return _musicManifest[_nextMusicIndex];
  }

  function _playCurrentMusic(playEvenIfNotSelected) {
    if (!game.isMobile && _currentMusicInstance) {
      var currSong = _musicManifest[_currMusicIndex];
      var selectedMusicIndex = _selectedMusicIds.indexOf(currSong.id);

      // Check whether the player un-selected the current song while it was 
      // paused
      if (!playEvenIfNotSelected && selectedMusicIndex < 0) {
        // Check whether there are any other valid songs
        var validIds = utils.getIntersection(_registeredMusicIds, _selectedMusicIds);
        if (validIds.length > 0) {
          _startNewRandomMusic();
        }
      }

      // Check whether we are allowed to play music now
      if (game.musicOn && !game.isPaused && !game.isEnded) {
        // If a song has been paused, then resume needs to be called to 
        // start playback where it left off.  Otherwise, a call to resume 
        // will return false, so we can then play the song for the first 
        // time.
        if (!_currentMusicInstance.resume()) {
          log.i('---sound._playCurrentMusic: PLAYING NEW SONG: '+_currentMusicInstance.src);
          _currentMusicInstance.play(createjs.Sound.INTERRUPT_ANY, 0, 0, 0, sound.musicVolume, 0);
        }
      }
    }
  }

  function _pauseMusic() {
    if (_currentMusicInstance) {
      try {
        _currentMusicInstance.pause();
      } catch (error) {
        log.w('---sound._pauseMusic: soundjs still has that null value bug: type='+error.type+'; msg='+error.msg);
      }
    }
  }

  function _onSoundError(event) {
    log.w('---sound._onSoundError: type='+event.type+
        '; target.src='+event.target.src+
        '; target.playState='+event.target.playState);
    setTimeout(_startNewRandomMusic, _SOUND_ERROR_PLAY_AGAIN_DELAY);
  }

  function _onMusicSelectionChange() {
    var index = _selectedMusicIds.indexOf(this.value);

    if (this.checked) {
      if (index < 0) {
        _selectedMusicIds.push(this.value);
      }
    } else {
      if (index >= 0) {
        _selectedMusicIds.splice(index, 1);
      }
    }
  }

  function _getMusicManifest() {
    return _musicManifest;
  }

  function _getSelectedMusic() {
    return _selectedMusicIds;
  }

  window.sound = {
    init: _init,
    playSfx: _playSfx,
    playCurrentMusic: _playCurrentMusic,
    pauseMusic: _pauseMusic,
    toggleSfx: _toggleSfx,
    toggleMusic: _toggleMusic,
    onMusicSelectionChange: _onMusicSelectionChange,

    getMusicManifest: _getMusicManifest,
    getSelectedMusic: _getSelectedMusic,

    playMusicOnSingleLoop: _playMusicOnSingleLoop, 
    shuffleMusic: _shuffleMusic, 

    sfxVolume: 0.45,
    musicVolume: 0.05
  };

  log.i('<--sound.LOADING_MODULE');
}());
