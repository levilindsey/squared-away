<!doctype html>
<html lang="en">
<head>
	<title>Squared Away</title>

	<meta charset="utf-8">
	<meta name="description" content="A tile-matching puzzle game">
	<meta name="viewport" content="width=device-width">

	<link rel="shortcut icon" href="img/icon.ico">
	<link rel="stylesheet" href="css/squaredaway.css">
</head>
<body>
	<div id="pageColumn">
		<div id="banner">
			<img src="img/title.png" alt="Squared Away">
		</div>

		<div id="noJavaScriptArea">
			<p>
				Hey!  This spiffy web app needs JavaScript in order to run.  
				Come back with a browser that has JavaScript turned on!
			</p>
		</div>

		<div id ="playArea">
			<canvas id="gameCanvas"></canvas>

			<div id="topLevelDisplayArea">
				Level: <span id="topLevelDisplayData">1</span>
			</div>

			<div id="topScoreDisplayArea">
				Score: <span id="topScoreDisplayData">0</span>
			</div>

			<div id="pauseScreen">
				<h3 id="pauseScreenTitle">Game Paused</h3>
				<button id="unpauseButton">Play Game</button>
				<table id="statsTable">
					<tr>
						<td>Score:</td>
						<td id="scoreData"></td>
					</tr>
					<tr>
						<td>Level:</td>
						<td id="levelData"></td>
					</tr>
					<tr>
						<td>Time:</td>
						<td id="timeData"></td>
					</tr>
					<tr>
						<td>Layers destroyed:</td>
						<td id="layersCollapsedData"></td>
					</tr>
					<tr>
						<td>Squares destroyed:</td>
						<td id="squaresCollapsedData"></td>
					</tr>
					<tr>
						<td>Blocks handled:</td>
						<td id="blocksHandledData"></td>
					</tr>
					<tr>
						<td>Collapse bombs used:</td>
						<td id="collapseBombsUsedData"></td>
					</tr>
					<tr>
						<td>Settle bombs used:</td>
						<td id="settleBombsUsedData"></td>
					</tr>
				</table>
			</div>

			<div id="playAreaButtons">
				<div id="playAreaButtonsLeftContainer">
					<img id="helpButton" src="img/help.png" alt="help">
				</div>
				<div id="playAreaButtonsRightContainer">
					<img id="musicOnButton" src="img/music_on.png" alt="turn music on">
					<img id="musicOffButton" src="img/music_off.png" alt="turn music off">
					<img id="sfxOnButton" src="img/sfx_on.png" alt="turn sfx on">
					<img id="sfxOffButton" src="img/sfx_off.png" alt="turn sfx off">
				</div>
			</div>
		</div>

		<div id="infoArea">
			<div id="directionsArea">
				<h2>Directions</h2>
				<table id="directionsTable">
					<p class="peanutGallery">
						Just, like, be awesome.  And win.
						<br>
						<br>
					</p>
					<tr>
						<td class="directionPanel">
							<h3>Rotate Block</h3>
							<img src="img/directions_rotate.png" alt="Rotate block">
							<p class="keyboardDirection">
								Press X.
								<br>- OR -<br>
							</p>
							<p>Tap on block.<p>
						</td>
						<td class="directionPanel">
							<h3>Move Block Sideways</h3>
							<img src="img/directions_move.png" alt="Move block sideways">
							<p class="keyboardDirection">
								Press either arrow key sideways from the block&apos;s fall direction.
								<br>- OR -<br>
							</p>
							<p>Press on block, and drag sideways.<p>
						</td>
					</tr>
					<tr>
						<td class="directionPanel">
							<h3>Drop Block</h3>
							<img src="img/directions_drop.png" alt="Drop block">
							<p class="keyboardDirection">
								Press the arrow key toward the block&apos;s fall direction.
								<br>- OR -<br>
							</p>
							<p>Press on block, and drag down (toward fall direction).<p>
						</td>
						<td class="directionPanel">
							<h3>Switch Block Fall Direction</h3>
							<img src="img/directions_switch_fall_direction.png" alt="Switch block fall direction">
							<p class="keyboardDirection">
								Tap the arrow key away from the block&apos;s fall direction twice.
								<br>- OR -<br>
							</p>
							<p>Press on block, and drag up (away from current fall direction).<p>
						</td>
					</tr>
					<tr>
						<td class="directionPanel">
							<h3>Use Collapse Bomb</h3>
							<img src="img/directions_use_collapse_bomb.png" alt="Use collapse bomb">
							<p class="keyboardDirection">
								Tap A to select a collapse bomb.  Then use the arrow keys to select which side to release the bomb from.  Then tap A again to release the bomb.
								<br>- OR -<br>
							</p>
							<p>Tap on the lower-left collapse bomb area.  Then tap on the side to release the bomb from.<p>
						</td>
						<td class="directionPanel">
							<h3>Use Settle Bomb</h3>
							<img src="img/directions_use_settle_bomb.png" alt="Use settle bomb">
							<p class="keyboardDirection">
								Tap S twice.
								<br>- OR -<br>
							</p>
							<p>Tap twice on the lower-right settle-bomb area.<p>
						</td>
					</tr>
					<tr>
						<td class="directionPanel keyboardDirection">
							<h3>Switch Selected Block</h3>
							<img src="img/directions_switch_selected_block.png" alt="Switch selected block">
							<p class="keyboardDirection">
								Press Z.
							</p>
							<p><p>
						</td>
					</tr>
				</table>
				<p>
					Press the spacebar to pause.
				</p>
			</div>

			<hr>

			<div id="optionsArea">
				<h2>Options</h2>
				<p>
					<label><input type="checkbox" name="keyboardControlCB" id="keyboardControlCB" class="modeCB" value="keyboardControlCB" checked>
						Enable keyboard control
						<span id="keyboardControlCBDefaultComment" class="peanutGallery">Guaranteed to increase your WPM or your money back!</span>
					</label>
					<br>
					<label><input type="checkbox" name="completeSquaresCB" id="completeSquaresCB" class="modeCB" value="completeSquaresCB" checked>
						Completing squares instead of lines
						<span id="completeSquaresCBDefaultComment" class="peanutGallery">Totally four times as much fun</span>
					</label>
					<br>
					<label><input type="checkbox" name="blocksFallPastCenterCB" id="blocksFallPastCenterCB" class="modeCB" value="blocksFallPastCenterCB">
						Blocks are allowed to fall past the center
						<span id="blocksFallPastCenterCBOffComment" class="peanutGallery">You&apos;re gonna miss the center...</span>
						<span id="blocksFallPastCenterCBOnComment" class="peanutGallery">I&apos;ll bet you also need bumpers when you bowl...</span>
					</label>
					<br>
					<label><input type="checkbox" name="changeFallDirectionCB" id="changeFallDirectionCB" class="modeCB" value="changeFallDirectionCB" checked>
						Able to change falling direction of blocks
						<span id="changeFallDirectionCBOffComment" class="peanutGallery">Aw, don&apos;t be constrained to just one dimension</span>
						<span id="changeFallDirectionCBOnComment" class="peanutGallery">Whoo hoo! Now we can spin around in circles!</span>
					</label>
					<br>
					<label><input type="checkbox" name="changeQuadrantWithFallDirectionCB" id="changeQuadrantWithFallDirectionCB" class="modeCB" value="changeQuadrantWithFallDirectionCB" checked>
						Changing direction moves block to next quadrant
						<span id="changeQuadrantWithFallDirectionCBDefaultComment" class="peanutGallery">Where'd it go?!</span>
					</label>
					<br>
					<label><input type="checkbox" name="settleWithCollapseCB" id="settleWithCollapseCB" class="modeCB" value="settleWithCollapseCB" checked>
						Collapsing a layer causes higher layers to &quot;settle&quot;
						<span id="settleWithCollapseCBDefaultComment" class="peanutGallery">Whoo hoo! An auto mistake fixer!</span>
					</label>
					<br>
					<label><input type="checkbox" name="settleInwardCB" id="settleInwardCB" class="modeCB" value="settleInwardCB" checked>
						Layers &quot;settle&quot; inwards as well as downwards
						<span id="settleInwardCBDefaultComment" class="peanutGallery">Well, that's just confusing</span>
					</label>
					<br>
					<label><input type="checkbox" name="bombsCB" id="bombsCB" class="modeCB" value="bombsCB" checked>
						Bombs on
						<span id="bombsCBOffComment" class="peanutGallery">You&apos;re no fun...</span>
						<span id="bombsCBOnComment" class="peanutGallery">Well, duh...</span>
					</label>
					<br>
					<label><input type="checkbox" name="fallOutwardCB" id="fallOutwardCB" class="modeCB" value="fallOutwardCB">
						Blow my mind
						<span id="fallOutwardCBDefaultComment" class="peanutGallery">Wait, what?</span>
						<span id="fallOutwardCBOffComment" class="peanutGallery">Booooooring</span>
						<span id="fallOutwardCBOnComment" class="peanutGallery">Well, aren&apos;t you brave...</span>
					</label>
					<br>
					<label><input type="checkbox" name="consoleCB" id="consoleCB" class="modeCB" value="consoleCB">
						Show the debug console
						<span id="consoleCBDefaultComment" class="peanutGallery">Not that there are any bugs or anything...</span>
					</label>
					<br>
					<label><input type="checkbox" name="peanutGalleryCB" id="peanutGalleryCB" class="modeCB" value="peanutGalleryCB">
						Peanut gallery
						<span id="peanutGalleryCBDefaultComment" class="peanutGallery">What? My app wasn&apos;t entertaining enough for you before?!?</span>
					</label>
					<br>
					Size of game area:
					<select id="gameWindowSize" class="gameParameterSelect">
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="40" selected>40</option>
						<option value="60">60</option>
						<option value="80">80</option>
						<option value="100">100</option>
						<option value="120">120</option>
						<option value="140">140</option>
						<option value="160">160</option>
						<option value="180">180</option>
						<option value="200">200</option>
					</select>
					<br>
					Size of center square:
					<select id="centerSquareSize" class="gameParameterSelect">
						<option value="2">2</option>
						<option value="4">4</option>
						<option value="6" selected>6</option>
						<option value="8">8</option>
						<option value="12">12</option>
						<option value="14">14</option>
						<option value="16">16</option>
						<option value="18">18</option>
						<option value="20">20</option>
					</select>
					<br>
					Number of squares in a block:
					<select id="numberOfSquaresInABlock" class="gameParameterSelect">
						<option value="8" selected>2-5</option>
						<option value="7">4-5</option>
						<option value="6">2-4</option>
						<option value="5">5</option>
						<option value="4">4</option>
						<option value="3">3</option>
						<option value="2">2</option>
					</select>
					<br>
					Starting level:
					<select id="startingLevel" class="gameParameterSelect">
						<option value="1" selected>1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
						<option value="10">10</option>
						<option value="15">15</option>
						<option value="20">20</option>
					</select>
				</p>
			</div>

			<hr>

			<div id="musicArea">
				<h2>Music</h2>
				<div class="textColumn">
					<label><input type="checkbox" name="aNightOfDizzySpells" id="aNightOfDizzySpells" value="aNightOfDizzySpells" checked> A Night Of Dizzy Spells</label>
					<a href="https://soundcloud.com/eric-skiff/a-night-of-dizzy-spells?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="allOfUs" id="allOfUs" value="allOfUs" checked> All of Us</label>
					<a href="https://soundcloud.com/eric-skiff/all-of-us?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="arpanauts" id="arpanauts" value="arpanauts" checked> Arpanauts</label>
					<a href="https://soundcloud.com/eric-skiff/arpanauts?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="ascending" id="ascending" value="ascending" checked> Ascending</label>
					<a href="https://soundcloud.com/eric-skiff/ascending?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="chibiNinja" id="chibiNinja" value="chibiNinja" checked> Chibi Ninja</label>
					<a href="https://soundcloud.com/eric-skiff/chibi-ninja?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="comeAndFindMeB" id="comeAndFindMeB" value="comeAndFindMeB"> Come and Find Me - B mix</label>
					<a href="https://soundcloud.com/eric-skiff/come-and-find-me-b-mix?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="comeAndFindMe" id="comeAndFindMe" value="comeAndFindMe"> Come and Find Me</label>
					<a href="https://soundcloud.com/eric-skiff/come-and-find-me?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="digitalNative" id="digitalNative" value="digitalNative" checked> Digital Native</label>
					<a href="https://soundcloud.com/eric-skiff/digital-native?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
				</div>
				<div class="textColumn">
					<label><input type="checkbox" name="hhavokIntro" id="hhavokIntro" value="hhavokIntro"> HHavok-intro</label>
					<a href="https://soundcloud.com/eric-skiff/hhavok-intro?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="hhavokMain" id="hhavokMain" value="hhavokMain" checked> HHavok-main</label>
					<a href="https://soundcloud.com/eric-skiff/hhavok-main?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="jumpshot" id="jumpshot" value="jumpshot" checked> Jumpshot</label>
					<a href="https://soundcloud.com/eric-skiff/jumpshot?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="prologue" id="prologue" value="prologue"> Prologue</label>
					<a href="https://soundcloud.com/eric-skiff/prologue?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="searching" id="searching" value="searching" checked> Searching</label>
					<a href="https://soundcloud.com/eric-skiff/searching?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="underclocked" id="underclocked" value="underclocked" checked> Underclocked (underunderclocked mix)</label>
					<a href="https://soundcloud.com/eric-skiff/underclocked-underunderclocked?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="wereAllUnderTheStars" id="wereAllUnderTheStars" value="wereAllUnderTheStars"> We're All Under the Stars</label>
					<a href="https://soundcloud.com/eric-skiff/were-all-under-the-stars?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="wereTheResistors" id="wereTheResistors" value="wereTheResistors"> We're the Resistors</label>
					<a href="https://soundcloud.com/eric-skiff/were-the-resistors?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
				</div>
				<br>
				<p>
					The talented <a href="http://ericskiff.com/music/" target="_blank">Eric Skiff</a> composed of all of this music.
				</p>
			</div>

			<hr>

			<div id="aboutArea">
				<h2>About</h2>
				<p>
					This game was made by <a href="www.jackieandlevi.com/levi.php">Levi Lindsey</a>.
				</p>
				<p>
					<img src="img/github.png" alt="Github icon">
					If you&apos;re one of those crazy people who think code is cool, then check out this app's source code on GitHub at 
					<a href="https://github.com/levisl176/squared_away" target="_blank">
					https://github.com/levisl176/squared_away</a>!
				</p>
				<p>
					<img src="img/android.png" alt="Android icon">
					Also, this app is coming soon to the Android marketplace.
				</p>
			</div>
		</div>

		<div id="console">
			<hr>

			<h2>Debug Console:</h2>
		</div>
	</div>

    <script type="text/javascript" src="js/stacktrace-min-0.4.js"></script>
    <script type="text/javascript" src="js/soundjs-0.4.1.min.js"></script>

    <script type="text/javascript" src="js/logger.js"></script>
    <script type="text/javascript" src="js/utils.js"></script>
    <script type="text/javascript" src="js/resources.js"></script>
    <script type="text/javascript" src="js/sprite.js"></script>
    <script type="text/javascript" src="js/block.js"></script>
    <script type="text/javascript" src="js/previewwindow.js"></script>
    <script type="text/javascript" src="js/centersquare.js"></script>
    <script type="text/javascript" src="js/gameWindow.js"></script>
    <script type="text/javascript" src="js/input.js"></script>
    <script type="text/javascript" src="js/sound.js"></script>
    <script type="text/javascript" src="js/game.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
</body>
</html>
