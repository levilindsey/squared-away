// ------------------------------------------------------------------------- //
// THE CURRENT VERSION NUMBER

var VERSION_STRING = '?v=0.3.2';

// ------------------------------------------------------------------------- //
// ELEMENT IDS AND CLASSES

var SHADOW_FILENAME = '/wedding/images/shadow.png';

// ------------------------------------------------------------------------- //
// ELEMENT IDS AND CLASSES

var ENVELOPE_BOTTOM_ID = 'envelope_bottom';

var BUBBLE_1_ID = 'bubble1';
var BUBBLE_2_ID = 'bubble2';
var BUBBLE_3_ID = 'bubble3';
var BUBBLE_4_ID = 'bubble4';
var BUBBLE_5_ID = 'bubble5';
var BUBBLE_6_ID = 'bubble6';
var BUBBLE_7_ID = 'bubble7';

var BUBBLE_CLASS = 'bubble';
var BIG_BUBBLE_CLASS = 'big_bubble';
var SMALL_BUBBLE_CLASS = 'small_bubble';
var BUBBLE_MAIN_IMG_CLASS = 'bubble_main_img';
var BUBBLE_SUB_H_CLASS = 'bubble_sub_h';
var BUBBLE_BODY_CLASS = 'bubble_body';
var BUBBLE_MAIN_H_CLASS = 'bubble_main_h';
var BUBBLE_P_CLASS = 'bubble_p';
var BUBBLE_SUB_IMG_CLASS = 'bubble_sub_img';

var SHADOW_CLASS = 'shadow';

// ------------------------------------------------------------------------- //

var TWO_PI = Math.PI * 2;
var EPSILON = 0.00001;

var ENVELOPE_BOTTOM_WIDTH_INT = 618;
var ENVELOPE_BOTTOM_HEIGHT_INT = 438;
var ENVELOPE_BOTTOM_HALF_WIDTH_INT = ENVELOPE_BOTTOM_WIDTH_INT / 2;
var ENVELOPE_BOTTOM_HALF_HEIGHT_INT = ENVELOPE_BOTTOM_HEIGHT_INT / 2;

var BIG_BUBBLE_WIDTH_INT = 600;
var BIG_BUBBLE_HEIGHT_INT = 424;
var BIG_BUBBLE_HALF_WIDTH_INT = BIG_BUBBLE_WIDTH_INT / 2;
var BIG_BUBBLE_HALF_HEIGHT_INT = BIG_BUBBLE_HEIGHT_INT / 2;

var SMALL_BUBBLE_WIDTH_INT = 100;
var SMALL_BUBBLE_HEIGHT_INT = 70;
var SMALL_BUBBLE_HALF_WIDTH_INT = SMALL_BUBBLE_WIDTH_INT / 2;
var SMALL_BUBBLE_HALF_HEIGHT_INT = SMALL_BUBBLE_HEIGHT_INT / 2;

var VERTICAL_SKEW = BIG_BUBBLE_WIDTH_INT / BIG_BUBBLE_HEIGHT_INT;

var BUBBLE_MARGIN_INT = 75;

var BUBBLE_HORIZONTAL_APPEAR_DISTANCE_INT = 150 + BIG_BUBBLE_HALF_WIDTH_INT;
var BUBBLE_HORIZONTAL_DISAPPEAR_DISTANCE_INT = 70 + BUBBLE_MARGIN_INT + BIG_BUBBLE_HALF_WIDTH_INT + SMALL_BUBBLE_WIDTH_INT;

var SLIDE_OUT_DURATION = 1200;
var SLIDE_IN_DURATION = 1000;
var SLIDE_IN_OUT_INNER_BEZIER_ANGLE = 90;
var SLIDE_IN_OUT_OUTER_BEZIER_ANGLE = 120;
var SLIDE_IN_OUT_INNER_BEZIER_LENGTH = 1.1;
var SLIDE_IN_OUT_OUTER_BEZIER_LENGTH = 0.7;

