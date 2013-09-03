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
				Level: <span id="topLevelDisplayData"></span>
			</div>

			<div id="topScoreDisplayArea">
				Score: <span id="topScoreDisplayData"></span>
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
				</table>
			</div>
		</div>

		<div id="infoArea">
			<h2>Directions</h2>
			<table id="directionsTable">
				<p>
					Just, like, be awesome.  And win.
				</p>
				<tr>
					<td class="directionPanel">
						<h3>Rotate Block</h3>
						<img src="img/directions_rotate.png" alt="Rotate block">
						<p>Tap on block.<p>
					</td>
					<td class="directionPanel">
						<h3>Move Block Sideways</h3>
						<img src="img/directions_move.png" alt="Move block sideways">
						<p>Press on block, and drag sideways.<p>
					</td>
				</tr>
				<tr>
					<td class="directionPanel">
						<h3>Drop Block</h3>
						<img src="img/directions_drop.png" alt="Drop block">
						<p>Press on block, and drag down (toward fall direction).<p>
					</td>
					<td class="directionPanel">
						<h3>Switch Block Fall Direction</h3>
						<img src="img/directions_switch_fall_direction.png" alt="Switch block fall direction">
						<p>Press on block, and drag up (away from current fall direction).<p>
					</td>
				</tr>
			</table>

			<hr>

			<h2>Options</h2>
			<p>
				<label><input type="checkbox" name="mode1" id="mode1" value="mode1"> Enable keyboard control</label>
				<br>
				<label><input type="checkbox" name="mode2" id="mode2" value="mode2" checked> Completing squares instead of lines</label>
				<br>
				<label><input type="checkbox" name="mode3" id="mode3" value="mode3" checked> Blocks are allowed to fall past the center</label>
				<br>
				<label><input type="checkbox" name="mode4" id="mode4" value="mode4" checked> Able to change falling direction of blocks</label>
				<br>
				<label><input type="checkbox" name="mode5" id="mode5" value="mode5" checked> Changing direction moves block to next quadrant</label>
				<br>
				Size of game area:
				<select id="gameAreaSize">
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
				<select id="centerSquareSize">
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
				Starting level:
				<select id="startingLevel">
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

			<hr>

			<h2>About</h2>
			<p>
				This game was made by <a href="www.jackieandlevi.com/levi.php">Levi Lindsey</a>.
				<br><br>
				The code is open source, and you can find it on GitHub at <a href="https://github.com/levisl176/squared_away">https://github.com/levisl176/squared_away</a>.
				<br><br>
				Also, this app is coming soon to the Android marketplace.
			</p>
		</div>

		<div id="console">
			<hr>

			<h2>Debug Console:</h2>
		</div>
	</div>

    <script type="text/javascript" src="js/stacktrace-min-0.4.js"></script>
    <script type="text/javascript" src="js/logger.js"></script>
    <script type="text/javascript" src="js/utils.js"></script>
    <script type="text/javascript" src="js/resources.js"></script>
    <script type="text/javascript" src="js/sprite.js"></script>
    <script type="text/javascript" src="js/block.js"></script>
    <script type="text/javascript" src="js/previewwindow.js"></script>
    <script type="text/javascript" src="js/centersquare.js"></script>
    <script type="text/javascript" src="js/game.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
</body>
</html>
