<!doctype html>
<html lang="en">
<head>
	<title>Squared Away</title>
	
	<meta charset="utf-8">
    <meta name="description" content="A tile-matching puzzle game">
    <meta name="viewport" content="width=device-width">
	
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
			Please come back with a browser that has JavaScript turned on!
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

			<div id="problemScreen">
				<p id="problemText">
				Bummer dude.  The code died.
				</p>
			</div>
		</div>

		<div id="infoArea">
			<h2>Directions</h2>
			<p>
			Just, like, be awesome.  And win.
			</p>

			<hr>

			<h2>Options</h2>
			<p>
			<label><input type="checkbox" name="mode1" id="mode1" value="mode1" checked> Completing squares instead of lines</label>
			<br>
			<label><input type="checkbox" name="mode2" id="mode2" value="mode2" checked> Blocks are allowed to fall past the center</label>
			<br>
			<label><input type="checkbox" name="mode3" id="mode3" value="mode3"> Able to change falling direction of blocks</label>
			<br>
			<label><input type="checkbox" name="mode4" id="mode4" value="mode4"> Changing direction moves block to next quadrant</label>
			<br>
			Size of game area:
			<select id="gameAreaSize">
				<option value="80">80</option>
				<option value="100" selected>100</option>
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
			The code is open source and you can find it on GitHub at <a href="https://github.com/levisl176/squared_away">https://github.com/levisl176/squared_away</a>.
			<br><br>
			Also, this app is coming soon to the Android marketplace.
			</p>
		</div>
	</div>

    <script type="text/javascript" src="js/utils.js"></script>
    <script type="text/javascript" src="js/resources.js"></script>
    <script type="text/javascript" src="js/sprite.js"></script>
    <script type="text/javascript" src="js/block.js"></script>
    <script type="text/javascript" src="js/gamewindow.js"></script>
    <script type="text/javascript" src="js/previewwindow.js"></script>
    <script type="text/javascript" src="js/game.js"></script>
    <script type="text/javascript" src="js/input.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
</body>
</html>
