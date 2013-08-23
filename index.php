<!doctype html>
<html lang="en">
<head>
	<title>Squared</title>
	
	<meta charset="utf-8">
    <meta name="description" content="A tile-matching puzzle game">
    <meta name="viewport" content="width=device-width">
	
	<link rel="stylesheet" href="css/squared.css">
</head>
<body>
	<div id="pageColumn">
		<div id="banner">
			<img src="img/title.png" alt="Squared" />
		</div>

		<div id ="playArea">
			<canvas id="gameCanvas"></canvas>

			<div id="pauseScreen">
				<h3 id="pauseScreenTitle">Game Paused</h3>
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

		<div id="problemArea">
			<p>
			Well, that's not good.
			</p>
		</div>

		<div id="infoArea">
			<h2>Directions</h2>
			<p>
			Directions for the game go here.
			</p>
			
			<hr/>
			
			<h2>Info</h2>
			<p>
			Misc info goes here.
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
