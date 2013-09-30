var MAX_VALUE = 9007199254740992;

var DAYS_DIVISOR = 86400000;  // 1000 * 60 * 60 * 24
var HOURS_DIVISOR = 3600000;  // 1000 * 60 * 60
var HOURS_MODULUS = 24;
var MINUTES_DIVISOR = 60000;  // 1000 * 60
var MINUTES_MODULUS = 60;
var SEOCNDS_DIVISOR = 1000;    // 1000
var SECONDS_MODULUS = 60;
var HUNDRETHS_OF_SECONDS_DIVISOR = 10;    // 10
var HUNDRETHS_OF_SECONDS_MODULUS = 100;

var DAYS_CELL_ID = 'days';
var HOURS_CELL_ID = 'hours';
var MINUTES_CELL_ID = 'minutes';
var SECONDS_CELL_ID = 'seconds';
var HUNDRETHS_OF_SECONDS_CELL_ID = 'hundreths_of_seconds';

var LEADING_ZERO = true;

var timer;
var weddingDateInMillis;

var thisIsAfterTheWedding;

function initializeTimer() {
  weddingDateInMillis = new Date('8/3/2013 2:00 PM').getTime();
  timer = setInterval(updateClock, 1000);
  thisIsAfterTheWedding = false;
}

function parseTimeValue(millis, timeUnit) {
  var divisor, modulus, increment;
  
  switch(timeUnit) {
  case DAYS_CELL_ID:
    divisor = DAYS_DIVISOR;
    modulus = MAX_VALUE;
    increment = 0;
    break;
  case HOURS_CELL_ID:
    divisor = HOURS_DIVISOR;
    modulus = HOURS_MODULUS;
    increment = HOURS_DIVISOR;
    break;
  case MINUTES_CELL_ID:
    divisor = MINUTES_DIVISOR;
    modulus = MINUTES_MODULUS;
    increment = 0;
    break;
  case SECONDS_CELL_ID:
    divisor = SEOCNDS_DIVISOR;
    modulus = SECONDS_MODULUS;
    increment = 0;
    break;
  case HUNDRETHS_OF_SECONDS_CELL_ID:
    divisor = HUNDRETHS_OF_SECONDS_DIVISOR;
    modulus = HUNDRETHS_OF_SECONDS_MODULUS;
    increment = 0;
    break;
  default:
    return '';
    break;
  }
  
  var timeValue = (Math.floor((millis + increment) / divisor) % modulus);
  
  // Fix the one-hour early decrement of days
  if(timeUnit == DAYS_CELL_ID) {
    var hourValue = (Math.floor((millis + HOURS_DIVISOR) / HOURS_DIVISOR) % HOURS_MODULUS);
    if(hourValue == 0) {
      timeValue++;
    }
  }
  
  timeValue = timeValue.toString();
  
  if(LEADING_ZERO && timeValue.length < 2) {
    timeValue = '0' + timeValue;
  }
  
  return timeValue;
}

function updateClock() {
  // Get the time remaining
  var currentTimeInMillis = new Date().getTime();
  var timeRemainingMillis = weddingDateInMillis - currentTimeInMillis;
  
  var daysStr, hoursStr, minutesStr, secondsStr;
  
  // After the wedding occurs, this timer will actually go in reverse--i.e., 
  // it will be a counter for how long we have been married
  if(timeRemainingMillis <= 0) {
    timeRemainingMillis = -timeRemainingMillis;
    timeRemainingMillis -= HOURS_DIVISOR; // TODO: HACK. discover and fix the real problem.
    thisIsAfterTheWedding = true;
  }
  
  // Get the text values
  daysStr = parseTimeValue(timeRemainingMillis, DAYS_CELL_ID);
  hoursStr = parseTimeValue(timeRemainingMillis, HOURS_CELL_ID);
  minutesStr = parseTimeValue(timeRemainingMillis, MINUTES_CELL_ID);
  secondsStr = parseTimeValue(timeRemainingMillis, SECONDS_CELL_ID);

  // Display the text values
  $('#' + DAYS_CELL_ID).html(daysStr);
  $('#' + HOURS_CELL_ID).html(hoursStr);
  $('#' + MINUTES_CELL_ID).html(minutesStr);
  $('#' + SECONDS_CELL_ID).html(secondsStr);
}
