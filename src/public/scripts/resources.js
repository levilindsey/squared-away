// ------------------------------------------------------------------------- //
// -- window.resources
// ------------------------------------------------------------------------- //
// This file provides logic for preloading resources for the Squared Away web app.
// 
// This is based off of code by James Long 
// (http://jlongster.com/Making-Sprite-based-Games-with-Canvas)
// 
// Dependencies:
//    - utils
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->resources.LOADING_MODULE');

    var _resourceCache = {};

    // Load a single image url or an array of image urls
    function _loadURLOrArray(urlOrArray) {
    log.d('-->resources._loadURLOrArray');

        if(urlOrArray instanceof Array) {
      // Given an array

            for (var i = 0; i < urlOrArray.length; ++i) {
        _loadURL(urlOrArray[i]);
      }
        }
        else {
      // Given a single url

            _loadURL(urlOrArray);
        }

    log.d('<--resources._loadURLOrArray');
    }

    function _loadURL(url) {
        if(_resourceCache[url]) {
      // In case the resource is somehow already in the cache

            return _resourceCache[url];
        }
    else {
      // Add the new resource to the cache

            var img = new Image();
            img.onload = function() {
                _resourceCache[url] = img;

        if(_isReady() && window.resources.onready) {
          // When the last resource is added, call the onready 
          // callback
                    window.resources.onready();
                }
            };
            _resourceCache[url] = false;
            img.src = url;
        }
    }

    function _get(url) {
        return _resourceCache[url];
    }

    function _isReady() {
        var ready = true;
        for(var k in _resourceCache) {
            if(_resourceCache.hasOwnProperty(k) &&
        !_resourceCache[k]) {
        // If a value of false has been added to the resourceCache 
        // array for any element, then not all of the resources have 
        // yet been loaded
                ready = false;
            }
        }
        return ready;
    }

    window.resources = { 
        load: _loadURLOrArray,
        get: _get,
        onready: null,
        isReady: _isReady
    };

  log.i('<--resources.LOADING_MODULE');
}());