var SLIDE_AROUND_DURATION = 800;
var SLIDE_AROUND_BEZIER_ANGLE = 15;
var SLIDE_AROUND_BEZIER_LENGTH = 0.4;

var BUBBLE_MAIN_H_WIDTH_INT = 600;
var BUBBLE_SUB_H_WIDTH_INT = 100;

var HORIZONTAL_CLEARANCE = BIG_BUBBLE_HALF_WIDTH_INT + SMALL_BUBBLE_WIDTH_INT + BUBBLE_MARGIN_INT;
var VERTICAL_CLEARANCE = BIG_BUBBLE_HALF_HEIGHT_INT + SMALL_BUBBLE_HEIGHT_INT + BUBBLE_MARGIN_INT;

var SLIDE_BACK_IN_DELAY = 2500;

// ------------------------------------------------------------------------- //

var windowHeight;
var windowWidth;
var bubbleCenterX;
var bubbleCenterY;
var bigBubbleCornerX;
var bigBubbleCornerY;
var smallBubbleHiddenCornerX;
var smallBubbleHiddenCornerY;

var envelopeBottomCornerX;
var envelopeBottomCornerY;

var smallBubbleCount;
var smallBubbleCenterXPositions;
var smallBubbleCenterYPositions;
var smallBubbleGapCenterXPositions;
var smallBubbleGapCenterYPositions;
var smallBubbleCornerXPositions;
var smallBubbleCornerYPositions;
var smallBubbleGapCornerXPositions;
var smallBubbleGapCornerYPositions;

var envelopeBottom;

var bubbles;

var smallBubbles;

var homeBubble;

var currentBigBubble;
var displaySmallBubbleShadow;
var bubblesAreSlidingIn;
var bubblesAreSlidingOut;
var bubblesAreSlidingAround;

var smallBubbleShadow;

var lastAnimationStartTime;
var lastAnimationDuration;

var isCCWTilt;

var inGapPositions;

var bubbleTimer;

// ------------------------------------------------------------------------- //

/**
 * Append the current version number to the end of each of the filename references.
 */
function updateFileNameVersions() {
//  BROLLY_FRONT_IMAGE_FILENAME = BROLLY_FRONT_IMAGE_FILENAME + VERSION_STRING;
  SHADOW_FILENAME = SHADOW_FILENAME + VERSION_STRING;
}

/**
 * Set up some basic parameters and attach event-handling functionality.
 */
function initializeBubblesJS() {
  bubbles = $('.' + BUBBLE_CLASS);

  lastAnimationStartTime = -1;
  lastAnimationDuration = -1;

  $(window).resize(onResize);
  $(document).mousemove(onBodyMouseMove);
  bubbles.click(onClick);
  bubbles.hover(onMouseIn, onMouseOut);
  bubbles.mousemove(onBubbleMouseMove);

  calculateWindowDimensions();
  calculateSmallBubblePositions();
  initializeBubbles();

  updateFileNameVersions();

  // Preload the other product images.
  // TODO: ensure that the CSS file has all bubbles/images as initially visible, and then hide them here
}

/**
 * Initialize bubble properties.
 */
function initializeBubbles() {
  homeBubble = $('#' + BUBBLE_1_ID);

  var smallBubble;
  smallBubbles = [];
  $('.' + SMALL_BUBBLE_CLASS).each(function(index, element) {
    smallBubble = $(element);
    smallBubbles[index] = smallBubble;
    smallBubble.css('left', smallBubbleHiddenCornerX + 'px');
    smallBubble.css('top', smallBubbleHiddenCornerY + 'px');
    smallBubble.css('display', 'none');
  });

  currentBigBubble = $('.' + BIG_BUBBLE_CLASS);
  currentBigBubble.css('left', bigBubbleCornerX + 'px');
  currentBigBubble.css('top', bigBubbleCornerY + 'px');

  envelopeBottom = $('#' + ENVELOPE_BOTTOM_ID);

  envelopeBottom.css('left', envelopeBottomCornerX + 'px');
  envelopeBottom.css('top', envelopeBottomCornerY + 'px');

  homeBubble.css('left', envelopeBottomCornerX + 'px');
  homeBubble.css('top', envelopeBottomCornerY + 'px');

  displaySmallBubbleShadow = true;

  isCCWTilt = false;

  inGapPositions = false;

  if(!currentBigBubble.is(homeBubble)) {
    envelopeBottom.css('display', 'block');
  }
}

