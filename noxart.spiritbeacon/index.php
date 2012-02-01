<!doctype html>
<html lang="en">
	<head>
		<!-- charset -->
		<meta charset="utf-8">
		
		<!-- resources -->
		<link href="./assets/css/main.css" rel="stylesheet">
		<link href="./assets/images/favicon.ico" rel="shortcut icon">
		
		<!-- title -->
		<title>SpiritBeacon » arcade browser-based shooter game</title>
		
		<!-- author -->
		<meta name="author" content="Jiří 'NoxArt' Petruželka | www.noxart.cz | petruzelka@nox-art.cz | @NoxArt">	
		<meta name="description" lang="en" content="SpiritBeacon » arcade browser-based shooter game">
	</head>
	<body>
		
		<header>
			<h1><a href="/">SpiritBeacon &nbsp; v0.9beta</a></h1>
		</header>
		
		<section>
			<div class="box menu">
				<a class="start">Start the game!</a>
				<br>
				<a class="music">Music is OFF</a>
				<br>
				<a href="/scoreboard.php">See scoreboard</a>
				<br>
				<h3>Controls</h3>
				<dl>
					<dt>Arrows<dt>
					<dd>Move (left/top/right/down)</dd>
					
					<dt class="odd">Spacebar</dt>
					<dd class="odd">Fire weapon</dd>
					
					<dt>Shift</dt>
					<dd>Change weapon</dd>
					
					<dt class="odd">X</dt>
					<dd class="odd">
						Enter <i>SpiritWorld</i>: regenerates shields, degenerates health (ends if would drop below 25),
						allows unchallenged movement
					</dd>
					
					<dt>P</dt>
					<dd>Pause</dd>
					
					<dt class="odd">M</dt>
					<dd class="odd">Mute</dd>
					
					<dt>R, F5</dt>
					<dd>Restart</dd>
				</dl>
				
				<hr>
				<br>
				<h3>Tips</h3>
				<h4>Power-ups</h4>
				<ul class="power-ups">
					<li><img src="assets/images/battery-normal.png"> <strong>Shield overcharger</strong>
						sets shields to 200% of maximum, but drops max by 5</li>
					<li><img src="assets/images/plating-normal.png"> <strong>Extra plating</strong>
						adds 1 plating and 5 HP</li>
					<li><img src="assets/images/exoskelet-normal.png"> <strong>Plating restructuring</strong>
						+10 max HP, -30 HP</li>
					<li><img src="assets/images/firepower-normal.png"> <strong>Firepower upgrade</strong>
						current weapon +1 level, forces to reload</li>
					<li><img src="assets/images/bouncer-normal.png"> <strong>Omnishield</strong>
						shield turns for 7 seconds to omnishield, making you immune to damage and bouncing off attacks, but drops shields to 0</li>
				</ul>
				
			</div>
			
			<div class="box" id="gameover">
				<h2>Game over! (nice shooting though)</h2>
				<h3>You reached score <span class="score">?</span>!</h3>
				<form action="/scoreboard.php">
				<p class="nick">Type your nickname <input name="nick"></p>
				</form>
				<a class="restart">Play again</a>
				<ul></ul>
				<a href="/scoreboard.php">See scoreboard</a>
			</div>
			
			<canvas>
				You need an internet browser that supports canvas or it's up-to-date version
			</canvas>
		</section>
		
		<footer>
			Created by <a href="https://twitter.com/#!/NoxArt" title="@NoxArt at Twitter">NoxArt</a> as an entry for
			<a href="https://github.com/hughfdjackson/bbgcomp2">#bbgcomp2</a>
			<div id="debug"></div>
		</footer>
		
		<!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if offline | http://html5boilerplate.com/ -->
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="scripts/libs/jquery-1.7.1.min.js"><\/script>')</script>
		
		
		<!-- Da script -->
		<script src="/scripts/libs/jquery-1.7.1.min.js"></script>
		<script src="/scripts/libs/sugar-1.1.3.min.js"></script>
		<script src="/scripts/core.js"></script>
		
		<!-- Here be lions and GA tracking code -->
		
		
	</body>
</html>