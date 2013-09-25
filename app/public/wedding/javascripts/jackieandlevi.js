// This file must be included AFTER the other javascript files

var SCRIPTED_CONTENT_CLASS = 'scripted_content';
var NO_SCRIPT_CONTENT_CLASS = 'no_script_content';
var IE_USER_CONTENT_CLASS = 'ie_user_content';

/**
 * Called when the window loads.
 */
$(document).ready(function() {
  // Only use Javascript for non-IE users
  if(navigator.appName != 'Microsoft Internet Explorer') {
    $('#' + RSVP_SUBMIT_ID).attr('disabled', 'true');

    // Fix the page content for people do indeed have javascript enabled
    $('.' + NO_SCRIPT_CONTENT_CLASS).css('display', 'none');
    $('.' + SCRIPTED_CONTENT_CLASS).css('display', 'block');

    initializeBubblesJS();
    initializeTimer();
    initializeRSVP();
  } else {
    $('#' + RSVP_SUBMIT_ID).removeAttr('disabled');

    $('.' + NO_SCRIPT_CONTENT_CLASS).css('display', 'none');
    $('.' + IE_USER_CONTENT_CLASS).css('display', 'block');
  }
});