/**
 * Calculate and save some important window dimensions.
 */
function calculateWindowDimensions() {
  windowWidth = $(window).width();
  windowHeight = $(window).height();

  var windowCenterX = windowWidth / 2;
  var windowCenterY = windowHeight / 2;

  if(windowCenterX < HORIZONTAL_CLEARANCE) {
    bubbleCenterX = (windowCenterX + HORIZONTAL_CLEARANCE) / 2;
  } else {
    bubbleCenterX = windowCenterX;
  }

  if(windowCenterY < VERTICAL_CLEARANCE) {
    bubbleCenterY = (windowCenterY + VERTICAL_CLEARANCE) / 2;
  } else {
    bubbleCenterY = windowCenterY;
  }

  bigBubbleCornerX = bubbleCenterX - BIG_BUBBLE_HALF_WIDTH_INT;
  bigBubbleCornerY = bubbleCenterY - BIG_BUBBLE_HALF_HEIGHT_INT;
  smallBubbleHiddenCornerX = bubbleCenterX - SMALL_BUBBLE_HALF_WIDTH_INT;
  smallBubbleHiddenCornerY = bubbleCenterY - SMALL_BUBBLE_HALF_HEIGHT_INT;

  envelopeBottomCornerX = bubbleCenterX - ENVELOPE_BOTTOM_HALF_WIDTH_INT;
  envelopeBottomCornerY = bubbleCenterY - ENVELOPE_BOTTOM_HALF_HEIGHT_INT;
}

/**
 * Calculate and save the appropriate positions for the small bubbles.
 */
function calculateSmallBubblePositions() {
  smallBubbleCount = $('.' + BUBBLE_CLASS).size() - 1;
  var deltaTheta = TWO_PI / smallBubbleCount;
  var smallBubblePositionHalfHorizontalOffset = BIG_BUBBLE_HALF_WIDTH_INT + SMALL_BUBBLE_HALF_WIDTH_INT + BUBBLE_MARGIN_INT;
  var smallBubblePositionHalfVerticalOffset = BIG_BUBBLE_HALF_HEIGHT_INT + SMALL_BUBBLE_HALF_HEIGHT_INT + BUBBLE_MARGIN_INT;

  var startingAngle;
  if(smallBubbleCount % 2 == 1) {
    startingAngle = -Math.PI / 2;
  } else if(smallBubbleCount % 4 == 0) {
    startingAngle = Math.PI / 4;
  } else {
    startingAngle = 0;
  }

  var theta;
  var i;

  smallBubbleCenterXPositions = new Array();
  smallBubbleCenterYPositions = new Array();
  smallBubbleCornerXPositions = new Array();
  smallBubbleCornerYPositions = new Array();
  for(theta = startingAngle, i = 0; i < smallBubbleCount; theta += deltaTheta, i++) {
    smallBubbleCenterXPositions[i] = bubbleCenterX + (smallBubblePositionHalfHorizontalOffset * Math.cos(theta));
    smallBubbleCenterYPositions[i] = bubbleCenterY + (smallBubblePositionHalfVerticalOffset * Math.sin(theta));
    smallBubbleCornerXPositions[i] = smallBubbleCenterXPositions[i] - SMALL_BUBBLE_HALF_WIDTH_INT;
    smallBubbleCornerYPositions[i] = smallBubbleCenterYPositions[i] - SMALL_BUBBLE_HALF_HEIGHT_INT;
  }

  smallBubbleGapCenterXPositions = new Array();
  smallBubbleGapCenterYPositions = new Array();
  smallBubbleGapCornerXPositions = new Array();
  smallBubbleGapCornerYPositions = new Array();
  for(theta = startingAngle + (deltaTheta / 2), i = 0; i < smallBubbleCount; theta += deltaTheta, i++) {
    smallBubbleGapCenterXPositions[i] = bubbleCenterX + (smallBubblePositionHalfHorizontalOffset * Math.cos(theta));
    smallBubbleGapCenterYPositions[i] = bubbleCenterY + (smallBubblePositionHalfVerticalOffset * Math.sin(theta));
    smallBubbleGapCornerXPositions[i] = smallBubbleGapCenterXPositions[i] - SMALL_BUBBLE_HALF_WIDTH_INT;
    smallBubbleGapCornerYPositions[i] = smallBubbleGapCenterYPositions[i] - SMALL_BUBBLE_HALF_HEIGHT_INT;
  }
}

