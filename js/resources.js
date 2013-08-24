// ------------------------------------------------------------------------- //
// -- window.resources
// ------------------------------------------------------------------------- //
// This file provides logic for preloading resources for the Squared Away web app.
// 
// This is based off of code by James Long 
// (http://jlongster.com/Making-Sprite-based-Games-with-Canvas)
// 
// Dependencies:
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
    var _resourceCache = {};

    // Load a single image url or an array of image urls
    var _loadURLOrArray = function(urlOrArray) {
        if(urlOrArray instanceof Array) {
			// Given an array

            urlOrArray.forEach(function(url) {
                _loadURL(url);
            });
        }
        else {
			// Given a single url

            _loadURL(urlOrArr);
        }
    };

    var _loadURL = function(url) {
        if(resourceCache[url]) {
			// In case the resource is somehow already in the cache

            return resourceCache[url];
        }
		else {
			// Add the new resource to the cache

            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

				if(isReady() && window.resources.onready) {
					// When the last resource is added, call the onready 
					// callback
                    window.resources.onready();
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    };

    var _get = function(url) {
        return resourceCache[url];
    };

    var _isReady = function() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
				!resourceCache[k]) {
				// If a value of false has been added to the resourceCache 
				// array for any element, then not all of the resources have 
				// yet been loaded
                ready = false;
            }
        }
        return ready;
    };

    window.resources = { 
        load: _loadURLOrArray,
        get: _get,
        onready: null,
        isReady: _isReady
    };
}());
