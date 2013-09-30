/*****************************************************************************
 * Authors: Levi Lindsey,
 *      Jackie Schwartzstein
 *****************************************************************************/

var COMING_YES_ID = 'coming_yes_rb';
var COMING_NO_ID = 'coming_no_rb';

var RSVP_COMING_ID = 'rsvp_coming';

var RSVP_NAME_ID = 'rsvp_name';
var RSVP_EMAIL_ID = 'rsvp_email';
var RSVP_COUNT_ID = 'rsvp_count';
var RSVP_DIET_NEEDS_ID = 'rsvp_diet_needs';

var RSVP_SUBMIT_ID = 'rsvp_submit';

var RSVP_NAME_ERROR_ID = 'rsvp_name_error';
var RSVP_EMAIL_ERROR_ID = 'rsvp_email_error';
var RSVP_COUNT_ERROR_ID = 'rsvp_count_error';
var RSVP_DIET_NEEDS_ERROR_ID = 'rsvp_diet_needs_error';

// ------------------------------------------------------------------------- //

var checkedYesOrNo = false;
var checkedYes = false;

var currentTextInFocus = null;

var EMPTY_NAME_ERROR_MSG  = 'Please enter your full name<br />';
var EMPTY_EMAIL_ERROR_MSG  = 'Please enter your email address<br />';
var INVALID_EMAIL_ERROR_MSG  = 'Not a valid email address<br />';
var EMPTY_COUNT_ERROR_MSG  = 'Please enter how many people will be in your party<br />';
var INVALID_COUNT_ERROR_MSG  = 'Please enter only numeric characters (e.g., 4 rather than four)<br />';

// ------------------------------------------------------------------------- //

function initializeRSVP() {
  $('#' + COMING_YES_ID).change(onYesNoChange);
  $('#' + COMING_NO_ID).change(onYesNoChange);

  $('#' + RSVP_NAME_ID).change(onTextChange);
  $('#' + RSVP_EMAIL_ID).change(onTextChange);
  $('#' + RSVP_COUNT_ID).change(onTextChange);
  $('#' + RSVP_DIET_NEEDS_ID).change(onTextChange);

  $('#' + RSVP_NAME_ID).focus(onTextFocus);
  $('#' + RSVP_EMAIL_ID).focus(onTextFocus);
  $('#' + RSVP_COUNT_ID).focus(onTextFocus);
  $('#' + RSVP_DIET_NEEDS_ID).focus(onTextFocus);

  validateUserInput();
}

function onYesNoChange() {
  checkedYesOrNo = true;
  checkedYes = $(this).attr('id') == COMING_YES_ID;

  var rsvpComingSection = $('#' + RSVP_COMING_ID);
  if(checkedYes) {
    rsvpComingSection.css('display', 'inline');
  } else {
    rsvpComingSection.css('display', 'none');
  }

  validateUserInput();
}

function onTextFocus() {
  checkText(currentTextInFocus);

  currentTextInFocus = $(this);

  // Remove any error messages for this input
  switch(currentTextInFocus.attr('id')) {
    case RSVP_NAME_ID:
      $('#' + RSVP_NAME_ERROR_ID).css('display', 'none');
      break;
    case RSVP_EMAIL_ID:
      $('#' + RSVP_EMAIL_ERROR_ID).css('display', 'none');
      break;
    case RSVP_COUNT_ID:
      $('#' + RSVP_COUNT_ERROR_ID).css('display', 'none');
      break;
    case RSVP_DIET_NEEDS_ID:
      $('#' + RSVP_DIET_NEEDS_ERROR_ID).css('display', 'none');
      break;
    default:
      break;
  }
}

function onTextChange() {
  currentTextInFocus = $(this);
  checkText(currentTextInFocus);
}

function checkText(currentTextInFocus) {
  // Validate this input
  switch(currentTextInFocus.attr('id')) {
    case RSVP_NAME_ID:
      checkNameText(true);
      break;
    case RSVP_EMAIL_ID:
      checkEmailText(true);
      break;
    case RSVP_COUNT_ID:
      checkCountText(true);
      break;
    case RSVP_DIET_NEEDS_ID:
      checkDietNeedsText(true);
      break;
    default:
      break;
  }

  validateUserInput();
}

function validateUserInput() {
  var rsvpSubmitButton = $('#' + RSVP_SUBMIT_ID);
  if(checkedYesOrNo &&
      checkNameText(false) &&
      checkEmailText(false) &&
      (!checkedYes ||
        (checkCountText(false) &&
        checkDietNeedsText(false))) && 
      !thisIsAfterTheWedding) {
//    rsvpSubmitButton.removeAttr('disabled');
  } else {
    rsvpSubmitButton.attr('disabled', 'true');
  }
}

function checkNameText(displayErrMsg) {
  var errorMsg = $('#' + RSVP_NAME_ERROR_ID);
  var currentInput = $('#' + RSVP_NAME_ID).val();
  if(currentInput.length <= 0) {
    if(displayErrMsg) {
      // Display an error message
      errorMsg.html(EMPTY_NAME_ERROR_MSG);
      errorMsg.css('display', 'inline');
    }
    return false;
  } else {
    // Hide any error message
    errorMsg.css('display', 'none');
    return true;
  }
}

function checkEmailText(displayErrMsg) {
  var errorMsg = $('#' + RSVP_EMAIL_ERROR_ID);
  var currentInput = $('#' + RSVP_EMAIL_ID).val();
  if(currentInput.length <= 0) {
    if(displayErrMsg) {
      // Display an error message
      errorMsg.html(EMPTY_EMAIL_ERROR_MSG);
      errorMsg.css('display', 'inline');
    }
    return false;
  } else if(!isEmail(currentInput)) {
    if(displayErrMsg) {
      // Display an error message
      errorMsg.html(INVALID_EMAIL_ERROR_MSG);
      errorMsg.css('display', 'inline');
    }
    return false;
  } else {
    // Hide any error message
    errorMsg.css('display', 'none');
    return true;
  }
}

function checkCountText(displayErrMsg) {
  var errorMsg = $('#' + RSVP_COUNT_ERROR_ID);
  var currentInput = $('#' + RSVP_COUNT_ID).val();
  if(currentInput.length <= 0) {
    if(displayErrMsg) {
      // Display an error message
      errorMsg.html(EMPTY_COUNT_ERROR_MSG);
      errorMsg.css('display', 'inline');
    }
    return false;
  } else if(!isNumeric(currentInput)) {
    if(displayErrMsg) {
      // Display an error message
      errorMsg.html(INVALID_COUNT_ERROR_MSG);
      errorMsg.css('display', 'inline');
    }
    return false;
  } else {
    // Hide any error message
    errorMsg.css('display', 'none');
    return true;
  }
}

function checkDietNeedsText(displayErrMsg) {
  return true;
}

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function isNumeric(text) {
  var regex = /^[0-9]+$/;
  return regex.test(text);
}