function startBubbleTimer() {
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(bubbleTimerIsUp, SLIDE_BACK_IN_DELAY);
}

function killBubbleTimer() {
  clearTimeout(bubbleTimer);
}

function bubbleTimerIsUp() {
  slideAllBubblesInOut(false);
}

function slideAllBubblesInOut(slideOut) {
  for(i = 0; i < smallBubbleCount; i++) {
    slideBubbleInOut(i, slideOut);
  }

  if(!slideOut) {
    killBubbleTimer();
  }
}

/**
 * Return the Euclidian distance between two points.
 */
function getDistance(aX, aY, bX, bY, verticalSkew) {
  var deltaX = aX - bX;
  var deltaY = (aY - bY) * verticalSkew;
  return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
}

/**
 * Slide the given bubble into or out of the center according to the position represented by the
 * given position index.
 */
function slideBubbleInOut(i, slideOut) {
  var bubble = $(smallBubbles[i]);
  var bubbleOffset = bubble.offset();
  var currentX = bubbleOffset.left - 8;// TODO: FIX THIS HACKY FIX!!!!!
  var currentY = bubbleOffset.top - 8;// TODO: FIX THIS HACKY FIX!!!!!

  var bezierParams;

  // Stop any previously running animation
  bubble.stop();

  if(slideOut) {
    bubblesAreSlidingOut = true;

    inGapPositions = false;

    // Make the small bubble visible
    bubble.css('display', 'block');

    // Unless the bubble is already in mid-transition, have it slide from the hidden position
    if(currentX <= 1 && currentY <= 1) {
      currentX = smallBubbleHiddenCornerX;
      currentY = smallBubbleHiddenCornerY;
    }

    // Display the small bubble's sub-header
    $('#' + bubble.id + ' .' + BUBBLE_SUB_H_CLASS).css('display', 'inline');

    // Slide the small bubble to its expanded position
    bezierParams = {
      start: {
        x: currentX,
        y: currentY,
        angle: SLIDE_IN_OUT_INNER_BEZIER_ANGLE,
        length: SLIDE_IN_OUT_INNER_BEZIER_LENGTH
      },
      end: {
        x: smallBubbleCornerXPositions[i],
        y: smallBubbleCornerYPositions[i],
        angle: -SLIDE_IN_OUT_OUTER_BEZIER_ANGLE,
        length: SLIDE_IN_OUT_OUTER_BEZIER_LENGTH
      }
    };

    bubble.animate({
      path: new $.path.bezier(bezierParams)
    }, SLIDE_OUT_DURATION, 'easeOutBack', function() {
      bubblesAreSlidingOut = false;
      lastAnimationStartTime = -1;
      lastAnimationDuration = -1;
    });

    lastAnimationDuration = SLIDE_OUT_DURATION;
  } else {
    bubblesAreSlidingIn = true;

    // Slide the small bubble to the hidden position
    bezierParams = {
      start: {
        x: currentX,
        y: currentY,
        angle: SLIDE_IN_OUT_OUTER_BEZIER_ANGLE,
        length: SLIDE_IN_OUT_OUTER_BEZIER_LENGTH
      },
      end: {
        x: smallBubbleHiddenCornerX,
        y: smallBubbleHiddenCornerY,
        angle: -SLIDE_IN_OUT_INNER_BEZIER_ANGLE,
        length: SLIDE_IN_OUT_INNER_BEZIER_LENGTH
      }
    };

    bubble.animate({
      path: new $.path.bezier(bezierParams)
    }, SLIDE_IN_DURATION, 'easeInQuart', function() {
      // Hide the small bubble's sub-headers
      $('#' + bubble.id + ' .' + BUBBLE_SUB_H_CLASS).css('display', 'none');

      // Make the small bubble invisible
      bubble.css('display', 'none');

      bubblesAreSlidingIn = false;
      lastAnimationStartTime = -1;
      lastAnimationDuration = -1;
    });

    lastAnimationDuration = SLIDE_IN_DURATION;
  }

  lastAnimationStartTime = $.now();
}

