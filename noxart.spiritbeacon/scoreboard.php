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
	<body id="scoreboard">
		
		<header>
			<h1><a href="/">SpiritBeacon &nbsp; v0.9beta</a></h1>
		</header>
		
		<section>
			<div class="box menu">
				<h3>Scoreboard</h3>
				<table>
				<tr>
					<th>Nick</th>
					<th>Score</th>
				</tr>
				
				
				<?php
				error_reporting(E_ALL);
				ini_set('display_errors', 1);
				
				$scores = (array)json_decode(file_get_contents('./scores.txt'));
				$post = $_POST;
				
				if( ! empty($post) )
					$scores[ $post['nick'] ] = intval($post['score']);
				
				arsort($scores);
				
				foreach($scores as $nick => $score)
					echo "<tr><td>".htmlspecialchars($nick, ENT_QUOTES)."</td><td>".intval($score)."</td><tr>";
				
				file_put_contents('./scores.txt', json_encode($scores));
				?>
				</table>
			</div>
		</section>
		
		<footer>
			Created by <a href="https://twitter.com/#!/NoxArt" title="@NoxArt at Twitter">NoxArt</a> as an entry for
			<a href="https://github.com/hughfdjackson/bbgcomp2">#bbgcomp2</a>
		</footer>
		
		
	</body>
</html>