/**
 * Slide the small bubble represented by the given index around the circle according to the
 * position represented by the given index.
 */
function slideBubbleAround(index, movingCCW) {
  bubblesAreSlidingAround = true;

  var bubble = smallBubbles[index];
  var bubbleOffset = bubble.offset();
  var currentX = bubbleOffset.left - 8;// TODO: FIX THIS HACKY FIX!!!!!
  var currentY = bubbleOffset.top - 8;// TODO: FIX THIS HACKY FIX!!!!!

  // Make the small bubble visible
  bubble.css('display', 'block');

  // Stop any previously running animation
  bubble.stop();

  // Determine whether to use the original or the gap positions
  var endX, endY;
  if(inGapPositions) {
    endX = smallBubbleCornerXPositions[index];
    endY = smallBubbleCornerYPositions[index];
  } else {
    endX = smallBubbleGapCornerXPositions[index];
    endY = smallBubbleGapCornerYPositions[index];
  }

  var startAngle = movingCCW ? SLIDE_AROUND_BEZIER_ANGLE : -SLIDE_AROUND_BEZIER_ANGLE;

  // Slide the small bubble to expanded positions
  var bezierParams = {
    start: {
      x: currentX,
      y: currentY,
      angle: startAngle,
      length: SLIDE_AROUND_BEZIER_LENGTH
    },
    end: {
      x: endX,
      y: endY,
      angle: -startAngle,
      length: SLIDE_AROUND_BEZIER_LENGTH
    }
  };

  bubble.animate({
    path: new $.path.bezier(bezierParams)
  }, SLIDE_AROUND_DURATION, 'easeInOutCubic', function() {
    bubblesAreSlidingAround = false;
    lastAnimationStartTime = -1;
    lastAnimationDuration = -1;
  });

  lastAnimationStartTime = $.now();
  lastAnimationDuration = SLIDE_AROUND_DURATION;
}

/**
 * The event handler for the window re-size event.
 */
function onResize(event) {
  calculateWindowDimensions();
  calculateSmallBubblePositions();
  initializeBubbles();
}

/**
 * The event handler for the mouse move event (over the entire body).
 */
function onBodyMouseMove(event) {
  startBubbleTimer();

  if(lastAnimationStartTime < 0 || $.now() > lastAnimationStartTime + lastAnimationDuration) {
    var mouseX = event.pageX;
    var mouseY = event.pageY;

    var skewedDistanceFromCenter = getDistance(mouseX, mouseY, bubbleCenterX, bubbleCenterY, VERTICAL_SKEW);

    var smallBubblesAreDisplayed = smallBubbles[0].css('display') != 'none';

    var i;

    // Check whether the mouse is close to the main bubble area
    if(skewedDistanceFromCenter < BUBBLE_HORIZONTAL_APPEAR_DISTANCE_INT && !smallBubblesAreDisplayed && !bubblesAreSlidingOut) {
      slideAllBubblesInOut(true);

    // Check whether the mouse is far from the main bubble area
    } else if(skewedDistanceFromCenter > BUBBLE_HORIZONTAL_DISAPPEAR_DISTANCE_INT && smallBubblesAreDisplayed && !bubblesAreSlidingIn) {
      slideAllBubblesInOut(false);
    }
  }
}

/**
 * The event handler for the mouse over event (over a bubble).
 */
function onBubbleMouseMove(event) {
  // TODO: add an additional boolean param here to allow for square bubbles instead of just circular ones
  var thisBubble = $(this);

  if(displaySmallBubbleShadow && thisBubble.hasClass(SMALL_BUBBLE_CLASS)) {
    var mouseX = event.pageX;
    var mouseY = event.pageY;
    var bubbleOffset = thisBubble.offset();
    var thisBubbleCenterX = bubbleOffset.left + SMALL_BUBBLE_HALF_WIDTH_INT;
    var thisBubbleCenterY = bubbleOffset.top + SMALL_BUBBLE_HALF_HEIGHT_INT;
    var distanceFromBubbleCenter = getDistance(mouseX, mouseY, thisBubbleCenterX, thisBubbleCenterY, VERTICAL_SKEW);

    var shadows = $('.' + SHADOW_CLASS);

    if(distanceFromBubbleCenter <= SMALL_BUBBLE_HALF_WIDTH_INT) {
      if(shadows.length != 0 && !thisBubble.is(smallBubbleShadow.parent())) {
        smallBubbleShadow.remove();
      }

      if(shadows.length == 0) {
        smallBubbleShadow = $(document.createElement('img'));
        smallBubbleShadow.addClass(SHADOW_CLASS);
        smallBubbleShadow.attr('src', SHADOW_FILENAME);
        smallBubbleShadow.appendTo(thisBubble);
      }
    } else {
      if(shadows.length != 0) {
        smallBubbleShadow.remove();
      }
    }
  }
}

/**
 * The event handler for the mouse in hover event (over a bubble).
 */
function onMouseIn(event) {
  // Do nothing
}

/**
 * The event handler for the mouse out hover event (over a bubble).
 */
function onMouseOut(event) {
  var shadows = $('.' + SHADOW_CLASS);

  if(shadows.length != 0) {
    smallBubbleShadow.remove();
  }
}

/**
 * The event handler for the click event (over a bubble).
 */
function onClick(event) {
  startBubbleTimer();

  var thisBubble = $(this);

  if(thisBubble.hasClass(SMALL_BUBBLE_CLASS)) {
    if(lastAnimationStartTime < 0 || $.now() > lastAnimationStartTime + lastAnimationDuration) {
      envelopeBottom.css('display', 'block');

      // ---------- Swap out and re-arrange the bubble indices ---------- //

      // Find the index of the currently clicked small bubble and the index at which to place
      // the previous big bubble
      var thisSmallBubbleIndex = -1;
      var prevBigBubbleNewIndex = -1;
      var i;
      for(i = 0; i < smallBubbles.length; i++) {
        if(thisBubble.is(smallBubbles[i])) {
          thisSmallBubbleIndex = i;
          prevBigBubbleNewIndex = (i + Math.floor(smallBubbleCount / 2)) % smallBubbleCount;
          break;
        }
      }

      // Swap out big bubble references
      var previousBigBubble = currentBigBubble;
      currentBigBubble = thisBubble;

      var movingCCW = new Object();

      // Shift half of the bubbles down one index
      for(i = thisSmallBubbleIndex; i < smallBubbleCount - 1 && i != prevBigBubbleNewIndex; i++) {
          smallBubbles[i] = smallBubbles[i + 1];
          movingCCW[i] = true;
      } if(i != prevBigBubbleNewIndex) {
        smallBubbles[smallBubbleCount - 1] = smallBubbles[0];
        movingCCW[smallBubbleCount - 1] = true;

        for(i = 0; i < prevBigBubbleNewIndex; i++) {
          smallBubbles[i] = smallBubbles[i + 1];
          movingCCW[i] = true;
        }
      }

      // Place the previous big bubble into the small bubble array
      smallBubbles[prevBigBubbleNewIndex] = previousBigBubble;

      // We need to bump all small bubbles down by one index when starting from the gap positions
      if(inGapPositions) {
        var $tempBubble = smallBubbles[smallBubbleCount - 1];
        for(i = smallBubbleCount - 1; i > 0; i--) {
          smallBubbles[i] = smallBubbles[i - 1];
        }
        smallBubbles[0] = $tempBubble;
        movingCCW[thisSmallBubbleIndex] = false;
      }

      // ---------- Turn off the small bubble shadow functionality ---------- //

      smallBubbleShadow.remove();
      displaySmallBubbleShadow = false;

      // ---------- Hide the swapping bubbles' headers and other content ---------- //

      previousBigBubble.removeClass(BIG_BUBBLE_CLASS);
      previousBigBubble.addClass(SMALL_BUBBLE_CLASS);
      previousBigBubble.find('.' + BUBBLE_SUB_H_CLASS).css('display', 'inline');
      currentBigBubble.find('.' + BUBBLE_SUB_H_CLASS).css('display', 'none');
      previousBigBubble.css('display', 'block');

      // ---------- Re-spread out the small bubbles ---------- //

      for(i = 0; i < smallBubbleCount; i++) {
        slideBubbleAround(i, i in movingCCW && movingCCW[i]);
      }

      // ---------- Stop any currently running animations ---------- //

      currentBigBubble.stop();
      previousBigBubble.stop();

      // ---------- Slide the old main bubble to the perimeter and shrink it ---------- //

      var prevBigBubMainImg = previousBigBubble.find('.' + BUBBLE_MAIN_IMG_CLASS);

      // Determine whether to use the original or the gap positions
      var endX, endY;
      if(inGapPositions) {
        endX = smallBubbleCornerXPositions[(prevBigBubbleNewIndex + 1) % smallBubbleCount];
        endY = smallBubbleCornerYPositions[(prevBigBubbleNewIndex + 1) % smallBubbleCount];
      } else {
        endX = smallBubbleGapCornerXPositions[prevBigBubbleNewIndex];
        endY = smallBubbleGapCornerYPositions[prevBigBubbleNewIndex];
      }

      if(!previousBigBubble.is(homeBubble)) {
        previousBigBubble.animate({
          borderSpacing: 0,
          height: SMALL_BUBBLE_HEIGHT_INT + 'px',
          width: SMALL_BUBBLE_WIDTH_INT + 'px',
          left: endX,
          top: endY
        }, {
          duration: SLIDE_AROUND_DURATION,
          easing: 'easeInOutCubic',
          step: function(now, fx) {
            if(fx.prop == 'borderSpacing') {
              $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
              $(this).css('-moz-transform', 'rotate(' + now + 'deg)');
              $(this).css('-o-transform', 'rotate(' + now + 'deg)');
            }
          }
        });

        prevBigBubMainImg.css('height', BIG_BUBBLE_HEIGHT_INT + 'px');
        prevBigBubMainImg.css('width', BIG_BUBBLE_WIDTH_INT + 'px');
        prevBigBubMainImg.animate({
          height: SMALL_BUBBLE_HEIGHT_INT + 'px',
          width: SMALL_BUBBLE_WIDTH_INT + 'px'
        }, SLIDE_AROUND_DURATION, 'easeInOutCubic');
      } else {
        previousBigBubble.animate({
          height: SMALL_BUBBLE_HEIGHT_INT + 'px',
          width: SMALL_BUBBLE_WIDTH_INT + 'px',
          left: endX,
          top: endY
        }, SLIDE_AROUND_DURATION, 'easeInOutCubic');

        prevBigBubMainImg.css('height', ENVELOPE_BOTTOM_HEIGHT_INT + 'px');
        prevBigBubMainImg.css('width', ENVELOPE_BOTTOM_WIDTH_INT + 'px');
        prevBigBubMainImg.animate({
          height: SMALL_BUBBLE_HEIGHT_INT + 'px',
          width: SMALL_BUBBLE_WIDTH_INT + 'px'
        }, SLIDE_AROUND_DURATION, 'easeInOutCubic');
      }

      var prevBigBubSubH = previousBigBubble.find('.' + BUBBLE_SUB_H_CLASS);
      prevBigBubSubH.css('width', BUBBLE_MAIN_H_WIDTH_INT + 'px');
      prevBigBubSubH.animate({
        width: BUBBLE_SUB_H_WIDTH_INT + 'px'
      }, SLIDE_AROUND_DURATION, 'easeInOutCubic');

      previousBigBubble.css('z-index', 3);

      // ---------- Slide the new main bubble to the center and enlarge it ---------- //

      if(!currentBigBubble.is(homeBubble)) {
        // Calculate the slight angle at which to tilt the card
        var angle = Math.random() * 6.3 + 1.2;
        isCCWTilt = !isCCWTilt;
        if(!isCCWTilt) {
          angle *= -1;
        }

        // Calculate the slight offset at which to place the card
        var offsetX = Math.random() * 20 - 10;
        var offsetY = Math.random() * 20 - 10;

        currentBigBubble.find('.' + BUBBLE_MAIN_IMG_CLASS).animate({
          height: BIG_BUBBLE_HEIGHT_INT + 'px',
          width: BIG_BUBBLE_WIDTH_INT + 'px'
        }, SLIDE_AROUND_DURATION, 'easeInOutCubic');

        currentBigBubble.animate({
          borderSpacing: angle,
          height: BIG_BUBBLE_HEIGHT_INT + 'px',
          width: BIG_BUBBLE_WIDTH_INT + 'px',
          left: bigBubbleCornerX + offsetX,
          top: bigBubbleCornerY + offsetY
        }, {
          duration: SLIDE_AROUND_DURATION,
          easing: 'easeInOutCubic',
          step: function(now, fx) {
            if(fx.prop == 'borderSpacing') {
              $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
              $(this).css('-moz-transform', 'rotate(' + now + 'deg)');
              $(this).css('-o-transform', 'rotate(' + now + 'deg)');
              $(this).css('writing-mode', 'lr-tb');
            }
          },
          complete: function() {

          // ---------- Display the new main bubble's main header and other content ---------- //

            currentBigBubble.removeClass(SMALL_BUBBLE_CLASS);
            currentBigBubble.addClass(BIG_BUBBLE_CLASS);

          // ---------- Turn back on the small bubble shadow functionality ---------- //

            displaySmallBubbleShadow = true;
          }
        });
      } else {
        currentBigBubble.find('.' + BUBBLE_MAIN_IMG_CLASS).animate({
          height: ENVELOPE_BOTTOM_HEIGHT_INT + 'px',
          width: ENVELOPE_BOTTOM_WIDTH_INT + 'px'
        }, SLIDE_AROUND_DURATION, 'easeInOutCubic');

        currentBigBubble.animate({
          height: BIG_BUBBLE_HEIGHT_INT + 'px',
          width: BIG_BUBBLE_WIDTH_INT + 'px',
          left: envelopeBottomCornerX,
          top: envelopeBottomCornerY
        }, SLIDE_AROUND_DURATION, 'easeInOutCubic', function() {
          envelopeBottom.css('display', 'none');

        // ---------- Display the new main bubble's main header and other content ---------- //

          currentBigBubble.removeClass(SMALL_BUBBLE_CLASS);
          currentBigBubble.addClass(BIG_BUBBLE_CLASS);

        // ---------- Turn back on the small bubble shadow functionality ---------- //

          displaySmallBubbleShadow = true;
        });
      }

      inGapPositions = !inGapPositions;

      currentBigBubble.css('z-index', 11);
    }
  }
}
